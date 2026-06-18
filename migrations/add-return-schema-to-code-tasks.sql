ALTER TABLE code_tasks
ADD COLUMN IF NOT EXISTS "returnSchema" jsonb;
