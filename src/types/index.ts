export interface UsageExample {
  title: string;
  description?: string | undefined;
  code: string;
  language: string; // 'php', 'json', 'bash', etc.
}

export interface InstallationInfo {
  composer: string;      // "composer require vendor/package"
  version?: string | undefined;      // specific version constraint
}

export interface AuthorInfo {
  name: string;
  email?: string;
  role?: string;
  homepage?: string;
}

export interface RepositoryInfo {
  type: string;
  url: string;
  reference?: string | undefined;
}

export interface PackageBasicInfo {
  name: string;
  version: string;
  description: string;
  type: string;
  homepage?: string | undefined;
  license: string | string[];
  authors: AuthorInfo[];
  keywords: string[];
  minimum_stability?: string | undefined;
  require?: Record<string, string> | undefined;
  require_dev?: Record<string, string> | undefined;
  suggest?: Record<string, string> | undefined;
  autoload?: {
    'psr-4'?: Record<string, string>;
    'psr-0'?: Record<string, string>;
    files?: string[];
    classmap?: string[];
  } | undefined;
}

export interface DownloadStats {
  total: number;
  monthly: number;
  daily: number;
}

export interface PackageSearchResult {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  author: string;
  publisher: string;
  maintainers: string[];
  score: {
    final: number;
    detail: {
      quality: number;
      popularity: number;
      maintenance: number;
    };
  };
  searchScore: number;
}

// Tool Parameters
export interface GetPackageReadmeParams {
  package_name: string;    // Package name (required)
  version?: string;        // Version specification (optional, default: "latest")
  include_examples?: boolean; // Whether to include usage examples (optional, default: true)
}

export interface GetPackageInfoParams {
  package_name: string;
  include_dependencies?: boolean; // Whether to include dependencies (default: true)
  include_dev_dependencies?: boolean; // Whether to include dev dependencies (default: false)
  include_suggestions?: boolean; // Whether to include suggested packages (default: false)
}

export interface SearchPackagesParams {
  query: string;          // Search query
  limit?: number;         // Maximum number of results (default: 20)
  quality?: number;       // Minimum quality score (0-1)
  popularity?: number;    // Minimum popularity score (0-1)
  type?: string;          // Filter by package type
}

// Tool Responses
export interface PackageReadmeResponse {
  package_name: string;
  version: string;
  description: string;
  readme_content: string;
  usage_examples: UsageExample[];
  installation: InstallationInfo;
  basic_info: PackageBasicInfo;
  repository?: RepositoryInfo | undefined;
  download_stats?: DownloadStats;
}

export interface PackageInfoResponse {
  package_name: string;
  latest_version: string;
  description: string;
  author: string;
  license: string;
  keywords: string[];
  dependencies?: Record<string, string> | undefined;
  dev_dependencies?: Record<string, string> | undefined;
  download_stats: {
    last_day: number;
    last_week: number;
    last_month: number;
  };
  repository?: RepositoryInfo | undefined;
  exists: boolean;
}

export interface SearchPackagesResponse {
  query: string;
  total: number;
  packages: PackageSearchResult[];
}

// Cache Types
export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export interface CacheOptions {
  ttl?: number;
  maxSize?: number;
}

// Packagist API Types
export interface PackagistPackageInfo {
  name: string;
  description: string;
  time: string;
  maintainers: {
    name: string;
    avatar_url: string;
  }[];
  versions: {
    [version: string]: PackagistVersionInfo;
  };
  type: string;
  repository: string;
  github_stars?: number;
  github_watchers?: number;
  github_forks?: number;
  github_open_issues?: number;
  language?: string;
  dependents?: number;
  suggesters?: number;
  downloads: {
    total: number;
    monthly: number;
    daily: number;
  };
}

export interface PackagistVersionInfo {
  name: string;
  description: string;
  keywords: string[];
  homepage?: string;
  version: string;
  version_normalized: string;
  license: string[];
  authors: AuthorInfo[];
  source: {
    type: string;
    url: string;
    reference: string;
  };
  dist: {
    type: string;
    url: string;
    reference: string;
    shasum?: string;
  };
  require?: Record<string, string>;
  require_dev?: Record<string, string>;
  suggest?: Record<string, string>;
  provide?: Record<string, string>;
  conflict?: Record<string, string>;
  replace?: Record<string, string>;
  type: string;
  time: string;
  autoload?: {
    'psr-4'?: Record<string, string>;
    'psr-0'?: Record<string, string>;
    files?: string[];
    classmap?: string[];
  };
  extra?: Record<string, unknown>;
  scripts?: Record<string, string | string[]>;
  minimum_stability?: string;
  prefer_stable?: boolean;
  bin?: string[];
}

export interface PackagistSearchResponse {
  results: {
    name: string;
    description: string;
    url: string;
    repository: string;
    downloads: number;
    favers: number;
    abandoned: boolean | string;
  }[];
  total: number;
  next?: string;
}

export interface PackagistStatsResponse {
  package: {
    name: string;
    description: string;
    downloads: {
      total: number;
      monthly: number;
      daily: number;
    };
    favers: number;
    dependents: number;
    suggesters: number;
    github_stars?: number;
    github_watchers?: number;
    github_forks?: number;
    github_open_issues?: number;
  };
}

// GitHub API Types
export interface GitHubReadmeResponse {
  name: string;
  path: string;
  sha: string;
  size: number;
  url: string;
  html_url: string;
  git_url: string;
  download_url: string;
  type: string;
  content: string;
  encoding: string;
  _links: {
    self: string;
    git: string;
    html: string;
  };
}

// Error Types
export class PackageReadmeMcpError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'PackageReadmeMcpError';
  }
}

export class PackageNotFoundError extends PackageReadmeMcpError {
  constructor(packageName: string) {
    super(`Package '${packageName}' not found`, 'PACKAGE_NOT_FOUND', 404);
  }
}

export class VersionNotFoundError extends PackageReadmeMcpError {
  constructor(packageName: string, version: string) {
    super(`Version '${version}' of package '${packageName}' not found`, 'VERSION_NOT_FOUND', 404);
  }
}

export class RateLimitError extends PackageReadmeMcpError {
  constructor(service: string, retryAfter?: number) {
    super(`Rate limit exceeded for ${service}`, 'RATE_LIMIT_EXCEEDED', 429, { retryAfter });
  }
}

export class NetworkError extends PackageReadmeMcpError {
  constructor(message: string, originalError?: Error) {
    super(`Network error: ${message}`, 'NETWORK_ERROR', undefined, originalError);
  }
}