import { logger } from '../utils/logger.js';
import { validateSearchQuery, validateLimit, validatePackageType } from '../utils/validators.js';
import { packagistApi } from '../services/packagist-api.js';
import { withCache, createSearchCacheKey } from '../utils/cache-helpers.js';
import { CACHE_CONSTANTS } from '../utils/constants.js';
import {
  SearchPackagesParams,
  SearchPackagesResponse,
  PackageSearchResult,
} from '../types/index.js';

export async function searchPackages(params: SearchPackagesParams): Promise<SearchPackagesResponse> {
  const { query, limit = 20, type } = params;

  logger.info(`Searching packages: ${query} (limit: ${limit})`);

  // Validate inputs
  validateSearchQuery(query);
  validateLimit(limit);
  
  if (type) {
    validatePackageType(type);
  }

  const cacheKey = createSearchCacheKey(query, limit, type);
  
  return withCache(cacheKey, async () => {
    return await performPackageSearch(query, limit, type);
  }, CACHE_CONSTANTS.SEARCH_RESULT_TTL_MS);
}

async function performPackageSearch(
  query: string,
  limit: number,
  type?: string
): Promise<SearchPackagesResponse> {

  try {
    // Search packages on Packagist
    const searchResult = await packagistApi.searchPackages(query, limit, type);

    // Transform results to our format
    const packages: PackageSearchResult[] = searchResult.results.map(pkg => ({
      name: pkg.name,
      description: pkg.description || 'No description available',
      url: pkg.url,
      repository: pkg.repository,
      downloads: pkg.downloads || 0,
      favers: pkg.favers || 0, // Packagist API term for "favorites"
      abandoned: pkg.abandoned || false,
    }));

    const response: SearchPackagesResponse = {
      query,
      results: packages,
      total: searchResult.total,
    };

    logger.info(`Successfully searched packages: ${query}, found ${packages.length} results`);
    return response;

  } catch (error) {
    logger.error(`Failed to search packages: ${query}`, { error });
    throw error;
  }
}