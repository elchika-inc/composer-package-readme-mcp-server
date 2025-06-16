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
    // Check package existence first
    logger.debug(`Checking package existence: ${packageName}`);
    const packageExists = await packagistApi.checkPackageExists(packageName);
    
    if (!packageExists) {
      logger.info(`Package not found: ${packageName}`);
      return {
        package_name: packageName,
        latest_version: '',
        description: '',
        author: '',
        license: '',
        keywords: [],
        dependencies: undefined,
        dev_dependencies: undefined,
        download_stats: {
          last_day: 0,
          last_week: 0,
          last_month: 0,
        },
        repository: undefined,
        exists: false,
      };
    }

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

    // Extract author string from authors array
    const authorString = latestVersionInfo.authors && latestVersionInfo.authors.length > 0 
      ? latestVersionInfo.authors[0]?.name || ''
      : '';

    // Create response according to specification
    const response: PackageInfoResponse = {
      package_name: packageName,
      latest_version: latestVersionInfo.version,
      description: latestVersionInfo.description || packageInfo.description || 'No description available',
      author: authorString,
      license: Array.isArray(latestVersionInfo.license) ? latestVersionInfo.license.join(', ') : (latestVersionInfo.license || 'Unknown'),
      keywords: latestVersionInfo.keywords || [],
      dependencies: includeDependencies ? latestVersionInfo.require : undefined,
      dev_dependencies: includeDevDependencies ? latestVersionInfo.require_dev : undefined,
      download_stats: {
        last_day: downloadStats.daily,
        last_week: downloadStats.daily * 7, // Approximate weekly from daily
        last_month: downloadStats.monthly,
      },
      repository,
      exists: true,
    };

    logger.info(`Successfully fetched package info: ${packageName}@${latestVersionInfo.version}`);
    return response;

  } catch (error) {
    logger.error(`Failed to fetch package info: ${packageName}`, { error });
    
    // Return error response with exists: false
    return {
      package_name: packageName,
      latest_version: '',
      description: '',
      author: '',
      license: '',
      keywords: [],
      dependencies: undefined,
      dev_dependencies: undefined,
      download_stats: {
        last_day: 0,
        last_week: 0,
        last_month: 0,
      },
      repository: undefined,
      exists: false,
    };
  }
}