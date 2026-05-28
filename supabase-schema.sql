-- Supabase Table Creation SQL for KnowBase
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- MessageRole enum
DO $$ BEGIN
  CREATE TYPE "MessageRole" AS ENUM ('USER', 'ASSISTANT');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Workspace table
CREATE TABLE IF NOT EXISTS "Workspace" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  name TEXT NOT NULL,
  "inviteCode" TEXT UNIQUE DEFAULT uuid_generate_v4()::text,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  email TEXT UNIQUE NOT NULL,
  "hashedPassword" TEXT NOT NULL,
  name TEXT,
  "emailVerified" TIMESTAMPTZ,
  "workspaceId" TEXT NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Document table
CREATE TABLE IF NOT EXISTS "Document" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  "fileName" TEXT NOT NULL,
  "fileUrl" TEXT NOT NULL,
  "extractedText" TEXT NOT NULL,
  "workspaceId" TEXT NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Chat table
CREATE TABLE IF NOT EXISTS "Chat" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  title TEXT,
  "workspaceId" TEXT NOT NULL REFERENCES "Workspace"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- Message table
CREATE TABLE IF NOT EXISTS "Message" (
  id TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
  role "MessageRole" NOT NULL,
  content TEXT NOT NULL,
  "chatId" TEXT NOT NULL REFERENCES "Chat"(id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

-- IMPORTANT: Disable Row Level Security (RLS) on all tables so the anon key works
-- If you want to use RLS, add a service_role key to .env instead
ALTER TABLE "Workspace" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "User" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Document" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Chat" DISABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" DISABLE ROW LEVEL SECURITY;

-- Optional: Enable realtime for Document and Chat tables
BEGIN;
  -- Publication for realtime (if you want to use Supabase realtime later)
  -- Do nothing for now; realtime is off by default
COMMIT;
