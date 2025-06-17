import { PackageReadmeMcpError } from '../types/index.js';
import { VALIDATION_CONSTANTS, PACKAGE_TYPES } from './constants.js';

export function validatePackageName(packageName: string): void {
  if (!packageName || typeof packageName !== 'string') {
    throw new PackageReadmeMcpError('Package name is required and must be a string', 'INVALID_PACKAGE_NAME');
  }

  const trimmed = packageName.trim();
  if (trimmed.length === 0) {
    throw new PackageReadmeMcpError(
      'Package name cannot be empty. Please provide a valid Composer package name like "monolog/monolog" or "symfony/console".',
      'INVALID_PACKAGE_NAME'
    );
  }

  if (trimmed.length > VALIDATION_CONSTANTS.MAX_PACKAGE_NAME_LENGTH) {
    throw new PackageReadmeMcpError(
      `Package name cannot exceed ${VALIDATION_CONSTANTS.MAX_PACKAGE_NAME_LENGTH} characters (current: ${trimmed.length})`,
      'INVALID_PACKAGE_NAME'
    );
  }

  // Check for common mistakes and provide suggestions
  if (!trimmed.includes('/')) {
    throw new PackageReadmeMcpError(
      `Package name "${trimmed}" is missing vendor prefix. Composer packages must use vendor/package format. Example: "monolog/${trimmed}" or "symfony/${trimmed}".`,
      'INVALID_PACKAGE_NAME'
    );
  }

  if (trimmed.includes(' ')) {
    throw new PackageReadmeMcpError(
      `Package name "${trimmed}" contains spaces. Composer package names cannot contain spaces. Did you mean "${trimmed.replace(/\s+/g, '-')}"?`,
      'INVALID_PACKAGE_NAME'
    );
  }

  if (/[A-Z]/.test(trimmed)) {
    throw new PackageReadmeMcpError(
      `Package name "${trimmed}" contains uppercase letters. Composer package names must be lowercase. Did you mean "${trimmed.toLowerCase()}"?`,
      'INVALID_PACKAGE_NAME'
    );
  }

  // Check for invalid characters
  const invalidCharsMatch = trimmed.match(/[^a-z0-9_.\/-]/g);
  if (invalidCharsMatch) {
    const invalidChars = Array.from(new Set(invalidCharsMatch));
    throw new PackageReadmeMcpError(
      `Package name "${trimmed}" contains invalid characters: ${invalidChars.join(', ')}. Composer package names can only contain lowercase letters, numbers, dots (.), hyphens (-), underscores (_), and exactly one slash (/). Examples: "monolog/monolog", "symfony/console", "laravel/framework".`,
      'INVALID_PACKAGE_NAME'
    );
  }

  // Validate vendor/package format
  if (!/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/.test(trimmed)) {
    throw new PackageReadmeMcpError(
      `Package name "${trimmed}" is not in valid vendor/package format. Valid examples: "monolog/monolog", "symfony/console", "doctrine/orm".`,
      'INVALID_PACKAGE_NAME'
    );
  }

  // Check for reserved words or invalid patterns
  const parts = trimmed.split('/');
  if (parts.length !== 2) {
    const slashCount = (trimmed.match(/\//g) || []).length;
    if (slashCount === 0) {
      throw new PackageReadmeMcpError(
        `Package name "${trimmed}" is missing vendor prefix. Format should be "vendor/package".`,
        'INVALID_PACKAGE_NAME'
      );
    } else {
      throw new PackageReadmeMcpError(
        `Package name "${trimmed}" contains ${slashCount} slashes but must contain exactly one. Format should be "vendor/package".`,
        'INVALID_PACKAGE_NAME'
      );
    }
  }

  const vendor = parts[0];
  const package_name = parts[1];
  
  if (!vendor || vendor.length === 0) {
    throw new PackageReadmeMcpError(
      `Package name "${trimmed}" has empty vendor name. Vendor name must not be empty. Example: "monolog/monolog".`,
      'INVALID_PACKAGE_NAME'
    );
  }
  
  if (!package_name || package_name.length === 0) {
    throw new PackageReadmeMcpError(
      `Package name "${trimmed}" has empty package name. Package name must not be empty. Example: "monolog/monolog".`,
      'INVALID_PACKAGE_NAME'
    );
  }

  const partChecks: Array<[string, string]> = [['vendor', vendor], ['package', package_name]];
  for (const [partName, part] of partChecks) {
    if (part.startsWith('.') || part.endsWith('.')) {
      throw new PackageReadmeMcpError(
        `${partName.charAt(0).toUpperCase() + partName.slice(1)} name "${part}" cannot start or end with a dot. Valid ${partName} names: "monolog", "symfony", "doctrine".`,
        'INVALID_PACKAGE_NAME'
      );
    }
    if (part.startsWith('-') || part.endsWith('-')) {
      throw new PackageReadmeMcpError(
        `${partName.charAt(0).toUpperCase() + partName.slice(1)} name "${part}" cannot start or end with a hyphen. Valid ${partName} names: "monolog", "symfony", "doctrine".`,
        'INVALID_PACKAGE_NAME'
      );
    }
    if (part.startsWith('_') || part.endsWith('_')) {
      throw new PackageReadmeMcpError(
        `${partName.charAt(0).toUpperCase() + partName.slice(1)} name "${part}" cannot start or end with an underscore. Valid ${partName} names: "monolog", "symfony", "doctrine".`,
        'INVALID_PACKAGE_NAME'
      );
    }
  }
}

export function validateVersion(version: string): void {
  if (!version || typeof version !== 'string') {
    throw new PackageReadmeMcpError('Version must be a string', 'INVALID_VERSION');
  }

  const trimmed = version.trim();
  if (trimmed.length === 0) {
    throw new PackageReadmeMcpError('Version cannot be empty', 'INVALID_VERSION');
  }

  // Allow common version patterns for Composer
  if (trimmed === 'latest' || trimmed === 'dev-master' || trimmed === 'dev-main') {
    return;
  }

  // Allow dev branches
  if (trimmed.startsWith('dev-')) {
    return;
  }

  // Validate semantic version or version constraint
  const semverRegex = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
  const constraintRegex = /^[\^~>=<! ]*[0-9]/;
  
  if (!semverRegex.test(trimmed) && !constraintRegex.test(trimmed)) {
    throw new PackageReadmeMcpError(
      'Version must be a valid semantic version (e.g., 1.0.0), version constraint (e.g., ^1.0), or a valid branch reference',
      'INVALID_VERSION'
    );
  }
}

export function validateSearchQuery(query: string): void {
  if (!query || typeof query !== 'string') {
    throw new PackageReadmeMcpError('Search query is required and must be a string', 'INVALID_SEARCH_QUERY');
  }

  const trimmed = query.trim();
  if (trimmed.length === 0) {
    throw new PackageReadmeMcpError('Search query cannot be empty', 'INVALID_SEARCH_QUERY');
  }

  if (trimmed.length > VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH) {
    throw new PackageReadmeMcpError(`Search query cannot exceed ${VALIDATION_CONSTANTS.MAX_SEARCH_QUERY_LENGTH} characters`, 'INVALID_SEARCH_QUERY');
  }
}

export function validateLimit(limit: number): void {
  if (!Number.isInteger(limit) || limit < VALIDATION_CONSTANTS.MIN_SEARCH_LIMIT || limit > VALIDATION_CONSTANTS.MAX_SEARCH_LIMIT) {
    throw new PackageReadmeMcpError(`Limit must be an integer between ${VALIDATION_CONSTANTS.MIN_SEARCH_LIMIT} and ${VALIDATION_CONSTANTS.MAX_SEARCH_LIMIT}`, 'INVALID_LIMIT');
  }
}

export function validatePackageType(type: string): void {
  if (!PACKAGE_TYPES.includes(type as typeof PACKAGE_TYPES[number])) {
    throw new PackageReadmeMcpError(
      `Package type must be one of: ${PACKAGE_TYPES.join(', ')}`,
      'INVALID_PACKAGE_TYPE'
    );
  }
}