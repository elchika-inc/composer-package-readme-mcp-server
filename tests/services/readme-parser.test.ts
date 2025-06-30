import { expect, test, describe } from "vitest";

describe('ReadmeParser', () => {
  test('should exist and be constructable', () => {
    const { ReadmeParser } = require('../../dist/src/services/readme-parser.js');
    expect(typeof ReadmeParser).toBe('function');
    
    const parser = new ReadmeParser();
    expect(parser).toBeDefined();
  });

  test('should have required methods', () => {
    const { ReadmeParser } = require('../../dist/src/services/readme-parser.js');
    const parser = new ReadmeParser();
    
    expect(typeof parser.parseUsageExamples).toBe('function');
    expect(typeof parser.cleanMarkdown).toBe('function');
    expect(typeof parser.extractDescription).toBe('function');
  });

  test('should parse usage examples from markdown', () => {
    const { ReadmeParser } = require('../../dist/src/services/readme-parser.js');
    const parser = new ReadmeParser();
    
    const markdown = `# Test Package

## Usage

\`\`\`php
<?php
use Test\\Package;
$package = new Package();
\`\`\`
`;

    const examples = parser.parseUsageExamples(markdown, true);
    expect(Array.isArray(examples)).toBe(true);
  });

  test('should return empty array when includeExamples is false', () => {
    const { ReadmeParser } = require('../../dist/src/services/readme-parser.js');
    const parser = new ReadmeParser();
    
    const markdown = `# Test Package

## Usage

\`\`\`php
<?php echo "test";
\`\`\`
`;

    const examples = parser.parseUsageExamples(markdown, false);
    expect(examples).toEqual([]);
  });

  test('should clean markdown content', () => {
    const { ReadmeParser } = require('../../dist/src/services/readme-parser.js');
    const parser = new ReadmeParser();
    
    const markdown = `# Test

![Build Status](https://example.com/badge.svg)

Some content.`;

    const cleaned = parser.cleanMarkdown(markdown);
    expect(typeof cleaned).toBe('string');
    expect(cleaned).toContain('Test');
    expect(cleaned).toContain('Some content');
  });

  test('should extract description from markdown', () => {
    const { ReadmeParser } = require('../../dist/src/services/readme-parser.js');
    const parser = new ReadmeParser();
    
    const markdown = `# Test Package

This is a comprehensive package for testing purposes.

## Installation

Run composer install.`;

    const description = parser.extractDescription(markdown);
    expect(typeof description).toBe('string');
    expect(description.length).toBeGreaterThan(0);
  });
});