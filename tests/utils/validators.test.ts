import { describe, it, expect } from 'vitest';
import {
  validatePackageName,
  validateSearchQuery,
  validateLimit,
  validateVersion,
  validatePackageType,
} from '../../src/utils/validators.js';

describe('validators', () => {
  describe('validatePackageName', () => {
    it('should accept valid package names', () => {
      const validNames = [
        'vendor/package',
        'symfony/console',
        'doctrine/orm',
        'psr/log',
        'monolog/monolog',
        'vendor-name/package-name',
        'vendor_name/package_name',
        'test123/package456',
      ];

      validNames.forEach(name => {
        expect(() => validatePackageName(name)).not.toThrow();
      });
    });

    it('should reject invalid package names', () => {
      const invalidNames = [
        'package', // Missing vendor
        'vendor/', // Missing package
        '/package', // Missing vendor
        'vendor//package', // Double slash
        'vendor/package/extra', // Too many parts
        '', // Empty
        'vendor', // No slash
        'VENDOR/PACKAGE', // Uppercase not allowed
        'vendor/package-', // Trailing dash
        'vendor/-package', // Leading dash
        'vendor/package_', // Trailing underscore
        'vendor/_package', // Leading underscore
        'vendor/.package', // Starting with dot
        'vendor/package.', // Ending with dot
        'vendor/pack age', // Space
        'vendor/package@version', // Contains @
        'vendor/package#tag', // Contains #
      ];

      invalidNames.forEach(name => {
        expect(() => validatePackageName(name)).toThrow();
      });
    });

    it('should handle null and undefined', () => {
      expect(() => validatePackageName(null as any)).toThrow();
      expect(() => validatePackageName(undefined as any)).toThrow();
    });

    it('should handle non-string values', () => {
      expect(() => validatePackageName(123 as any)).toThrow();
      expect(() => validatePackageName({} as any)).toThrow();
      expect(() => validatePackageName([] as any)).toThrow();
    });
  });

  describe('validateSearchQuery', () => {
    it('should accept valid search queries', () => {
      const validQueries = [
        'console',
        'symfony console',
        'logging framework',
        'api client',
        'test-package',
        'package_name',
        'api123',
        'a', // Single character
        'console framework for symfony applications',
      ];

      validQueries.forEach(query => {
        expect(() => validateSearchQuery(query)).not.toThrow();
      });
    });

    it('should reject invalid search queries', () => {
      const invalidQueries = [
        '', // Empty
        '   ', // Only whitespace
        'a'.repeat(251), // Too long (> 250 characters)
      ];

      invalidQueries.forEach(query => {
        expect(() => validateSearchQuery(query)).toThrow();
      });
    });

    it('should handle null and undefined', () => {
      expect(() => validateSearchQuery(null as any)).toThrow();
      expect(() => validateSearchQuery(undefined as any)).toThrow();
    });

    it('should handle non-string values', () => {
      expect(() => validateSearchQuery(123 as any)).toThrow();
      expect(() => validateSearchQuery({} as any)).toThrow();
      expect(() => validateSearchQuery([] as any)).toThrow();
    });

    it('should trim whitespace before validation', () => {
      expect(() => validateSearchQuery('  console  ')).not.toThrow();
      expect(() => validateSearchQuery('  ')).toThrow(); // Only whitespace after trim
    });
  });

  describe('validateLimit', () => {
    it('should accept valid limits', () => {
      const validLimits = [1, 20, 50, 100];

      validLimits.forEach(limit => {
        expect(() => validateLimit(limit)).not.toThrow();
      });
    });

    it('should reject invalid limits', () => {
      const invalidLimits = [
        0, // Too low
        -1, // Negative
        101, // Too high
        1000, // Way too high
        1.5, // Float
        Infinity,
        -Infinity,
        NaN,
      ];

      invalidLimits.forEach(limit => {
        expect(() => validateLimit(limit)).toThrow();
      });
    });

    it('should handle null and undefined', () => {
      expect(() => validateLimit(null as any)).toThrow();
      expect(() => validateLimit(undefined as any)).toThrow();
    });

    it('should handle non-number values', () => {
      expect(() => validateLimit('20' as any)).toThrow();
      expect(() => validateLimit({} as any)).toThrow();
      expect(() => validateLimit([] as any)).toThrow();
    });
  });

  describe('validateVersion', () => {
    it('should accept basic valid versions', () => {
      expect(() => validateVersion('latest')).not.toThrow();
      expect(() => validateVersion('v6.4.0')).not.toThrow();
      expect(() => validateVersion('1.0.0')).not.toThrow();
    });

    it('should reject invalid versions', () => {
      const invalidVersions = [
        '', // Empty
        '   ', // Only whitespace
        'v'.repeat(101), // Too long
        'invalid version string with many words that makes no sense',
      ];

      invalidVersions.forEach(version => {
        expect(() => validateVersion(version)).toThrow();
      });
    });

    it('should handle null and undefined', () => {
      expect(() => validateVersion(null as any)).toThrow();
      expect(() => validateVersion(undefined as any)).toThrow();
    });

    it('should handle non-string values', () => {
      expect(() => validateVersion(123 as any)).toThrow();
      expect(() => validateVersion({} as any)).toThrow();
      expect(() => validateVersion([] as any)).toThrow();
    });
  });

  describe('validatePackageType', () => {
    it('should accept valid package types', () => {
      const validTypes = [
        'library',
        'project',
        'metapackage',
        'composer-plugin',
        'symfony-bundle',
        'wordpress-plugin',
        'drupal-module',
        'laravel-package',
      ];

      validTypes.forEach(type => {
        expect(() => validatePackageType(type)).not.toThrow();
      });
    });

    it('should reject invalid package types', () => {
      const invalidTypes = [
        'invalid-type',
        'unknown',
        'custom-type',
        '',
      ];

      invalidTypes.forEach(type => {
        expect(() => validatePackageType(type)).toThrow();
      });
    });

    it('should handle null and undefined', () => {
      expect(() => validatePackageType(null as any)).toThrow();
      expect(() => validatePackageType(undefined as any)).toThrow();
    });
  });

  describe('edge cases', () => {
    it('should handle very long but valid inputs', () => {
      const longButValidPackageName = 'a'.repeat(100) + '/' + 'b'.repeat(100); // 201 chars total
      expect(() => validatePackageName(longButValidPackageName)).not.toThrow();

      const longButValidQuery = 'search query ' + 'word '.repeat(40); // ~200 chars
      expect(() => validateSearchQuery(longButValidQuery.trim())).not.toThrow();
    });

    it('should handle boundary values for limits', () => {
      expect(() => validateLimit(1)).not.toThrow(); // Minimum
      expect(() => validateLimit(100)).not.toThrow(); // Maximum
    });

    it('should handle special characters in package names appropriately', () => {
      // Valid special characters
      expect(() => validatePackageName('vendor-name/package-name')).not.toThrow();
      expect(() => validatePackageName('vendor_name/package_name')).not.toThrow();
      expect(() => validatePackageName('vendor123/package456')).not.toThrow();

      // Invalid special characters
      expect(() => validatePackageName('vendor@name/package')).toThrow();
      expect(() => validatePackageName('vendor/package$name')).toThrow();
      expect(() => validatePackageName('vendor/package%name')).toThrow();
    });

    it('should handle version strings with various formats', () => {
      // Composer-style constraints
      expect(() => validateVersion('^6.0')).not.toThrow();
      expect(() => validateVersion('~6.4.0')).not.toThrow();
    });
  });
});