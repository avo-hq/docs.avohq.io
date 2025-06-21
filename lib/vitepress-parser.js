import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Parse VitePress config.js file and extract sidebar structure
 * @param {string} configPath - Path to the VitePress config.js file
 * @returns {Object} Parsed sidebar structure
 */
export function parseVitePressConfig(configPath) {
  try {
    if (!fs.existsSync(configPath)) {
      throw new Error(`Config file not found: ${configPath}`);
    }

    // Read the config file content
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Extract sidebar configuration using regex (simplified approach)
    // This is a basic implementation - in production you might want to use a proper JS parser
    const sidebarMatch = configContent.match(/sidebar:\s*{([\s\S]*?)},\s*["']\/[^"']+["']:/);
    
    if (!sidebarMatch) {
      throw new Error('Could not find sidebar configuration in config file');
    }

    // Parse the sidebar structure by extracting version-specific sections
    const sidebar = extractSidebarStructure(configContent);
    
    return {
      sidebar,
      configPath,
      parsedAt: new Date().toISOString()
    };
  } catch (error) {
    throw new Error(`Failed to parse VitePress config: ${error.message}`);
  }
}

/**
 * Extract sidebar structure from config content
 * @param {string} configContent - Content of the config file
 * @returns {Object} Sidebar structure organized by version
 */
function extractSidebarStructure(configContent) {
  const sidebar = {};
  
  // Extract version-specific sidebar sections
  const versionMatches = configContent.matchAll(/["']\/(\d+\.\d+)\/["']:\s*\[([\s\S]*?)\]/g);
  
  for (const match of versionMatches) {
    const version = match[1];
    const sectionContent = match[2];
    
    sidebar[version] = parseSidebarSection(sectionContent);
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