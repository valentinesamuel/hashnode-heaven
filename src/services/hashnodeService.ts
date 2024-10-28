import { HashnodeRepository } from "../repositories/hasnode.repository";
import { HashnodeInterface } from "../repositories/interfaces/hashnode.interface";

import { PublishPostInput, PublishPostPayload } from "../utils/hashnode.types";

export class HashnodeService {
    private readonly hashnodeRepository: HashnodeInterface;

    constructor() {
        this.hashnodeRepository = new HashnodeRepository();
    }

    async publishPost(input: PublishPostInput): Promise<PublishPostPayload> {
        return await this.hashnodeRepository.publishPost(input);
    }
}
