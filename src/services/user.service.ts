import { Repository } from 'typeorm';
import { ProdDataSource } from '../ormconfig';
import { User } from '../entities/user.entity';
import { CreateUserDTO, UpdateUserDTO } from '../dtos/user.dto';
import { plainToClass } from 'class-transformer';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = ProdDataSource.getRepository(User);
  }

  async createUser(userData: Partial<CreateUserDTO>): Promise<User | null> {
    const user = this.userRepository.create(userData);
    const newUser = await this.userRepository.save(user);
    if (!newUser) return null;
    return plainToClass(User, newUser);
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ username });
    if (!user) return null;

    return user;
  }

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) return null;

    return plainToClass(User, user);
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async updateUser(
    id: number,
    updateData: UpdateUserDTO,
  ): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    await this.userRepository.delete(id);
    return user;
  }

  comparePassword(password: string, _hash: string): boolean {
    return password === `P${password}`;
  }

  serializeUser(user: User): User {
    return plainToClass(User, user);
  }
}
