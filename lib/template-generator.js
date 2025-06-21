import path from 'path';
import { 
  logger, 
  ConfigurationError, 
  ErrorHandler,
  PerformanceTimer 
} from './logger.js';
import { MarkdownUtils } from './markdown-processor.js';

/**
 * Default template configuration
 */
export const DEFAULT_TEMPLATE_CONFIG = {
  includeMetadata: true,
  includeTableOfContents: true,
  sectionSeparator: '\n\n---\n\n',
  headerLevel: 1,
  includeTimestamp: true,
  includeSourcePath: true,
  includeWordCount: true,
  maxSectionLength: null,
  customHeaders: {},
  outputFormat: 'markdown'
};

/**
 * Template types for different output formats
 */
export const TEMPLATE_TYPES = {
  MARKDOWN: 'markdown',
  TEXT: 'text',
  STRUCTURED: 'structured',
  LLMS_TXT: 'llms_txt'
};

/**
 * Template generator class for creating structured documentation sections
 */
export class TemplateGenerator {
  constructor(config = {}) {
    this.config = { ...DEFAULT_TEMPLATE_CONFIG, ...config };
    this.logger = config.logger || logger;
    this.timer = new PerformanceTimer(this.logger);
    this.sectionCounter = 0;
  }

  /**
   * Generate a complete section template from processed markdown
   * @param {Object} processedFile - Result from MarkdownProcessor
   * @param {Object} options - Generation options
   * @returns {Object} Generated section template
   */
  generateSection(processedFile, options = {}) {
    const templateOptions = { ...this.config, ...options };
    
    return this.timer.measure('generateSection', () => {
      try {
        this.logger.debug('Generating section template', { 
          filePath: processedFile.relativePath 
        });

        const section = {
          id: this.generateSectionId(processedFile),
          metadata: this.generateMetadata(processedFile, templateOptions),
          content: this.formatContent(processedFile.content, templateOptions),
          structure: this.analyzeStructure(processedFile.content),
          generatedAt: new Date().toISOString()
        };

        // Add table of contents if requested
        if (templateOptions.includeTableOfContents) {
          section.tableOfContents = this.generateTableOfContents(processedFile.content);
        }

        // Add custom sections based on template type
        switch (templateOptions.outputFormat) {
          case TEMPLATE_TYPES.LLMS_TXT:
            section.formatted = this.formatForLLMs(section, templateOptions);
            break;
          case TEMPLATE_TYPES.STRUCTURED:
            section.formatted = this.formatStructured(section, templateOptions);
            break;
          case TEMPLATE_TYPES.TEXT:
            section.formatted = this.formatPlainText(section, templateOptions);
            break;
          default:
            section.formatted = this.formatMarkdown(section, templateOptions);
        }

        this.logger.success('Section template generated', {
          id: section.id,
          contentLength: section.content.length,
          format: templateOptions.outputFormat
        });

        return section;

      } catch (error) {
        this.logger.error('Failed to generate section template', error);
        throw ErrorHandler.file('generate template', processedFile.filePath, error);
      }
    });
  }

  /**
   * Generate multiple sections from processed files
   * @param {Array} processedFiles - Array of processed file results
   * @param {Object} options - Generation options
   * @returns {Object} Collection of generated sections
   */
  generateSections(processedFiles, options = {}) {
    this.logger.info('Generating multiple section templates', { 
      count: processedFiles.length 
    });
    
    const sections = [];
    const errors = [];
    let totalContentLength = 0;

    for (const processedFile of processedFiles) {
      try {
        const section = this.generateSection(processedFile, options);
        sections.push(section);
        totalContentLength += section.content.length;
      } catch (error) {
        this.logger.error('Failed to generate section', { 
          filePath: processedFile.filePath, 
          error: error.message 
        });
        errors.push({ 
          filePath: processedFile.filePath, 
          error 
        });
      }
    }

    const collection = {
      sections,
      errors,
      metadata: {
        totalSections: sections.length,
        totalContentLength,
        failedSections: errors.length,
        generatedAt: new Date().toISOString(),
        outputFormat: options.outputFormat || this.config.outputFormat
      }
    };

    // Generate combined template if multiple sections
    if (sections.length > 1) {
      collection.combined = this.combineSections(sections, options);
    }

    this.logger.success('Multiple sections generated', {
      successful: sections.length,
      failed: errors.length,
      totalLength: totalContentLength
    });

    return collection;
  }

  /**
   * Generate unique section ID
   * @param {Object} processedFile - Processed file data
   * @returns {string} Unique section ID
   */
  generateSectionId(processedFile) {
    this.sectionCounter++;
    const baseName = path.basename(processedFile.relativePath, '.md');
    const sanitized = baseName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return `section-${this.sectionCounter}-${sanitized}`;
  }

  /**
   * Generate metadata for a section
   * @param {Object} processedFile - Processed file data
   * @param {Object} options - Generation options
   * @returns {Object} Section metadata
   */
  generateMetadata(processedFile, options) {
    const metadata = {
      title: this.extractTitle(processedFile.content),
      sourceFile: processedFile.relativePath,
      processedAt: processedFile.processedAt
    };

    if (options.includeWordCount) {
      metadata.wordCount = this.countWords(processedFile.content);
      metadata.estimatedReadingTime = Math.ceil(metadata.wordCount / 200); // ~200 WPM
    }

    if (options.includeSourcePath) {
      metadata.absolutePath = processedFile.filePath;
    }

    if (options.includeTimestamp) {
      metadata.generatedAt = new Date().toISOString();
    }

    // Include processing metadata if available
    if (processedFile.metadata) {
      metadata.processing = {
        transformations: processedFile.metadata.transformations,
        originalSize: processedFile.metadata.originalSize,
        finalSize: processedFile.content.length
      };

      if (processedFile.metadata.frontmatter) {
        metadata.frontmatter = processedFile.metadata.frontmatter;
      }
    }

    // Add custom headers
    if (options.customHeaders) {
      metadata.custom = { ...options.customHeaders };
    }

    return metadata;
  }

  /**
   * Format content based on template configuration
   * @param {string} content - Raw content
   * @param {Object} options - Formatting options
   * @returns {string} Formatted content
   */
  formatContent(content, options) {
    let formatted = content;

    // Apply maximum section length if specified
    if (options.maxSectionLength && formatted.length > options.maxSectionLength) {
      this.logger.warn('Content exceeds maximum section length, truncating', {
        originalLength: formatted.length,
        maxLength: options.maxSectionLength
      });
      
      formatted = formatted.substring(0, options.maxSectionLength);
      
      // Try to end at a natural break point
      const lastParagraph = formatted.lastIndexOf('\n\n');
      if (lastParagraph > options.maxSectionLength * 0.8) {
        formatted = formatted.substring(0, lastParagraph);
      }
      
      formatted += '\n\n[Content truncated...]';
    }

    return formatted;
  }

  /**
   * Analyze content structure
   * @param {string} content - Content to analyze
   * @returns {Object} Structure analysis
   */
  analyzeStructure(content) {
    const headings = MarkdownUtils.extractHeadings(content);
    const codeBlocks = MarkdownUtils.extractCodeBlocks(content);
    
    return {
      headings: headings.map(h => ({
        level: h.level,
        text: h.text,
        anchor: h.anchor
      })),
      codeBlocks: codeBlocks.map(cb => ({
        language: cb.language,
        lineCount: cb.code.split('\n').length
      })),
      stats: {
        headingCount: headings.length,
        codeBlockCount: codeBlocks.length,
        maxHeadingLevel: Math.max(...headings.map(h => h.level), 0),
        hasCode: codeBlocks.length > 0
      }
    };
  }

  /**
   * Generate table of contents
   * @param {string} content - Content to generate TOC from
   * @returns {Array} Table of contents entries
   */
  generateTableOfContents(content) {
    const headings = MarkdownUtils.extractHeadings(content);
    
    return headings.map(heading => ({
      level: heading.level,
      text: heading.text,
      anchor: heading.anchor,
      indent: '  '.repeat(heading.level - 1)
    }));
  }

  /**
   * Format section for LLMs.txt output
   * @param {Object} section - Section data
   * @param {Object} options - Formatting options
   * @returns {string} Formatted content for LLMs
   */
  formatForLLMs(section, options) {
    let output = '';

    // Add title header
    if (section.metadata.title) {
      output += `# ${section.metadata.title}\n\n`;
    }

    // Add metadata comment
    if (options.includeMetadata) {
      output += `<!-- Source: ${section.metadata.sourceFile}`;
      if (section.metadata.wordCount) {
        output += ` | Words: ${section.metadata.wordCount}`;
      }
      output += ` -->\n\n`;
    }

    // Add table of contents for complex sections
    if (section.tableOfContents && section.tableOfContents.length > 3) {
      output += '## Table of Contents\n\n';
      for (const item of section.tableOfContents) {
        output += `${item.indent}- [${item.text}](#${item.anchor})\n`;
      }
      output += '\n';
    }

    // Add main content
    output += section.content;

    // Clean up for LLM consumption
    output = MarkdownUtils.cleanForLLM(output);

    return output;
  }

  /**
   * Format section as structured data
   * @param {Object} section - Section data
   * @param {Object} options - Formatting options
   * @returns {Object} Structured section data
   */
  formatStructured(section, options) {
    return {
      metadata: section.metadata,
      structure: section.structure,
      tableOfContents: section.tableOfContents,
      content: {
        raw: section.content,
        cleaned: MarkdownUtils.cleanForLLM(section.content),
        headings: section.structure.headings,
        codeBlocks: section.structure.codeBlocks
      },
      stats: {
        ...section.structure.stats,
        contentLength: section.content.length,
        wordCount: section.metadata.wordCount
      }
    };
  }

  /**
   * Format section as plain text
   * @param {Object} section - Section data
   * @param {Object} options - Formatting options
   * @returns {string} Plain text format
   */
  formatPlainText(section, options) {
    let output = '';

    if (section.metadata.title) {
      output += `${section.metadata.title.toUpperCase()}\n`;
      output += '='.repeat(section.metadata.title.length) + '\n\n';
    }

    // Strip markdown formatting
    let plainContent = section.content
      .replace(/#{1,6}\s/g, '') // Remove heading markers
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
      .replace(/\*(.*?)\*/g, '$1') // Remove italic
      .replace(/`(.*?)`/g, '$1') // Remove inline code
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links, keep text
      .replace(/```[\s\S]*?```/g, '[CODE BLOCK]'); // Replace code blocks

    output += plainContent;

    return output;
  }

  /**
   * Format section as markdown
   * @param {Object} section - Section data
   * @param {Object} options - Formatting options
   * @returns {string} Formatted markdown
   */
  formatMarkdown(section, options) {
    let output = '';

    // Add title if not already present
    if (section.metadata.title && !section.content.startsWith('#')) {
      output += `# ${section.metadata.title}\n\n`;
    }

    // Add metadata if requested
    if (options.includeMetadata) {
      output += '---\n';
      output += `source: ${section.metadata.sourceFile}\n`;
      if (section.metadata.wordCount) {
        output += `words: ${section.metadata.wordCount}\n`;
      }
      if (section.metadata.generatedAt) {
        output += `generated: ${section.metadata.generatedAt}\n`;
      }
      output += '---\n\n';
    }

    output += section.content;

    return output;
  }

  /**
   * Combine multiple sections into a single template
   * @param {Array} sections - Array of section objects
   * @param {Object} options - Combination options
   * @returns {Object} Combined template
   */
  combineSections(sections, options = {}) {
    this.logger.info('Combining sections into single template', { 
      count: sections.length 
    });

    const combined = {
      metadata: {
        title: options.title || 'Combined Documentation',
        totalSections: sections.length,
        totalWordCount: sections.reduce((sum, s) => sum + (s.metadata.wordCount || 0), 0),
        sources: sections.map(s => s.metadata.sourceFile),
        generatedAt: new Date().toISOString()
      },
      sections: sections.map(s => ({
        id: s.id,
        title: s.metadata.title,
        source: s.metadata.sourceFile
      })),
      content: ''
    };

    // Generate combined content
    const separator = options.sectionSeparator || this.config.sectionSeparator;
    
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      
      if (i > 0) {
        combined.content += separator;
      }
      
      combined.content += section.formatted || section.content;
    }

    return combined;
  }

  /**
   * Extract title from content
   * @param {string} content - Content to extract title from
   * @returns {string} Extracted title
   */
  extractTitle(content) {
    const headings = MarkdownUtils.extractHeadings(content);
    
    if (headings.length > 0) {
      return headings[0].text;
    }
    
    // Fallback: use first line if it looks like a title
    const firstLine = content.split('\n')[0].trim();
    if (firstLine.length < 100 && !firstLine.includes('.')) {
      return firstLine;
    }
    
    return 'Untitled Section';
  }

  /**
   * Count words in content
   * @param {string} content - Content to count
   * @returns {number} Word count
   */
  countWords(content) {
    // Remove markdown syntax and count words
    const plainText = content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/#{1,6}\s/g, '') // Remove headings
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Keep link text only
      .replace(/[*_~`]/g, '') // Remove emphasis markers
      .replace(/<!--[\s\S]*?-->/g, ''); // Remove comments

    const words = plainText
      .split(/\s+/)
      .filter(word => word.length > 0 && /\w/.test(word));
    
    return words.length;
  }

  /**
   * Reset section counter
   */
  resetCounter() {
    this.sectionCounter = 0;
    this.logger.debug('Section counter reset');
  }

  /**
   * Get generation statistics
   * @returns {Object} Generation statistics
   */
  getStats() {
    return {
      sectionsGenerated: this.sectionCounter,
      timestamp: new Date().toISOString()
    };
  }
}

/**
 * Template utilities
 */
export const TemplateUtils = {
  /**
   * Validate template configuration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validateConfig(config) {
    const errors = [];
    const warnings = [];

    if (config.maxSectionLength && config.maxSectionLength < 100) {
      warnings.push('Very small maxSectionLength may result in truncated content');
    }

    if (config.outputFormat && !Object.values(TEMPLATE_TYPES).includes(config.outputFormat)) {
      errors.push(`Invalid output format: ${config.outputFormat}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  },

  /**
   * Create template configuration for specific use cases
   * @param {string} useCase - Use case identifier
   * @returns {Object} Template configuration
   */
  createConfigForUseCase(useCase) {
    switch (useCase) {
      case 'llms':
        return {
          ...DEFAULT_TEMPLATE_CONFIG,
          outputFormat: TEMPLATE_TYPES.LLMS_TXT,
          includeTableOfContents: true,
          maxSectionLength: 50000
        };
      
      case 'documentation':
        return {
          ...DEFAULT_TEMPLATE_CONFIG,
          outputFormat: TEMPLATE_TYPES.MARKDOWN,
          includeMetadata: true,
          includeTableOfContents: true
        };
      
      case 'analysis':
        return {
          ...DEFAULT_TEMPLATE_CONFIG,
          outputFormat: TEMPLATE_TYPES.STRUCTURED,
          includeMetadata: true,
          includeWordCount: true
        };
      
      default:
        return DEFAULT_TEMPLATE_CONFIG;
    }
  }
};

/**
 * Default template generator instance
 */
export const defaultGenerator = new TemplateGenerator();

/**
 * Convenience function for quick section generation
 * @param {Object} processedFile - Processed file data
 * @param {Object} config - Template configuration
 * @returns {Object} Generated section
 */
export function generateSection(processedFile, config = {}) {
  const generator = new TemplateGenerator(config);
  return generator.generateSection(processedFile);
}