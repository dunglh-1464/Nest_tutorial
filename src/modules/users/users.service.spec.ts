import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { User } from './entities/user.entity.js';
import { UpdateUserData, UsersService } from './users.service.js';

describe('UsersService', () => {
  let repository: {
    findOneBy: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let service: UsersService;

  beforeEach(() => {
    repository = {
      findOneBy: vi.fn(),
      save: vi.fn((user: User) => Promise.resolve(user)),
    };

    service = new UsersService(repository as unknown as Repository<User>);
  });

  it('does not overwrite existing fields with undefined values', async () => {
    const user = {
      id: 'user-id',
      username: 'jake',
      email: 'jake@example.com',
      passwordHash: 'hash',
      bio: undefined,
      image: undefined,
    } as User;
    const data: UpdateUserData = {
      username: undefined,
      email: undefined,
      bio: 'Updated bio',
      image: '/uploads/avatars/new-avatar.jpg',
    };

    repository.findOneBy.mockResolvedValue(user);

    const result = await service.update(user.id, data);

    expect(result).toMatchObject({
      username: 'jake',
      email: 'jake@example.com',
      bio: 'Updated bio',
      image: '/uploads/avatars/new-avatar.jpg',
    });
  });

  it('updates a field when a defined value is provided', async () => {
    const user = {
      id: 'user-id',
      username: 'jake',
      email: 'jake@example.com',
      passwordHash: 'hash',
    } as User;

    repository.findOneBy.mockResolvedValue(user);

    const result = await service.update(user.id, {
      email: 'new@example.com',
    });

    expect(result?.email).toBe('new@example.com');
  });
});
