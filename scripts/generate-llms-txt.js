#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');

// Import our modules
const { parseVitePressConfig, getDocumentationPages } = require('../lib/vitepress-parser.js');
const { MarkdownProcessor } = require('../lib/markdown-processor.js');
const { TemplateGenerator, TemplateUtils, TEMPLATE_TYPES } = require('../lib/template-generator.js');
const { FileUtils, OutputGenerator } = require('../lib/file-utils.js');
const { processVersion, validateVersion } = require('../lib/version-validator.js');
const {
  logger,
  LOG_LEVELS,
  Logger,
  ErrorHandler,
  PerformanceTimer
} = require('../lib/logger.js');



/**
 * CLI Configuration
 */
const CLI_CONFIG = {
  name: 'generate-llms-txt',
  version: '1.0.0',
  description: 'Generate LLMs.txt files from VitePress documentation',
  defaultConfigPath: 'docs/.vitepress/config.js',
  defaultOutputPath: 'docs/public/llms.txt',
  defaultLogLevel: 'info'
};

/**
 * Main CLI class
 */
class GenerateLLMsTxtCLI {
  constructor() {
    this.timer = new PerformanceTimer(logger);
    this.setupProgram();
  }

  /**
   * Set up the commander program
   */
  setupProgram() {
    program
      .name(CLI_CONFIG.name)
      .version(CLI_CONFIG.version)
      .description(CLI_CONFIG.description)
      .argument('[version]', 'Version to process (e.g., 4.0, 3.0, latest, all)', 'latest')
      .option('-c, --config <path>', 'Path to VitePress config file', CLI_CONFIG.defaultConfigPath)
      .option('-o, --output <path>', 'Output file path', CLI_CONFIG.defaultOutputPath)
      .option('-d, --docs-dir <path>', 'Documentation directory', 'docs')
      .option('--log-level <level>', 'Logging level (silent, error, warn, info, debug)', CLI_CONFIG.defaultLogLevel)
      .option('--log-file <path>', 'Log to file')
      .option('--include-toc', 'Include table of contents', false)
      .option('--include-metadata', 'Include file metadata', true)
      .option('--max-section-length <size>', 'Maximum section length in characters')
      .option('--format <format>', 'Output format (markdown, text, llms_txt)', 'llms_txt')
      .option('--title <title>', 'Custom title for generated file')
      .option('--description <description>', 'Custom description for generated file')
      .option('--dry-run', 'Show what would be done without actually generating files', false)
      .option('--verbose', 'Enable verbose output', false)
      .action(async (version, options) => {
        await this.execute(version, options);
      });

    program.parse();
  }

  /**
   * Execute the main CLI logic
   * @param {string} version - Version parameter
   * @param {Object} options - CLI options
   */
  async execute(version, options) {
    try {
      // Configure logging
      this.setupLogging(options);

      logger.info('Starting LLMs.txt generation', {
        version,
        config: options.config,
        output: options.output
      });

      // Validate and process version parameter
      const versionResult = this.processVersionParameter(version);
      logger.info('Version processing completed', {
        input: version,
        resolved: versionResult.versions,
        count: versionResult.count
      });

      // Parse VitePress configuration
      const configResult = this.parseConfiguration(options.config);
      logger.success('Configuration parsed successfully', {
        versions: Object.keys(configResult.sidebar).length,
        configPath: configResult.configPath
      });

      // Process each version
      const allResults = [];
      for (const targetVersion of versionResult.versions) {
        logger.info(`Processing version ${targetVersion}`);

        const versionResult = await this.processVersion(
          targetVersion,
          configResult,
          options
        );

        if (versionResult) {
          allResults.push(versionResult);
        }
      }

      // Generate final output
      if (!options.dryRun && allResults.length > 0) {
        await this.generateFinalOutput(allResults, options);
      }

      // Report final results
      this.reportResults(allResults, options);

    } catch (error) {
      logger.error('CLI execution failed', error);
      process.exit(1);
    }
  }

  /**
   * Set up logging configuration
   * @param {Object} options - CLI options
   */
  setupLogging(options) {
    // Set log level
    const logLevel = LOG_LEVELS[options.logLevel.toUpperCase()] || LOG_LEVELS.INFO;
    logger.setLevel(logLevel);

    // Configure verbose mode
    if (options.verbose) {
      logger.setLevel(LOG_LEVELS.DEBUG);
    }

    // Set up file logging if specified
    if (options.logFile) {
      logger.logFile = options.logFile;
    }

    logger.debug('Logging configured', {
      level: options.logLevel,
      verbose: options.verbose,
      logFile: options.logFile
    });
  }

  /**
   * Process version parameter
   * @param {string} version - Version input
   * @returns {Object} Processed version information
   */
  processVersionParameter(version) {
    try {
      const validation = validateVersion(version);

      if (!validation.valid) {
        throw new Error(`Invalid version parameter: ${validation.error}`);
      }

      return processVersion(version);
    } catch (error) {
      logger.error('Version parameter processing failed', error);
      throw error;
    }
  }

  /**
   * Parse VitePress configuration
   * @param {string} configPath - Path to config file
   * @returns {Object} Parsed configuration
   */
  parseConfiguration(configPath) {
    try {
      const absoluteConfigPath = path.resolve(configPath);
      logger.debug('Parsing VitePress configuration', { configPath: absoluteConfigPath });

      const result = parseVitePressConfig(absoluteConfigPath);

      if (!result.sidebar || Object.keys(result.sidebar).length === 0) {
        throw new Error('No sidebar configuration found in VitePress config');
      }

      return result;
    } catch (error) {
      logger.error('Configuration parsing failed', error);
      throw error;
    }
  }

  /**
   * Process a specific version
   * @param {string} version - Version to process
   * @param {Object} configResult - Parsed configuration
   * @param {Object} options - CLI options
   * @returns {Object} Processing result
   */
  async processVersion(version, configResult, options) {
    return this.timer.measure(`processVersion:${version}`, async () => {
      try {
        logger.info(`Starting processing for version ${version}`);

        // Get documentation pages for this version
        const pages = getDocumentationPages(configResult.sidebar, version);
        logger.info(`Found ${pages.length} pages for version ${version}`);

        if (pages.length === 0) {
          logger.warn(`No pages found for version ${version}`);
          return null;
        }

        // Convert page links to file paths
        const fileUtils = new FileUtils();
        const markdownFiles = [];

        for (const page of pages) {
          const filePath = path.join(options.docsDir, page.link.replace(/\.html$/, '.md'));
          const absolutePath = path.resolve(filePath);

          const fileInfo = fileUtils.getFileInfo(absolutePath);
          if (fileInfo && fileInfo.isFile) {
            markdownFiles.push(absolutePath);
          } else {
            logger.warn(`File not found: ${filePath}`);
          }
        }

        logger.info(`Processing ${markdownFiles.length} markdown files for version ${version}`);

        if (options.dryRun) {
          logger.info('Dry run mode - would process files:', { files: markdownFiles });
          return {
            version,
            files: markdownFiles,
            dryRun: true
          };
        }

        // Process markdown files
        const processor = new MarkdownProcessor();
        const processingResult = await processor.processFiles(markdownFiles);

        logger.info(`Processed ${processingResult.results.length} files successfully`, {
          successful: processingResult.results.length,
          failed: processingResult.errors.length
        });

        // Generate templates
        const templateConfig = TemplateUtils.createConfigForUseCase('llms');
        if (options.maxSectionLength) {
          templateConfig.maxSectionLength = parseInt(options.maxSectionLength);
        }
        if (options.format) {
          templateConfig.outputFormat = options.format;
        }

        const generator = new TemplateGenerator(templateConfig);
        const templateCollection = await generator.generateSections(processingResult.results, {
          includeTableOfContents: options.includeToc,
          includeMetadata: options.includeMetadata,
          outputFormat: templateConfig.outputFormat
        });

        logger.success(`Generated ${templateCollection.sections.length} sections for version ${version}`);

        return {
          version,
          templateCollection,
          processingResult,
          stats: {
            files: markdownFiles.length,
            processed: processingResult.results.length,
            failed: processingResult.errors.length,
            sections: templateCollection.sections.length,
            totalWords: templateCollection.metadata.totalWordCount
          }
        };

      } catch (error) {
        logger.error(`Failed to process version ${version}`, error);
        throw error;
      }
    });
  }

  /**
   * Generate final output file
   * @param {Array} results - Processing results for all versions
   * @param {Object} options - CLI options
   */
  async generateFinalOutput(results, options) {
    return this.timer.measure('generateFinalOutput', async () => {
      try {
        logger.info('Generating final output file', { outputPath: options.output });

        // Combine all template collections
        const allSections = [];
        for (const result of results) {
          if (result.templateCollection && result.templateCollection.sections) {
            allSections.push(...result.templateCollection.sections);
          }
        }

        const combinedCollection = {
          sections: allSections,
          metadata: {
            totalSections: allSections.length,
            totalWordCount: allSections.reduce((sum, s) => sum + (s.metadata?.wordCount || 0), 0),
            versions: results.map(r => r.version),
            generatedAt: new Date().toISOString()
          }
        };

        // Generate output
        const fileUtils = new FileUtils();
        const outputGenerator = new OutputGenerator(fileUtils);

        const outputOptions = {
          title: options.title || 'VitePress Documentation',
          description: options.description || 'Generated from VitePress documentation for LLM consumption',
          includeHeader: true,
          includeTableOfContents: options.includeToc,
          includeFooter: true,
          outputFormat: options.format
        };

        const outputResult = await outputGenerator.generateOutput(
          combinedCollection,
          options.output,
          outputOptions
        );

        logger.success('Output file generated successfully', {
          outputPath: outputResult.relativePath,
          size: outputResult.size,
          sections: outputResult.metadata.sections,
          words: outputResult.metadata.totalWords
        });

        // Copy to version directories as everything.md
        await this.copyToVersionDirectories(results, outputResult, options);

        return outputResult;

      } catch (error) {
        logger.error('Failed to generate final output', error);
        throw error;
      }
    });
  }

  /**
   * Copy generated content to version directories as everything.md
   * @param {Array} results - Processing results for all versions
   * @param {Object} outputResult - Main output file result
   * @param {Object} options - CLI options
   */
  async copyToVersionDirectories(results, outputResult, options) {
    return this.timer.measure('copyToVersionDirectories', async () => {
      try {
        logger.info('Copying generated content to version directories');

        const fileUtils = new FileUtils();

        // Read the generated content from the main output file
        const generatedContent = await fileUtils.readFile(outputResult.filePath);

        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
          if (!result.version) continue;

          try {
            const versionDir = path.join(options.docsDir, result.version);
            const everythingPath = path.join(versionDir, 'everything.md');

            // Ensure the version directory exists
            if (!fileUtils.ensureDirectory(versionDir)) {
              throw new Error(`Failed to create directory: ${versionDir}`);
            }

            // Write the content to everything.md
            await fileUtils.writeFile(everythingPath, generatedContent, {
              allowOverwrite: true,
              createDirectories: true
            });

            logger.success(`Copied to version ${result.version}`, {
              path: everythingPath
            });

            successCount++;

          } catch (error) {
            logger.error(`Failed to copy to version ${result.version}`, {
              version: result.version,
              error: error.message
            });
            errorCount++;
          }
        }

        logger.success('Version directory copying completed', {
          successful: successCount,
          failed: errorCount,
          total: results.length
        });

      } catch (error) {
        logger.error('Failed to copy to version directories', error);
        throw error;
      }
    });
  }

  /**
   * Report final results
   * @param {Array} results - All processing results
   * @param {Object} options - CLI options
   */
  reportResults(results, options) {
    logger.info('\n=== Generation Summary ===');

    let totalFiles = 0;
    let totalSections = 0;
    let totalWords = 0;

    for (const result of results) {
      if (result && result.stats) {
        totalFiles += result.stats.files || 0;
        totalSections += result.stats.sections || 0;
        totalWords += result.stats.totalWords || 0;

        logger.info(`Version ${result.version}:`, {
          files: result.stats.files,
          sections: result.stats.sections,
          words: result.stats.totalWords
        });
      }
    }

    logger.success('Total Summary:', {
      versions: results.length,
      files: totalFiles,
      sections: totalSections,
      words: totalWords,
      outputFile: options.output,
      dryRun: options.dryRun
    });

    if (options.dryRun) {
      logger.info('This was a dry run - no files were actually generated');
    }
  }
}

/**
 * Error handling for uncaught exceptions
 */
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
  process.exit(1);
});

/**
 * Initialize and run CLI
 */
if (require.main === module) {
  new GenerateLLMsTxtCLI();
}
