-- Create app_role enum for user roles
CREATE TYPE app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM user_roles
    WHERE user_id = _user_id
    AND role = _role
  );
$$;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  region TEXT,
  main_crops TEXT[],
  farm_size TEXT,
  bio TEXT,
  avatar_url TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create trigger to auto-create profile
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    new.email
  );
  
  INSERT INTO user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create blogs table
CREATE TABLE blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  region TEXT NOT NULL,
  crop TEXT NOT NULL,
  season TEXT NOT NULL,
  headline_image_url TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;

-- Blogs policies
CREATE POLICY "Anyone can view blogs"
  ON blogs FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can create own blogs"
  ON blogs FOR INSERT
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Users can update own blogs"
  ON blogs FOR UPDATE
  USING (auth.uid() = author_id);

CREATE POLICY "Users can delete own blogs"
  ON blogs FOR DELETE
  USING (auth.uid() = author_id);

CREATE POLICY "Admins can manage all blogs"
  ON blogs FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create markets table
CREATE TABLE markets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  logo_url TEXT,
  crop TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  trends TEXT,
  market_type TEXT NOT NULL CHECK (market_type IN ('local', 'international')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE markets ENABLE ROW LEVEL SECURITY;

-- Markets policies
CREATE POLICY "Anyone can view markets"
  ON markets FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can manage markets"
  ON markets FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Create chat_messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Chat policies
CREATE POLICY "Users can view own chats"
  ON chat_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own chats"
  ON chat_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blogs_updated_at
  BEFORE UPDATE ON blogs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_markets_updated_at
  BEFORE UPDATE ON markets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample market data
INSERT INTO markets (name, crop, price, description, trends, market_type) VALUES
  ('Nairobi Coffee Exchange', 'Coffee', 450.00, 'Primary coffee trading hub in East Africa', 'Prices up 5% this month', 'local'),
  ('Kericho Tea Auction', 'Tea', 320.00, 'Major tea auction center', 'Stable demand', 'local'),
  ('London Coffee Exchange', 'Coffee', 520.00, 'International coffee futures market', 'Strong export demand', 'international'),
  ('New York Tea Market', 'Tea', 380.00, 'Global tea trading platform', 'Premium prices for specialty teas', 'international');