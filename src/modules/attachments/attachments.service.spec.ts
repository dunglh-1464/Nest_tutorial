import { unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { Repository } from 'typeorm';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AttachmentsService } from './attachments.service.js';
import { AVATAR_UPLOAD_DIRECTORY } from './avatar-upload.options.js';
import { Attachment } from './entity/attachment.entity.js';

vi.mock('node:fs/promises', () => ({
  unlink: vi.fn(),
}));

describe('AttachmentsService', () => {
  const file = {
    filename: 'new-avatar.jpg',
    mimetype: 'image/jpeg',
    size: 1024,
  } as Express.Multer.File;

  let repository: {
    findOneBy: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    merge: ReturnType<typeof vi.fn>;
    save: ReturnType<typeof vi.fn>;
  };
  let service: AttachmentsService;

  beforeEach(() => {
    repository = {
      findOneBy: vi.fn(),
      create: vi.fn((data: Partial<Attachment>) => data as Attachment),
      merge: vi.fn((attachment: Attachment, data: Partial<Attachment>) =>
        Object.assign(attachment, data),
      ),
      save: vi.fn(),
    };

    service = new AttachmentsService(
      repository as unknown as Repository<Attachment>,
    );
    vi.mocked(unlink).mockReset();
  });

  it('creates the first avatar without deleting a file', async () => {
    repository.findOneBy.mockResolvedValue(null);
    repository.save.mockImplementation(
      async (attachment: Attachment) => attachment,
    );

    const result = await service.replaceUserAvatar('user-id', file);

    expect(result.fileName).toBe(file.filename);
    expect(result.url).toBe(`/uploads/avatars/${file.filename}`);
    expect(unlink).not.toHaveBeenCalled();
  });

  it('reuses the attachment and deletes the previous avatar', async () => {
    const currentAttachment = {
      attachableType: 'user',
      attachableId: 'user-id',
      fileName: 'old-avatar.jpg',
    } as Attachment;

    repository.findOneBy.mockResolvedValue(currentAttachment);
    repository.save.mockImplementation(
      async (attachment: Attachment) => attachment,
    );

    const result = await service.replaceUserAvatar('user-id', file);

    expect(repository.create).not.toHaveBeenCalled();
    expect(result.fileName).toBe(file.filename);
    expect(unlink).toHaveBeenCalledWith(
      join(AVATAR_UPLOAD_DIRECTORY, 'old-avatar.jpg'),
    );
  });

  it('deletes the new file when saving the attachment fails', async () => {
    const databaseError = new Error('database failed');

    repository.findOneBy.mockResolvedValue(null);
    repository.save.mockRejectedValue(databaseError);

    await expect(service.replaceUserAvatar('user-id', file)).rejects.toBe(
      databaseError,
    );
    expect(unlink).toHaveBeenCalledWith(
      join(AVATAR_UPLOAD_DIRECTORY, file.filename),
    );
  });
});
