#!/usr/bin/env node

const { program } = require('commander');
const path = require('path');
const fs = require('fs');
const { minimatch } = require('minimatch');

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
  description: 'Generate LLMs.txt files from Avo documentation',
  defaultConfigPath: 'docs/.vitepress/config.js',
  defaultOutputPath: 'docs/public/llms.txt',
  defaultLogLevel: 'info'
};

/**
 * Default ignore patterns for files to exclude from compilation
 * These patterns are always applied unless overridden
 */
const DEFAULT_IGNORE_PATTERNS = [
  '**/.*',           // Hidden files (dotfiles)
  '**/*.tmp',        // Temporary files
  '**/*.bak',        // Backup files
  '**/*~',           // Editor backup files
  '**/node_modules/**', // Node modules
  '**/dist/**',      // Distribution directories
  '**/build/**',     // Build directories
  'upgrade.md'
  // Add more default patterns as needed
];

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
      .option('--ignore <patterns...>', 'Additional ignore patterns for files to exclude (glob patterns supported, adds to defaults)')
      .option('--ignore-only <patterns...>', 'Override default ignore patterns with only these patterns')
      .option('--no-default-ignores', 'Disable default ignore patterns')
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
    // Store the original version parameter to check later
    this.originalVersionParam = version;
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
      const configResult = await this.parseConfiguration(options.config);
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
  async parseConfiguration(configPath) {
    try {
      const absoluteConfigPath = path.resolve(configPath);
      logger.debug('Parsing VitePress configuration', { configPath: absoluteConfigPath });

      const result = await parseVitePressConfig(absoluteConfigPath);

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
   * Get effective ignore patterns based on CLI options and defaults
   * @param {Object} options - CLI options
   * @returns {Array} Combined ignore patterns
   */
  getEffectiveIgnorePatterns(options) {
    let patterns = [];

    // Start with default patterns unless disabled
    if (options.defaultIgnores !== false) {
      patterns = [...DEFAULT_IGNORE_PATTERNS];
    }

    // Handle ignore-only option (override defaults)
    if (options.ignoreOnly && options.ignoreOnly.length > 0) {
      patterns = [...options.ignoreOnly];
    } else if (options.ignore && options.ignore.length > 0) {
      // Add additional patterns to defaults
      patterns = patterns.concat(options.ignore);
    }

    // Remove duplicates
    patterns = [...new Set(patterns)];

    logger.debug('Effective ignore patterns', {
      defaultCount: DEFAULT_IGNORE_PATTERNS.length,
      cliCount: (options.ignore?.length || 0) + (options.ignoreOnly?.length || 0),
      totalCount: patterns.length,
      useDefaults: options.defaultIgnores !== false,
      overrideMode: !!options.ignoreOnly,
      patterns
    });

    return patterns;
  }

  /**
   * Filter files based on ignore patterns
   * @param {Array} files - Array of file paths
   * @param {Array} ignorePatterns - Array of ignore patterns
   * @param {string} docsDir - Base documentation directory
   * @returns {Object} Filtered files and ignored files info
   */
  filterIgnoredFiles(files, ignorePatterns, docsDir) {
    if (!ignorePatterns || ignorePatterns.length === 0) {
      return {
        filteredFiles: files,
        ignoredFiles: [],
        ignoredCount: 0
      };
    }

    const filteredFiles = [];
    const ignoredFiles = [];

    for (const file of files) {
      const relativePath = path.relative(docsDir, file);
      let shouldIgnore = false;
      let matchedPattern = null;

      for (const pattern of ignorePatterns) {
        // Support both glob patterns and simple path matching
        if (minimatch(relativePath, pattern) ||
            relativePath.includes(pattern) ||
            file.includes(pattern)) {
          shouldIgnore = true;
          matchedPattern = pattern;
          break;
        }
      }

      if (shouldIgnore) {
        ignoredFiles.push({ file, relativePath, pattern: matchedPattern });
      } else {
        filteredFiles.push(file);
      }
    }

    logger.debug('File filtering completed', {
      total: files.length,
      filtered: filteredFiles.length,
      ignored: ignoredFiles.length,
      patterns: ignorePatterns
    });

    return {
      filteredFiles,
      ignoredFiles,
      ignoredCount: ignoredFiles.length
    };
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

        // Add the main guides.md file
        const guidesIndexFile = path.join(options.docsDir, version, 'guides.md');
        if (fs.existsSync(guidesIndexFile)) {
          markdownFiles.push(path.resolve(guidesIndexFile));
          logger.info(`Added main guides.md file`);
        }

        // Add all individual guides from the guides directory
        const guidesDir = path.join(options.docsDir, version, 'guides');
        if (fs.existsSync(guidesDir)) {
          const guideFiles = fs.readdirSync(guidesDir)
            .filter(file => file.endsWith('.md'))
            .map(file => path.resolve(guidesDir, file));

          markdownFiles.push(...guideFiles);
          logger.info(`Added ${guideFiles.length} individual guide files from ${guidesDir}`);
        } else {
          logger.warn(`Guides directory not found: ${guidesDir}`);
        }

        // Filter files based on ignore patterns
        const effectiveIgnorePatterns = this.getEffectiveIgnorePatterns(options);
        const filterResult = this.filterIgnoredFiles(markdownFiles, effectiveIgnorePatterns, options.docsDir);
        const finalMarkdownFiles = filterResult.filteredFiles;

        if (filterResult.ignoredCount > 0) {
          logger.info(`Ignored ${filterResult.ignoredCount} files based on ignore patterns`, {
            defaultPatterns: DEFAULT_IGNORE_PATTERNS.length,
            cliPatterns: (options.ignore?.length || 0) + (options.ignoreOnly?.length || 0),
            totalPatterns: effectiveIgnorePatterns.length,
            ignoredFiles: filterResult.ignoredFiles.map(f => `${f.relativePath} (${f.pattern})`)
          });
        }

        logger.info(`Processing ${finalMarkdownFiles.length} markdown files (${filterResult.ignoredCount} ignored) for version ${version}`);

                if (options.dryRun) {
          logger.info('Dry run mode - would process files:', {
            files: finalMarkdownFiles,
            ignored: filterResult.ignoredFiles.map(f => `${f.relativePath} (${f.pattern})`),
            ignorePatterns: effectiveIgnorePatterns
          });
          return {
            version,
            files: finalMarkdownFiles,
            ignoredFiles: filterResult.ignoredFiles,
            ignorePatterns: effectiveIgnorePatterns,
            dryRun: true
          };
        }

        // Process markdown files
        const processor = new MarkdownProcessor();
        const processingResult = await processor.processFiles(finalMarkdownFiles);

        logger.info(`Processed ${processingResult.results.length} files successfully`, {
          successful: processingResult.results.length,
          failed: processingResult.errors.length,
          ignored: filterResult.ignoredCount
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
            files: finalMarkdownFiles.length,
            processed: processingResult.results.length,
            failed: processingResult.errors.length,
            ignored: filterResult.ignoredCount,
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
        logger.info('Generating output files', {
          versions: results.map(r => r.version),
          outputPath: options.output
        });

        const fileUtils = new FileUtils();
        const outputGenerator = new OutputGenerator(fileUtils);
        const outputResults = [];

        // Generate individual version files
        for (const result of results) {
          if (result.templateCollection && result.templateCollection.sections) {
            try {
              // Generate individual version output
              const versionOutputOptions = {
                title: options.title ? `${options.title} - Version ${result.version}` : `Avo for Ruby on Rails Documentation - Version ${result.version}`,
                description: options.description || `Generated from Avo documentation v${result.version} for LLM consumption`,
                includeHeader: true,
                includeTableOfContents: options.includeToc,
                includeFooter: true,
                outputFormat: options.format
              };

                             // Generate output for this version in public directory
               const versionDir = path.join(options.docsDir, 'public', result.version);
               const versionOutputPath = path.join(versionDir, 'llms-full.txt');

              const versionOutputResult = await outputGenerator.generateOutput(
                result.templateCollection,
                versionOutputPath,
                versionOutputOptions
              );

              logger.success(`Generated llms.txt for version ${result.version}`, {
                outputPath: versionOutputResult.relativePath,
                size: versionOutputResult.size,
                sections: versionOutputResult.metadata.sections,
                words: versionOutputResult.metadata.totalWords
              });

              outputResults.push({
                version: result.version,
                outputResult: versionOutputResult
              });

            } catch (error) {
              logger.error(`Failed to generate output for version ${result.version}`, error);
            }
          }
        }

                // Generate combined output file in public directory (only for single version or explicit requests)
        // Skip combined file when processing "all" versions
        const isProcessingAllVersions = this.originalVersionParam === 'all';

        if (results.length > 1 && !isProcessingAllVersions) {
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

          const combinedOutputOptions = {
            title: options.title || 'Avo Documentation - All Versions',
            description: options.description || 'Generated from Avo documentation for LLM consumption (all versions combined)',
            includeHeader: true,
            includeTableOfContents: options.includeToc,
            includeFooter: true,
            outputFormat: options.format
          };

          const combinedOutputResult = await outputGenerator.generateOutput(
            combinedCollection,
            options.output,
            combinedOutputOptions
          );

          logger.success('Combined output file generated successfully', {
            outputPath: combinedOutputResult.relativePath,
            size: combinedOutputResult.size,
            sections: combinedOutputResult.metadata.sections,
            words: combinedOutputResult.metadata.totalWords
          });

          outputResults.push({
            version: 'combined',
            outputResult: combinedOutputResult
          });
        } else if (isProcessingAllVersions) {
          logger.info('Skipping combined output file when processing all versions - only generating versioned files');
        }

        // Also copy to version directories as everything.md (for backward compatibility)
        // await this.copyToVersionDirectories(results, outputResults, options);

        return outputResults;

      } catch (error) {
        logger.error('Failed to generate output files', error);
        throw error;
      }
    });
  }

  /**
   * Copy generated content to version directories as everything.md
   * @param {Array} results - Processing results for all versions
   * @param {Array} outputResults - Generated output results
   * @param {Object} options - CLI options
   */
  async copyToVersionDirectories(results, outputResults, options) {
    return this.timer.measure('copyToVersionDirectories', async () => {
      try {
        logger.info('Copying generated content to version directories as everything.md');

        const fileUtils = new FileUtils();
        let successCount = 0;
        let errorCount = 0;

        for (const result of results) {
          if (!result.version) continue;

          try {
            // Find the corresponding output result for this version
            const versionOutput = outputResults.find(o => o.version === result.version);

            if (!versionOutput) {
              logger.warn(`No output result found for version ${result.version}`);
              continue;
            }

            // Read the generated content from the version-specific output file
            const generatedContent = await fileUtils.readFile(versionOutput.outputResult.filePath);

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
          words: result.stats.totalWords,
          outputFile: `public/${result.version}/llms.txt`
        });
      }
    }

    const isProcessingAllVersions = this.originalVersionParam === 'all';

    logger.success('Total Summary:', {
      versions: results.length,
      files: totalFiles,
      sections: totalSections,
      words: totalWords,
      individualFiles: results.map(r => `public/${r.version}/llms.txt`),
      combinedFile: (results.length > 1 && !isProcessingAllVersions) ? options.output : null,
      dryRun: options.dryRun
    });

    if (options.dryRun) {
      logger.info('This was a dry run - no files were actually generated');
    } else {
      logger.info('Generated files:');
      for (const result of results) {
        logger.info(`  ✓ docs/public/${result.version}/llms.txt`);
      }
      if (results.length > 1 && !isProcessingAllVersions) {
        logger.info(`  ✓ ${options.output} (combined)`);
      }
      if (isProcessingAllVersions) {
        logger.info('Note: Combined file skipped when processing all versions');
      }
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
