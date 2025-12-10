-- PostgreSQL schema for additional features: docs, events, announcements, polls

-- docs table
CREATE TABLE IF NOT EXISTS docs (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  uploader TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- events table
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  when_at TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  description TEXT,
  organizer TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- announcements table
CREATE TABLE IF NOT EXISTS announcements (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- polls table
-- options stored as JSONB: [{opt: "Option A", votes: 0}, ...]
CREATE TABLE IF NOT EXISTS polls (
  id SERIAL PRIMARY KEY,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  total_votes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_docs_created ON docs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_when ON events(when_at ASC);
CREATE INDEX IF NOT EXISTS idx_ann_created ON announcements(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_polls_created ON polls(created_at DESC);
