import { validatePackageName, validateSearchQuery, validateLimit } from './validators.js';
import {
  GetPackageReadmeParams,
  GetPackageInfoParams,
  SearchPackagesParams,
} from '../types/index.js';

export class ParameterValidator {
  static validateGetPackageReadmeParams(args: unknown): GetPackageReadmeParams {
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

  static validateGetPackageInfoParams(args: unknown): GetPackageInfoParams {
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

  static validateSearchPackagesParams(args: unknown): SearchPackagesParams {
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