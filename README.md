# Composer Package README MCP Server

MCP server for fetching Composer package README and usage information from Packagist.

## Features

- **Get Package README**: Fetch package README content and usage examples
- **Get Package Info**: Retrieve basic package information, dependencies, and statistics
- **Search Packages**: Search for packages on Packagist with filtering options
- **Caching**: Intelligent caching to reduce API calls and improve performance
- **Error Handling**: Comprehensive error handling with retry logic

## Installation

### Using npm

```bash
npm install -g composer-package-readme-mcp-server
```

### Using the MCP Server

Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "composer-package-readme": {
      "command": "composer-package-readme-mcp-server"
    }
  }
}
```

## Available Tools

### get_package_readme

Get package README and usage examples from Packagist.

**Parameters:**
- `package_name` (required): The name of the Composer package (vendor/package format)
- `version` (optional): The version of the package (default: "latest")
- `include_examples` (optional): Whether to include usage examples (default: true)

**Example:**
```json
{
  "package_name": "symfony/console",
  "version": "latest",
  "include_examples": true
}
```

### get_package_info

Get package basic information and dependencies from Packagist.

**Parameters:**
- `package_name` (required): The name of the Composer package
- `include_dependencies` (optional): Whether to include dependencies (default: true)
- `include_dev_dependencies` (optional): Whether to include development dependencies (default: false)
- `include_suggestions` (optional): Whether to include suggested packages (default: false)

**Example:**
```json
{
  "package_name": "laravel/framework",
  "include_dependencies": true,
  "include_dev_dependencies": false
}
```

### search_packages

Search for packages in Packagist.

**Parameters:**
- `query` (required): The search query
- `limit` (optional): Maximum number of results to return (default: 20, max: 100)
- `type` (optional): Package type filter (e.g., "library", "symfony-bundle", "wordpress-plugin")

**Example:**
```json
{
  "query": "http client",
  "limit": 10,
  "type": "library"
}
```

## Supported Package Types

- `library` - Standard PHP library
- `project` - Project package
- `metapackage` - Meta package
- `composer-plugin` - Composer plugin
- `symfony-bundle` - Symfony bundle
- `wordpress-plugin` - WordPress plugin
- `drupal-module` - Drupal module
- `laravel-package` - Laravel package
- `phpunit-test` - PHPUnit test package
- `psr-implementation` - PSR implementation

## Development

### Setup

```bash
# Clone the repository
git clone <repository-url>
cd composer-package-readme-mcp-server

# Install dependencies
npm install

# Build the project
npm run build
```

### Available Scripts

- `npm run build` - Build the TypeScript project
- `npm run dev` - Run in development mode
- `npm start` - Start the built server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Testing

```bash
# Run the server locally
npm run dev

# Test with a simple tool call
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | npm run dev
```

## Configuration

The server can be configured through environment variables:

- `LOG_LEVEL` - Set logging level (ERROR, WARN, INFO, DEBUG)
- `GITHUB_TOKEN` - GitHub token for enhanced API limits (optional)
- `CACHE_TTL` - Cache TTL in milliseconds (default: 3600000 = 1 hour)
- `MAX_CACHE_SIZE` - Maximum cache size in bytes (default: 104857600 = 100MB)

## API Rate Limits

- **Packagist**: No specific rate limits, but please be respectful
- **GitHub**: 60 requests/hour without token, 5000 with token (for README fetching)

## Error Handling

The server includes comprehensive error handling:

- **Package Not Found**: When a package doesn't exist on Packagist
- **Version Not Found**: When a specific version doesn't exist
- **Network Errors**: Connection timeouts and failures
- **Rate Limiting**: Automatic retry with exponential backoff
- **Validation Errors**: Invalid package names or parameters

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Support

For issues and questions, please use the GitHub issue tracker.