import axios, { AxiosError } from "axios";
import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { AppConfig } from "../config/config";

export class SupabaseStorage {
    private readonly supabase;
    private readonly bucketName: string;
    private readonly tempDir: string;

    constructor(tempDir: string = './temp') {
        this.supabase = createClient(AppConfig.SUPABASE_URL, AppConfig.SUPABASE_ANON_KEY);
        this.bucketName = AppConfig.SUPABASE_BUCKET_NAME;
        this.tempDir = tempDir;
        this.ensureTempDirExists();
    }

    private ensureTempDirExists(): void {
        if (!fs.existsSync(this.tempDir)) {
            fs.mkdirSync(this.tempDir, { recursive: true });
        }
    }

    private async downloadImage(imageUrl: string, filePath: string): Promise<{ contentType: string }> {
        try {
            const response = await axios({
                method: 'get',
                url: imageUrl,
                responseType: 'arraybuffer',
                headers: {
                    'Accept': 'image/*',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                maxRedirects: 5,
                validateStatus: (status) => status < 400
            });

            // Check if we received image data
            const contentType = response.headers['content-type'];
            if (!contentType?.startsWith('image/')) {
                throw new Error(`Invalid content type received: ${contentType}`);
            }

            await fs.promises.writeFile(filePath, Buffer.from(response.data));
            return { contentType };
        } catch (error: any) {
            if (error instanceof AxiosError) {
                const status = error.response?.status;
                const responseData = error.response?.data;
                throw new Error(`Failed to download image (Status ${status}): ${error.message}\nResponse: ${responseData}`);
            }
            throw new Error(`Failed to download image: ${error.message}`);
        }
    }

    /**
     * Downloads an image from a URL and uploads it to Supabase Storage
     * @param imageUrl - The URL of the image (supports s3, unsplash, notion, hashnode, etc.)
     * @param fileName - The desired filename in Supabase storage
     * @returns Object containing the uploaded file path and public URL
     */
    async processImage(imageUrl: string, fileName: string): Promise<{
        path: string;
        publicUrl: string;
    }> {
        const filePath = path.join(this.tempDir, fileName);

        try {
            // Validate URL
            const url = new URL(imageUrl);
            if (!url.protocol.startsWith('http')) {
                throw new Error('Invalid URL protocol. Must be HTTP or HTTPS.');
            }

            // Download the image
            const { contentType } = await this.downloadImage(imageUrl, filePath);

            // Verify file exists and has content
            const stats = await fs.promises.stat(filePath);
            if (stats.size === 0) {
                throw new Error('Downloaded file is empty');
            }

            // Read file as buffer
            const fileBuffer = await fs.promises.readFile(filePath);

            // Upload to Supabase
            const { data, error } = await this.supabase
                .storage
                .from(this.bucketName)
                .upload(fileName, fileBuffer, {
                    contentType,
                    upsert: true
                });

            if (error) {
                throw new Error(`Supabase upload error: ${error.message}`);
            }

            if (!data?.path) {
                throw new Error('Upload successful but path is missing');
            }

            // Get public URL
            const { data: urlData } = this.supabase
                .storage
                .from(this.bucketName)
                .getPublicUrl(data.path);

            if (!data) {
                throw new Error(`Failed to get public URL`);
            }

            return {
                path: data.path,
                publicUrl: urlData.publicUrl
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to process image: ${error.message}`);
            }
            throw new Error('Failed to process image: Unknown error occurred');
        } finally {
            // Cleanup: Remove temporary file
            try {
                if (fs.existsSync(filePath)) {
                    await fs.promises.unlink(filePath);
                }
            } catch (cleanupError) {
                console.error('Failed to cleanup temporary file:', cleanupError);
            }
        }
    }

    /**
     * Gets the public URL for a file in Supabase storage
     */
    getPublicUrl(fileName: string): string {
        const { data } = this.supabase
            .storage
            .from(this.bucketName)
            .getPublicUrl(fileName);

        if (!data) {
            throw new Error(`Failed to get public URL`);
        }

        return data.publicUrl;
    }

    /**
     * Deletes a file from Supabase storage
     */
    async deleteFile(fileName: string): Promise<void> {
        const { error } = await this.supabase
            .storage
            .from(this.bucketName)
            .remove([fileName]);

        if (error) {
            throw new Error(`Failed to delete file: ${error.message}`);
        }
    }
}