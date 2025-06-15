// Cache configuration constants
export const CACHE_CONSTANTS = {
  DEFAULT_TTL_MS: 3600 * 1000, // 1 hour
  DEFAULT_MAX_SIZE_BYTES: 100 * 1024 * 1024, // 100MB
  CLEANUP_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  SEARCH_RESULT_TTL_MS: 15 * 60 * 1000, // 15 minutes
} as const;

// Validation constants
export const VALIDATION_CONSTANTS = {
  MAX_PACKAGE_NAME_LENGTH: 214,
  MAX_SEARCH_QUERY_LENGTH: 250,
  MIN_SEARCH_LIMIT: 1,
  MAX_SEARCH_LIMIT: 100,
  MIN_DESCRIPTION_LENGTH: 20,
  MAX_DESCRIPTION_LENGTH: 300,
  MAX_USAGE_EXAMPLES: 10,
} as const;

// API configuration constants
export const API_CONSTANTS = {
  DEFAULT_TIMEOUT_MS: 30000, // 30 seconds
  MAX_RETRIES: 3,
  BASE_RETRY_DELAY_MS: 1000,
  USER_AGENT: 'composer-package-readme-mcp/1.0.0',
} as const;

// Supported package types
export const PACKAGE_TYPES = [
  'library',
  'project', 
  'metapackage',
  'composer-plugin',
  'symfony-bundle',
  'wordpress-plugin',
  'drupal-module',
  'laravel-package',
  'phpunit-test',
  'psr-implementation',
] as const;

// Supported languages for code examples
export const SUPPORTED_LANGUAGES = {
  php: 'php',
  javascript: 'javascript',
  js: 'javascript',
  typescript: 'typescript',
  ts: 'typescript',
  bash: 'bash',
  shell: 'bash',
  sh: 'bash',
  json: 'json',
  yaml: 'yaml',
  yml: 'yaml',
  xml: 'xml',
  markdown: 'markdown',
  md: 'markdown',
  html: 'html',
  htm: 'html',
} as const;