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

export class HashnodeController {
    private readonly contextLogger;

    constructor() {
        this.contextLogger = Logger;
    }

    async postArticlesToBePublished(): Promise<Article[] | void> {
        const postedArticles: Article[] = [];
        const articles = await notionService.getArticlesToBePublished(NOTIONCOLUMNS.TODO);

        if (!articles || articles.length === 0) {
            this.contextLogger.error('No articles found to be published', null, 'json');
            return;
        }

        for (const article of articles) {
            try {
                const articleProperties = notionService.processArticleProperties(article);
                const pageContent = await notionService.getArticlePageContent(article.id);

                if (!pageContent) {
                    this.contextLogger.error(`Failed to fetch article content for ${article.id}`, null, 'json');
                    continue;
                }

                const data: {
                    fileContent: string;
                    title: string;
                    subtitle: string;
                    tags: string[];
                    enableTableOfContent: boolean;
                    coverImageUrl: string
                } = {
                    fileContent: pageContent,
                    title: articleProperties.title,
                    subtitle: articleProperties.subTitle,
                    tags: articleProperties.tags,
                    enableTableOfContent: true,
                    coverImageUrl: articleProperties.cover.url,
                };

                const publishResponse = await notionService.publishBlogPostToHashnode(data);
                if (!publishResponse?.publishPost) {
                    this.contextLogger.error(`Failed to publish article ${article.id}`, null, 'json');
                    continue;
                }

                const { publishPost } = publishResponse;
                console.log(publishPost.post?.tags)
                const notionTags = publishPost.post?.tags?.map((
                    tag: {
                        name: string,
                        slug: string
                    }
                ) => tag.slug) ?? [];

                console.log(notionTags)
                const updateData = {
                    status: NOTIONCOLUMNS.IN_PROGRESS,
                    url: publishPost.post.url,
                    last_published_at: new Date(publishPost.post?.updatedAt || publishPost.post?.publishedAt).toISOString(),
                    readTime: `${publishPost.post.readTimeInMinutes} min read`,
                    slug: publishPost.post.slug,
                    tags: notionTags,
                    first_published_at: new Date(publishPost.post.publishedAt).toISOString(),
                };

                const updateResult = await notionService.updateNotionBlogPorperties(article.id, updateData);
                if (updateResult) {
                    postedArticles.push(updateResult as unknown as Article);
                }
            } catch (error: any) {
                this.contextLogger.error(`Error processing article ${article.id}: ${error.message}`, null, 'json');
            }
        }
        return postedArticles;
    }
}
