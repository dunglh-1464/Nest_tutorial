import { MigrationInterface, QueryRunner } from "typeorm";

export class DropOldTags1790226857949 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable('tags');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
