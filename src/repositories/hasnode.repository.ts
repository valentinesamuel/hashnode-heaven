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
import { HashnodeInterface } from './interfaces/hashnode.interface';
import { callHashnodeAPI } from '../utils/fetch';

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
    const response = await callHashnodeAPI(PUBLISH_POST, input);

    return response.data;
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
