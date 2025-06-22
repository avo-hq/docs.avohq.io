const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const {
  logger,
  VitePressParserError,
  FileProcessingError,
  ErrorHandler,
  PerformanceTimer
} = require('./logger.js');

/**
 * Load ES6 config via child process to avoid module loading issues
 * @param {string} configPath - Absolute path to config file
 * @returns {Promise<Object>} Loaded config object
 */
async function loadES6ConfigViaChildProcess(configPath) {
  return new Promise((resolve, reject) => {
    // Create a temporary script that can load the ES6 module
    const tempScript = `
      import config from '${configPath}';
      console.log(JSON.stringify(config, null, 2));
    `;

    // Use node with --input-type=module to run ES6 code directly
    const child = spawn('node', ['--input-type=module', '--eval', tempScript], {
      stdio: ['pipe', 'pipe', 'pipe'],
      cwd: path.dirname(configPath)
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        try {
          const config = JSON.parse(stdout);
          resolve(config);
        } catch (parseError) {
          reject(new Error(`Failed to parse config JSON: ${parseError.message}`));
        }
      } else {
        reject(new Error(`Child process failed with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Failed to spawn child process: ${error.message}`));
    });
  });
}

/**
 * Parse VitePress config.js file and extract sidebar structure
 * @param {string} configPath - Path to the VitePress config.js file
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed sidebar structure
 */
async function parseVitePressConfig(configPath, options = {}) {
  const loggerInstance = options.logger || logger;

  try {
    loggerInstance.info('Starting VitePress config parsing', { configPath });

    if (!configPath) {
      throw new VitePressParserError(
        'Config path is required',
        'MISSING_CONFIG_PATH'
      );
    }

    if (!fs.existsSync(configPath)) {
      throw new FileProcessingError(
        `Config file not found: ${configPath}`,
        'CONFIG_FILE_NOT_FOUND',
        { configPath }
      );
    }

    loggerInstance.debug('Reading config file', { configPath });

            // Try to dynamically import the config file to evaluate JavaScript
    let config;
    try {
      const absoluteConfigPath = path.resolve(configPath);

      // Try to load the ES6 module using a child process approach
      loggerInstance.debug('Attempting to load config via child process');

      config = await loadES6ConfigViaChildProcess(absoluteConfigPath);

      loggerInstance.debug('Successfully loaded config via child process');

    } catch (importError) {
      loggerInstance.debug('Failed to import config, falling back to regex parsing', {
        error: importError.message
      });

      // Fallback to regex parsing
      const configContent = fs.readFileSync(configPath, 'utf8');

      if (!configContent.trim()) {
        throw new VitePressParserError(
          'Config file is empty',
          'EMPTY_CONFIG_FILE',
          { configPath }
        );
      }

      // Extract sidebar configuration using regex (simplified approach)
      const sidebarMatch = configContent.match(/sidebar:\s*{([\s\S]*?)},\s*["']\/[^"']+["']:/);

      if (!sidebarMatch) {
        loggerInstance.warn('Could not find sidebar configuration using regex, attempting alternative parsing');
        // Try alternative pattern
        const altMatch = configContent.match(/sidebar:\s*{([\s\S]*?)}/);
        if (!altMatch) {
          throw new VitePressParserError(
            'Could not find sidebar configuration in config file',
            'SIDEBAR_NOT_FOUND',
            { configPath }
          );
        }
      }

      loggerInstance.debug('Extracting sidebar structure using regex');
      const sidebar = extractSidebarStructure(configContent);

      const result = {
        sidebar,
        configPath,
        parsedAt: new Date().toISOString(),
        method: 'regex',
        stats: {
          versions: Object.keys(sidebar).length,
          totalSections: Object.values(sidebar).reduce((sum, sections) => sum + sections.length, 0)
        }
      };

      loggerInstance.success('VitePress config parsed successfully via regex', {
        versions: result.stats.versions,
        totalSections: result.stats.totalSections
      });

      return result;
    }

    // If we successfully loaded the config, extract sidebar from the actual object
    if (!config || !config.themeConfig || !config.themeConfig.sidebar) {
      throw new VitePressParserError(
        'Config file does not contain themeConfig.sidebar',
        'SIDEBAR_NOT_FOUND',
        { configPath }
      );
    }

    loggerInstance.debug('Extracting sidebar structure from loaded config');
    const sidebar = extractSidebarFromConfig(config.themeConfig.sidebar);

    const result = {
      sidebar,
      configPath,
      parsedAt: new Date().toISOString(),
      method: 'dynamic_import',
      stats: {
        versions: Object.keys(sidebar).length,
        totalSections: Object.values(sidebar).reduce((sum, sections) => sum + sections.length, 0)
      }
    };

    loggerInstance.success('VitePress config parsed successfully via dynamic import', {
      versions: result.stats.versions,
      totalSections: result.stats.totalSections
    });

    return result;

  } catch (error) {
    if (error instanceof VitePressParserError || error instanceof FileProcessingError) {
      loggerInstance.error('VitePress config parsing failed', error);
      throw error;
    }

    // Wrap unexpected errors
    const wrappedError = new VitePressParserError(
      `Failed to parse VitePress config: ${error.message}`,
      'PARSING_ERROR',
      { configPath, originalError: error.message }
    );

    loggerInstance.error('Unexpected error during config parsing', wrappedError);
    throw wrappedError;
  }
}

/**
 * Extract sidebar structure from loaded config object
 * @param {Object} sidebarConfig - Sidebar configuration object
 * @returns {Object} Sidebar structure organized by version
 */
function extractSidebarFromConfig(sidebarConfig) {
  const sidebar = {};

  try {
    logger.debug('Extracting sidebar structure from config object');

    // Iterate through each version in the sidebar config
    for (const [versionPath, sectionArray] of Object.entries(sidebarConfig)) {
      // Extract version number from path (e.g., "/4.0/" -> "4.0")
      const versionMatch = versionPath.match(/\/(\d+\.\d+)\//);
      if (!versionMatch) {
        logger.warn(`Could not extract version from path: ${versionPath}`);
        continue;
      }

      const version = versionMatch[1];
      logger.debug(`Processing version ${version} from path ${versionPath}`);

      sidebar[version] = [];

      // Process each section in the array
      for (const section of sectionArray) {
        const processedSection = processSidebarSection(section);
        sidebar[version].push(processedSection);
      }

      logger.debug(`Successfully processed ${sidebar[version].length} sections for version ${version}`);
    }

    logger.debug(`Extracted sidebar structure for ${Object.keys(sidebar).length} versions`);

  } catch (error) {
    logger.error('Failed to extract sidebar structure from config object', { error: error.message });
    throw new VitePressParserError(
      'Failed to extract sidebar structure from config object',
      'SIDEBAR_EXTRACTION_ERROR',
      { originalError: error.message }
    );
  }

  return sidebar;
}

/**
 * Process individual sidebar section from config object
 * @param {Object} section - Sidebar section object
 * @returns {Object} Processed section with all nested items
 */
function processSidebarSection(section) {
  const processedSection = {
    text: section.text
  };

  // Copy boolean properties
  if (section.collapsible !== undefined) {
    processedSection.collapsible = section.collapsible;
  }
  if (section.collapsed !== undefined) {
    processedSection.collapsed = section.collapsed;
  }

  // Add link if present
  if (section.link) {
    processedSection.link = section.link;
  }

  // Process nested items
  if (section.items && Array.isArray(section.items)) {
    processedSection.items = [];

    for (const item of section.items) {
      if (typeof item === 'object' && item !== null) {
        const processedItem = {
          text: item.text
        };

        if (item.link) {
          processedItem.link = item.link;
        }

        // Handle nested items recursively
        if (item.items && Array.isArray(item.items)) {
          processedItem.items = item.items.map(nestedItem => ({
            text: nestedItem.text,
            link: nestedItem.link
          }));
        }

        processedSection.items.push(processedItem);
      }
    }
  }

  return processedSection;
}

/**
 * Extract sidebar structure from config content
 * @param {string} configContent - Content of the config file
 * @returns {Object} Sidebar structure organized by version
 */
function extractSidebarStructure(configContent) {
  const sidebar = {};

  try {
    logger.debug('Extracting version-specific sidebar sections');

    // Extract version-specific sidebar sections
    // Use a simple approach: find each version section individually
    const versionPattern = /["'](\/)(\d+\.\d+)(\/?)["']:\s*\[/g;
    let match;
    let matchCount = 0;

    while ((match = versionPattern.exec(configContent)) !== null) {
      const version = match[2]; // The version number (4.0, 3.0, etc.)
      const startPos = match.index + match[0].length;

      // Find the matching closing bracket
      let bracketCount = 1;
      let endPos = startPos;

      while (endPos < configContent.length && bracketCount > 0) {
        if (configContent[endPos] === '[') bracketCount++;
        if (configContent[endPos] === ']') bracketCount--;
        endPos++;
      }

      if (bracketCount === 0) {
        const sectionContent = configContent.substring(startPos, endPos - 1);

        logger.debug(`Processing version ${version}`, { version });

        try {
          sidebar[version] = parseSidebarSection(sectionContent);
          matchCount++;

          logger.debug(`Successfully parsed ${sidebar[version].length} sections for version ${version}`);
        } catch (error) {
          logger.warn(`Failed to parse sidebar section for version ${version}`, {
            version,
            error: error.message
          });
          // Continue processing other versions
          sidebar[version] = [];
        }
      }
    }

    if (matchCount === 0) {
      logger.warn('No version-specific sidebar sections found, attempting fallback parsing');
      // Fallback: try to find any sidebar structure
      const fallbackMatch = configContent.match(/sidebar:\s*{([\s\S]*?)}/);
      if (fallbackMatch) {
        sidebar['default'] = parseSidebarSection(fallbackMatch[1]);
        logger.info('Found fallback sidebar structure', { sections: sidebar['default'].length });
      }
    }

    logger.debug(`Extracted sidebar structure for ${Object.keys(sidebar).length} versions`);

  } catch (error) {
    logger.error('Failed to extract sidebar structure', { error: error.message });
    throw new VitePressParserError(
      'Failed to extract sidebar structure',
      'SIDEBAR_EXTRACTION_ERROR',
      { originalError: error.message }
    );
  }

  return sidebar;
}

/**
 * Parse individual sidebar section content
 * @param {string} sectionContent - Content of a sidebar section
 * @returns {Array} Parsed sidebar items
 */
function parseSidebarSection(sectionContent) {
  const items = [];

  // Extract individual sidebar items using regex
  // This is a simplified parser - you might want to use a proper AST parser for production
  const itemMatches = sectionContent.matchAll(/{[\s\S]*?text:\s*["']([^"']+)["'][\s\S]*?}/g);

  for (const match of itemMatches) {
    const text = match[1];
    const fullItemMatch = match[0];

    const item = {
      text,
      items: extractNestedItems(fullItemMatch, text),
      link: extractLink(fullItemMatch),
      collapsible: fullItemMatch.includes('collapsible: true'),
      collapsed: fullItemMatch.includes('collapsed: true')
    };

    // Only add link if it exists
    if (!item.link) {
      delete item.link;
    }

    items.push(item);
  }

  return items;
}

/**
 * Extract nested items from a sidebar item
 * @param {string} itemContent - Content of a sidebar item
 * @param {string} sectionText - Text of the parent section (for context)
 * @returns {Array} Nested items
 */
function extractNestedItems(itemContent, sectionText) {
  const nestedItems = [];

  // Look for items array within the item
  const itemsMatch = itemContent.match(/items:\s*\[([\s\S]*?)\]/);
  if (itemsMatch) {
    const itemsContent = itemsMatch[1];
    const nestedMatches = itemsContent.matchAll(/{[\s\S]*?text:\s*["']([^"']+)["'][\s\S]*?link:\s*["']([^"']+)["'][\s\S]*?}/g);

    for (const match of nestedMatches) {
      nestedItems.push({
        text: match[1],
        link: match[2]
      });
    }
  } else {
    // Check for dynamic variable references like fieldsMenuItems3
    const variableMatch = itemContent.match(/items:\s*([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (variableMatch) {
      const variableName = variableMatch[1];

      // Handle specific known variables
      if (variableName.includes('fieldsMenuItems') && sectionText === 'Field types') {
        logger.debug(`Resolving dynamic field items for ${variableName}`);

        // Extract version from variable name (e.g., fieldsMenuItems3 -> 3.0)
        const versionMatch = variableName.match(/fieldsMenuItems(\d)/);
        if (versionMatch) {
          const versionNumber = versionMatch[1];
          const version = `${versionNumber}.0`;

          try {
            const fieldItems = generateFieldMenuItems(version);
            nestedItems.push(...fieldItems);
            logger.debug(`Generated ${fieldItems.length} field items for version ${version}`);
          } catch (error) {
            logger.warn(`Failed to generate field items for ${variableName}`, { error: error.message });
          }
        }
      }
    }
  }

  return nestedItems;
}

/**
 * Generate field menu items by reading files from the fields directory
 * @param {string} version - Version string (e.g., '3.0', '4.0')
 * @returns {Array} Array of field menu items
 */
function generateFieldMenuItems(version) {
  const fieldItems = [];

  try {
    // Construct the fields directory path
    const fieldsDir = path.join(__dirname, '..', 'docs', version, 'fields');

    if (!fs.existsSync(fieldsDir)) {
      logger.warn(`Fields directory not found: ${fieldsDir}`);
      return fieldItems;
    }

    // Read files from the fields directory
    const files = fs.readdirSync(fieldsDir);

    // Filter and process files similar to the getFiles function
    const processedFiles = files
      .filter(file => file !== 'index.md')
      .filter(file => file !== 'common')
      .filter(file => !file.includes('_common.md'))
      .filter(file => file.endsWith('.md'))
      .map(file => {
        let text = humanizeFieldName(file.replace('.md', ''));

        // Handle special cases
        if (text === 'Easy mde') {
          text = 'Easy MDE';
        }
        if (text === 'Tip tap') {
          text = 'Tip Tap';
        }

        const link = `/${version}/fields/${file.replace('.md', '.html')}`;

        return { text, link };
      });

    fieldItems.push(...processedFiles);

  } catch (error) {
    logger.error('Failed to generate field menu items', { version, error: error.message });
  }

  return fieldItems;
}

/**
 * Humanize field name (simplified version of the humanize function)
 * @param {string} str - String to humanize
 * @returns {string} Humanized string
 */
function humanizeFieldName(str) {
  // Convert snake_case to Title Case
  return str
    .replace(/_id$/, '') // Remove trailing _id
    .replace(/_/g, ' ')  // Replace underscores with spaces
    .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
    .trim();
}

/**
 * Extract link from sidebar item content
 * @param {string} itemContent - Content of a sidebar item
 * @returns {string|null} Link URL or null if not found
 */
function extractLink(itemContent) {
  const linkMatch = itemContent.match(/link:\s*["']([^"']+)["']/);
  return linkMatch ? linkMatch[1] : null;
}

/**
 * Get all documentation pages from sidebar structure
 * @param {Object} sidebarStructure - Parsed sidebar structure
 * @param {string} version - Version to extract pages from
 * @returns {Array} Array of page objects with text and link
 */
function getDocumentationPages(sidebarStructure, version) {
  if (!sidebarStructure[version]) {
    throw new Error(`Version ${version} not found in sidebar structure`);
  }

  const pages = [];

  function extractPages(items) {
    for (const item of items) {
      if (item.link) {
        pages.push({
          text: item.text,
          link: item.link
        });
      }

      if (item.items && item.items.length > 0) {
        extractPages(item.items);
      }
    }
  }

  extractPages(sidebarStructure[version]);
  return pages;
}

/**
 * Validate sidebar structure
 * @param {Object} sidebarStructure - Parsed sidebar structure
 * @returns {Object} Validation result
 */
function validateSidebarStructure(sidebarStructure) {
  const errors = [];
  const warnings = [];

  if (!sidebarStructure || typeof sidebarStructure !== 'object') {
    errors.push('Sidebar structure is not a valid object');
    return { valid: false, errors, warnings };
  }

  const versions = Object.keys(sidebarStructure);
  if (versions.length === 0) {
    warnings.push('No versions found in sidebar structure');
  }

  for (const version of versions) {
    const versionItems = sidebarStructure[version];
    if (!Array.isArray(versionItems)) {
      errors.push(`Version ${version} items is not an array`);
      continue;
    }

    for (const item of versionItems) {
      if (!item.text) {
        warnings.push(`Item in version ${version} is missing text property`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    versions,
    totalItems: versions.reduce((sum, v) => sum + sidebarStructure[v].length, 0)
  };
}

// Export everything
module.exports = {
  parseVitePressConfig,
  getDocumentationPages,
  validateSidebarStructure
};
