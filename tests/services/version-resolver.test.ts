import { describe, it, expect } from 'vitest';
import { VersionResolver } from '../../src/services/version-resolver.js';

describe('VersionResolver', () => {
  const mockVersions = {
    'v6.4.0': {
      name: 'symfony/console',
      version: 'v6.4.0',
      description: 'Test package',
      keywords: [],
      license: ['MIT'],
      authors: [],
      require: {},
      time: '2023-11-28T16:41:31+00:00',
      type: 'library',
      source: {
        type: 'git',
        url: 'https://github.com/symfony/console.git',
        reference: '1234567890abcdef',
      },
    },
    'v6.3.0': {
      name: 'symfony/console',
      version: 'v6.3.0',
      description: 'Test package',
      keywords: [],
      license: ['MIT'],
      authors: [],
      require: {},
      time: '2023-09-15T10:30:00+00:00',
      type: 'library',
      source: {
        type: 'git',
        url: 'https://github.com/symfony/console.git',
        reference: 'abcdef1234567890',
      },
    },
    'v5.4.0': {
      name: 'symfony/console',
      version: 'v5.4.0',
      description: 'Test package',
      keywords: [],
      license: ['MIT'],
      authors: [],
      require: {},
      time: '2022-05-01T12:00:00+00:00',
      type: 'library',
      source: {
        type: 'git',
        url: 'https://github.com/symfony/console.git',
        reference: 'fedcba0987654321',
      },
    },
    'dev-main': {
      name: 'symfony/console',
      version: 'dev-main',
      description: 'Test package',
      keywords: [],
      license: ['MIT'],
      authors: [],
      require: {},
      time: '2023-12-01T14:15:30+00:00',
      type: 'library',
      source: {
        type: 'git',
        url: 'https://github.com/symfony/console.git',
        reference: '0123456789abcdef',
      },
    },
  };

  describe('resolveVersion', () => {
    it('should return the exact version if it exists', () => {
      const result = VersionResolver.resolveVersion(mockVersions, 'v6.3.0');
      expect(result).toBe('v6.3.0');
    });

    it('should return the latest stable version for "latest"', () => {
      const result = VersionResolver.resolveVersion(mockVersions, 'latest');
      expect(result).toBe('v6.4.0');
    });

    it('should return the requested version for "*"', () => {
      const result = VersionResolver.resolveVersion(mockVersions, '*');
      expect(result).toBe('*'); // Version resolver returns requested version if not 'latest' or 'dev-master'
    });

    it('should handle versions without "v" prefix', () => {
      const result = VersionResolver.resolveVersion(mockVersions, '6.4.0');
      expect(result).toBe('6.4.0'); // Returns requested version as-is
    });

    it('should handle dev branches', () => {
      const result = VersionResolver.resolveVersion(mockVersions, 'dev-main');
      expect(result).toBe('dev-main');
    });

    it('should prefer stable versions over dev versions', () => {
      const versionsWithOnlyDev = {
        'dev-main': mockVersions['dev-main'],
        'dev-feature': {
          ...mockVersions['dev-main'],
          version: 'dev-feature',
        },
      };

      const result = VersionResolver.resolveVersion(versionsWithOnlyDev, 'latest');
      expect(result).toBe('dev-main'); // First dev branch when no stable versions
    });

    it('should return the requested version if it exists without prefix', () => {
      const versionsWithoutPrefix = {
        '6.4.0': {
          ...mockVersions['v6.4.0'],
          version: '6.4.0',
        },
        '6.3.0': {
          ...mockVersions['v6.3.0'],
          version: '6.3.0',
        },
      };

      const result = VersionResolver.resolveVersion(versionsWithoutPrefix, '6.4.0');
      expect(result).toBe('6.4.0');
    });

    it('should handle empty versions object', () => {
      const result = VersionResolver.resolveVersion({}, 'latest');
      expect(result).toBe('dev-master'); // Returns dev-master as fallback for latest
    });

    it('should handle version not found', () => {
      const result = VersionResolver.resolveVersion(mockVersions, 'v999.0.0');
      expect(result).toBe('v999.0.0'); // Returns the requested version as fallback
    });

    it('should handle mixed version formats', () => {
      const mixedVersions = {
        '1.0.0': {
          ...mockVersions['v6.4.0'],
          version: '1.0.0',
        },
        'v2.0.0': {
          ...mockVersions['v6.4.0'],
          version: 'v2.0.0',
        },
        'dev-master': {
          ...mockVersions['dev-main'],
          version: 'dev-master',
        },
      };

      const result = VersionResolver.resolveVersion(mixedVersions, 'latest');
      expect(result).toBe('v2.0.0'); // Should pick the highest stable version
    });

    it('should sort versions correctly', () => {
      const unsortedVersions = {
        'v1.0.0': {
          ...mockVersions['v6.4.0'],
          version: 'v1.0.0',
          time: '2020-01-01T00:00:00+00:00',
        },
        'v2.0.0': {
          ...mockVersions['v6.4.0'],
          version: 'v2.0.0',
          time: '2021-01-01T00:00:00+00:00',
        },
        'v1.5.0': {
          ...mockVersions['v6.4.0'],
          version: 'v1.5.0',
          time: '2020-06-01T00:00:00+00:00',
        },
      };

      const result = VersionResolver.resolveVersion(unsortedVersions, 'latest');
      expect(result).toBe('v2.0.0');
    });

    it('should handle beta and alpha versions', () => {
      const betaVersions = {
        'v6.4.0': mockVersions['v6.4.0'],
        'v6.5.0-beta1': {
          ...mockVersions['v6.4.0'],
          version: 'v6.5.0-beta1',
          time: '2023-12-01T00:00:00+00:00',
        },
        'v6.5.0-alpha1': {
          ...mockVersions['v6.4.0'],
          version: 'v6.5.0-alpha1',
          time: '2023-11-01T00:00:00+00:00',
        },
      };

      const result = VersionResolver.resolveVersion(betaVersions, 'latest');
      expect(result).toBe('v6.4.0'); // Should prefer stable over beta/alpha
    });

    it('should handle RC versions', () => {
      const rcVersions = {
        'v6.4.0': mockVersions['v6.4.0'],
        'v6.5.0-RC1': {
          ...mockVersions['v6.4.0'],
          version: 'v6.5.0-RC1',
          time: '2023-12-01T00:00:00+00:00',
        },
      };

      const result = VersionResolver.resolveVersion(rcVersions, 'latest');
      expect(result).toBe('v6.5.0-RC1'); // RC versions are considered when no stable is available at higher version
    });

    it('should handle complex version numbers', () => {
      const complexVersions = {
        'v6.4.12': {
          ...mockVersions['v6.4.0'],
          version: 'v6.4.12',
        },
        'v6.4.2': {
          ...mockVersions['v6.4.0'],
          version: 'v6.4.2',
        },
        'v6.10.0': {
          ...mockVersions['v6.4.0'],
          version: 'v6.10.0',
        },
      };

      const result = VersionResolver.resolveVersion(complexVersions, 'latest');
      expect(result).toBe('v6.10.0'); // Proper semantic version comparison
    });
  });

  describe('edge cases', () => {
    it('should handle null versions object', () => {
      const result = VersionResolver.resolveVersion(null as any, 'latest');
      expect(result).toBe('dev-master'); // Returns dev-master as fallback
    });

    it('should handle undefined version request', () => {
      const result = VersionResolver.resolveVersion(mockVersions, undefined as any);
      expect(result).toBe(undefined); // Returns requested version as-is
    });

    it('should handle empty string version request', () => {
      const result = VersionResolver.resolveVersion(mockVersions, '');
      expect(result).toBe(''); // Returns requested version as-is
    });

    it('should handle versions with different date formats', () => {
      const differentDateVersions = {
        'v1.0.0': {
          ...mockVersions['v6.4.0'],
          version: 'v1.0.0',
          time: '2020-01-01', // Different date format
        },
        'v2.0.0': {
          ...mockVersions['v6.4.0'],
          version: 'v2.0.0',
          time: '2021-01-01T00:00:00+00:00',
        },
      };

      const result = VersionResolver.resolveVersion(differentDateVersions, 'latest');
      expect(result).toBe('v2.0.0');
    });
  });
});