import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  logger, 
  FileProcessingError, 
  ErrorHandler,
  PerformanceTimer 
} from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Default file utilities configuration
 */
export const DEFAULT_FILE_CONFIG = {
  encoding: 'utf8',
  createDirectories: true,
  backupExisting: false,
  allowOverwrite: true,
  maxFileSize: 100 * 1024 * 1024, // 100MB
  excludePatterns: [
    '*.log',
    '*.tmp',
    'node_modules/**',
    '.git/**',
    '.DS_Store'
  ],
  includePatterns: [
    '*.md',
    '*.markdown'
  ]
};

/**
 * File utilities class for handling file operations
 */
export class FileUtils {
  constructor(config = {}) {
    this.config = { ...DEFAULT_FILE_CONFIG, ...config };
    this.logger = config.logger || logger;
    this.timer = new PerformanceTimer(this.logger);
  }

  /**
   * Safely read a file with error handling
   * @param {string} filePath - Path to the file
   * @param {Object} options - Read options
   * @returns {Promise<string>} File content
   */
  async readFile(filePath, options = {}) {
    const readOptions = { ...this.config, ...options };
    
    return this.timer.measure(`readFile:${path.basename(filePath)}`, async () => {
      try {
        const absolutePath = path.resolve(filePath);
        
        if (!fs.existsSync(absolutePath)) {
          throw new FileProcessingError(
            `File not found: ${filePath}`,
            'FILE_NOT_FOUND',
            { filePath: absolutePath }
          );
        }

        const stats = fs.statSync(absolutePath);
        
        // Check file size
        if (readOptions.maxFileSize && stats.size > readOptions.maxFileSize) {
          throw new FileProcessingError(
            `File too large: ${stats.size} bytes (max: ${readOptions.maxFileSize})`,
            'FILE_TOO_LARGE',
            { filePath: absolutePath, size: stats.size, maxSize: readOptions.maxFileSize }
          );
        }

        const content = fs.readFileSync(absolutePath, readOptions.encoding);
        
        this.logger.debug('File read successfully', {
          filePath: absolutePath,
          size: stats.size,
          encoding: readOptions.encoding
        });

        return content;

      } catch (error) {
        if (error instanceof FileProcessingError) {
          throw error;
        }
        throw ErrorHandler.file('read', filePath, error);
      }
    });
  }

  /**
   * Safely write a file with error handling
   * @param {string} filePath - Path to the file
   * @param {string} content - Content to write
   * @param {Object} options - Write options
   * @returns {Promise<Object>} Write result
   */
  async writeFile(filePath, content, options = {}) {
    const writeOptions = { ...this.config, ...options };
    
    return this.timer.measure(`writeFile:${path.basename(filePath)}`, async () => {
      try {
        const absolutePath = path.resolve(filePath);
        const directory = path.dirname(absolutePath);

        // Create directory if it doesn't exist
        if (writeOptions.createDirectories && !fs.existsSync(directory)) {
          fs.mkdirSync(directory, { recursive: true });
          this.logger.debug('Created directory', { directory });
        }

        // Check if file exists and handle accordingly
        let existingContent = null;
        if (fs.existsSync(absolutePath)) {
          if (!writeOptions.allowOverwrite) {
            throw new FileProcessingError(
              `File already exists and overwrite is not allowed: ${filePath}`,
              'FILE_EXISTS',
              { filePath: absolutePath }
            );
          }

          // Backup existing file if requested
          if (writeOptions.backupExisting) {
            existingContent = fs.readFileSync(absolutePath, writeOptions.encoding);
            const backupPath = `${absolutePath}.backup.${Date.now()}`;
            fs.writeFileSync(backupPath, existingContent);
            this.logger.debug('Created backup', { backupPath });
          }
        }

        // Write the file
        fs.writeFileSync(absolutePath, content, writeOptions.encoding);
        
        const stats = fs.statSync(absolutePath);
        
        const result = {
          filePath: absolutePath,
          relativePath: path.relative(process.cwd(), absolutePath),
          size: stats.size,
          created: !existingContent,
          backed: !!writeOptions.backupExisting && !!existingContent,
          writtenAt: new Date().toISOString()
        };

        this.logger.success('File written successfully', {
          filePath: path.basename(absolutePath),
          size: stats.size,
          created: result.created
        });

        return result;

      } catch (error) {
        if (error instanceof FileProcessingError) {
          throw error;
        }
        throw ErrorHandler.file('write', filePath, error);
      }
    });
  }

  /**
   * Find markdown files in a directory
   * @param {string} directory - Directory to search
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Array of found files
   */
  async findMarkdownFiles(directory, options = {}) {
    const searchOptions = { ...this.config, ...options };
    
    return this.timer.measure('findMarkdownFiles', async () => {
      try {
        const absoluteDir = path.resolve(directory);
        
        if (!fs.existsSync(absoluteDir)) {
          throw new FileProcessingError(
            `Directory not found: ${directory}`,
            'DIRECTORY_NOT_FOUND',
            { directory: absoluteDir }
          );
        }

        const stats = fs.statSync(absoluteDir);
        if (!stats.isDirectory()) {
          throw new FileProcessingError(
            `Path is not a directory: ${directory}`,
            'NOT_A_DIRECTORY',
            { directory: absoluteDir }
          );
        }

        const files = [];
        const errors = [];

        const walkDirectory = (dir) => {
          try {
            const items = fs.readdirSync(dir);
            
            for (const item of items) {
              const itemPath = path.join(dir, item);
              const itemStats = fs.statSync(itemPath);
              
              if (itemStats.isDirectory()) {
                // Recurse into subdirectories
                if (!this.shouldExclude(itemPath, searchOptions.excludePatterns)) {
                  walkDirectory(itemPath);
                }
              } else if (itemStats.isFile()) {
                // Check if it's a markdown file
                if (this.isMarkdownFile(itemPath) && 
                    !this.shouldExclude(itemPath, searchOptions.excludePatterns)) {
                  files.push({
                    absolutePath: itemPath,
                    relativePath: path.relative(absoluteDir, itemPath),
                    size: itemStats.size,
                    modified: itemStats.mtime
                  });
                }
              }
            }
          } catch (error) {
            errors.push({
              directory: dir,
              error: error.message
            });
          }
        };

        walkDirectory(absoluteDir);

        // Sort files by relative path for consistent ordering
        files.sort((a, b) => a.relativePath.localeCompare(b.relativePath));

        this.logger.info('Markdown files found', {
          directory: absoluteDir,
          count: files.length,
          errors: errors.length
        });

        return {
          files,
          errors,
          directory: absoluteDir,
          searchedAt: new Date().toISOString()
        };

      } catch (error) {
        if (error instanceof FileProcessingError) {
          throw error;
        }
        throw ErrorHandler.file('search', directory, error);
      }
    });
  }

  /**
   * Check if a file should be excluded based on patterns
   * @param {string} filePath - File path to check
   * @param {Array} excludePatterns - Array of exclusion patterns
   * @returns {boolean} True if file should be excluded
   */
  shouldExclude(filePath, excludePatterns = []) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    for (const pattern of excludePatterns) {
      if (this.matchesPattern(relativePath, pattern)) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Check if a file path matches a pattern
   * @param {string} filePath - File path to check
   * @param {string} pattern - Pattern to match against
   * @returns {boolean} True if pattern matches
   */
  matchesPattern(filePath, pattern) {
    // Convert glob pattern to regex
    const regexPattern = pattern
      .replace(/\*\*/g, '.*') // ** matches any number of directories
      .replace(/\*/g, '[^/]*') // * matches any characters except /
      .replace(/\?/g, '.') // ? matches any single character
      .replace(/\./g, '\\.'); // Escape dots
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(filePath);
  }

  /**
   * Check if a file is a markdown file
   * @param {string} filePath - File path to check
   * @returns {boolean} True if it's a markdown file
   */
  isMarkdownFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.md' || ext === '.markdown';
  }

  /**
   * Ensure directory exists
   * @param {string} dirPath - Directory path
   * @returns {boolean} True if directory exists or was created
   */
  ensureDirectory(dirPath) {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        this.logger.debug('Created directory', { directory: dirPath });
        return true;
      }
      return true;
    } catch (error) {
      this.logger.error('Failed to create directory', { directory: dirPath, error: error.message });
      return false;
    }
  }

  /**
   * Get file information
   * @param {string} filePath - File path
   * @returns {Object} File information
   */
  getFileInfo(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      
      if (!fs.existsSync(absolutePath)) {
        return null;
      }

      const stats = fs.statSync(absolutePath);
      
      return {
        absolutePath,
        relativePath: path.relative(process.cwd(), absolutePath),
        basename: path.basename(absolutePath),
        dirname: path.dirname(absolutePath),
        extname: path.extname(absolutePath),
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile()
      };
    } catch (error) {
      this.logger.error('Failed to get file info', { filePath, error: error.message });
      return null;
    }
  }

  /**
   * Clean up temporary files
   * @param {Array} filePaths - Array of file paths to clean up
   * @returns {Object} Cleanup result
   */
  cleanup(filePaths) {
    const results = {
      cleaned: [],
      errors: []
    };

    for (const filePath of filePaths) {
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          results.cleaned.push(filePath);
          this.logger.debug('Cleaned up file', { filePath });
        }
      } catch (error) {
        results.errors.push({ filePath, error: error.message });
        this.logger.warn('Failed to clean up file', { filePath, error: error.message });
      }
    }

    return results;
  }
}

/**
 * Output generator class for creating final output files
 */
export class OutputGenerator {
  constructor(fileUtils, config = {}) {
    this.fileUtils = fileUtils || new FileUtils();
    this.config = config;
    this.logger = config.logger || logger;
    this.timer = new PerformanceTimer(this.logger);
  }

  /**
   * Generate output file from template collection
   * @param {Object} templateCollection - Collection of templates
   * @param {string} outputPath - Output file path
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Generation result
   */
  async generateOutput(templateCollection, outputPath, options = {}) {
    return this.timer.measure('generateOutput', async () => {
      try {
        this.logger.info('Generating output file', { 
          outputPath, 
          sections: templateCollection.sections?.length || 0 
        });

        let outputContent = '';

        // Add header if requested
        if (options.includeHeader !== false) {
          outputContent += this.generateHeader(templateCollection, options);
        }

        // Add table of contents if requested
        if (options.includeTableOfContents) {
          outputContent += this.generateTableOfContents(templateCollection, options);
        }

        // Add main content
        if (templateCollection.combined) {
          outputContent += templateCollection.combined.content;
        } else if (templateCollection.sections) {
          const separator = options.sectionSeparator || '\n\n---\n\n';
          for (let i = 0; i < templateCollection.sections.length; i++) {
            if (i > 0) {
              outputContent += separator;
            }
            const section = templateCollection.sections[i];
            outputContent += section.formatted || section.content;
          }
        }

        // Add footer if requested
        if (options.includeFooter) {
          outputContent += this.generateFooter(templateCollection, options);
        }

        // Write output file
        const writeResult = await this.fileUtils.writeFile(outputPath, outputContent, options);

        const result = {
          ...writeResult,
          metadata: {
            sections: templateCollection.sections?.length || 0,
            totalWords: this.countWords(outputContent),
            outputFormat: options.outputFormat || 'markdown',
            generatedAt: new Date().toISOString()
          }
        };

        this.logger.success('Output file generated successfully', {
          outputPath: path.basename(outputPath),
          size: result.size,
          sections: result.metadata.sections,
          words: result.metadata.totalWords
        });

        return result;

      } catch (error) {
        this.logger.error('Failed to generate output', error);
        throw ErrorHandler.file('generate output', outputPath, error);
      }
    });
  }

  /**
   * Generate header for output file
   * @param {Object} templateCollection - Template collection
   * @param {Object} options - Generation options
   * @returns {string} Header content
   */
  generateHeader(templateCollection, options = {}) {
    let header = '';

    if (options.title) {
      header += `# ${options.title}\n\n`;
    }

    if (options.description) {
      header += `${options.description}\n\n`;
    }

    // Add generation metadata
    header += '<!-- Generated file - do not edit directly -->\n';
    header += `<!-- Generated at: ${new Date().toISOString()} -->\n`;
    header += `<!-- Sections: ${templateCollection.sections?.length || 0} -->\n`;
    
    if (templateCollection.metadata?.totalWordCount) {
      header += `<!-- Total words: ${templateCollection.metadata.totalWordCount} -->\n`;
    }

    header += '\n';

    return header;
  }

  /**
   * Generate table of contents for output file
   * @param {Object} templateCollection - Template collection
   * @param {Object} options - Generation options
   * @returns {string} Table of contents content
   */
  generateTableOfContents(templateCollection, options = {}) {
    if (!templateCollection.sections || templateCollection.sections.length === 0) {
      return '';
    }

    let toc = '## Table of Contents\n\n';

    for (const section of templateCollection.sections) {
      if (section.metadata?.title) {
        const anchor = section.metadata.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '');
        
        toc += `- [${section.metadata.title}](#${anchor})\n`;
      }
    }

    toc += '\n';

    return toc;
  }

  /**
   * Generate footer for output file
   * @param {Object} templateCollection - Template collection
   * @param {Object} options - Generation options
   * @returns {string} Footer content
   */
  generateFooter(templateCollection, options = {}) {
    let footer = '\n---\n\n';
    
    footer += '## Generation Information\n\n';
    footer += `- **Generated at:** ${new Date().toISOString()}\n`;
    footer += `- **Total sections:** ${templateCollection.sections?.length || 0}\n`;
    
    if (templateCollection.metadata?.totalWordCount) {
      footer += `- **Total words:** ${templateCollection.metadata.totalWordCount}\n`;
    }

    if (templateCollection.sections) {
      footer += '\n### Source Files\n\n';
      for (const section of templateCollection.sections) {
        if (section.metadata?.sourceFile) {
          footer += `- ${section.metadata.sourceFile}\n`;
        }
      }
    }

    footer += '\n';

    return footer;
  }

  /**
   * Count words in content
   * @param {string} content - Content to count
   * @returns {number} Word count
   */
  countWords(content) {
    return content
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/<!--[\s\S]*?-->/g, '') // Remove comments
      .split(/\s+/)
      .filter(word => word.length > 0 && /\w/.test(word))
      .length;
  }
}

/**
 * Default instances
 */
export const defaultFileUtils = new FileUtils();
export const defaultOutputGenerator = new OutputGenerator(defaultFileUtils);

/**
 * Convenience functions
 */
export async function findMarkdownFiles(directory, config = {}) {
  const fileUtils = new FileUtils(config);
  return await fileUtils.findMarkdownFiles(directory);
}

export async function generateOutputFile(templateCollection, outputPath, config = {}) {
  const outputGenerator = new OutputGenerator(null, config);
  return await outputGenerator.generateOutput(templateCollection, outputPath, config);
}