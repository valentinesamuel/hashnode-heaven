import axios, { AxiosInstance } from 'axios';
import { AppConfig } from '../config/config';
import { CreateDraftInput, CreateDraftPayload, Post, PublishPostInput, PublishPostPayload, RemovePostInput, RemovePostPayload, RestorePostInput, RestorePostPayload, UpdatePostInput, UpdatePostPayload } from '../utils/hashnode.types';
import { PUBLISH_POST } from './queries';
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

    const query = PUBLISH_POST;



    const response = await fetch('https://gql.hashnode.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': '6f9de4a1-28e7-4cba-8523-9cef9fd8a2aa',
      },
      body: JSON.stringify({
        query,
        variables: {
          input
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  };



  // publishPost(input)
  //   .then(data => console.log(data))
  //   .catch (error => console.error('Error processing Notion to Markdown:', error));

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