import { logger } from '../utils/logger.js';
import { validatePackageName, validateVersion } from '../utils/validators.js';
import { packagistApi } from '../services/packagist-api.js';
import { githubApi } from '../services/github-api.js';
import { readmeParser } from '../services/readme-parser.js';
import { withCache, createPackageReadmeCacheKey } from '../utils/cache-helpers.js';
import { searchPackages } from './search-packages.js';
import {
  GetPackageReadmeParams,
  PackageReadmeResponse,
  InstallationInfo,
  PackageBasicInfo,
  RepositoryInfo,
  PackagistVersionInfo,
} from '../types/index.js';

export async function getPackageReadme(params: GetPackageReadmeParams): Promise<PackageReadmeResponse> {
  const { package_name, version = 'latest', include_examples = true } = params;

  logger.info(`Fetching package README: ${package_name}@${version}`);

  // Validate inputs
  validatePackageName(package_name);
  if (version !== 'latest') {
    validateVersion(version);
  }

  const cacheKey = createPackageReadmeCacheKey(package_name, version);
  
  return withCache(cacheKey, async () => {
    return await fetchPackageReadme(package_name, version, include_examples);
  });
}

async function fetchPackageReadme(
  packageName: string, 
  version: string, 
  includeExamples: boolean
): Promise<PackageReadmeResponse> {

  try {
    // First, search to verify package exists
    logger.debug(`Searching for package existence: ${packageName}`);
    const searchResult = await searchPackages({ query: packageName, limit: 10 });
    
    // Check if the exact package name exists in search results
    const exactMatch = searchResult.packages.find((pkg: any) => pkg.name === packageName);
    if (!exactMatch) {
      throw new Error(`Package '${packageName}' not found in Packagist registry`);
    }
    
    logger.debug(`Package found in search results: ${packageName}`);

    // Get package info from Packagist
    const versionInfo = await packagistApi.getVersionInfo(packageName, version);

    // Get actual version string (in case we requested 'latest')
    const actualVersion = versionInfo.version;

    // Try to get README content
    let readmeContent = '';
    let readmeSource = 'none';

    // Try to get README from GitHub repository
    if (versionInfo.source && versionInfo.source.url) {
      const repository: RepositoryInfo = {
        type: versionInfo.source.type,
        url: versionInfo.source.url,
        reference: versionInfo.source.reference,
      };
      
      const githubReadme = await githubApi.getReadmeFromRepository(repository);
      if (githubReadme) {
        readmeContent = githubReadme;
        readmeSource = 'github';
        logger.debug(`Got README from GitHub: ${packageName}`);
      }
    }

    // Clean and process README content
    const cleanedReadme = readmeParser.cleanMarkdown(readmeContent);
    
    // Extract usage examples
    const usageExamples = readmeParser.parseUsageExamples(readmeContent, includeExamples);

    // Create installation info
    const installation = createInstallationInfo(packageName, actualVersion);

    // Create basic info
    const basicInfo = createBasicInfo(versionInfo, actualVersion);

    // Create repository info
    const repository = createRepositoryInfo(versionInfo);

    // Get download stats
    const downloadStats = await packagistApi.getDownloadStats(packageName);

    // Create response
    const response: PackageReadmeResponse = {
      package_name: packageName,
      version: actualVersion,
      description: basicInfo.description,
      readme_content: cleanedReadme,
      usage_examples: usageExamples,
      installation,
      basic_info: basicInfo,
      repository,
      download_stats: downloadStats,
    };

    logger.info(`Successfully fetched package README: ${packageName}@${actualVersion} (README source: ${readmeSource})`);
    return response;

  } catch (error) {
    logger.error(`Failed to fetch package README: ${packageName}@${version}`, { error });
    throw error;
  }
}

function createInstallationInfo(packageName: string, version: string): InstallationInfo {
  return {
    composer: `composer require ${packageName}`,
    ...(version !== 'dev-master' && { version }),
  };
}

function createBasicInfo(versionInfo: PackagistVersionInfo, actualVersion: string): PackageBasicInfo {
  return {
    name: versionInfo.name,
    version: actualVersion,
    description: versionInfo.description || 'No description available',
    type: versionInfo.type || 'library',
    homepage: versionInfo.homepage || undefined,
    license: versionInfo.license || ['Unknown'],
    authors: versionInfo.authors || [],
    keywords: versionInfo.keywords || [],
    ...(versionInfo.minimum_stability && { minimum_stability: versionInfo.minimum_stability }),
    require: versionInfo.require,
    require_dev: versionInfo.require_dev,
    suggest: versionInfo.suggest,
    autoload: versionInfo.autoload,
  };
}

function createRepositoryInfo(versionInfo: PackagistVersionInfo): RepositoryInfo | undefined {
  if (!versionInfo.source) {
    return undefined;
  }
  
  return {
    type: versionInfo.source.type,
    url: versionInfo.source.url,
    reference: versionInfo.source.reference,
  };
}