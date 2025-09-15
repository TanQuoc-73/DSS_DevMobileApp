'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';
import { supabase } from '@/lib/supabaseClient';
import { syncUserToDb } from '@/services/userSync';

interface User {
  id: string;
  email: string;
  full_name?: string | null;
  company?: string | null;
  role?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function initializeAuth() {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (sessionUser && isMounted) {
        const mappedUser: User = {
          id: sessionUser.id,
          email: sessionUser.email || '',
          full_name:
            sessionUser.user_metadata?.full_name ||
            sessionUser.email?.split('@')[0] ||
            null,
          avatar_url: sessionUser.user_metadata?.avatar_url || null,
          company: sessionUser.user_metadata?.company || null,
          role: 'developer',
        };
        setUser(mappedUser);
        await syncUserToDb(sessionUser);
      }
      if (isMounted) setLoading(false);
    }

    initializeAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user && isMounted) {
          const mappedUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name:
              session.user.user_metadata?.full_name ||
              session.user.email?.split('@')[0] ||
              null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            company: session.user.user_metadata?.company || null,
            role: 'developer',
          };
          setUser(mappedUser);
          await syncUserToDb(session.user);
        } else if (isMounted) {
          setUser(null);
        }
        if (isMounted) setLoading(false);
      }
    );

    return () => {
      isMounted = false;
      listener?.subscription.unsubscribe();
    };
  }, []);

  // Đăng nhập với Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) console.error('Login error:', error.message);
  };

  // Đăng xuất
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error.message);
    else setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, loading, signInWithGoogle, signOut }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook để gọi user trong component
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
