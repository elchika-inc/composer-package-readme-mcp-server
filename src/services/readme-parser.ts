import { logger } from '../utils/logger.js';
import { UsageExample } from '../types/index.js';
import { VALIDATION_CONSTANTS, SUPPORTED_LANGUAGES } from '../utils/constants.js';

export class ReadmeParser {
  private static readonly USAGE_SECTION_PATTERNS = [
    /^#{1,6}\s*(usage|use|using|how to use|getting started|quick start|examples?|basic usage|installation|quickstart)\s*$/gim,
    /^usage:?\s*$/gim,
    /^examples?:?\s*$/gim,
    /^installation:?\s*$/gim,
  ];

  private static readonly CODE_BLOCK_PATTERN = /```(\w+)?\n([\s\S]*?)```/g;
  
  // Pre-compiled regex patterns for better performance
  private static readonly CODE_INDICATORS = [
    /^\s*[{}[\]();,]/, // Starts with common code characters
    /[{}[\]();,]\s*$/, // Ends with common code characters
    /^\s*(const|let|var|function|class|import|export|require)\s+/, // JS keywords
    /^\s*<\?php/, // PHP opening tag
    /^\s*\$/, // Shell prompt or PHP variable
    /^\s*\/\//, // Comments
    /^\s*#/, // Comments or shell
    /^\s*\/\*/, // Block comments
  ];

  parseUsageExamples(readmeContent: string, includeExamples: boolean = true): UsageExample[] {
    if (!includeExamples || !readmeContent) {
      return [];
    }

    try {
      const examples: UsageExample[] = [];
      const sections = this.extractUsageSections(readmeContent);

      for (const section of sections) {
        const sectionExamples = this.extractCodeBlocksFromSection(section);
        examples.push(...sectionExamples);
      }

      // Deduplicate examples based on code content
      const uniqueExamples = this.deduplicateExamples(examples);
      
      // Limit to reasonable number
      const limitedExamples = uniqueExamples.slice(0, VALIDATION_CONSTANTS.MAX_USAGE_EXAMPLES);

      logger.debug(`Extracted ${limitedExamples.length} usage examples from README`);
      return limitedExamples;
    } catch (error) {
      logger.warn('Failed to parse usage examples from README', { error });
      return [];
    }
  }

  private extractUsageSections(content: string): string[] {
    const sections: string[] = [];
    const lines = content.split('\n');
    let currentSection: string[] = [];
    let inUsageSection = false;
    let sectionLevel = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line === undefined) continue;
      const isHeader = /^#{1,6}\s/.test(line);
      
      if (isHeader) {
        const headerMatch = line.match(/^#+/);
        if (!headerMatch) continue;
        const level = headerMatch[0].length;
        const isUsageHeader = this.isUsageHeader(line);

        if (isUsageHeader) {
          // Start new usage section
          if (currentSection.length > 0) {
            sections.push(currentSection.join('\n'));
          }
          currentSection = [line];
          inUsageSection = true;
          sectionLevel = level;
        } else if (inUsageSection && level <= sectionLevel) {
          // End of current usage section
          if (currentSection.length > 0) {
            sections.push(currentSection.join('\n'));
          }
          currentSection = [];
          inUsageSection = false;
        } else if (inUsageSection) {
          currentSection.push(line);
        }
      } else if (inUsageSection) {
        currentSection.push(line);
      }
    }

    // Add final section if exists
    if (currentSection.length > 0) {
      sections.push(currentSection.join('\n'));
    }

    return sections;
  }

  private isUsageHeader(line: string): boolean {
    return ReadmeParser.USAGE_SECTION_PATTERNS.some(pattern => {
      pattern.lastIndex = 0; // Reset regex state
      return pattern.test(line);
    });
  }

  private extractCodeBlocksFromSection(section: string): UsageExample[] {
    const examples: UsageExample[] = [];
    const codeBlockRegex = new RegExp(ReadmeParser.CODE_BLOCK_PATTERN.source, 'g');
    let match;

    while ((match = codeBlockRegex.exec(section)) !== null) {
      const [, language = 'text', code] = match;
      if (!code) continue;
      const cleanCode = code.trim();
      
      if (cleanCode.length === 0) {
        continue;
      }

      // Determine the type of example based on language and content
      const title = this.generateExampleTitle(cleanCode, language);
      const description = this.extractExampleDescription(section, match.index);

      examples.push({
        title,
        description: description || undefined,
        code: cleanCode,
        language: this.normalizeLanguage(language),
      });
    }

    return examples;
  }

  private generateExampleTitle(code: string, language: string): string {
    // Try to infer title from code content
    const lines = code.split('\n');
    if (lines.length === 0) return 'Code Example';
    const firstLine = lines[0]?.trim() || '';
    
    if (language === 'bash' || language === 'shell' || language === 'sh') {
      if (firstLine.includes('composer require') || firstLine.includes('composer install')) {
        return 'Installation';
      }
      return 'Command Line Usage';
    }

    if (language === 'php') {
      if (firstLine.includes('require') || firstLine.includes('include') || firstLine.includes('use ')) {
        return 'Basic Usage';
      }
      if (code.includes('$') && code.includes('=')) {
        return 'Basic Example';
      }
      return 'PHP Example';
    }

    if (language === 'javascript' || language === 'js') {
      if (firstLine.includes('require(') || firstLine.includes('import ')) {
        return 'Basic Usage';
      }
      return 'JavaScript Example';
    }

    if (language === 'json') {
      if (code.includes('"require"') || code.includes('"require-dev"')) {
        return 'Composer Configuration';
      }
      return 'Configuration';
    }

    if (language === 'yaml' || language === 'yml') {
      return 'Configuration';
    }

    if (language === 'xml') {
      return 'XML Configuration';
    }

    return 'Code Example';
  }

  private extractExampleDescription(section: string, codeBlockIndex: number): string | undefined {
    // Look for text before the code block that might be a description
    const beforeCodeBlock = section.substring(0, codeBlockIndex);
    const lines = beforeCodeBlock.split('\n').reverse();
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.length === 0 || trimmed.startsWith('#')) {
        continue;
      }
      
      // If it's a reasonable length and doesn't look like code, use it as description
      if (trimmed.length > VALIDATION_CONSTANTS.MIN_DESCRIPTION_LENGTH && trimmed.length < VALIDATION_CONSTANTS.MAX_DESCRIPTION_LENGTH && !this.looksLikeCode(trimmed)) {
        return trimmed.replace(/^[*-]\s*/, ''); // Remove bullet points
      }
      
      break; // Stop at first non-empty line
    }

    return undefined;
  }

  private looksLikeCode(text: string): boolean {
    // Use pre-compiled patterns for better performance
    return ReadmeParser.CODE_INDICATORS.some(pattern => pattern.test(text));
  }

  private normalizeLanguage(language: string): string {
    const normalized = language.toLowerCase();
    return SUPPORTED_LANGUAGES[normalized as keyof typeof SUPPORTED_LANGUAGES] || normalized;
  }

  private deduplicateExamples(examples: UsageExample[]): UsageExample[] {
    const seen = new Set<string>();
    const unique: UsageExample[] = [];

    for (const example of examples) {
      // Create a hash of the code content (normalize whitespace)
      const codeHash = example.code.replace(/\s+/g, ' ').trim();
      
      if (!seen.has(codeHash)) {
        seen.add(codeHash);
        unique.push(example);
      }
    }

    return unique;
  }

  cleanMarkdown(content: string): string {
    try {
      // Remove or replace common markdown elements that don't translate well
      let cleaned = content;

      // Remove badges (but keep the alt text if meaningful)
      cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, (_match, altText) => {
        return altText && altText.length > 3 ? altText : '';
      });

      // Convert relative links to absolute GitHub links (if we can detect the repo)
      // This is a simplified version - in practice, you'd want to pass repository info
      cleaned = cleaned.replace(/\[([^\]]+)\]\((?!https?:\/\/)([^)]+)\)/g, '$1');

      // Clean up excessive whitespace
      cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
      cleaned = cleaned.trim();

      return cleaned;
    } catch (error) {
      logger.warn('Failed to clean markdown content', { error });
      return content;
    }
  }

  extractDescription(content: string): string {
    try {
      // Look for the first substantial paragraph after any title
      const lines = content.split('\n');
      let foundDescription = false;
      let description = '';

      for (const line of lines) {
        const trimmed = line.trim();
        
        // Skip empty lines and headers
        if (trimmed.length === 0 || trimmed.startsWith('#')) {
          if (foundDescription && description.length > 0) {
            break; // Stop at next section
          }
          continue;
        }

        // Skip badges and images
        if (trimmed.startsWith('![') || trimmed.startsWith('[![')) {
          continue;
        }

        // This looks like a description
        if (trimmed.length > 20) {
          if (!foundDescription) {
            description = trimmed;
            foundDescription = true;
          } else {
            // Add continuation if it's part of the same paragraph
            if (description.length + trimmed.length < 300) {
              description += ' ' + trimmed;
            } else {
              break;
            }
          }
        }
      }

      return description || 'No description available';
    } catch (error) {
      logger.warn('Failed to extract description from README', { error });
      return 'No description available';
    }
  }
}

export const readmeParser = new ReadmeParser();