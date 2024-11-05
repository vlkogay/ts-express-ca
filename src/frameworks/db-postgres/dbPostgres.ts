import { PostgresConfig } from '../../config/config';
import * as pg from 'pg';
import ILogger from '../../logger/logger';
import IDatabase from '../../application/repositories/database';

export default class DbPostgres implements IDatabase {
  private pgpool: pg.Pool;

  constructor(private PostgresConfig: PostgresConfig, private logger: ILogger) {
    this.pgpool = new pg.Pool({
      user: this.PostgresConfig.username,
      host: this.PostgresConfig.host,
      database: this.PostgresConfig.database,
      password: this.PostgresConfig.password,
      port: this.PostgresConfig.port,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
    this.pgpool.on('error', (err: Error) => {
      this.logger.error(err);
    });
  }

  async startTransaction(
    callback: (connection: unknown) => Promise<void>,
  ): Promise<void> {
    const client = await this.pgpool.connect();
    try {
      await client.query('BEGIN');
      await callback(client);
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  close() {
    this.pgpool.end();
  }

  get pool() {
    return this.pgpool;
  }
}
