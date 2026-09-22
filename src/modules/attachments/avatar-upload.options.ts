import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { diskStorage } from 'multer';
import { I18nContext } from 'nestjs-i18n';

export const AVATAR_UPLOAD_DIRECTORY = join(
  process.cwd(),
  'public',
  'uploads',
  'avatars',
);

mkdirSync(AVATAR_UPLOAD_DIRECTORY, { recursive: true });

const extensions: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
};

export const avatarUploadOptions = {
  storage: diskStorage({
    destination: AVATAR_UPLOAD_DIRECTORY,
    filename: (_request, file, callback) => {
      console.log(`file_name__${file.mimetype}`);
      const extension = extensions[file.mimetype];

      callback(null, `${randomUUID()}${extension}`);
    },
  }),

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (
    _request: unknown,
    file: Express.Multer.File,
    callback: (error: Error | null, acceptFile: boolean) => void,
  ) => {
    if (!extensions[file.mimetype]) {
      callback(
        new BadRequestException(
          I18nContext.current()?.t('validation.INVALID_IMAGE_TYPE'),
        ),
        false,
      );
      return;
    }

    callback(null, true);
  },
};
