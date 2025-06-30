import {
  PackageReadmeResponse,
  InstallationInfo,
  PackageBasicInfo,
  RepositoryInfo,
  PackagistVersionInfo,
} from '../types/index.js';

export class ResponseBuilder {
  static createInstallationInfo(packageName: string, version: string): InstallationInfo {
    return {
      composer: `composer require ${packageName}`,
      ...(version !== 'dev-master' && { version }),
    };
  }

  static createBasicInfo(versionInfo: PackagistVersionInfo, actualVersion: string): PackageBasicInfo {
    return {
      name: versionInfo.name,
      version: actualVersion,
      description: versionInfo.description || 'No description available',
      type: versionInfo.type || 'library',
      homepage: versionInfo.homepage || undefined,
      license: versionInfo.license || ['Unknown'],
      authors: versionInfo.authors || [],
      keywords: versionInfo.keywords || [],
      ...(versionInfo.minimum_stability && { minimum_stability: versionInfo.minimum_stability }),
      require: versionInfo.require,
      require_dev: versionInfo.require_dev,
      suggest: versionInfo.suggest,
      autoload: versionInfo.autoload,
    };
  }

  static createRepositoryInfo(versionInfo: PackagistVersionInfo): RepositoryInfo | undefined {
    if (!versionInfo.source) {
      return undefined;
    }
    
    return {
      type: versionInfo.source.type,
      url: versionInfo.source.url,
      reference: versionInfo.source.reference,
    };
  }

  static createNotFoundResponse(packageName: string, version: string): PackageReadmeResponse {
    return {
      package_name: packageName,
      version: version || 'latest',
      description: 'Package not found',
      readme_content: '',
      usage_examples: [],
      installation: this.createInstallationInfo(packageName, version),
      basic_info: {
        name: packageName,
        version: version || 'latest',
        description: 'Package not found',
        type: 'library',
        license: 'Unknown',
        authors: [],
        keywords: [],
        homepage: undefined,
      },
      exists: false,
    };
  }
}