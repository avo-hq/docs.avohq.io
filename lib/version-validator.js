const { logger, ConfigurationError, ErrorHandler } = require('./logger.js');

/**
 * Supported version formats and patterns
 */
const VERSION_PATTERNS = {
  SEMANTIC: /^\d+\.\d+(\.\d+)?$/,           // 1.0, 1.0.0, 4.0.1
  MAJOR_MINOR: /^\d+\.\d+$/,                // 4.0, 3.0, 2.0
  LATEST: /^latest$/i,                      // latest (case insensitive)
  ALL: /^all$/i                             // all (case insensitive)
};

/**
 * Default configuration for version validation
 */
const DEFAULT_VERSION_CONFIG = {
  supportedVersions: ['4.0', '3.0', '2.0'],
  defaultVersion: '4.0',
  allowLatest: true,
  allowAll: true,
  strictValidation: false
};

/**
 * Version validator class for handling version parameter validation
 */
class VersionValidator {
  constructor(config = {}) {
    this.config = { ...DEFAULT_VERSION_CONFIG, ...config };
    this.logger = config.logger || logger;
  }

  /**
   * Validate a version string against supported versions
   * @param {string} version - Version string to validate
   * @returns {Object} Validation result
   */
  validate(version) {
    try {
      this.logger.debug('Validating version parameter', { version, config: this.config });

      // Handle null/undefined
      if (!version) {
        this.logger.info('No version provided, using default', { default: this.config.defaultVersion });
        return {
          valid: true,
          version: this.config.defaultVersion,
          normalized: this.config.defaultVersion,
          isDefault: true,
          type: 'default'
        };
      }

      // Convert to string and trim
      const versionStr = String(version).trim();

      if (!versionStr) {
        throw ErrorHandler.validation('version', version, 'Version cannot be empty');
      }

      // Handle special keywords
      if (VERSION_PATTERNS.LATEST.test(versionStr)) {
        if (!this.config.allowLatest) {
          throw ErrorHandler.validation('version', version, 'Latest version not allowed');
        }

        const latestVersion = this.getLatestVersion();
        this.logger.info('Using latest version', { latest: latestVersion });

        return {
          valid: true,
          version: versionStr,
          normalized: latestVersion,
          isDefault: false,
          type: 'latest',
          resolved: latestVersion
        };
      }

      if (VERSION_PATTERNS.ALL.test(versionStr)) {
        if (!this.config.allowAll) {
          throw ErrorHandler.validation('version', version, 'All versions option not allowed');
        }

        this.logger.info('Processing all versions', { versions: this.config.supportedVersions });

        return {
          valid: true,
          version: versionStr,
          normalized: this.config.supportedVersions,
          isDefault: false,
          type: 'all',
          resolved: this.config.supportedVersions
        };
      }

      // Validate format
      if (!this.isValidFormat(versionStr)) {
        throw ErrorHandler.validation(
          'version',
          version,
          `Invalid version format. Expected formats: ${this.getSupportedFormats().join(', ')}`
        );
      }

      // Check if version is supported
      if (!this.isSupportedVersion(versionStr)) {
        if (this.config.strictValidation) {
          throw ErrorHandler.validation(
            'version',
            version,
            `Unsupported version. Supported versions: ${this.config.supportedVersions.join(', ')}`
          );
        } else {
          this.logger.warn('Version not in supported list but allowing due to non-strict mode', {
            version: versionStr,
            supported: this.config.supportedVersions
          });
        }
      }

      // Normalize version (ensure consistent format)
      const normalized = this.normalizeVersion(versionStr);

      this.logger.debug('Version validation successful', {
        original: version,
        normalized,
        supported: this.isSupportedVersion(versionStr)
      });

      return {
        valid: true,
        version: versionStr,
        normalized,
        isDefault: false,
        type: 'specific',
        supported: this.isSupportedVersion(versionStr)
      };

    } catch (error) {
      this.logger.error('Version validation failed', error);

      return {
        valid: false,
        version,
        error: error.message,
        code: error.code,
        details: error.details
      };
    }
  }

  /**
   * Check if version format is valid
   * @param {string} version - Version to check
   * @returns {boolean} True if format is valid
   */
  isValidFormat(version) {
    return VERSION_PATTERNS.SEMANTIC.test(version) ||
           VERSION_PATTERNS.MAJOR_MINOR.test(version);
  }

  /**
   * Check if version is in supported versions list
   * @param {string} version - Version to check
   * @returns {boolean} True if version is supported
   */
  isSupportedVersion(version) {
    return this.config.supportedVersions.includes(version);
  }

  /**
   * Get the latest version from supported versions
   * @returns {string} Latest version
   */
  getLatestVersion() {
    // Sort versions and return the highest
    const sorted = [...this.config.supportedVersions].sort((a, b) => {
      const [aMajor, aMinor] = a.split('.').map(Number);
      const [bMajor, bMinor] = b.split('.').map(Number);

      if (aMajor !== bMajor) return bMajor - aMajor;
      return bMinor - aMinor;
    });

    return sorted[0];
  }

  /**
   * Normalize version string to consistent format
   * @param {string} version - Version to normalize
   * @returns {string} Normalized version
   */
  normalizeVersion(version) {
    // For now, just return as-is, but this could add consistent formatting
    // e.g., ensure 2-digit minor versions, etc.
    return version;
  }

  /**
   * Get supported version formats for error messages
   * @returns {Array} Array of format descriptions
   */
  getSupportedFormats() {
    const formats = ['X.Y (e.g., 4.0)', 'X.Y.Z (e.g., 4.0.1)'];

    if (this.config.allowLatest) {
      formats.push('latest');
    }

    if (this.config.allowAll) {
      formats.push('all');
    }

    return formats;
  }

  /**
   * Update supported versions list
   * @param {Array} versions - New supported versions
   */
  updateSupportedVersions(versions) {
    if (!Array.isArray(versions)) {
      throw new ConfigurationError('Supported versions must be an array');
    }

    for (const version of versions) {
      if (!this.isValidFormat(version)) {
        throw new ConfigurationError(`Invalid version format in supported versions: ${version}`);
      }
    }

    this.config.supportedVersions = versions;
    this.logger.info('Updated supported versions', { versions });
  }
}

/**
 * Version processor for handling multiple versions and resolution
 */
class VersionProcessor {
  constructor(validator, config = {}) {
    this.validator = validator;
    this.logger = config.logger || logger;
  }

  /**
   * Process version parameter and return resolved versions list
   * @param {string} version - Version parameter
   * @returns {Object} Processing result with resolved versions
   */
  process(version) {
    this.logger.info('Processing version parameter', { version });

    const validation = this.validator.validate(version);

    if (!validation.valid) {
      throw new ConfigurationError(
        `Invalid version parameter: ${validation.error}`,
        validation.code,
        validation.details
      );
    }

    let resolvedVersions = [];

    switch (validation.type) {
      case 'default':
      case 'specific':
        resolvedVersions = [validation.normalized];
        break;

      case 'latest':
        resolvedVersions = [validation.resolved];
        break;

      case 'all':
        resolvedVersions = validation.resolved;
        break;

      default:
        throw new ConfigurationError(`Unknown version type: ${validation.type}`);
    }

    const result = {
      original: version,
      validation,
      versions: resolvedVersions,
      count: resolvedVersions.length,
      processedAt: new Date().toISOString()
    };

    this.logger.success('Version processing completed', {
      original: version,
      resolved: resolvedVersions,
      count: resolvedVersions.length
    });

    return result;
  }

  /**
   * Get processing summary for logging/reporting
   * @param {Object} processingResult - Result from process()
   * @returns {Object} Summary information
   */
  getSummary(processingResult) {
    return {
      input: processingResult.original,
      type: processingResult.validation.type,
      versions: processingResult.versions,
      count: processingResult.count,
      isMultiple: processingResult.count > 1,
      isDefault: processingResult.validation.isDefault
    };
  }
}

/**
 * Default instances for common usage
 */
const defaultValidator = new VersionValidator();
const defaultProcessor = new VersionProcessor(defaultValidator);

/**
 * Convenience function for quick validation
 * @param {string} version - Version to validate
 * @param {Object} config - Optional configuration
 * @returns {Object} Validation result
 */
function validateVersion(version, config = {}) {
  const validator = new VersionValidator(config);
  return validator.validate(version);
}

/**
 * Convenience function for quick processing
 * @param {string} version - Version to process
 * @param {Object} config - Optional configuration
 * @returns {Object} Processing result
 */
function processVersion(version, config = {}) {
  const validator = new VersionValidator(config);
  const processor = new VersionProcessor(validator, config);
  return processor.process(version);
}

// Export everything
module.exports = {
  VERSION_PATTERNS,
  DEFAULT_VERSION_CONFIG,
  VersionValidator,
  VersionProcessor,
  defaultValidator,
  defaultProcessor,
  validateVersion,
  processVersion
};
