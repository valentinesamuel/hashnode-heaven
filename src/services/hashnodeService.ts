import { HashnodeRepository } from "../repositories/hasnode.repository";
import { HashnodeInterface } from "../repositories/interfaces/hashnode.interface";

export class HashnodeService {
    private readonly hashnodeRepository: HashnodeInterface;

    constructor() {
        this.hashnodeRepository = new HashnodeRepository();
    }
}
