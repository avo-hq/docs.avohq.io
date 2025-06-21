import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { 
  logger, 
  VitePressParserError, 
  FileProcessingError, 
  ErrorHandler,
  PerformanceTimer 
} from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse VitePress config.js file and extract sidebar structure
 * @param {string} configPath - Path to the VitePress config.js file
 * @param {Object} options - Parsing options
 * @returns {Object} Parsed sidebar structure
 */
export function parseVitePressConfig(configPath, options = {}) {
  const timer = new PerformanceTimer(logger);
  const loggerInstance = options.logger || logger;
  
  return timer.measure('parseVitePressConfig', () => {
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
      const configContent = fs.readFileSync(configPath, 'utf8');
      
      if (!configContent.trim()) {
        throw new VitePressParserError(
          'Config file is empty',
          'EMPTY_CONFIG_FILE',
          { configPath }
        );
      }
      
      // Extract sidebar configuration using regex (simplified approach)
      // This is a basic implementation - in production you might want to use a proper JS parser
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

      loggerInstance.debug('Extracting sidebar structure');
      const sidebar = extractSidebarStructure(configContent);
      
      const result = {
        sidebar,
        configPath,
        parsedAt: new Date().toISOString(),
        stats: {
          versions: Object.keys(sidebar).length,
          totalSections: Object.values(sidebar).reduce((sum, sections) => sum + sections.length, 0)
        }
      };
      
      loggerInstance.success('VitePress config parsed successfully', {
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
  });
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
    const versionMatches = configContent.matchAll(/["']\/(\d+\.\d+)\/["']:\s*\[([\s\S]*?)\]/g);
    
    let matchCount = 0;
    for (const match of versionMatches) {
      const version = match[1];
      const sectionContent = match[2];
      
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
      items: extractNestedItems(fullItemMatch),
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
 * @returns {Array} Nested items
 */
function extractNestedItems(itemContent) {
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
  }
  
  return nestedItems;
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
export function getDocumentationPages(sidebarStructure, version) {
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
export function validateSidebarStructure(sidebarStructure) {
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