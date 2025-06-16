import { logger } from '../utils/logger.js';
import { handleApiError, handleHttpError, withRetry } from '../utils/error-handler.js';
import { VersionResolver } from './version-resolver.js';
import { API_CONSTANTS } from '../utils/constants.js';
import { 
  PackagistPackageInfo,
  PackagistVersionInfo,
  PackagistSearchResponse,
  PackagistStatsResponse,
  VersionNotFoundError,
} from '../types/index.js';

export class PackagistApiClient {
  private readonly baseUrl = 'https://packagist.org/packages';
  private readonly searchUrl = 'https://packagist.org/search.json';
  private readonly statsUrl = 'https://packagist.org/packages';
  private readonly timeout: number;

  constructor(timeout?: number) {
    this.timeout = timeout || API_CONSTANTS.DEFAULT_TIMEOUT_MS;
  }

  async checkPackageExists(packageName: string): Promise<boolean> {
    const url = `${this.baseUrl}/${encodeURIComponent(packageName)}.json`;
    
    return withRetry(async () => {
      logger.debug(`Checking package existence: ${packageName}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal,
          headers: {
            'User-Agent': API_CONSTANTS.USER_AGENT,
          },
        });

        const exists = response.ok;
        logger.debug(`Package existence check: ${packageName} - ${exists ? 'exists' : 'not found'}`);
        return exists;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          logger.warn(`Package existence check timeout: ${packageName}`);
          return false;
        }
        logger.warn(`Package existence check failed: ${packageName}`, { error });
        return false;
      } finally {
        clearTimeout(timeoutId);
      }
    }, 3, 1000, `packagist checkPackageExists(${packageName})`);
  }

  async getPackageInfo(packageName: string): Promise<PackagistPackageInfo> {
    const url = `${this.baseUrl}/${encodeURIComponent(packageName)}.json`;
    
    return withRetry(async () => {
      logger.debug(`Fetching package info: ${packageName}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': API_CONSTANTS.USER_AGENT,
          },
        });

        if (!response.ok) {
          handleHttpError(response.status, response, `packagist for package ${packageName}`);
        }

        const data = await response.json() as { package: PackagistPackageInfo };
        logger.debug(`Successfully fetched package info: ${packageName}`);
        return data.package;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          handleApiError(new Error('Request timeout'), `packagist for package ${packageName}`);
        }
        handleApiError(error, `packagist for package ${packageName}`);
      } finally {
        clearTimeout(timeoutId);
      }
    }, 3, 1000, `packagist getPackageInfo(${packageName})`);
  }

  async getVersionInfo(packageName: string, version: string): Promise<PackagistVersionInfo> {
    const packageInfo = await this.getPackageInfo(packageName);
    
    // Resolve version alias using dedicated resolver
    const actualVersion = VersionResolver.resolveVersion(packageInfo.versions, version);

    const versionInfo = packageInfo.versions[actualVersion];
    if (!versionInfo) {
      throw new VersionNotFoundError(packageName, version);
    }

    return versionInfo;
  }

  async searchPackages(
    query: string,
    limit: number = 20,
    type?: string
  ): Promise<PackagistSearchResponse> {
    const params = new URLSearchParams({
      q: query,
      per_page: limit.toString(),
    });

    if (type) {
      params.append('type', type);
    }

    const url = `${this.searchUrl}?${params.toString()}`;

    return withRetry(async () => {
      logger.debug(`Searching packages: ${query} (limit: ${limit})`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': API_CONSTANTS.USER_AGENT,
          },
        });

        if (!response.ok) {
          handleHttpError(response.status, response, `packagist search for query ${query}`);
        }

        const data = await response.json() as PackagistSearchResponse;
        logger.debug(`Successfully searched packages: ${query}, found ${data.total} results`);
        return data;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          handleApiError(new Error('Request timeout'), `packagist search for query ${query}`);
        }
        handleApiError(error, `packagist search for query ${query}`);
      } finally {
        clearTimeout(timeoutId);
      }
    }, 3, 1000, `packagist searchPackages(${query})`);
  }

  async getPackageStats(packageName: string): Promise<PackagistStatsResponse | null> {
    const url = `${this.statsUrl}/${encodeURIComponent(packageName)}/stats.json`;
    
    return withRetry(async () => {
      logger.debug(`Fetching package stats: ${packageName}`);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      
      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
            'User-Agent': API_CONSTANTS.USER_AGENT,
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            // Package might not have stats, return null
            return null;
          }
          handleHttpError(response.status, response, `packagist stats for package ${packageName}`);
        }

        const data = await response.json() as PackagistStatsResponse;
        logger.debug(`Successfully fetched package stats: ${packageName}`);
        return data;
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          handleApiError(new Error('Request timeout'), `packagist stats for package ${packageName}`);
        }
        handleApiError(error, `packagist stats for package ${packageName}`);
      } finally {
        clearTimeout(timeoutId);
      }
    }, 3, 1000, `packagist getPackageStats(${packageName})`);
  }

  async getDownloadStats(packageName: string): Promise<{
    total: number;
    monthly: number;
    daily: number;
  }> {
    try {
      const stats = await this.getPackageStats(packageName);
      
      if (!stats) {
        return {
          total: 0,
          monthly: 0,
          daily: 0,
        };
      }

      return {
        total: stats.package.downloads.total || 0,
        monthly: stats.package.downloads.monthly || 0,
        daily: stats.package.downloads.daily || 0,
      };
    } catch (error) {
      logger.warn(`Failed to fetch download stats for ${packageName}, using zeros`, { error });
      return {
        total: 0,
        monthly: 0,
        daily: 0,
      };
    }
  }
}

export const packagistApi = new PackagistApiClient();