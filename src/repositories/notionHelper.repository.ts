import * as fs from 'fs';
import { Client, isFullBlock } from '@notionhq/client';
import { BlockObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export class NotionHelper {
    private readonly rateLimit = 3;
    private readonly delayBetweenRequests = 1000 / this.rateLimit;

    constructor(private readonly notion: Client) { }

    async convertNotionBlocksToMarkdown(pageId: string) {
        const filePath = 'tempArticle.md';
        const blocks = await this.fetchBlocksRecursively(pageId);
        const markdownContent = await this.generateMarkdown(blocks);
        fs.writeFileSync(filePath, markdownContent);

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        // fs.unlinkSync(filePath); // Uncomment if you want to delete the file after reading
        return fileContent;
    }

    private async fetchBlocksRecursively(blockId: string): Promise<BlockObjectResponse[]> {
        const blocks = await this.notion.blocks.children.list({ block_id: blockId });
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

    private async generateMarkdown(blocks: BlockObjectResponse[], depth = 0): Promise<string> {
        const lines: string[] = [];
        for (const block of blocks) {
            const markdown = await this.blockToMarkdown(block, depth);
            lines.push(markdown);
        }
        return lines.join('\n');
    }

    private async blockToMarkdown(block: any, level: number = 0): Promise<string> {
        let markdownContent = "";
        const indentation = " ".repeat(level * 4); // 4 spaces for each level of indentation

        switch (block.type) {
            case "to_do":
                const toDoText = block.to_do.rich_text[0]?.plain_text ?? '';
                markdownContent += `${indentation}- [ ] ${toDoText}\n`;
                break;

            case "bulleted_list_item":
                const bulletText = block.bulleted_list_item.rich_text[0]?.plain_text ?? '';
                markdownContent += `${indentation}- ${bulletText}\n`;
                break;

            case "numbered_list_item":
                const numberText = block.numbered_list_item.rich_text[0]?.plain_text ?? '';
                markdownContent += `${indentation}1. ${numberText}\n`;
                break;

            case "heading_1":
                const heading1Text = block.heading_1.rich_text[0]?.plain_text ?? '';
                markdownContent += `# ${heading1Text}\n`;
                break;

            case "heading_2":
                const heading2Text = block.heading_2.rich_text[0]?.plain_text ?? '';
                markdownContent += `## ${heading2Text}\n`;
                break;

            case "heading_3":
                const heading3Text = block.heading_3.rich_text[0]?.plain_text ?? '';
                markdownContent += `### ${heading3Text}\n`;
                break;

            case "paragraph":
                const paragraphText = block.paragraph.rich_text[0]?.plain_text ?? '';
                markdownContent += `${indentation}${paragraphText}\n`;
                break;

            // Add other block types as necessary
        }

        // Fetch and process children if the block has children
        if (block.has_children) {
            const childBlocks = await this.fetchBlocksRecursively(block.id);
            for (const childBlock of childBlocks) {
                markdownContent += await this.blockToMarkdown(childBlock, level + 1);
            }
        }

        return markdownContent;
    }
}
