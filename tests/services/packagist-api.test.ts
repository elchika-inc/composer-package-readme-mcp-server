import { expect, test, describe } from "vitest";

describe('PackagistApiClient', () => {
  test('should exist and be constructable', () => {
    const { PackagistApiClient } = require('../../dist/src/services/packagist-api.js');
    expect(typeof PackagistApiClient).toBe('function');
    
    const client = new PackagistApiClient();
    expect(client).toBeDefined();
  });

  test('should have required methods', () => {
    const { PackagistApiClient } = require('../../dist/src/services/packagist-api.js');
    const client = new PackagistApiClient();
    
    expect(typeof client.checkPackageExists).toBe('function');
    expect(typeof client.getPackageInfo).toBe('function');
    expect(typeof client.getVersionInfo).toBe('function');
    expect(typeof client.searchPackages).toBe('function');
    expect(typeof client.getPackageStats).toBe('function');
    expect(typeof client.getDownloadStats).toBe('function');
  });

  test('should create client with custom timeout', () => {
    const { PackagistApiClient } = require('../../dist/src/services/packagist-api.js');
    const client = new PackagistApiClient(10000);
    expect(client).toBeDefined();
  });
});