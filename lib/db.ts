import 'server-only';
import type { DataSource } from 'typeorm';
import { AppDataSource } from '@/db/data-source';

declare global {
  var rebordDatabasePromise: Promise<DataSource> | undefined;
}

export async function getDatabase(): Promise<DataSource> {
  if (AppDataSource.isInitialized) {
    return AppDataSource;
  }

  if (!globalThis.rebordDatabasePromise) {
    globalThis.rebordDatabasePromise = AppDataSource.initialize();
  }

  try {
    return await globalThis.rebordDatabasePromise;
  } catch (error) {
    globalThis.rebordDatabasePromise = undefined;
    throw new Error('No se pudo inicializar la conexión con PostgreSQL.', { cause: error });
  }
}
