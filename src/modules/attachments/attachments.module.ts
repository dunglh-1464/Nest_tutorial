import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from './entity/attachment.entity.js';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  providers: [AttachmentsService],
  exports: [AttachmentsService],
})
export class AttachmentsModule {}
