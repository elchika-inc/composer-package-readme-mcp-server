import { PackagistVersionInfo } from '../types/index.js';

export class VersionResolver {
  static resolveVersion(
    packageVersions: Record<string, PackagistVersionInfo> | null | undefined,
    requestedVersion: string
  ): string {
    if (requestedVersion !== 'latest' && requestedVersion !== 'dev-master') {
      return requestedVersion;
    }

    if (!packageVersions) {
      return requestedVersion === 'latest' ? 'dev-master' : requestedVersion;
    }

    const versions = Object.keys(packageVersions);
    
    if (requestedVersion === 'dev-master') {
      return versions.includes('dev-master') ? 'dev-master' : (this.getLatestStableVersion(versions) || 'dev-master');
    }

    // For 'latest', prefer stable version over dev-master
    if (versions.includes('dev-master') && requestedVersion === 'latest') {
      const latestStable = this.getLatestStableVersion(versions);
      return latestStable || 'dev-master';
    }

    const latestStable = this.getLatestStableVersion(versions);
    return latestStable || versions[0] || 'dev-master';
  }

  private static getLatestStableVersion(versions: string[]): string | null {
    const stableVersions = this.filterStableVersions(versions);
    
    if (stableVersions.length === 0) {
      return null;
    }

    return this.sortVersionsDescending(stableVersions)[0] || null;
  }

  private static filterStableVersions(versions: string[]): string[] {
    return versions.filter(v => 
      !v.startsWith('dev-') && 
      !v.includes('alpha') && 
      !v.includes('beta') && 
      !v.includes('rc')
    );
  }

  private static sortVersionsDescending(versions: string[]): string[] {
    return versions.sort((a, b) => {
      const aNum = this.parseVersion(a);
      const bNum = this.parseVersion(b);
      
      for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
        const diff = (bNum[i] || 0) - (aNum[i] || 0);
        if (diff !== 0) return diff;
      }
      return 0;
    });
  }

  private static parseVersion(version: string): number[] {
    return version
      .replace(/^v/, '')
      .split('.')
      .map(n => parseInt(n) || 0);
  }
}