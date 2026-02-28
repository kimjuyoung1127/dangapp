-- DangGeting Initial Schema Migration
-- Defines the core 16 tables, enums, extensions, and RLS policies

-- Enable specific extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis"; -- For distance matching

--------------------------------------------------------------------------------
-- 1. ENUMS
--------------------------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE match_status AS ENUM ('pending', 'accepted', 'rejected');
CREATE TYPE schedule_status AS ENUM ('proposed', 'confirmed', 'completed', 'cancelled');
CREATE TYPE chat_room_type AS ENUM ('direct', 'group');
CREATE TYPE message_type AS ENUM ('text', 'image', 'schedule', 'system');
CREATE TYPE dog_gender AS ENUM ('male', 'female');
CREATE TYPE badge_type AS ENUM ('verified', 'active_walker', 'top_reviewer', 'care_angel');
CREATE TYPE mode_type AS ENUM ('basic', 'care', 'family');

--------------------------------------------------------------------------------
-- 2. TABLES
--------------------------------------------------------------------------------

-- 2.1 Users (Extends auth.users implicitly, but we store minimal custom data here)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE,
  role user_role DEFAULT 'user'::user_role NOT NULL,
  trust_score NUMERIC(5,2) DEFAULT 0.00,
  trust_level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.2 Guardians (User Profile)
CREATE TABLE public.guardians (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  address_name TEXT,     -- e.g., "역삼동"
  location GEOGRAPHY(POINT, 4326), -- PostGIS Point for distance calculation
  verified_region BOOLEAN DEFAULT FALSE,
  activity_times JSONB DEFAULT '[]'::JSONB, -- Array of preferred times e.g., ["morning", "evening"]
  preferred_radius_km INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.3 Dogs
CREATE TABLE public.dogs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  breed TEXT NOT NULL,
  age INTEGER,
  weight_kg NUMERIC(5,2),
  temperament JSONB DEFAULT '[]'::JSONB, -- e.g., ["active", "friendly"]
  gender dog_gender,
  neutered BOOLEAN,
  photo_urls TEXT[] DEFAULT '{}',
  vaccination_docs TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.4 Matches
CREATE TABLE public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  from_guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  to_guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  status match_status DEFAULT 'pending'::match_status NOT NULL,
  liked_section TEXT,         -- Which part of the profile they liked
  comment TEXT,               -- The message sent with the like
  compatibility_score INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT matches_unique_pair UNIQUE (from_guardian_id, to_guardian_id)
);

-- 2.5 Blocks
CREATE TABLE public.blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  blocker_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT blocks_unique_pair UNIQUE (blocker_id, blocked_id)
);

-- 2.6 Chat Rooms
CREATE TABLE public.chat_rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type chat_room_type DEFAULT 'direct'::chat_room_type NOT NULL,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.7 Chat Room Participants
CREATE TABLE public.chat_participants (
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (room_id, guardian_id)
);

-- 2.8 Chat Messages
CREATE TABLE public.chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.guardians(id) ON DELETE SET NULL, -- Null if system message
  type message_type DEFAULT 'text'::message_type NOT NULL,
  content TEXT,
  metadata JSONB, -- For image URLs, schedule IDs, etc.
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.9 Schedules (Appointments/Walks)
CREATE TABLE public.schedules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  organizer_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  location_name TEXT,
  location_geog GEOGRAPHY(POINT, 4326),
  datetime TIMESTAMPTZ NOT NULL,
  status schedule_status DEFAULT 'proposed'::schedule_status NOT NULL,
  participant_ids UUID[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.10 DangLogs (Social Feed)
CREATE TABLE public.danglogs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  dog_id UUID REFERENCES public.dogs(id) ON DELETE SET NULL,
  title TEXT,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  activity_type TEXT, -- e.g., 'walk', 'cafe', 'training'
  shared_with UUID[] DEFAULT '{}', -- If private/specific group
  co_authors UUID[] DEFAULT '{}',  -- For care mode linked posts
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.11 DangLog Comments
CREATE TABLE public.danglog_comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  danglog_id UUID REFERENCES public.danglogs(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.12 DangLog Likes
CREATE TABLE public.danglog_likes (
  danglog_id UUID REFERENCES public.danglogs(id) ON DELETE CASCADE NOT NULL,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (danglog_id, guardian_id)
);

-- 2.13 Reviews
CREATE TABLE public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  target_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  schedule_id UUID REFERENCES public.schedules(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  content TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.14 Trust Badges
CREATE TABLE public.trust_badges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  badge_type badge_type NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT unique_badge_per_guardian UNIQUE (guardian_id, badge_type)
);

-- 2.15 Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- e.g., 'new_match', 'message', 'review'
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data_json JSONB,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2.16 Mode Unlocks
CREATE TABLE public.mode_unlocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  guardian_id UUID REFERENCES public.guardians(id) ON DELETE CASCADE NOT NULL,
  mode mode_type NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  criteria_met_json JSONB NOT NULL,
  CONSTRAINT unique_mode_per_guardian UNIQUE (guardian_id, mode)
);

--------------------------------------------------------------------------------
-- 3. UPDATED_AT TRIGGERS
--------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_guardians_modtime BEFORE UPDATE ON public.guardians FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_dogs_modtime BEFORE UPDATE ON public.dogs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_matches_modtime BEFORE UPDATE ON public.matches FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_schedules_modtime BEFORE UPDATE ON public.schedules FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_danglogs_modtime BEFORE UPDATE ON public.danglogs FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_danglog_comments_modtime BEFORE UPDATE ON public.danglog_comments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

--------------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (Base Setup)
--------------------------------------------------------------------------------
-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.guardians ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danglogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danglog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.danglog_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trust_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mode_unlocks ENABLE ROW LEVEL SECURITY;

-- Note: Specific RLS policies will be added in a subsequent migration tailored to 
-- exact app data-access rules (e.g., users can only update their own records,
-- public profiles are readable, chat messages only readable by participants).
