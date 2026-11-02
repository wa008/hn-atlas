CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT '',
  ip_hash TEXT NOT NULL,
  dedupe TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'queued',
  github_issue INTEGER
);
CREATE INDEX IF NOT EXISTS submissions_queue ON submissions(status, created_at);
CREATE INDEX IF NOT EXISTS submissions_rate ON submissions(ip_hash, created_at);
