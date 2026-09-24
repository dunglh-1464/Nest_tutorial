import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateArticleFavorites1790324412465 implements MigrationInterface {
    name = 'CreateArticleFavorites1790324412465'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "article_favorites" ("article_id" uuid NOT NULL, "user_id" uuid NOT NULL, CONSTRAINT "PK_31af347dc5116ca4092699a9c83" PRIMARY KEY ("article_id", "user_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_19fa0bc90b91678cc4d30e3737" ON "article_favorites"  ("article_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_8d1bc602f86930d0b609972221" ON "article_favorites"  ("user_id") `);
        await queryRunner.query(`ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_19fa0bc90b91678cc4d30e37375" FOREIGN KEY ("article_id") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "article_favorites" ADD CONSTRAINT "FK_8d1bc602f86930d0b609972221a" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_8d1bc602f86930d0b609972221a"`);
        await queryRunner.query(`ALTER TABLE "article_favorites" DROP CONSTRAINT "FK_19fa0bc90b91678cc4d30e37375"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8d1bc602f86930d0b609972221"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_19fa0bc90b91678cc4d30e3737"`);
        await queryRunner.query(`DROP TABLE "article_favorites"`);
    }

}
