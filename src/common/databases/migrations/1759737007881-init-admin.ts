import * as bcrypt from 'bcrypt';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitAdmin1759737007881 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'password';

    const admin = await queryRunner.query(
      `SELECT * FROM "user" WHERE role = 'ADMIN' LIMIT 1`,
    );

    if (admin.length > 0) {
      console.log('Admin account already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    await queryRunner.query(
      `
      INSERT INTO "user" (email, password, name, role, "createdAt", "updatedAt", version)
      VALUES ($1, $2, $3, $4, NOW(), NOW(), 1)
      `,
      [adminEmail, hashedPassword, 'admin', 'admin'],
    );

    console.log('Admin account created successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "user" WHERE role = 'ADMIN'`);
  }
}
