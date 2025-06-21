# VitePress LLMs.txt Concatenator

A powerful CLI tool for converting VitePress documentation into LLM-friendly formats, specifically designed to generate comprehensive `llms.txt` files for AI/LLM consumption.

## Features

- 🔍 **VitePress Config Parsing**: Automatically extracts sidebar structure from VitePress configuration
- 📄 **Markdown Processing**: Processes markdown files with frontmatter removal, include handling, and link transformation
- 🏗️ **Template Generation**: Creates structured sections with metadata and table of contents
- 📦 **Multiple Output Formats**: Supports markdown, plain text, structured JSON, and LLMs.txt formats
- 🎯 **Version Support**: Process specific versions (4.0, 3.0) or all versions at once
- 🔧 **Comprehensive Logging**: Detailed logging with performance timing and error handling
- ⚡ **File Management**: Robust file operations with backup and validation capabilities

## Installation

```bash
# Install dependencies
npm install
# or
yarn install

# Make CLI executable
chmod +x scripts/generate-llms-txt.js
```

## Usage

### Basic Usage

```bash
# Generate for latest version (default)
npm run generate-llms-txt

# Generate for specific version
npm run generate-llms-4
npm run generate-llms-3

# Generate for all versions
npm run generate-llms-all
```

### CLI Options

```bash
node scripts/generate-llms-txt.js [version] [options]

Arguments:
  version                     Version to process (4.0, 3.0, latest, all) (default: "latest")

Options:
  -V, --version              Display version number
  -h, --help                 Display help for command
  -c, --config <path>        Path to VitePress config file (default: "docs/.vitepress/config.js")
  -o, --output <path>        Output file path (default: "docs/public/llms.txt")
  -d, --docs-dir <path>      Documentation directory (default: "docs")
  --log-level <level>        Logging level (silent, error, warn, info, debug) (default: "info")
  --log-file <path>          Log to file
  --include-toc              Include table of contents
  --include-metadata         Include file metadata (default: true)
  --max-section-length <size> Maximum section length in characters
  --format <format>          Output format (markdown, text, llms_txt) (default: "llms_txt")
  --title <title>           Custom title for generated file
  --description <description> Custom description for generated file
  --dry-run                 Show what would be done without actually generating files
  --verbose                 Enable verbose output
```

### Examples

```bash
# Generate with custom options
node scripts/generate-llms-txt.js 4.0 \
  --output docs/public/avo-4.0-llms.txt \
  --include-toc \
  --title "Avo 4.0 Documentation" \
  --verbose

# Dry run to see what files would be processed
node scripts/generate-llms-txt.js all --dry-run --verbose

# Generate with logging to file
node scripts/generate-llms-txt.js latest \
  --log-file logs/generation.log \
  --log-level debug
```

## Architecture

### Core Modules

#### 1. VitePress Parser (`lib/vitepress-parser.js`)
- Parses VitePress `config.js` files
- Extracts sidebar structure by version
- Validates configuration integrity
- Provides page extraction utilities

#### 2. Markdown Processor (`lib/markdown-processor.js`)
- Processes markdown files with frontmatter removal
- Handles include directives and nested files
- Transforms links for LLM consumption
- Prevents circular include dependencies

#### 3. Template Generator (`lib/template-generator.js`)
- Creates structured section templates
- Generates metadata and table of contents
- Supports multiple output formats
- Combines multiple sections efficiently

#### 4. File Utils (`lib/file-utils.js`)
- Robust file operations with error handling
- Directory traversal and file discovery
- Pattern-based file filtering
- Backup and cleanup utilities

#### 5. Version Validator (`lib/version-validator.js`)
- Validates version parameters (4.0, 3.0, latest, all)
- Resolves version aliases to specific versions
- Supports flexible version configuration

#### 6. Logger (`lib/logger.js`)
- Structured logging with multiple levels
- Performance timing and metrics
- Custom error classes for better debugging
- File and console output support

### Data Flow

```
VitePress Config → Sidebar Structure → Page Discovery → Markdown Processing → Template Generation → Output File
```

1. **Configuration Parsing**: Extract sidebar structure from VitePress config
2. **Page Discovery**: Convert sidebar links to file paths
3. **Markdown Processing**: Process each markdown file (frontmatter, includes, links)
4. **Template Generation**: Create structured sections with metadata
5. **Output Generation**: Combine sections and write final output file

## Configuration

### Default Configuration

The tool uses sensible defaults but can be customized:

```javascript
{
  // VitePress config path
  configPath: 'docs/.vitepress/config.js',
  
  // Output settings
  outputPath: 'docs/public/llms.txt',
  outputFormat: 'llms_txt',
  
  // Processing options
  removeFrontmatter: true,
  processIncludes: true,
  transformLinks: true,
  
  // Template options
  includeMetadata: true,
  includeTableOfContents: true,
  maxSectionLength: 50000,
  
  // File handling
  excludePatterns: ['*.log', '*.tmp', 'node_modules/**', '.git/**'],
  includePatterns: ['*.md', '*.markdown']
}
```

### Version Configuration

Supported versions are automatically detected from the VitePress sidebar configuration:

```javascript
{
  supportedVersions: ['4.0', '3.0', '2.0'],
  defaultVersion: '4.0',
  allowLatest: true,
  allowAll: true
}
```

## Output Formats

### LLMs.txt Format (Default)
Optimized for LLM consumption with:
- Clean markdown formatting
- Contextual metadata comments
- Table of contents for navigation
- Section separators
- Word count and source information

### Markdown Format
Standard markdown with:
- YAML frontmatter with metadata
- Preserved markdown formatting
- Internal link conversion
- Section organization

### Structured Format
JSON output with:
- Complete metadata
- Content analysis
- Structural information
- Processing statistics

### Plain Text Format
Simplified text with:
- Stripped markdown formatting
- Clean text content
- Basic section headers
- Minimal metadata

## Error Handling

The tool includes comprehensive error handling:

### Custom Error Classes
- `VitePressParserError`: Config parsing issues
- `FileProcessingError`: File operation problems
- `ConfigurationError`: Invalid configuration

### Error Recovery
- Graceful handling of missing files
- Partial processing on errors
- Detailed error reporting
- Continue processing on non-critical errors

### Logging Levels
- **SILENT**: No output
- **ERROR**: Only errors
- **WARN**: Errors and warnings
- **INFO**: General information (default)
- **DEBUG**: Detailed debug information

## Performance

### Optimization Features
- File caching for repeated includes
- Parallel processing where possible
- Memory-efficient streaming for large files
- Performance timing and metrics

### Monitoring
- Processing time measurement
- Memory usage tracking
- File size statistics
- Section generation metrics

## Testing

### Running Tests
```bash
# Run all tests
npm test

# Run specific test files
npm test -- --testPathPattern=vitepress-parser
```

### Test Coverage
- VitePress config parsing
- Markdown processing
- Template generation
- File operations
- Version validation

## Troubleshooting

### Common Issues

#### Config File Not Found
```bash
Error: Config file not found: docs/.vitepress/config.js
```
**Solution**: Ensure the VitePress config file exists or specify correct path with `-c` option.

#### No Sidebar Configuration
```bash
Error: Could not find sidebar configuration in config file
```
**Solution**: Verify the VitePress config has a proper `sidebar` configuration.

#### File Processing Errors
```bash
Warning: File not found: docs/4.0/missing-file.md
```
**Solution**: Check that all linked files exist or update the sidebar configuration.

#### Permission Errors
```bash
Error: EACCES: permission denied, open 'docs/public/llms.txt'
```
**Solution**: Ensure write permissions for the output directory.

### Debug Mode

Enable debug logging for detailed information:
```bash
node scripts/generate-llms-txt.js --log-level debug --verbose
```

### Dry Run

Test without generating files:
```bash
node scripts/generate-llms-txt.js --dry-run --verbose
```

## Contributing

### Development Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Run tests: `npm test`
4. Test CLI: `npm run generate-llms-txt -- --dry-run`

### Adding Features
1. Create feature branch
2. Add tests for new functionality
3. Update documentation
4. Submit pull request

### Module Structure
- Each module should be self-contained
- Include comprehensive error handling
- Add logging for debugging
- Write unit tests
- Document public APIs

## License

MIT License - see LICENSE file for details.

## Changelog

### v1.0.0
- Initial release
- VitePress config parsing
- Markdown processing with includes
- Multiple output formats
- Comprehensive logging
- CLI interface with full options