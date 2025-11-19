-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enum Types
CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'tour_booked', 'tour_completed', 'enrolled', 'lost');
CREATE TYPE program_interest AS ENUM ('jr', 'create', 'camp');
CREATE TYPE tour_status AS ENUM ('scheduled', 'completed', 'no-show');
CREATE TYPE interaction_type AS ENUM ('call', 'sms', 'email');
CREATE TYPE user_role AS ENUM ('owner', 'director');

-- 1. Franchises Table
CREATE TABLE franchises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    address TEXT,
    settings JSONB DEFAULT '{}'::jsonb, -- stores operating_hours, twilio_phone
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Profiles Table (Links to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    franchise_id UUID REFERENCES franchises(id),
    full_name TEXT,
    role user_role DEFAULT 'director',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Leads Table
CREATE TABLE leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    franchise_id UUID NOT NULL REFERENCES franchises(id),
    status lead_status DEFAULT 'new',
    source TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Guardians Table
CREATE TABLE guardians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Students Table
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    guardian_id UUID NOT NULL REFERENCES guardians(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    dob DATE NOT NULL,
    program_interest program_interest NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tours Table
CREATE TABLE tours (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    franchise_id UUID NOT NULL REFERENCES franchises(id),
    scheduled_at TIMESTAMPTZ NOT NULL,
    status tour_status DEFAULT 'scheduled',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Interactions Table
CREATE TABLE interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    type interaction_type NOT NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE franchises ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's franchise_id
CREATE OR REPLACE FUNCTION get_my_franchise_id()
RETURNS UUID AS $$
  SELECT franchise_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policies

-- Profiles: Users can read their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

-- Franchises: Users can view the franchise they belong to
CREATE POLICY "Users can view own franchise" ON franchises
    FOR SELECT USING (id = get_my_franchise_id());

-- Generic Policy for Tenant-Scoped Tables
-- Leads
CREATE POLICY "Tenant access for leads" ON leads
    USING (franchise_id = get_my_franchise_id());

-- Guardians (via lead -> franchise_id match, or implicit ownership via lead)
-- Optimization: Guardians don't have franchise_id directly, so we join to leads.
CREATE POLICY "Tenant access for guardians" ON guardians
    USING (EXISTS (
        SELECT 1 FROM leads 
        WHERE leads.id = guardians.lead_id 
        AND leads.franchise_id = get_my_franchise_id()
    ));

-- Students (via guardian -> lead -> franchise_id)
CREATE POLICY "Tenant access for students" ON students
    USING (EXISTS (
        SELECT 1 FROM guardians
        JOIN leads ON guardians.lead_id = leads.id
        WHERE guardians.id = students.guardian_id
        AND leads.franchise_id = get_my_franchise_id()
    ));

-- Tours
CREATE POLICY "Tenant access for tours" ON tours
    USING (franchise_id = get_my_franchise_id());

-- Interactions (via lead)
CREATE POLICY "Tenant access for interactions" ON interactions
    USING (EXISTS (
        SELECT 1 FROM leads 
        WHERE leads.id = interactions.lead_id 
        AND leads.franchise_id = get_my_franchise_id()
    ));


