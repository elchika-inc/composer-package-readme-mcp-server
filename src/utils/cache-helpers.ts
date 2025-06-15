import { cache, createCacheKey } from '../services/cache.js';
import { CACHE_CONSTANTS } from './constants.js';
import { logger } from './logger.js';

export async function withCache<T>(
  cacheKey: string,
  fetchFn: () => Promise<T>,
  ttl?: number
): Promise<T> {
  // Check cache first
  const cached = cache.get<T>(cacheKey);
  if (cached) {
    logger.debug(`Cache hit: ${cacheKey}`);
    return cached;
  }

  // Fetch data and cache it
  try {
    const result = await fetchFn();
    cache.set(cacheKey, result, ttl);
    logger.debug(`Cache set: ${cacheKey}`);
    return result;
  } catch (error) {
    logger.error(`Failed to fetch and cache: ${cacheKey}`, { error });
    throw error;
  }
}

export function createPackageReadmeCacheKey(packageName: string, version: string): string {
  return createCacheKey.packageReadme(packageName, version);
}

export function createPackageInfoCacheKey(packageName: string): string {
  return createCacheKey.packageInfo(packageName, 'latest');
}

export function createSearchCacheKey(query: string, limit: number, type?: string): string {
  return createCacheKey.searchResults(query, limit, type);
}