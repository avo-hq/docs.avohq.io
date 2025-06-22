const fs = require('fs');
const path = require('path');
const {
  logger,
  FileProcessingError,
  ErrorHandler,
  PerformanceTimer
} = require('./logger.js');

/**
 * Configuration for markdown processing
 */
const DEFAULT_MARKDOWN_CONFIG = {
  removeFrontmatter: true,
  processIncludes: true,
  transformLinks: true,
  preserveCodeBlocks: true,
  includePattern: /^@@include\s*\(\s*(.+?)\s*\)$/gm,
  vitepressIncludePattern: /<!--\s*@include:\s*([^>]+?)\s*-->/g,
  frontmatterDelimiter: '---',
  baseDirectory: null,
  encoding: 'utf8'
};

/**
 * Markdown processor class for handling VitePress markdown files
 */
class MarkdownProcessor {
  constructor(config = {}) {
    this.config = { ...DEFAULT_MARKDOWN_CONFIG, ...config };
    this.logger = config.logger || logger;
    this.timer = new PerformanceTimer(this.logger);
    this.processedFiles = new Set();
    this.includeCache = new Map();
  }

  /**
   * Process a single markdown file
   * @param {string} filePath - Path to the markdown file
   * @param {Object} options - Processing options
   * @returns {Object} Processing result
   */
  async processFile(filePath, options = {}) {
    const processingOptions = { ...this.config, ...options };
    const absolutePath = path.resolve(filePath);

    return this.timer.measure(`processFile:${path.basename(filePath)}`, async () => {
      try {
        this.logger.info('Processing markdown file', { filePath: absolutePath });

        if (!fs.existsSync(absolutePath)) {
          throw new FileProcessingError(
            `Markdown file not found: ${filePath}`,
            'FILE_NOT_FOUND',
            { filePath: absolutePath }
          );
        }

        // Check for circular includes
        if (this.processedFiles.has(absolutePath)) {
          this.logger.warn('Circular include detected, skipping', { filePath: absolutePath });
          return {
            content: `<!-- Circular include detected: ${filePath} -->`,
            filePath: absolutePath,
            processed: false,
            circular: true
          };
        }

        this.processedFiles.add(absolutePath);

        // Read file content
        const rawContent = fs.readFileSync(absolutePath, processingOptions.encoding);
        this.logger.debug('File read successfully', {
          filePath: absolutePath,
          size: rawContent.length
        });

        let processedContent = rawContent;
        const metadata = {
          originalSize: rawContent.length,
          transformations: []
        };

        // Remove frontmatter
        if (processingOptions.removeFrontmatter) {
          const frontmatterResult = this.removeFrontmatter(processedContent);
          processedContent = frontmatterResult.content;
          metadata.frontmatter = frontmatterResult.frontmatter;
          metadata.transformations.push('frontmatter-removed');
          this.logger.debug('Frontmatter processed', {
            hasFrontmatter: !!frontmatterResult.frontmatter
          });
        }

        // Process includes
        if (processingOptions.processIncludes) {
          const includeResult = await this.processIncludes(
            processedContent,
            path.dirname(absolutePath),
            processingOptions
          );
          processedContent = includeResult.content;
          metadata.includes = includeResult.includes;
          metadata.transformations.push('includes-processed');
          this.logger.debug('Includes processed', {
            count: includeResult.includes.length
          });
        }

        // Transform links
        if (processingOptions.transformLinks) {
          const linkResult = this.transformLinks(processedContent, path.dirname(absolutePath));
          processedContent = linkResult.content;
          metadata.links = linkResult.links;
          metadata.transformations.push('links-transformed');
          this.logger.debug('Links transformed', {
            count: linkResult.links.length
          });
        }

        // Clean up processed files tracking
        this.processedFiles.delete(absolutePath);

        const result = {
          content: processedContent,
          filePath: absolutePath,
          relativePath: path.relative(process.cwd(), absolutePath),
          processed: true,
          metadata,
          processedAt: new Date().toISOString()
        };

        this.logger.success('Markdown file processed successfully', {
          filePath: path.basename(absolutePath),
          originalSize: metadata.originalSize,
          finalSize: processedContent.length,
          transformations: metadata.transformations
        });

        return result;

      } catch (error) {
        this.processedFiles.delete(absolutePath);

        if (error instanceof FileProcessingError) {
          throw error;
        }

        throw ErrorHandler.file('process', filePath, error);
      }
    });
  }

  /**
   * Process multiple markdown files
   * @param {Array} filePaths - Array of file paths
   * @param {Object} options - Processing options
   * @returns {Array} Array of processing results
   */
  async processFiles(filePaths, options = {}) {
    this.logger.info('Processing multiple markdown files', { count: filePaths.length });

    const results = [];
    const errors = [];

    for (const filePath of filePaths) {
      try {
        const result = await this.processFile(filePath, options);
        results.push(result);
      } catch (error) {
        this.logger.error('Failed to process file', { filePath, error: error.message });
        errors.push({ filePath, error });
      }
    }

    this.logger.info('Batch processing completed', {
      total: filePaths.length,
      successful: results.length,
      failed: errors.length
    });

    return {
      results,
      errors,
      summary: {
        total: filePaths.length,
        successful: results.length,
        failed: errors.length,
        totalContentSize: results.reduce((sum, r) => sum + r.content.length, 0)
      }
    };
  }

  /**
   * Remove frontmatter from markdown content
   * @param {string} content - Markdown content
   * @returns {Object} Result with content and extracted frontmatter
   */
  removeFrontmatter(content) {
    const delimiter = this.config.frontmatterDelimiter;

    // Check if content starts with frontmatter delimiter
    if (!content.startsWith(delimiter)) {
      return { content, frontmatter: null };
    }

    // Find the closing delimiter
    const lines = content.split('\n');
    let closingIndex = -1;

    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim() === delimiter) {
        closingIndex = i;
        break;
      }
    }

    if (closingIndex === -1) {
      this.logger.warn('Frontmatter delimiter not closed, treating as regular content');
      return { content, frontmatter: null };
    }

    // Extract frontmatter and remaining content
    const frontmatterLines = lines.slice(1, closingIndex);
    const contentLines = lines.slice(closingIndex + 1);

    const frontmatter = frontmatterLines.join('\n').trim();
    const remainingContent = contentLines.join('\n');

    return {
      content: remainingContent,
      frontmatter: frontmatter || null
    };
  }

  /**
   * Process includes in markdown content
   * @param {string} content - Markdown content
   * @param {string} baseDir - Base directory for resolving includes
   * @param {Object} options - Processing options
   * @returns {Object} Result with processed content and include info
   */
  async processIncludes(content, baseDir, options = {}) {
    const includes = [];
    let processedContent = content;

    // Process both legacy and VitePress include patterns
    const patterns = [
      { pattern: this.config.includePattern, type: 'legacy' },
      { pattern: this.config.vitepressIncludePattern, type: 'vitepress' }
    ];

    for (const { pattern, type } of patterns) {
      const includeMatches = Array.from(processedContent.matchAll(pattern));

      for (const match of includeMatches) {
        const [fullMatch, includePath] = match;
        const trimmedPath = includePath.trim();
        const resolvedPath = path.resolve(baseDir, trimmedPath);

        this.logger.debug('Processing include', {
          type,
          includePath: trimmedPath,
          resolvedPath,
          directive: fullMatch
        });

        try {
          let includeContent = '';

          // Check cache first
          if (this.includeCache.has(resolvedPath)) {
            includeContent = this.includeCache.get(resolvedPath);
            this.logger.debug('Include loaded from cache', { resolvedPath });
          } else {
            if (!fs.existsSync(resolvedPath)) {
              this.logger.warn('Include file not found', { includePath: trimmedPath, resolvedPath });
              includeContent = `<!-- Include not found: ${trimmedPath} -->`;
            } else {
              // For VitePress includes, we need to handle relative paths correctly
              let actualPath = resolvedPath;

              // If it's a VitePress include and the file doesn't exist at the resolved path,
              // try to find it relative to the docs directory
              if (type === 'vitepress' && !fs.existsSync(resolvedPath)) {
                // Try relative to docs directory structure
                const docsPath = path.resolve(process.cwd(), 'docs', trimmedPath);
                if (fs.existsSync(docsPath)) {
                  actualPath = docsPath;
                  this.logger.debug('Found VitePress include in docs directory', {
                    originalPath: resolvedPath,
                    actualPath
                  });
                }
              }

              if (fs.existsSync(actualPath)) {
                // Read the include file content directly (no recursive processing for includes)
                includeContent = fs.readFileSync(actualPath, options.encoding || 'utf8');

                // Cache the content
                this.includeCache.set(resolvedPath, includeContent);

                this.logger.debug('Include file loaded', {
                  path: actualPath,
                  size: includeContent.length
                });
              } else {
                includeContent = `<!-- Include not found: ${trimmedPath} -->`;
              }
            }
          }

          // Replace the include directive with the content
          processedContent = processedContent.replace(fullMatch, includeContent);

          includes.push({
            directive: fullMatch,
            path: trimmedPath,
            resolvedPath,
            found: fs.existsSync(resolvedPath),
            size: includeContent.length,
            type
          });

        } catch (error) {
          this.logger.error('Error processing include', {
            type,
            includePath: trimmedPath,
            error: error.message
          });

          // Replace with error comment
          const errorComment = `<!-- Error including ${trimmedPath}: ${error.message} -->`;
          processedContent = processedContent.replace(fullMatch, errorComment);

          includes.push({
            directive: fullMatch,
            path: trimmedPath,
            resolvedPath,
            found: false,
            error: error.message,
            type
          });
        }
      }
    }

    return {
      content: processedContent,
      includes
    };
  }

  /**
   * Transform links in markdown content
   * @param {string} content - Markdown content
   * @param {string} baseDir - Base directory for resolving relative links
   * @returns {Object} Result with transformed content and link info
   */
  transformLinks(content, baseDir) {
    const links = [];
    let transformedContent = content;

    // Match markdown links [text](url)
    const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    const linkMatches = Array.from(content.matchAll(linkPattern));

    for (const match of linkMatches) {
      const [fullMatch, linkText, linkUrl] = match;

      // Skip external links (http/https)
      if (linkUrl.startsWith('http://') || linkUrl.startsWith('https://')) {
        links.push({
          original: fullMatch,
          text: linkText,
          url: linkUrl,
          type: 'external',
          transformed: false
        });
        continue;
      }

      // Skip anchor links
      if (linkUrl.startsWith('#')) {
        links.push({
          original: fullMatch,
          text: linkText,
          url: linkUrl,
          type: 'anchor',
          transformed: false
        });
        continue;
      }

      // Process relative links - remove them to prevent VitePress crashes
      const resolvedPath = path.resolve(baseDir, linkUrl);
      const exists = fs.existsSync(resolvedPath);

      let transformedLink = linkText; // Just use the link text, remove the link
      let transformed = true;

      // Remove relative markdown links entirely (replace with just the text)
      transformedContent = transformedContent.replace(fullMatch, linkText);

      links.push({
        original: fullMatch,
        transformed: transformedLink,
        text: linkText,
        url: linkUrl,
        resolvedPath,
        exists,
        type: 'relative',
        transformed,
        action: 'removed'
      });
    }

    return {
      content: transformedContent,
      links
    };
  }

  /**
   * Clear processing cache
   */
  clearCache() {
    this.includeCache.clear();
    this.processedFiles.clear();
    this.logger.debug('Processing cache cleared');
  }

  /**
   * Get processing statistics
   * @returns {Object} Statistics about processed files
   */
  getStats() {
    return {
      cacheSize: this.includeCache.size,
      currentlyProcessing: this.processedFiles.size,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Utility functions for markdown processing
 */
const MarkdownUtils = {
  /**
   * Extract headings from markdown content
   * @param {string} content - Markdown content
   * @returns {Array} Array of heading objects
   */
  extractHeadings(content) {
    const headings = [];
    const headingPattern = /^(#{1,6})\s+(.+)$/gm;
    const matches = Array.from(content.matchAll(headingPattern));

    for (const match of matches) {
      const [fullMatch, hashes, text] = match;
      headings.push({
        level: hashes.length,
        text: text.trim(),
        anchor: text.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        line: fullMatch
      });
    }

    return headings;
  },

  /**
   * Extract code blocks from markdown content
   * @param {string} content - Markdown content
   * @returns {Array} Array of code block objects
   */
  extractCodeBlocks(content) {
    const codeBlocks = [];
    const codeBlockPattern = /```(\w*)\n([\s\S]*?)```/g;
    const matches = Array.from(content.matchAll(codeBlockPattern));

    for (const match of matches) {
      const [fullMatch, language, code] = match;
      codeBlocks.push({
        language: language || 'text',
        code: code.trim(),
        full: fullMatch
      });
    }

    return codeBlocks;
  },

  /**
   * Clean markdown content for LLM consumption
   * @param {string} content - Markdown content
   * @returns {string} Cleaned content
   */
  cleanForLLM(content) {
    let cleaned = content;

    // Remove HTML comments
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');

    // Remove empty lines (more than 2 consecutive)
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

    // Trim whitespace
    cleaned = cleaned.trim();

    return cleaned;
  }
};

/**
 * Default processor instance
 */
const defaultProcessor = new MarkdownProcessor();

/**
 * Convenience function for quick file processing
 * @param {string} filePath - Path to markdown file
 * @param {Object} config - Processing configuration
 * @returns {Object} Processing result
 */
async function processMarkdownFile(filePath, config = {}) {
  const processor = new MarkdownProcessor(config);
  return await processor.processFile(filePath);
}

// Export everything
module.exports = {
  DEFAULT_MARKDOWN_CONFIG,
  MarkdownProcessor,
  MarkdownUtils,
  defaultProcessor,
  processMarkdownFile
};
