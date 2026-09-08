import 'reflect-metadata';
import { resolve } from 'node:path';
import { config } from 'dotenv';

config({ path: resolve(process.cwd(), '.env.local'), quiet: true });

const expectedTables = ['admins', 'properties', 'property_features', 'property_images'] as const;

async function main() {
  const command = process.argv[2];

  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL no está configurada en .env.local.');
  }

  const { AppDataSource } = await import('../db/data-source');
  const dataSource = await AppDataSource.initialize();

  try {
    switch (command) {
      case 'migration:run': {
        const migrations = await dataSource.runMigrations({ transaction: 'all' });
        if (migrations.length === 0) {
          console.log('No había migraciones pendientes.');
        } else {
          console.log(`Migraciones ejecutadas: ${migrations.map((migration) => migration.name).join(', ')}`);
        }
        break;
      }
      case 'migration:revert': {
        await dataSource.undoLastMigration({ transaction: 'all' });
        console.log('Última migración revertida.');
        break;
      }
      case 'migration:show': {
        const hasPendingMigrations = await dataSource.showMigrations();
        console.log(`Migraciones configuradas: ${dataSource.migrations.map((migration) => migration.name).join(', ')}`);
        console.log(`Migraciones pendientes: ${hasPendingMigrations ? 'sí' : 'no'}`);
        break;
      }
      case 'test': {
        const [connectionResult] = await dataSource.query<
          Array<{ result: number; database_time: Date }>
        >('SELECT 1::int AS result, NOW() AS database_time');
        console.log(`SELECT 1: ${connectionResult.result}`);
        console.log(`Hora de PostgreSQL: ${connectionResult.database_time.toISOString()}`);

        const tables = await dataSource.query<Array<{ table_name: string }>>(
          `SELECT table_name
           FROM information_schema.tables
           WHERE table_schema = 'public'
             AND table_name = ANY($1::text[])
           ORDER BY table_name`,
          [expectedTables],
        );
        const tableNames = tables.map((table) => table.table_name);
        console.log(`Tablas MVP: ${tableNames.join(', ')}`);

        const missingTables = expectedTables.filter((table) => !tableNames.includes(table));
        if (missingTables.length > 0) {
          throw new Error(`Faltan tablas del MVP: ${missingTables.join(', ')}`);
        }

        const migrations = await dataSource.query<
          Array<{ id: number; timestamp: string; name: string }>
        >('SELECT id, timestamp, name FROM "migrations" ORDER BY id');
        console.log(
          `Migraciones registradas: ${migrations.map((migration) => migration.name).join(', ') || 'ninguna'}`,
        );

        if (!migrations.some((migration) => migration.name === 'InitialSchema1788303766322')) {
          throw new Error('La migración inicial no figura en la tabla migrations.');
        }
        break;
      }
      default:
        throw new Error(
          'Comando inválido. Usá migration:run, migration:revert, migration:show o test.',
        );
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  const databaseUrl = process.env.DATABASE_URL;
  console.error(databaseUrl ? message.replaceAll(databaseUrl, '[DATABASE_URL REDACTADA]') : message);
  process.exitCode = 1;
});
