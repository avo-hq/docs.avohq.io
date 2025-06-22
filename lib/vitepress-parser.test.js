import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  parseVitePressConfig, 
  getDocumentationPages, 
  validateSidebarStructure 
} from './vitepress-parser.js';
import fs from 'fs';
import path from 'path';

describe('VitePress Parser', () => {
  const testConfigPath = 'test-config.js';
  const mockConfigContent = `
export default {
  title: "Test Docs",
  themeConfig: {
    sidebar: {
      "/4.0/": [
        {
          text: "Getting Started",
          items: [
            { text: "Installation", link: "/4.0/installation.html" },
            { text: "Configuration", link: "/4.0/configuration.html" }
          ]
        },
        {
          text: "Fields",
          items: [
            { text: "Text Field", link: "/4.0/fields/text.html" },
            { text: "Number Field", link: "/4.0/fields/number.html" }
          ]
        }
      ],
      "/3.0/": [
        {
          text: "Legacy Docs",
          items: [
            { text: "Overview", link: "/3.0/overview.html" }
          ]
        }
      ]
    }
  }
};
`;

  beforeEach(() => {
    // Create mock config file
    fs.writeFileSync(testConfigPath, mockConfigContent);
  });

  afterEach(() => {
    // Clean up mock files
    if (fs.existsSync(testConfigPath)) {
      fs.unlinkSync(testConfigPath);
    }
  });

  describe('parseVitePressConfig', () => {
    it('should parse a valid VitePress config file', () => {
      const result = parseVitePressConfig(testConfigPath);
      
      expect(result).toBeDefined();
      expect(result.sidebar).toBeDefined();
      expect(result.configPath).toBe(path.resolve(testConfigPath));
      expect(result.parsedAt).toBeDefined();
    });

    it('should throw error for non-existent config file', () => {
      expect(() => {
        parseVitePressConfig('non-existent.js');
      }).toThrow('Config file not found');
    });

    it('should throw error for empty config file', () => {
      const emptyConfigPath = 'empty-config.js';
      fs.writeFileSync(emptyConfigPath, '');
      
      try {
        expect(() => {
          parseVitePressConfig(emptyConfigPath);
        }).toThrow('Config file is empty');
      } finally {
        fs.unlinkSync(emptyConfigPath);
      }
    });
  });

  describe('getDocumentationPages', () => {
    it('should extract pages for a specific version', () => {
      const result = parseVitePressConfig(testConfigPath);
      const pages = getDocumentationPages(result.sidebar, '4.0');
      
      expect(pages).toHaveLength(4); // 2 getting started + 2 fields
      expect(pages[0]).toHaveProperty('text');
      expect(pages[0]).toHaveProperty('link');
    });

    it('should return empty array for non-existent version', () => {
      const result = parseVitePressConfig(testConfigPath);
      
      expect(() => {
        getDocumentationPages(result.sidebar, '5.0');
      }).toThrow('Version 5.0 not found in sidebar structure');
    });

    it('should handle version with no pages', () => {
      const emptyResult = { sidebar: { '2.0': [] } };
      const pages = getDocumentationPages(emptyResult.sidebar, '2.0');
      
      expect(pages).toHaveLength(0);
    });
  });

  describe('validateSidebarStructure', () => {
    it('should validate a correct sidebar structure', () => {
      const result = parseVitePressConfig(testConfigPath);
      const validation = validateSidebarStructure(result.sidebar);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.versions).toContain('4.0');
      expect(validation.versions).toContain('3.0');
    });

    it('should detect invalid sidebar structure', () => {
      const invalidSidebar = null;
      const validation = validateSidebarStructure(invalidSidebar);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('Sidebar structure is not a valid object');
    });

    it('should warn about empty sidebar', () => {
      const emptySidebar = {};
      const validation = validateSidebarStructure(emptySidebar);
      
      expect(validation.valid).toBe(true);
      expect(validation.warnings).toContain('No versions found in sidebar structure');
    });
  });
});