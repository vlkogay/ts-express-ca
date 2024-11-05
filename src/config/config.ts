import * as dotenv from 'dotenv';
dotenv.config();
dotenv.config({ path: `.env.local`, override: true });

export interface WebserverConfig {
  port: number;
  jsonLimit?: string;
  urlencodedLimit?: string;
}

export interface LoggerConfig {
  level: string;
}

export interface PostgresConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface AdminConfig {
  name: string;
  email: string;
  password: string;
}

export interface RedisConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface PasetoConfig {
  publicKey: string;
  secretKey: string;
  expiresInMs: number;
}

export interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
}

export interface E2eConfig {
  admin: AdminConfig;
  email: EmailConfig;
  postgres: PostgresConfig;
}

export interface Config {
  webserver: WebserverConfig;
  paseto: PasetoConfig;
  logger: LoggerConfig;
  postgres: PostgresConfig;
  redis: RedisConfig;
  admin: AdminConfig;
  email: EmailConfig;
  e2e: E2eConfig;
}

export default function getConfig(): Config {
  return {
    webserver: {
      port: process.env['PORT'] ? parseInt(process.env['PORT'], 10) : 3000,
      jsonLimit: process.env['JSON_LIMIT'] || '50mb',
      urlencodedLimit: process.env['URLENCODED_LIMIT'] || '50mb',
    },
    paseto: {
      publicKey: process.env['PASETO_PUBLIC_KEY'] || '',
      secretKey: process.env['PASETO_SECRET_KEY'] || '',
      expiresInMs: process.env['PASETO_EXPIRES_IN_MS']
        ? parseInt(process.env['PASETO_EXPIRES_IN_MS'], 10)
        : 3600000,
    },
    logger: { level: process.env['LOGGER_LEVEL'] || 'info' },
    postgres: {
      host: process.env['POSTGRES_HOST'] || 'localhost',
      port: process.env['POSTGRES_PORT']
        ? parseInt(process.env['POSTGRES_PORT'], 10)
        : 5432,
      username: process.env['POSTGRES_USER'] || 'postgres',
      password: process.env['POSTGRES_PASSWORD'] || 'postgres',
      database: process.env['POSTGRES_DATABASE'] || 'postgres',
    },
    redis: {
      host: process.env['REDIS_HOST'] || 'localhost',
      port: process.env['REDIS_PORT']
        ? parseInt(process.env['REDIS_PORT'], 10)
        : 6379,
      username: process.env['REDIS_USER'] || 'redis',
      password: process.env['REDIS_PASSWORD'] || 'redis',
    },
    admin: {
      name: process.env['ADMIN_NAME'] || '',
      email: process.env['ADMIN_EMAIL'] || '',
      password: process.env['ADMIN_PASSWORD'] || '',
    },
    email: {
      host: process.env['EMAIL_HOST'] || 'smtp.ethereal.email',
      port: process.env['EMAIL_PORT']
        ? parseInt(process.env['EMAIL_PORT'], 10)
        : 587,
      secure: process.env['EMAIL_SECURE'] === 'true',
      user: process.env['EMAIL_USER'] || 'user',
      pass: process.env['EMAIL_PASSWORD'] || 'pass',
      from: process.env['EMAIL_FROM'] || '',
    },
    e2e: {
      admin: {
        name: process.env['E2E_ADMIN_NAME'] || 'admin',
        email: process.env['E2E_ADMIN_EMAIL'] || '',
        password: process.env['E2E_ADMIN_PASSWORD'] || '',
      },
      email: {
        host: process.env['E2E_EMAIL_HOST'] || 'smtp.ethereal.email',
        port: process.env['E2E_EMAIL_PORT']
          ? parseInt(process.env['E2E_EMAIL_PORT'], 10)
          : 587,
        secure: process.env['E2E_EMAIL_SECURE'] === 'true',
        user: process.env['E2E_EMAIL_USER'] || 'user',
        pass: process.env['E2E_EMAIL_PASSWORD'] || 'pass',
        from: process.env['E2E_EMAIL_FROM'] || '',
      },
      postgres: {
        host: process.env['E2E_POSTGRES_HOST'] || 'localhost',
        port: process.env['E2E_POSTGRES_PORT']
          ? parseInt(process.env['E2E_POSTGRES_PORT'], 10)
          : 5432,
        username: process.env['E2E_POSTGRES_USER'] || 'postgres',
        password: process.env['E2E_POSTGRES_PASSWORD'] || 'postgres',
        database: process.env['E2E_POSTGRES_DATABASE'] || 'postgres',
      },
    },
  };
}
