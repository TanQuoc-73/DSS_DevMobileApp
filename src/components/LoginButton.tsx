'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function LoginButton() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    });
    if (error) console.error('Login error:', error.message);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error.message);
  };

  if (user) {
    return (
      <div className="flex items-center space-x-3 text-gray-300">
        <span className="font-medium">{user.email}</span>
        <button
          onClick={signOut}
          className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded"
        >
          Đăng xuất
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-600"
    >
      Đăng nhập Google
    </button>
  );
}
