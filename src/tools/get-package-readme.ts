import { logger } from '../utils/logger.js';
import { packagistApi } from '../services/packagist-api.js';
import { githubApi } from '../services/github-api.js';
import { readmeParser } from '../services/readme-parser.js';
import { withCache, createPackageReadmeCacheKey } from '../utils/cache-helpers.js';
import { ResponseBuilder } from '../utils/response-builder.js';
import {
  GetPackageReadmeParams,
  PackageReadmeResponse,
  RepositoryInfo,
} from '../types/index.js';

export async function getPackageReadme(params: GetPackageReadmeParams): Promise<PackageReadmeResponse> {
  const { package_name, version = 'latest', include_examples = true } = params;

  logger.info(`Fetching package README: ${package_name}@${version}`);

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
    const versionInfo = await getVersionInfo(packageName, version);
    const readmeContent = await getReadmeContent(versionInfo, packageName);
    
    return buildSuccessResponse(packageName, versionInfo, readmeContent, includeExamples);
  } catch (error) {
    if ((error as Error).message.includes('not found')) {
      return ResponseBuilder.createNotFoundResponse(packageName, version);
    }
    logger.error(`Failed to fetch package README: ${packageName}@${version}`, { error });
    throw error;
  }
}

async function getVersionInfo(packageName: string, version: string) {
  try {
    logger.debug(`Getting package info for: ${packageName}@${version}`);
    return await packagistApi.getVersionInfo(packageName, version);
  } catch (error) {
    logger.debug(`Package not found: ${packageName}`);
    throw new Error(`Package ${packageName} not found`);
  }
}

async function getReadmeContent(versionInfo: any, packageName: string): Promise<string> {
  if (!versionInfo.source?.url) {
    return '';
  }

  const repository: RepositoryInfo = {
    type: versionInfo.source.type,
    url: versionInfo.source.url,
    reference: versionInfo.source.reference,
  };
  
  const githubReadme = await githubApi.getReadmeFromRepository(repository);
  if (githubReadme) {
    logger.debug(`Got README from GitHub: ${packageName}`);
    return githubReadme;
  }
  
  return '';
}

async function buildSuccessResponse(
  packageName: string,
  versionInfo: any,
  readmeContent: string,
  includeExamples: boolean
): Promise<PackageReadmeResponse> {
  const actualVersion = versionInfo.version;
  const cleanedReadme = readmeParser.cleanMarkdown(readmeContent);
  const usageExamples = readmeParser.parseUsageExamples(readmeContent, includeExamples);
  const downloadStats = await packagistApi.getDownloadStats(packageName);

  const response: PackageReadmeResponse = {
    package_name: packageName,
    version: actualVersion,
    description: ResponseBuilder.createBasicInfo(versionInfo, actualVersion).description,
    readme_content: cleanedReadme,
    usage_examples: usageExamples,
    installation: ResponseBuilder.createInstallationInfo(packageName, actualVersion),
    basic_info: ResponseBuilder.createBasicInfo(versionInfo, actualVersion),
    repository: ResponseBuilder.createRepositoryInfo(versionInfo),
    download_stats: downloadStats,
    exists: true,
  };

  logger.info(`Successfully fetched package README: ${packageName}@${actualVersion}`);
  return response;
}

