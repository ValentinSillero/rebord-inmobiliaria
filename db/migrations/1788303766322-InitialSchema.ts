import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1788303766322 implements MigrationInterface {
  name = 'InitialSchema1788303766322';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."property_type_enum" AS ENUM ('house', 'apartment', 'duplex', 'land', 'commercial', 'warehouse', 'office', 'field', 'other')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."property_operation_enum" AS ENUM ('sale', 'rent', 'temporary_rent')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."property_status_enum" AS ENUM ('available', 'reserved', 'sold', 'rented', 'inactive')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."property_currency_enum" AS ENUM ('ARS', 'USD')`,
    );

    await queryRunner.query(`
      CREATE TABLE "admins" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" varchar(150) NOT NULL,
        "email" varchar(320) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_admins_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_admins_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "properties" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "title" varchar(200) NOT NULL,
        "slug" varchar(220) NOT NULL,
        "description" text,
        "property_type" "public"."property_type_enum" NOT NULL,
        "operation" "public"."property_operation_enum" NOT NULL,
        "status" "public"."property_status_enum" NOT NULL DEFAULT 'available',
        "price" numeric(15,2) NOT NULL,
        "currency" "public"."property_currency_enum" NOT NULL,
        "address" varchar(255),
        "city" varchar(120) NOT NULL,
        "province" varchar(120) NOT NULL,
        "postal_code" varchar(20),
        "latitude" numeric(10,7),
        "longitude" numeric(10,7),
        "hide_exact_address" boolean NOT NULL DEFAULT false,
        "rooms" integer,
        "bedrooms" integer,
        "bathrooms" integer,
        "garage" integer,
        "total_area" numeric(12,2),
        "covered_area" numeric(12,2),
        "featured" boolean NOT NULL DEFAULT false,
        "published" boolean NOT NULL DEFAULT false,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "updated_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_properties_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_properties_slug" UNIQUE ("slug"),
        CONSTRAINT "CHK_properties_price_nonnegative" CHECK ("price" >= 0),
        CONSTRAINT "CHK_properties_latitude_range" CHECK ("latitude" IS NULL OR "latitude" BETWEEN -90 AND 90),
        CONSTRAINT "CHK_properties_longitude_range" CHECK ("longitude" IS NULL OR "longitude" BETWEEN -180 AND 180),
        CONSTRAINT "CHK_properties_counts_nonnegative" CHECK (("rooms" IS NULL OR "rooms" >= 0) AND ("bedrooms" IS NULL OR "bedrooms" >= 0) AND ("bathrooms" IS NULL OR "bathrooms" >= 0) AND ("garage" IS NULL OR "garage" >= 0)),
        CONSTRAINT "CHK_properties_areas_nonnegative" CHECK (("total_area" IS NULL OR "total_area" >= 0) AND ("covered_area" IS NULL OR "covered_area" >= 0))
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_properties_operation" ON "properties" ("operation")`);
    await queryRunner.query(`CREATE INDEX "IDX_properties_status" ON "properties" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_properties_city" ON "properties" ("city")`);
    await queryRunner.query(
      `CREATE INDEX "IDX_properties_featured_true" ON "properties" ("featured") WHERE "featured" = true`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_properties_published_true" ON "properties" ("published") WHERE "published" = true`,
    );

    await queryRunner.query(`
      CREATE TABLE "property_images" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "property_id" uuid NOT NULL,
        "secure_url" varchar(2048) NOT NULL,
        "public_id" varchar(255) NOT NULL,
        "position" integer NOT NULL DEFAULT 0,
        "is_cover" boolean NOT NULL DEFAULT false,
        "alt_text" varchar(255),
        "width" integer,
        "height" integer,
        "format" varchar(32),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_property_images_id" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_property_images_position_nonnegative" CHECK ("position" >= 0),
        CONSTRAINT "CHK_property_images_dimensions_positive" CHECK (("width" IS NULL OR "width" > 0) AND ("height" IS NULL OR "height" > 0)),
        CONSTRAINT "FK_property_images_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_property_images_property_position" ON "property_images" ("property_id", "position")`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_property_images_one_cover_per_property" ON "property_images" ("property_id") WHERE "is_cover" = true`,
    );

    await queryRunner.query(`
      CREATE TABLE "property_features" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "property_id" uuid NOT NULL,
        "feature" varchar(100) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "PK_property_features_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_property_features_property" FOREIGN KEY ("property_id") REFERENCES "properties"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_property_features_property_feature" ON "property_features" ("property_id", "feature")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "property_features"`);
    await queryRunner.query(`DROP TABLE "property_images"`);
    await queryRunner.query(`DROP TABLE "properties"`);
    await queryRunner.query(`DROP TABLE "admins"`);
    await queryRunner.query(`DROP TYPE "public"."property_currency_enum"`);
    await queryRunner.query(`DROP TYPE "public"."property_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."property_operation_enum"`);
    await queryRunner.query(`DROP TYPE "public"."property_type_enum"`);
  }
}
