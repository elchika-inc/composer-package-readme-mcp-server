import { expect, test, describe } from "vitest";

describe('MemoryCache', () => {
  test('should exist and be constructable', () => {
    const { MemoryCache } = require('../../dist/src/services/cache.js');
    expect(typeof MemoryCache).toBe('function');
    
    const cache = new MemoryCache();
    expect(cache).toBeDefined();
    cache.destroy();
  });

  test('should have required methods', () => {
    const { MemoryCache } = require('../../dist/src/services/cache.js');
    const cache = new MemoryCache();
    
    expect(typeof cache.set).toBe('function');
    expect(typeof cache.get).toBe('function');
    expect(typeof cache.delete).toBe('function');
    expect(typeof cache.clear).toBe('function');
    expect(typeof cache.has).toBe('function');
    expect(typeof cache.size).toBe('function');
    expect(typeof cache.getStats).toBe('function');
    expect(typeof cache.destroy).toBe('function');
    
    cache.destroy();
  });

  test('should store and retrieve values', () => {
    const { MemoryCache } = require('../../dist/src/services/cache.js');
    const cache = new MemoryCache();
    
    const key = 'test-key';
    const value = { data: 'test value' };
    
    cache.set(key, value);
    const result = cache.get(key);
    
    expect(result).toEqual(value);
    cache.destroy();
  });

  test('should return null for non-existent keys', () => {
    const { MemoryCache } = require('../../dist/src/services/cache.js');
    const cache = new MemoryCache();
    
    const result = cache.get('non-existent');
    expect(result).toBeNull();
    
    cache.destroy();
  });

  test('should handle different data types', () => {
    const { MemoryCache } = require('../../dist/src/services/cache.js');
    const cache = new MemoryCache();
    
    const testCases = [
      { key: 'string', value: 'test string' },
      { key: 'number', value: 12345 },
      { key: 'boolean', value: true },
      { key: 'array', value: [1, 2, 3] },
      { key: 'object', value: { a: 1, b: 'test' } },
    ];

    testCases.forEach(({ key, value }) => {
      cache.set(key, value);
      const result = cache.get(key);
      expect(result).toEqual(value);
    });
    
    cache.destroy();
  });
});

describe('createCacheKey', () => {
  test('should create consistent keys', () => {
    const { createCacheKey } = require('../../dist/src/services/cache.js');
    
    expect(typeof createCacheKey.packageInfo).toBe('function');
    expect(typeof createCacheKey.packageReadme).toBe('function');
    expect(typeof createCacheKey.searchResults).toBe('function');
    expect(typeof createCacheKey.downloadStats).toBe('function');
  });

  test('should create package info keys', () => {
    const { createCacheKey } = require('../../dist/src/services/cache.js');
    
    const key1 = createCacheKey.packageInfo('symfony/console', 'v6.4.0');
    const key2 = createCacheKey.packageInfo('symfony/console', 'v6.4.0');
    
    expect(key1).toBe(key2);
    expect(typeof key1).toBe('string');
    expect(key1.length).toBeGreaterThan(0);
  });

  test('should create package readme keys', () => {
    const { createCacheKey } = require('../../dist/src/services/cache.js');
    
    const key1 = createCacheKey.packageReadme('symfony/console', 'v6.4.0');
    const key2 = createCacheKey.packageReadme('symfony/console', 'v6.4.0');
    
    expect(key1).toBe(key2);
    expect(typeof key1).toBe('string');
    expect(key1.length).toBeGreaterThan(0);
  });

  test('should create search results keys', () => {
    const { createCacheKey } = require('../../dist/src/services/cache.js');
    
    const key1 = createCacheKey.searchResults('console', 20);
    const key2 = createCacheKey.searchResults('console', 20);
    
    expect(key1).toBe(key2);
    expect(typeof key1).toBe('string');
    expect(key1.length).toBeGreaterThan(0);
  });

  test('should create download stats keys', () => {
    const { createCacheKey } = require('../../dist/src/services/cache.js');
    
    const key1 = createCacheKey.downloadStats('symfony/console');
    const key2 = createCacheKey.downloadStats('symfony/console');
    
    expect(key1).toBe(key2);
    expect(typeof key1).toBe('string');
    expect(key1.length).toBeGreaterThan(0);
  });
});