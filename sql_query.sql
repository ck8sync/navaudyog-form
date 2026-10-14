-- WARNING: This query will drop the existing 'leads' table and all its data.
-- Make sure you have backed up any important data before executing this.

DROP TABLE IF EXISTS leads;

CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ref TEXT NOT NULL UNIQUE,
    flow_id TEXT NOT NULL,
    event_id TEXT NOT NULL,
    source TEXT NOT NULL,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    email TEXT NOT NULL,
    answers JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone(
        'utc',
        now()
    )
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon access" ON leads
FOR INSERT WITH CHECK (true);

-- Optional: Add an index to event_id for faster queries if you frequently filter by event_id
-- CREATE INDEX IF NOT EXISTS idx_leads_event_id ON leads (event_id);