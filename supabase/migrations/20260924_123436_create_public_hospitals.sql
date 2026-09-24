-- Create the public_hospitals table for the public directory
CREATE TABLE public_hospitals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    verified BOOLEAN DEFAULT false,
    image TEXT,
    last_updated TIMESTAMPTZ DEFAULT now(),
    -- Stores: { "icu": "available", "blood": "unavailable", "emergencyDepartment": "available", "ventilator": "available", "ctScan": "available" }
    resources JSONB NOT NULL,
    -- Stores: { "phone": "...", "emergencyPhone": "..." }
    contact JSONB NOT NULL,
    -- Geographic coordinates for distance calculations
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    CONSTRAINT resources_shape CHECK (
        jsonb_typeof(resources) = 'object'
    )
);

-- Enable Row Level Security
ALTER TABLE public_hospitals ENABLE ROW LEVEL SECURITY;

-- Create a policy to allow public read access (anon role)
CREATE POLICY "Public hospitals are viewable by everyone"
ON public_hospitals
FOR SELECT
USING (true);

-- Add an index on the resources JSONB column for faster filtering
CREATE INDEX idx_public_hospitals_resources ON public_hospitals USING gin (resources);
