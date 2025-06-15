import { logger } from '../utils/logger.js';
import { validatePackageName } from '../utils/validators.js';
import { packagistApi } from '../services/packagist-api.js';
import { withCache, createPackageInfoCacheKey } from '../utils/cache-helpers.js';
import {
  GetPackageInfoParams,
  PackageInfoResponse,
  RepositoryInfo,
} from '../types/index.js';

export async function getPackageInfo(params: GetPackageInfoParams): Promise<PackageInfoResponse> {
  const { 
    package_name, 
    include_dependencies = true, 
    include_dev_dependencies = false,
    include_suggestions = false 
  } = params;

  logger.info(`Fetching package info: ${package_name}`);

  // Validate inputs
  validatePackageName(package_name);

  const cacheKey = createPackageInfoCacheKey(package_name);
  
  return withCache(cacheKey, async () => {
    return await fetchPackageInfo(package_name, include_dependencies, include_dev_dependencies, include_suggestions);
  });
}

async function fetchPackageInfo(
  packageName: string,
  includeDependencies: boolean,
  includeDevDependencies: boolean,
  includeSuggestions: boolean
): Promise<PackageInfoResponse> {

  try {
    // Get package info from Packagist
    const packageInfo = await packagistApi.getPackageInfo(packageName);
    
    // Get latest version info
    const latestVersionInfo = await packagistApi.getVersionInfo(packageName, 'latest');

    // Get download stats
    const downloadStats = await packagistApi.getDownloadStats(packageName);

    // Create repository info
    let repository: RepositoryInfo | undefined;
    if (latestVersionInfo.source) {
      repository = {
        type: latestVersionInfo.source.type,
        url: latestVersionInfo.source.url,
        reference: latestVersionInfo.source.reference,
      };
    }

    // Create response
    const response: PackageInfoResponse = {
      package_name: packageName,
      latest_version: latestVersionInfo.version,
      description: latestVersionInfo.description || packageInfo.description || 'No description available',
      type: latestVersionInfo.type || 'library',
      license: latestVersionInfo.license || ['Unknown'],
      authors: latestVersionInfo.authors || [],
      keywords: latestVersionInfo.keywords || [],
      dependencies: includeDependencies ? latestVersionInfo.require : undefined,
      dev_dependencies: includeDevDependencies ? latestVersionInfo.require_dev : undefined,
      suggestions: includeSuggestions ? latestVersionInfo.suggest : undefined,
      download_stats: downloadStats,
      repository: repository || undefined,
    };

    logger.info(`Successfully fetched package info: ${packageName}@${latestVersionInfo.version}`);
    return response;

  } catch (error) {
    logger.error(`Failed to fetch package info: ${packageName}`, { error });
    throw error;
  }
}