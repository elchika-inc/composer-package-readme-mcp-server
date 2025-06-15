import { 
  GetPackageReadmeParams, 
  GetPackageInfoParams, 
  SearchPackagesParams 
} from '../types/index.js';

export function isGetPackageReadmeParams(obj: unknown): obj is GetPackageReadmeParams {
  if (!obj || typeof obj !== 'object') return false;
  
  const params = obj as Record<string, unknown>;
  
  // Required fields
  if (!params.package_name || typeof params.package_name !== 'string') {
    return false;
  }
  
  // Optional fields validation
  if (params.version !== undefined && typeof params.version !== 'string') {
    return false;
  }
  
  if (params.include_examples !== undefined && typeof params.include_examples !== 'boolean') {
    return false;
  }
  
  return true;
}

export function isGetPackageInfoParams(obj: unknown): obj is GetPackageInfoParams {
  if (!obj || typeof obj !== 'object') return false;
  
  const params = obj as Record<string, unknown>;
  
  // Required fields
  if (!params.package_name || typeof params.package_name !== 'string') {
    return false;
  }
  
  // Optional fields validation
  if (params.include_dependencies !== undefined && typeof params.include_dependencies !== 'boolean') {
    return false;
  }
  
  if (params.include_dev_dependencies !== undefined && typeof params.include_dev_dependencies !== 'boolean') {
    return false;
  }
  
  if (params.include_suggestions !== undefined && typeof params.include_suggestions !== 'boolean') {
    return false;
  }
  
  return true;
}

export function isSearchPackagesParams(obj: unknown): obj is SearchPackagesParams {
  if (!obj || typeof obj !== 'object') return false;
  
  const params = obj as Record<string, unknown>;
  
  // Required fields
  if (!params.query || typeof params.query !== 'string') {
    return false;
  }
  
  // Optional fields validation
  if (params.limit !== undefined) {
    if (typeof params.limit !== 'number' || params.limit < 1 || params.limit > 100) {
      return false;
    }
  }
  
  if (params.type !== undefined) {
    if (typeof params.type !== 'string') {
      return false;
    }
    
    const validTypes = [
      'library', 'project', 'metapackage', 'composer-plugin',
      'symfony-bundle', 'wordpress-plugin', 'drupal-module',
      'laravel-package', 'phpunit-test', 'psr-implementation'
    ];
    
    if (!validTypes.includes(params.type)) {
      return false;
    }
  }
  
  return true;
}