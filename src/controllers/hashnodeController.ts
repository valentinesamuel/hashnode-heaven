import { Request, Response } from "express";
import { NotionService } from "../services/notionService";
import { NotionHelper } from "../utils/helper";
import Logger from "../logger/logger";

export type Article = {
    articleId: string;
    status: string;
    lastPublishedAt: string;
    firstPublishedAt: string;
    readTime: string;
    slug: string;
    tags: string[];
    url: string;
    featured: string;
    hashnodeId: string;
    featuredAt: string;
    deletedAt: string;
    createdAt: string;
    lastEditedAt: string;
    cover: {
        expiryTime: string;
        url: string;
    };
    title: string;
    isDeleted: string;
};
enum NOTIONCOLUMNS {
    TODO = '☘️ To Do',
    IN_PROGRESS = '⚒️ In Progress',
    VETTING = '🔍 Vetting',
    CLEAN_UP = '🧼 Cleanup',
    TO_BE_PUBLISHED = '📬 To Be Published',
    STAGING = '🏭 Staging',
    LIVE = '🎉 Live',
    TO_UPDATE = '♻️ To Update',
    REVAMPED = '🌟 Revamped',
    TRASH = '🗑️ Trash',
}

const notionService = new NotionService();
const notionHelper = new NotionHelper();

export class HashnodeController {
    private readonly contextLogger;
    constructor(
    ) {
        this.contextLogger = Logger;
    }

    async postArticlesToBePublished(req: Request, res: Response) {
        const articles = await notionService.getArticlesToBePublished('☘️ To Do');

        if (!articles) {
            this.contextLogger.error('No articles found to be published', null, 'json');
            return;
        }
        
        for (const article of articles) {
            const articleProperties = notionHelper.processArticleProperties(article);
            const pageContent = await notionService.getArticleById(article.id);
            const data = {
                fileContent: pageContent,
                title: articleProperties.title,
                subtitle: articleProperties.subTitle,
                tags: articleProperties.tags,
                enableTableOfContent: true,
                coverImageUrl: "http://127.0.0.1:54321/storage/v1/object/public/testbucket/azureLogo.jpeg",
            };
            const { publishPost } = (await notionService.publishBlogPostToHashnode(data))

            let notionTags = []

            for (const tag of publishPost.post?.tags ?? []) {
                notionTags.push(tag.slug)
            }

            await notionService.updateNotionBlogPorperties(article.id, {
                status: NOTIONCOLUMNS.IN_PROGRESS,
                url: publishPost.post?.url as string,
                last_published_at: new Date(publishPost.post?.updatedAt || publishPost.post?.publishedAt).toISOString(),
                readTime: `${publishPost.post?.readTimeInMinutes} min read`,
                slug: publishPost.post?.slug as string,
                tags: notionTags,
                first_published_at: new Date(publishPost.post?.publishedAt).toISOString(),
            });
        }
    }
}