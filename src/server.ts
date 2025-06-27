import { BasePackageServer, ToolDefinition } from '@elchika-inc/package-readme-shared';
import { getPackageReadme } from './tools/get-package-readme.js';
import { getPackageInfo } from './tools/get-package-info.js';
import { searchPackages } from './tools/search-packages.js';
import {
  GetPackageReadmeParams,
  GetPackageInfoParams,
  SearchPackagesParams,
} from './types/index.js';
import { PACKAGE_TYPES } from './utils/constants.js';
import { validatePackageName, validateSearchQuery, validateLimit } from './utils/validators.js';

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
      version: '1.0.0',
    });
  }

  protected getToolDefinitions(): Record<string, ToolDefinition> {
    return TOOL_DEFINITIONS;
  }

  protected async handleToolCall(name: string, args: unknown): Promise<unknown> {
    try {
      switch (name) {
        case 'get_readme_from_composer':
          return await getPackageReadme(this.validateGetPackageReadmeParams(args));
        
        case 'get_package_info_from_composer':
          return await getPackageInfo(this.validateGetPackageInfoParams(args));
        
        case 'search_packages_from_composer':
          return await searchPackages(this.validateSearchPackagesParams(args));
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      this.logger.error(`Tool execution failed: ${name}`, { error });
      throw error;
    }
  }

  private validateGetPackageReadmeParams(args: unknown): GetPackageReadmeParams {
    if (!args || typeof args !== 'object' || args === null) {
      throw new Error('Invalid parameters: expected object');
    }

    const params = args as Record<string, unknown>;
    
    if (typeof params.package_name !== 'string') {
      throw new Error('package_name is required and must be a string');
    }

    validatePackageName(params.package_name);

    return {
      package_name: params.package_name,
      version: typeof params.version === 'string' ? params.version : 'latest',
      include_examples: typeof params.include_examples === 'boolean' ? params.include_examples : true,
    };
  }

  private validateGetPackageInfoParams(args: unknown): GetPackageInfoParams {
    if (!args || typeof args !== 'object' || args === null) {
      throw new Error('Invalid parameters: expected object');
    }

    const params = args as Record<string, unknown>;
    
    if (typeof params.package_name !== 'string') {
      throw new Error('package_name is required and must be a string');
    }

    validatePackageName(params.package_name);

    return {
      package_name: params.package_name,
      include_dependencies: typeof params.include_dependencies === 'boolean' ? params.include_dependencies : true,
      include_dev_dependencies: typeof params.include_dev_dependencies === 'boolean' ? params.include_dev_dependencies : false,
      include_suggestions: typeof params.include_suggestions === 'boolean' ? params.include_suggestions : false,
    };
  }

  private validateSearchPackagesParams(args: unknown): SearchPackagesParams {
    if (!args || typeof args !== 'object' || args === null) {
      throw new Error('Invalid parameters: expected object');
    }

    const params = args as Record<string, unknown>;
    
    if (typeof params.query !== 'string') {
      throw new Error('query is required and must be a string');
    }

    validateSearchQuery(params.query);

    const limit = typeof params.limit === 'number' ? params.limit : 20;
    validateLimit(limit);

    return {
      query: params.query,
      limit,
      quality: typeof params.quality === 'number' ? params.quality : undefined,
      popularity: typeof params.popularity === 'number' ? params.popularity : undefined,
      type: typeof params.type === 'string' ? params.type : undefined,
    };
  }
}

export default ComposerPackageReadmeMcpServer;