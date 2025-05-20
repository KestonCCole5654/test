-- Create onboarding_status table
CREATE TABLE IF NOT EXISTS onboarding_status (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    has_created_sheet BOOLEAN DEFAULT false,
    spreadsheet_id TEXT,
    spreadsheet_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_onboarding_status_user_id ON onboarding_status(user_id);

-- Add RLS policies
ALTER TABLE onboarding_status ENABLE ROW LEVEL SECURITY;

-- Policy to allow users to read their own onboarding status
CREATE POLICY "Users can view their own onboarding status"
    ON onboarding_status
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy to allow users to update their own onboarding status
CREATE POLICY "Users can update their own onboarding status"
    ON onboarding_status
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy to allow users to insert their own onboarding status
CREATE POLICY "Users can insert their own onboarding status"
    ON onboarding_status
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_onboarding_status_updated_at
    BEFORE UPDATE ON onboarding_status
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column(); 