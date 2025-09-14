// CREATE TABLE users (
//     id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
//     email VARCHAR(255) UNIQUE NOT NULL,
//     full_name VARCHAR(255),
//     company VARCHAR(255),
//     role VARCHAR(100), -- manager, developer, startup_founder, etc.
//     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
//     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
// );

export interface User {
  id: string;
  email: string;
  full_name?: string | null;
  company?: string | null;
  role: string; 
  created_at: string;
  updated_at: string;
  avatar_url?: string;
  
}