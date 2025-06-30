import { expect, test, describe } from "vitest";

describe('GitHubApiClient', () => {
  test('should exist and be constructable', () => {
    const { GitHubApiClient } = require('../../dist/src/services/github-api.js');
    expect(typeof GitHubApiClient).toBe('function');
    
    const client = new GitHubApiClient();
    expect(client).toBeDefined();
  });

  test('should have required methods', () => {
    const { GitHubApiClient } = require('../../dist/src/services/github-api.js');
    const client = new GitHubApiClient();
    
    expect(typeof client.getReadme).toBe('function');
    expect(typeof client.parseRepositoryUrl).toBe('function');
    expect(typeof client.getReadmeFromRepository).toBe('function');
    expect(typeof client.isRateLimited).toBe('function');
    expect(typeof client.getRateLimitStatus).toBe('function');
  });

  test('should create client with token and timeout', () => {
    const { GitHubApiClient } = require('../../dist/src/services/github-api.js');
    const client = new GitHubApiClient('test-token', 10000);
    expect(client).toBeDefined();
  });

  test('should parse GitHub repository URLs', () => {
    const { GitHubApiClient } = require('../../dist/src/services/github-api.js');
    const client = new GitHubApiClient();
    
    const result = client.parseRepositoryUrl('https://github.com/symfony/console.git');
    expect(result).toEqual({
      owner: 'symfony',
      repo: 'console',
    });
  });

  test('should return null for invalid URLs', () => {
    const { GitHubApiClient } = require('../../dist/src/services/github-api.js');
    const client = new GitHubApiClient();
    
    const result = client.parseRepositoryUrl('https://gitlab.com/symfony/console.git');
    expect(result).toBeNull();
  });
});