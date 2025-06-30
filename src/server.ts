import { BasePackageServer, ToolDefinition } from '@elchika-inc/package-readme-shared';
import { getPackageReadme } from './tools/get-package-readme.js';
import { getPackageInfo } from './tools/get-package-info.js';
import { searchPackages } from './tools/search-packages.js';
import { PACKAGE_TYPES } from './utils/constants.js';
import { ParameterValidator } from './utils/parameter-validator.js';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageJson = JSON.parse(readFileSync(join(__dirname, '../../package.json'), 'utf8'));

const TOOL_DEFINITIONS: Record<string, ToolDefinition> = {
  get_readme_from_composer: {
    name: 'get_readme_from_composer',
    description: 'Get Composer package README and usage examples from Packagist',
    inputSchema: {
      type: 'object',
      properties: {
        package_name: {
          type: 'string',
          description: 'The name of the Composer package (vendor/package format)',
        },
        version: {
          type: 'string',
          description: 'The version of the package (default: "latest")',
          default: 'latest',
        },
        include_examples: {
          type: 'boolean',
          description: 'Whether to include usage examples (default: true)',
          default: true,
        }
      },
      required: ['package_name'],
    },
  },
  get_package_info_from_composer: {
    name: 'get_package_info_from_composer',
    description: 'Get Composer package basic information and dependencies from Packagist',
    inputSchema: {
      type: 'object',
      properties: {
        package_name: {
          type: 'string',
          description: 'The name of the Composer package (vendor/package format)',
        },
        include_dependencies: {
          type: 'boolean',
          description: 'Whether to include dependencies (default: true)',
          default: true,
        },
        include_dev_dependencies: {
          type: 'boolean',
          description: 'Whether to include development dependencies (default: false)',
          default: false,
        },
        include_suggestions: {
          type: 'boolean',
          description: 'Whether to include suggested packages (default: false)',
          default: false,
        }
      },
      required: ['package_name'],
    },
  },
  search_packages_from_composer: {
    name: 'search_packages_from_composer',
    description: 'Search for Composer packages in Packagist',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'The search query',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 20)',
          default: 20,
          minimum: 1,
          maximum: 100,
        },
        quality: {
          type: 'number',
          description: 'Minimum quality score (0-1)',
          minimum: 0,
          maximum: 1,
        },
        popularity: {
          type: 'number',
          description: 'Minimum popularity score (0-1)',
          minimum: 0,
          maximum: 1,
        },
        type: {
          type: 'string',
          description: 'Package type filter (e.g., "library", "symfony-bundle", "wordpress-plugin")',
          enum: [...PACKAGE_TYPES],
        }
      },
      required: ['query'],
    },
  },
} as const;

export class ComposerPackageReadmeMcpServer extends BasePackageServer {
  constructor() {
    super({
      name: 'composer-package-readme-mcp',
      version: packageJson.version,
    });
  }

  protected getToolDefinitions(): Record<string, ToolDefinition> {
    return TOOL_DEFINITIONS;
  }

  protected async handleToolCall(name: string, args: unknown): Promise<unknown> {
    try {
      switch (name) {
        case 'get_readme_from_composer':
          return await getPackageReadme(ParameterValidator.validateGetPackageReadmeParams(args));
        
        case 'get_package_info_from_composer':
          return await getPackageInfo(ParameterValidator.validateGetPackageInfoParams(args));
        
        case 'search_packages_from_composer':
          return await searchPackages(ParameterValidator.validateSearchPackagesParams(args));
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      this.logger.error(`Tool execution failed: ${name}`, { error });
      throw error;
    }
  }

}

export default ComposerPackageReadmeMcpServer;