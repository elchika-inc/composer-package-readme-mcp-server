import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListPromptsRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';

import { logger } from './utils/logger.js';
import { getPackageReadme } from './tools/get-package-readme.js';
import { getPackageInfo } from './tools/get-package-info.js';
import { searchPackages } from './tools/search-packages.js';
import {
  isGetPackageReadmeParams,
  isGetPackageInfoParams,
  isSearchPackagesParams,
} from './utils/type-guards.js';
import {
  GetPackageReadmeParams,
  GetPackageInfoParams,
  SearchPackagesParams,
  PackageReadmeMcpError,
} from './types/index.js';
import { PACKAGE_TYPES } from './utils/constants.js';

const TOOL_DEFINITIONS = {
  get_package_readme: {
    name: 'get_package_readme',
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
  get_package_info: {
    name: 'get_package_info',
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
  search_packages: {
    name: 'search_packages',
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

export class ComposerPackageReadmeMcpServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'composer-package-readme-mcp',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
          prompts: {},
          resources: {}
        }
      }
    );

    this.setupHandlers();
  }

  private setupHandlers(): void {
    // List available tools
    (this.server as any).setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: Object.values(TOOL_DEFINITIONS),
      };
    });

    // Handle prompts list
    (this.server as any).setRequestHandler(ListPromptsRequestSchema, async () => {
      return { prompts: [] };
    });

    // Handle resources list
    (this.server as any).setRequestHandler(ListResourcesRequestSchema, async () => {
      return { resources: [] };
    });

    // Handle tool calls
    (this.server as any).setRequestHandler(CallToolRequestSchema, async (request: any, _extra: any) => {
      const { name, arguments: args } = request.params;
      

      try {
        // Validate that args is an object
        if (!args || typeof args !== 'object') {
          throw new McpError(
            ErrorCode.InvalidParams,
            'Tool arguments must be an object'
          );
        }

        switch (name) {
          case 'get_package_readme':
            if (!isGetPackageReadmeParams(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid parameters for get_package_readme'
              );
            }
            return await this.handleGetPackageReadme(args);
          
          case 'get_package_info':
            if (!isGetPackageInfoParams(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid parameters for get_package_info'
              );
            }
            return await this.handleGetPackageInfo(args);
          
          case 'search_packages':
            if (!isSearchPackagesParams(args)) {
              throw new McpError(
                ErrorCode.InvalidParams,
                'Invalid parameters for search_packages'
              );
            }
            return await this.handleSearchPackages(args);
          
          default:
            throw new McpError(
              ErrorCode.MethodNotFound,
              `Unknown tool: ${name}`
            );
        }
      } catch (error) {
        logger.error(`Tool execution failed: ${name}`, { error, args });
        
        if (error instanceof PackageReadmeMcpError) {
          throw new McpError(
            this.mapErrorCode(error.code),
            error.message,
            error.details
          );
        }
        
        if (error instanceof McpError) {
          throw error;
        }
        
        throw new McpError(
          ErrorCode.InternalError,
          `Internal error: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    });
  }

  private async handleGetPackageReadme(params: GetPackageReadmeParams) {
    const result = await getPackageReadme(params);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async handleGetPackageInfo(params: GetPackageInfoParams) {
    const result = await getPackageInfo(params);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private async handleSearchPackages(params: SearchPackagesParams) {
    const result = await searchPackages(params);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  }

  private mapErrorCode(code: string): ErrorCode {
    switch (code) {
      case 'PACKAGE_NOT_FOUND':
      case 'VERSION_NOT_FOUND':
        return ErrorCode.InvalidRequest;
      case 'INVALID_PACKAGE_NAME':
      case 'INVALID_VERSION':
      case 'INVALID_SEARCH_QUERY':
      case 'INVALID_LIMIT':
      case 'INVALID_PACKAGE_TYPE':
        return ErrorCode.InvalidParams;
      case 'RATE_LIMIT_EXCEEDED':
        return ErrorCode.InternalError; // Could be a custom error code
      case 'NETWORK_ERROR':
        return ErrorCode.InternalError;
      default:
        return ErrorCode.InternalError;
    }
  }

  async run(): Promise<void> {
    try {
      const transport = new StdioServerTransport();
      await (this.server as any).connect(transport);
    } catch (error) {
      logger.error('Failed to start server transport', { error });
      throw error;
    }
  }

  async stop(): Promise<void> {
    await (this.server as any).close();
  }
}

export default ComposerPackageReadmeMcpServer;