import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'node:fs/promises';
import { basename, join } from 'node:path';
import { Repository } from 'typeorm';
import { AVATAR_UPLOAD_DIRECTORY } from './avatar-upload.options.js';
import { Attachment } from './entity/attachment.entity.js';
import { ENOENT } from './attachment.constant.js';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    @InjectRepository(Attachment)
    private readonly repository: Repository<Attachment>,
  ) {}

  async replaceUserAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<Attachment> {
    const currentAttachment = await this.repository.findOneBy({
      attachableType: 'user',
      attachableId: userId,
    });

    const previousFileName = currentAttachment?.fileName;
    const attachment =
      currentAttachment ??
      this.repository.create({
        attachableType: 'user',
        attachableId: userId,
      });

    this.repository.merge(attachment, {
      url: `/uploads/avatars/${file.filename}`,
      fileName: file.filename,
      fileType: file.mimetype,
      fileSize: file.size,
    });

    let savedAttachment: Attachment;

    try {
      savedAttachment = await this.repository.save(attachment);
    } catch (error) {
      await this.deleteFile(file.filename);
      throw error;
    }

    if (previousFileName && previousFileName !== file.filename) {
      await this.deleteFile(previousFileName);
    }

    return savedAttachment;
  }

  private async deleteFile(fileName: string): Promise<void> {
    try {
      await unlink(join(AVATAR_UPLOAD_DIRECTORY, basename(fileName)));
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;

      if (code !== ENOENT) {
        this.logger.warn(`Failed to delete avatar file: ${fileName}`);
      }
    }
  }
}
