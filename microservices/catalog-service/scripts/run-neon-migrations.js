/* eslint-disable no-console */
const { Client } = require('pg');

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const migrationStatements = [
  'create extension if not exists pgcrypto',
  `create table if not exists users (
    id uuid primary key default gen_random_uuid(),
    email varchar(255) not null unique,
    "passwordHash" varchar(255) not null,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
  )`,
  `create table if not exists products (
    id uuid primary key default gen_random_uuid(),
    title varchar(255) not null,
    description text null,
    price numeric(10,2) not null,
    "isActive" boolean not null default true,
    "lastKnownStock" integer not null default 0,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
  )`,
  `create table if not exists inventory_items (
    id uuid primary key default gen_random_uuid(),
    "productId" uuid not null unique,
    quantity integer not null default 0,
    "createdAt" timestamptz not null default now(),
    "updatedAt" timestamptz not null default now()
  )`,
];

async function run() {
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  await client.connect();
  await client.query('select now()');

  for (const statement of migrationStatements) {
    await client.query(statement);
  }

  const tableResult = await client.query(
    `select table_name
     from information_schema.tables
     where table_schema='public'
       and table_name in ('users', 'products', 'inventory_items')
     order by table_name`,
  );

  console.log(
    'Migration completed. Tables:',
    tableResult.rows.map((row) => row.table_name).join(', '),
  );

  await client.end();
}

run().catch(async (error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
