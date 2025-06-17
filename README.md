# Composer Package README MCP Server

[![npm version](https://img.shields.io/npm/v/composer-package-readme-mcp-server)](https://www.npmjs.com/package/composer-package-readme-mcp-server)
[![npm downloads](https://img.shields.io/npm/dm/composer-package-readme-mcp-server)](https://www.npmjs.com/package/composer-package-readme-mcp-server)
[![GitHub stars](https://img.shields.io/github/stars/naoto24kawa/composer-package-readme-mcp-server)](https://github.com/naoto24kawa/composer-package-readme-mcp-server)
[![GitHub issues](https://img.shields.io/github/issues/naoto24kawa/composer-package-readme-mcp-server)](https://github.com/naoto24kawa/composer-package-readme-mcp-server/issues)
[![license](https://img.shields.io/npm/l/composer-package-readme-mcp-server)](https://github.com/naoto24kawa/composer-package-readme-mcp-server/blob/main/LICENSE)

An MCP (Model Context Protocol) server that enables AI assistants to fetch comprehensive information about Composer packages from Packagist, including README content, package metadata, and search functionality.

## Features

- **📚 Package README Retrieval**: Fetch formatted README content with usage examples from GitHub repositories
- **📊 Package Information**: Get comprehensive package metadata including dependencies, versions, and statistics
- **🔍 Package Search**: Search Packagist with advanced filtering by type, popularity, and relevance
- **⚡ Smart Caching**: Intelligent caching system to optimize API usage and improve response times
- **🛡️ Robust Error Handling**: Comprehensive error handling with automatic retry logic and fallback strategies
- **🔗 GitHub Integration**: Seamless integration with GitHub API for enhanced README fetching

## Installation

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn package manager

### Install via npm

```bash
npm install -g composer-package-readme-mcp-server
```

### Claude Desktop Configuration

Add this server to your Claude Desktop configuration file:

**macOS/Linux**: `~/Library/Application\ Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "composer-package-readme": {
      "command": "composer-package-readme-mcp-server",
      "env": {
        "GITHUB_TOKEN": "your_github_token_here"
      }
    }
  }
}
```

> **Note**: The `GITHUB_TOKEN` is optional but recommended for higher API rate limits when fetching README content.

## Available Tools

### 📖 `get_package_readme`

Retrieves comprehensive README content and usage examples for Composer packages.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `package_name` | string | ✅ | - | Composer package name in `vendor/package` format |
| `version` | string | ❌ | `"latest"` | Specific package version or "latest" |
| `include_examples` | boolean | ❌ | `true` | Include usage examples and code snippets |

**Example Usage:**
```json
{
  "package_name": "symfony/console",
  "version": "6.3.0",
  "include_examples": true
}
```

**Returns:** Formatted README content with installation instructions, usage examples, and API documentation.

---

### 📋 `get_package_info`

Fetches detailed package metadata, dependencies, and statistics from Packagist.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `package_name` | string | ✅ | - | Composer package name |
| `include_dependencies` | boolean | ❌ | `true` | Include runtime dependencies |
| `include_dev_dependencies` | boolean | ❌ | `false` | Include development dependencies |
| `include_suggestions` | boolean | ❌ | `false` | Include suggested packages |

**Example Usage:**
```json
{
  "package_name": "laravel/framework",
  "include_dependencies": true,
  "include_dev_dependencies": true
}
```

**Returns:** Package metadata including version info, maintainers, license, download stats, and dependency tree.

---

### 🔍 `search_packages`

Searches Packagist for packages with advanced filtering capabilities.

**Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `query` | string | ✅ | - | Search terms (package name, description, keywords) |
| `limit` | number | ❌ | `20` | Max results to return (1-100) |
| `type` | string | ❌ | - | Filter by package type (see supported types below) |

**Example Usage:**
```json
{
  "query": "http client guzzle",
  "limit": 15,
  "type": "library"
}
```

**Returns:** List of matching packages with names, descriptions, download counts, and relevance scores.

## Supported Package Types

| Type | Description | Example |
|------|-------------|---------|
| `library` | Standard PHP library | `guzzlehttp/guzzle` |
| `project` | Complete application/framework | `laravel/laravel` |
| `metapackage` | Meta package (dependencies only) | `symfony/symfony` |
| `composer-plugin` | Composer plugin | `composer/installers` |
| `symfony-bundle` | Symfony bundle | `symfony/framework-bundle` |
| `wordpress-plugin` | WordPress plugin | `wpackagist-plugin/akismet` |
| `drupal-module` | Drupal module | `drupal/core` |
| `laravel-package` | Laravel-specific package | `laravel/sanctum` |
| `phpunit-test` | PHPUnit test package | `phpunit/phpunit` |
| `psr-implementation` | PSR standard implementation | `psr/log` |

## Development

### Local Development Setup

```bash
# Clone the repository
git clone <repository-url>
cd composer-package-readme-mcp-server

# Install dependencies
npm install

# Start development server with hot reload
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run build` | Compile TypeScript to JavaScript |
| `npm run dev` | Start development server with hot reload |
| `npm start` | Run the compiled server |
| `npm test` | Execute test suite |
| `npm run lint` | Run ESLint code analysis |
| `npm run typecheck` | Validate TypeScript types |

### Testing the Server

```bash
# Start the development server
npm run dev

# Test tool availability
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/list"}' | npm run dev

# Test package information retrieval
echo '{"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_package_info", "arguments": {"package_name": "symfony/console"}}}' | npm run dev
```

### Debugging

Enable debug logging by setting the environment variable:

```bash
LOG_LEVEL=DEBUG npm run dev
```

## Configuration

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `INFO` | Logging level (`ERROR`, `WARN`, `INFO`, `DEBUG`) |
| `GITHUB_TOKEN` | - | GitHub Personal Access Token (optional, recommended) |
| `CACHE_TTL` | `3600000` | Cache time-to-live in milliseconds (1 hour) |
| `MAX_CACHE_SIZE` | `104857600` | Maximum cache size in bytes (100MB) |
| `REQUEST_TIMEOUT` | `30000` | HTTP request timeout in milliseconds |
| `RETRY_ATTEMPTS` | `3` | Number of retry attempts for failed requests |

### GitHub Token Setup

To get enhanced API limits, create a GitHub Personal Access Token:

1. Go to [GitHub Settings > Developer settings > Personal access tokens](https://github.com/settings/tokens)
2. Generate a new token (classic)
3. No special scopes needed for public repositories
4. Add the token to your environment or Claude Desktop config

## API Rate Limits & Performance

| Service | Unauthenticated | With Token | Notes |
|---------|----------------|------------|-------|
| **Packagist** | Unlimited* | Unlimited* | *Fair use policy applies |
| **GitHub API** | 60/hour | 5,000/hour | For README content fetching |

> **💡 Performance Tips:**
> - Use GitHub token for better rate limits
> - Enable caching for frequently accessed packages
> - Batch multiple requests when possible

## Error Handling & Resilience

The server implements robust error handling with multiple fallback strategies:

### Automatic Error Recovery
- **🔄 Retry Logic**: Exponential backoff for transient failures
- **🏃‍♂️ Graceful Degradation**: Fallback to basic info when README unavailable
- **⚡ Circuit Breaker**: Prevents cascade failures during API outages
- **🛡️ Input Validation**: Comprehensive parameter validation

### Error Types Handled
- **404 Package Not Found**: Clear error messages with suggestions
- **403 Rate Limited**: Automatic retry with backoff
- **Network Timeouts**: Configurable timeout with retry
- **Invalid Versions**: Version resolution with fallback to latest

## Use Cases

This MCP server is perfect for:

- **📚 Documentation Research**: Quickly access package documentation and usage examples
- **🔍 Package Discovery**: Find suitable Composer packages for your PHP projects
- **📊 Dependency Analysis**: Understand package dependencies and compatibility
- **🏗️ Project Planning**: Evaluate packages before adding them to your project
- **📖 Learning**: Explore popular PHP packages and their implementations

## Troubleshooting

### Common Issues

**Package not found error**
```bash
# Verify package name format
get_package_info symfony/console  # ✅ Correct
get_package_info symfony-console  # ❌ Incorrect
```

**Rate limit exceeded**
```bash
# Add GitHub token to your config
export GITHUB_TOKEN="your_token_here"
```

**Slow responses**
```bash
# Check cache settings
export CACHE_TTL=7200000  # 2 hours
export MAX_CACHE_SIZE=209715200  # 200MB
```

### Getting Help

- **🐛 Bug Reports**: [GitHub Issues](https://github.com/your-repo/issues)
- **💡 Feature Requests**: [GitHub Discussions](https://github.com/your-repo/discussions)
- **📖 Documentation**: Check the README and source code comments

## License

MIT License - see [LICENSE](LICENSE) file for details

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. **🍴 Fork** the repository
2. **🌿 Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **💾 Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **📤 Push** to the branch (`git push origin feature/amazing-feature`)
5. **🔄 Open** a Pull Request

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and updates.

---

**Made with ❤️ for the PHP community**