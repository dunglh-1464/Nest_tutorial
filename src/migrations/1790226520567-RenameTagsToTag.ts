import { MigrationInterface, QueryRunner } from "typeorm";

export class RenameTagsToTag1790226520567 implements MigrationInterface {
    name = 'RenameTagsToTag1790226520567'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "attachable_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" ADD "attachable_id" uuid NOT NULL`);
    }

}
