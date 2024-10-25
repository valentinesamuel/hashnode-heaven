import * as fs from 'fs';
import { Client, isFullBlock } from '@notionhq/client'; 
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export class NotionHelper {
  private readonly rateLimit = 3; // queries per second
  private delayBetweenRequests = 1000 / this.rateLimit; // ms

  constructor(private notion: Client) { }

  async convertNotionBlocksToMarkdown(pageId: string) {
    const filePath = 'tempArticle.md';
    const blocks = await this.fetchBlocksRecursively(pageId);
    const markdownContent = await this.generateMarkdown(blocks);
    fs.writeFileSync(filePath, markdownContent);

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    fs.unlinkSync(filePath);
    return fileContent;
  }

  // Recursively fetch blocks with delay to respect rate limit
  private async fetchBlocksRecursively(blockId: string): Promise<BlockObjectResponse[]> {
    let blocks = await this.notion.blocks.children.list({ block_id: blockId });
    const allBlocks = [...blocks.results];

    // Helper to delay requests
    const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    for (const block of allBlocks) {
      if (isFullBlock(block) && block.has_children) {
        await delay(this.delayBetweenRequests);
        const children = await this.fetchBlocksRecursively(block.id);
        allBlocks.push(...children);
      }
    }
    return allBlocks as BlockObjectResponse[];
  }

  // Generates markdown for nested blocks
  private async generateMarkdown(blocks: BlockObjectResponse[], depth = 0): Promise<string> {
    const lines: string[] = [];
    for (const block of blocks) {
      const markdown = await this.blockToMarkdown(block, depth);
      lines.push(markdown);
    }
    return lines.join('\n');
  }

  // Converts each block to Markdown with recursive structure for nested lists
  private async blockToMarkdown(block: BlockObjectResponse, depth: number = 0): Promise<string> {
    const indentation = '  '.repeat(depth);
    let markdown = '';

    if (isFullBlock(block)) {
      switch (block.type) {
        case 'paragraph':
          markdown += `${indentation}${block.paragraph.rich_text.map((t) => t.plain_text).join('')}\n`;
          break;
        case 'heading_1':
          markdown += `${indentation}# ${block.heading_1.rich_text.map((t) => t.plain_text).join('')}\n`;
          break;
        case 'heading_2':
          markdown += `${indentation}## ${block.heading_2.rich_text.map((t) => t.plain_text).join('')}\n`;
          break;
        case 'heading_3':
          markdown += `${indentation}### ${block.heading_3.rich_text.map((t) => t.plain_text).join('')}\n`;
          break;
        case 'bulleted_list_item':
          markdown += `${indentation}- ${block.bulleted_list_item.rich_text.map((t) => t.plain_text).join('')}\n`;
          break;
        case 'numbered_list_item':
          markdown += `${indentation}1. ${block.numbered_list_item.rich_text.map((t) => t.plain_text).join('')}\n`;
          break;
        case 'code':
          markdown += `${indentation}\`\`\`${block.code.language}\n${block.code.rich_text.map((t) => t.plain_text).join('')}\n\`\`\`\n`;
          break;
        case 'image':
          const imageUrl = block.image.type === 'external' ? block.image.external.url : block.image.file.url;
          markdown += `${indentation}![Image](${imageUrl})\n\n`;
          break;
      }
    }

    return markdown;
  }
}
