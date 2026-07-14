-- Add form field columns that were missing from the equipment table
-- Run this in your Supabase SQL Editor to update an existing database

ALTER TABLE equipment
ADD COLUMN IF NOT EXISTS screen_size TEXT,
ADD COLUMN IF NOT EXISTS release_location TEXT;
