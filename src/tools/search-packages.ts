import { logger } from '../utils/logger.js';
import { packagistApi } from '../services/packagist-api.js';
import { withCache, createSearchCacheKey } from '../utils/cache-helpers.js';
import { CACHE_CONSTANTS } from '../utils/constants.js';
import {
  SearchPackagesParams,
  SearchPackagesResponse,
  PackageSearchResult,
} from '../types/index.js';

export async function searchPackages(params: SearchPackagesParams): Promise<SearchPackagesResponse> {
  const { query, limit = 20, quality, popularity, type } = params;

  logger.info(`Searching packages: ${query} (limit: ${limit})`);

  const cacheKey = createSearchCacheKey(query, limit, type);
  
  return withCache(cacheKey, async () => {
    return await performPackageSearch(query, limit, quality, popularity, type);
  }, CACHE_CONSTANTS.SEARCH_RESULT_TTL_MS);
}

async function performPackageSearch(
  query: string,
  limit: number,
  quality?: number,
  popularity?: number,
  type?: string
): Promise<SearchPackagesResponse> {

  try {
    // Search packages on Packagist
    const searchResult = await packagistApi.searchPackages(query, limit, type);

    // Transform results to our format and apply quality/popularity filters
    let packages: PackageSearchResult[] = searchResult.results.map(pkg => {
      // Calculate scores based on available metrics
      const qualityScore = calculateQualityScore(pkg);
      const popularityScore = calculatePopularityScore(pkg);
      const maintenanceScore = 0.8; // Default maintenance score
      
      const finalScore = (qualityScore + popularityScore + maintenanceScore) / 3;
      
      return {
        name: pkg.name,
        version: 'latest', // Packagist search doesn't provide version info
        description: pkg.description || 'No description available',
        keywords: [], // Packagist search API doesn't provide keywords
        author: extractAuthorFromName(pkg.name),
        publisher: extractAuthorFromName(pkg.name),
        maintainers: [extractAuthorFromName(pkg.name)], // Simplified
        score: {
          final: finalScore,
          detail: {
            quality: qualityScore,
            popularity: popularityScore,
            maintenance: maintenanceScore,
          }
        },
        searchScore: finalScore, // Use same as final score
      };
    });

    // Apply quality filter if specified
    if (quality !== undefined) {
      packages = packages.filter(pkg => pkg.score.detail.quality >= quality);
    }

    // Apply popularity filter if specified
    if (popularity !== undefined) {
      packages = packages.filter(pkg => pkg.score.detail.popularity >= popularity);
    }

    const response: SearchPackagesResponse = {
      query,
      total: packages.length, // Total after filtering
      packages,
    };

    logger.info(`Successfully searched packages: ${query}, found ${packages.length} results`);
    return response;

  } catch (error) {
    logger.error(`Failed to search packages: ${query}`, { error });
    throw error;
  }
}

function calculateQualityScore(pkg: any): number {
  // Calculate quality based on available metrics
  let score = 0.5; // Base score
  
  // Higher score for packages with description
  if (pkg.description && pkg.description.trim().length > 0) {
    score += 0.2;
  }
  
  // Higher score for packages with more downloads
  if (pkg.downloads > 10000) {
    score += 0.2;
  } else if (pkg.downloads > 1000) {
    score += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(score, 1.0);
}

function calculatePopularityScore(pkg: any): number {
  // Calculate popularity based on downloads and favers
  let score = 0.1; // Base score
  
  // Downloads contribution
  if (pkg.downloads > 100000) {
    score += 0.5;
  } else if (pkg.downloads > 10000) {
    score += 0.3;
  } else if (pkg.downloads > 1000) {
    score += 0.2;
  }
  
  // Favers contribution
  if (pkg.favers > 100) {
    score += 0.3;
  } else if (pkg.favers > 10) {
    score += 0.2;
  } else if (pkg.favers > 1) {
    score += 0.1;
  }
  
  // Cap at 1.0
  return Math.min(score, 1.0);
}

function extractAuthorFromName(packageName: string): string {
  // Extract vendor/author from package name (vendor/package format)
  const parts = packageName.split('/');
  return parts.length > 0 && parts[0] ? parts[0] : 'Unknown';
}