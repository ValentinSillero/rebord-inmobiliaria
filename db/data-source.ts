import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Admin } from './entities/Admin';
import { Property } from './entities/Property';
import { PropertyFeature } from './entities/PropertyFeature';
import { PropertyImage } from './entities/PropertyImage';
import { InitialSchema1788303766322 } from './migrations/1788303766322-InitialSchema';

function requireDatabaseUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error(
      'DATABASE_URL no está configurada. Definila en .env.local antes de usar la base de datos.',
    );
  }

  return databaseUrl;
}

export function createDataSource() {
  return new DataSource({
    type: 'postgres',
    url: requireDatabaseUrl(),
    ssl: { rejectUnauthorized: true },
    entities: [Admin, Property, PropertyImage, PropertyFeature],
    migrations: [InitialSchema1788303766322],
    migrationsTableName: 'migrations',
    migrationsRun: false,
    synchronize: false,
    logging: ['error'],
    extra: {
      application_name: 'rebord-inmobiliaria',
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 30_000,
      max: 5,
    },
  });
}

export const AppDataSource = createDataSource();
