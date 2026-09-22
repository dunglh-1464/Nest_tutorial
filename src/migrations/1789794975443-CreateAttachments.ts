import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAttachments1789794975443 implements MigrationInterface {
    name = 'CreateAttachments1789794975443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "attachable_type" character varying NOT NULL, "attachable_id" uuid NOT NULL, "url" character varying NOT NULL, "file_name" character varying NOT NULL, "file_type" character varying NOT NULL, "file_size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_418b716a9043b7a66cfa8d22db" ON "attachments"  ("attachable_type", "attachable_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_418b716a9043b7a66cfa8d22db"`);
        await queryRunner.query(`DROP TABLE "attachments"`);
    }

}
