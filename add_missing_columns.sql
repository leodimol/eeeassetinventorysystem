-- Add missing columns to equipment table
-- Run this in Supabase SQL Editor to update your database

ALTER TABLE equipment 
ADD COLUMN IF NOT EXISTS released_by TEXT,
ADD COLUMN IF NOT EXISTS release_datetime TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS release_location TEXT,
ADD COLUMN IF NOT EXISTS screen_size TEXT;
