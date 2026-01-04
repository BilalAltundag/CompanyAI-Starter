-- Company AI Database Schema

-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Departments table
CREATE TABLE departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User-Department relationships
CREATE TABLE user_departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, department_id)
);

-- Data types enum
CREATE TYPE data_type AS ENUM (
  'text_documents',
  'data_files',
  'presentations',
  'images',
  'videos',
  'audio',
  'structured_data',
  'external_links'
);

-- Files table
CREATE TABLE files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  type data_type NOT NULL,
  url TEXT NOT NULL,
  size BIGINT,
  department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT false,
  is_personal BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chatbots table
CREATE TABLE chatbots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  department_id UUID REFERENCES departments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  system_message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  -- Either department_id or user_id should be set, but not both
  CONSTRAINT chatbot_scope_check CHECK (
    (department_id IS NOT NULL AND user_id IS NULL) OR
    (department_id IS NULL AND user_id IS NOT NULL)
  )
);

-- Chat conversations
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chatbot_id UUID REFERENCES chatbots(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- File embeddings for RAG (optional - for future AI features)
CREATE TABLE file_embeddings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_id UUID REFERENCES files(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 dimensions
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_files_department ON files(department_id);
CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_type ON files(type);
CREATE INDEX idx_chatbots_department ON chatbots(department_id);
CREATE INDEX idx_chatbots_user ON chatbots(user_id);
CREATE INDEX idx_conversations_chatbot ON conversations(chatbot_id);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);

-- Row Level Security Policies

-- Departments: All authenticated users can read
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Departments are viewable by authenticated users" ON departments
  FOR SELECT USING (auth.role() = 'authenticated');

-- Users: Users can see their own data, admins can see all
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can view all users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- User departments: Users can see their own assignments
ALTER TABLE user_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own department assignments" ON user_departments
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage all department assignments" ON user_departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Files: Complex policy based on department membership and file visibility
ALTER TABLE files ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view files in their departments or public files" ON files
  FOR SELECT USING (
    is_public = true OR
    user_id = auth.uid() OR
    (department_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_departments ud
      WHERE ud.user_id = auth.uid() AND ud.department_id = files.department_id
    ))
  );

CREATE POLICY "Users can upload files to their departments or personal files" ON files
  FOR INSERT WITH CHECK (
    user_id = auth.uid() AND (
      is_personal = true OR
      (department_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM user_departments ud
        WHERE ud.user_id = auth.uid() AND ud.department_id = files.department_id
      ))
    )
  );

CREATE POLICY "Admins can manage all files" ON files
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Chatbots: Users can access chatbots for their departments or personal chatbots
ALTER TABLE chatbots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access department or personal chatbots" ON chatbots
  FOR SELECT USING (
    user_id = auth.uid() OR
    (department_id IS NOT NULL AND EXISTS (
      SELECT 1 FROM user_departments ud
      WHERE ud.user_id = auth.uid() AND ud.department_id = chatbots.department_id
    ))
  );

-- Conversations and Messages: Users can only access their own
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own conversations" ON conversations
  FOR ALL USING (user_id = auth.uid());

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access messages in their conversations" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id AND c.user_id = auth.uid()
    )
  );

-- Functions and Triggers

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_departments_updated_at BEFORE UPDATE ON departments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON files FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chatbots_updated_at BEFORE UPDATE ON chatbots FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create default chatbots when departments are created
CREATE OR REPLACE FUNCTION create_department_chatbots()
RETURNS TRIGGER AS $$
BEGIN
  -- Create department chatbot
  INSERT INTO chatbots (name, department_id, system_message)
  VALUES (
    NEW.name || ' Asistanı',
    NEW.id,
    'Sen ' || NEW.name || ' departmanı için uzman bir asistansın. Bu departmanın verilerine dayanarak sorulara doğru ve yardımcı yanıtlar ver.'
  );

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_department_chatbots_trigger
  AFTER INSERT ON departments
  FOR EACH ROW EXECUTE FUNCTION create_department_chatbots();

-- Function to create personal chatbot when user is created
CREATE OR REPLACE FUNCTION create_personal_chatbot()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO chatbots (name, user_id, system_message)
  VALUES (
    'Kişisel Asistan',
    NEW.id,
    'Sen ' || NEW.full_name || ' için kişisel bir asistansın. Sana yüklenen verilere dayanarak yardımcı olabilirsin.'
  );

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_personal_chatbot_trigger
  AFTER INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION create_personal_chatbot();
