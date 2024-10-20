import { CreateDraftInput, CreateDraftPayload, Post, PublishPostInput, PublishPostPayload, RemovePostInput, RemovePostPayload, RestorePostInput, RestorePostPayload, UpdatePostInput, UpdatePostPayload } from "../../utils/hashnode.types";

export interface HashnodeInterface {
    publishPost(input: PublishPostInput): Promise<PublishPostPayload>;

    updatePost(input: UpdatePostInput): Promise<UpdatePostPayload>

    deletePost(input: RemovePostInput): Promise<RemovePostPayload>

    restorePost(input: RestorePostInput): Promise<RestorePostPayload>

    createDraftPost(input: CreateDraftInput): Promise<CreateDraftPayload>

    publishDraftPost(input: PublishPostInput): Promise<PublishPostPayload>

    getPostById(id: string): Promise<Post>

}
