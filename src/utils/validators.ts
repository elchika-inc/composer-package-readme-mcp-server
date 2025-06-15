import { PackageReadmeMcpError } from '../types/index.js';
import { VALIDATION_CONSTANTS, PACKAGE_TYPES } from './constants.js';

export function validatePackageName(packageName: string): void {
  if (!packageName || typeof packageName !== 'string') {
    throw new PackageReadmeMcpError('Package name is required and must be a string', 'INVALID_PACKAGE_NAME');
  }

  const trimmed = packageName.trim();
  if (trimmed.length === 0) {
    throw new PackageReadmeMcpError('Package name cannot be empty', 'INVALID_PACKAGE_NAME');
  }

  if (trimmed.length > VALIDATION_CONSTANTS.MAX_PACKAGE_NAME_LENGTH) {
    throw new PackageReadmeMcpError(`Package name cannot exceed ${VALIDATION_CONSTANTS.MAX_PACKAGE_NAME_LENGTH} characters`, 'INVALID_PACKAGE_NAME');
  }

  // Composer package name validation rules (vendor/package format)
  if (!/^[a-z0-9_.-]+\/[a-z0-9_.-]+$/.test(trimmed)) {
    throw new PackageReadmeMcpError(
      'Package name must be in vendor/package format with lowercase letters, numbers, dots, hyphens, and underscores only',
      'INVALID_PACKAGE_NAME'
    );
  }

  // Check for reserved words or invalid patterns
  const parts = trimmed.split('/');
  if (parts.length !== 2) {
    throw new PackageReadmeMcpError('Package name must contain exactly one slash', 'INVALID_PACKAGE_NAME');
  }

  for (const part of parts) {
    if (part.length === 0) {
      throw new PackageReadmeMcpError('Package name parts cannot be empty', 'INVALID_PACKAGE_NAME');
    }
    if (part.startsWith('.') || part.endsWith('.')) {
      throw new PackageReadmeMcpError('Package name parts cannot start or end with a dot', 'INVALID_PACKAGE_NAME');
    }
    if (part.startsWith('-') || part.endsWith('-')) {
      throw new PackageReadmeMcpError('Package name parts cannot start or end with a hyphen', 'INVALID_PACKAGE_NAME');
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