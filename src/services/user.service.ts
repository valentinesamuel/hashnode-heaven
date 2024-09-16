import { Repository } from 'typeorm';
import { PgDataSource } from '../ormconfig';
import { User } from '../entities/user.entity';

export class UserService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = PgDataSource.getRepository(User);
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    const user = this.userRepository.create(userData);
    const newUser = await this.userRepository.save(user);
    if (!newUser) return null;
    return newUser;
  }

  async getUserById(id: number): Promise<Partial<User> | null> {
    return {
      id,
      username: 'bejadu',
      email: 'bejadu@or.la.com',
    };
    // return this.userRepository.findOneBy({ id });
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  async updateUser(
    id: number,
    updateData: Partial<User>,
  ): Promise<User | null> {
    const user = await this.getUserById(id);
    if (!user) return null;

    Object.assign(user, updateData);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await this.userRepository.delete(id);
    return result.affected !== 0;
  }
}
