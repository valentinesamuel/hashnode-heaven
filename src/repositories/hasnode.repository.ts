import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '../config/config';
import {
  CreateDraftInput,
  CreateDraftPayload,
  Post,
  PublishPostInput,
  PublishPostPayload,
  RemovePostInput,
  RemovePostPayload,
  RestorePostInput,
  RestorePostPayload,
  UpdatePostInput,
  UpdatePostPayload,
} from '../utils/hashnode.types';
import { PUBLISH_POST } from './queries';
import { callHashnodeAPI } from '../utils/fetch';
import { HashnodeInterface } from './interfaces/hashnode.interface';

export class HashnodeRepository implements HashnodeInterface {
  private readonly hashnodeInstance: AxiosInstance;
  constructor() {
    this.hashnodeInstance = axios.create({
      baseURL: 'https://gql.hashnode.com',
      headers: {
        Authorization: `${AppConfig.hashnodeToken}`,
      },
    });
  }

  async publishPost(input: PublishPostInput): Promise<PublishPostPayload> {
    const response: {
      data?: PublishPostPayload;
      errors: {
        message: string;
      }[];
    } = await callHashnodeAPI(PUBLISH_POST, input);
    if (!response.data) {
      for (const error of response.errors) {
        console.error(error.message);
      }
      throw new Error(`Error publishing post to Hashnode ${response}`);
    }

    return response.data as PublishPostPayload;
  }

  async updatePost(input: UpdatePostInput): Promise<UpdatePostPayload> {
    throw new Error('Method not implemented.');
  }

  async deletePost(input: RemovePostInput): Promise<RemovePostPayload> {
    throw new Error('Method not implemented.');
  }

  async restorePost(input: RestorePostInput): Promise<RestorePostPayload> {
    throw new Error('Method not implemented.');
  }

  async createDraftPost(input: CreateDraftInput): Promise<CreateDraftPayload> {
    throw new Error('Method not implemented.');
  }

  async publishDraftPost(input: PublishPostInput): Promise<PublishPostPayload> {
    throw new Error('Method not implemented.');
  }

  async getPostById(id: string): Promise<Post> {
    throw new Error('Method not implemented.');
  }
}
