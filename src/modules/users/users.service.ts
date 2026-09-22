import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity.js';

export type CreateUserData = Pick<User, 'username' | 'email' | 'passwordHash'>;

export type UpdateUserData = Partial<
  Pick<User, 'username' | 'email' | 'passwordHash' | 'bio' | 'image'>
>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(data: CreateUserData): Promise<User> {
    const user = this.usersRepository.create(data);
    return this.usersRepository.save(user);
  }

  async findByUserName(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  async findByUserId(userId: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: userId });
  }

  async update(userId: string, data: UpdateUserData): Promise<User | null> {
    const user = await this.findByUserId(userId);

    if (!user) {
      return null;
    }

    const definedData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    ) as UpdateUserData;

    Object.assign(user, definedData);

    return this.usersRepository.save(user);
  }
}
