CREATE TABLE IF NOT EXISTS "announcements" (
  "id" varchar PRIMARY KEY,
  "adminId" varchar NOT NULL,
  "title" varchar NOT NULL,
  "content" text NOT NULL,
  "author" varchar NOT NULL,
  "createdAt" datetime DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" datetime DEFAULT CURRENT_TIMESTAMP
);
