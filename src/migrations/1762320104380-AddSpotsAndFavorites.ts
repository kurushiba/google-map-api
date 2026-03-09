import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSpotsAndFavorites1762320104380 implements MigrationInterface {
  name = 'AddSpotsAndFavorites1762320104380';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "spot" (
        "id" varchar PRIMARY KEY NOT NULL,
        "name" varchar NOT NULL,
        "category" varchar NOT NULL,
        "latitude" real NOT NULL,
        "longitude" real NOT NULL,
        "description" varchar,
        "image_url" varchar,
        "address" varchar,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        "updatedAt" datetime NOT NULL DEFAULT (datetime('now'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "favorite" (
        "id" varchar PRIMARY KEY NOT NULL,
        "userId" varchar NOT NULL,
        "spotId" varchar NOT NULL,
        "createdAt" datetime NOT NULL DEFAULT (datetime('now')),
        CONSTRAINT "FK_favorite_user" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_favorite_spot" FOREIGN KEY ("spotId") REFERENCES "spot" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_favorite_user_spot" ON "favorite" ("userId", "spotId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_favorite_user_spot"`);
    await queryRunner.query(`DROP TABLE "favorite"`);
    await queryRunner.query(`DROP TABLE "spot"`);
  }
}
