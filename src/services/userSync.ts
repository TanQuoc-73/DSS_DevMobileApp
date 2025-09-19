import { supabase } from '@/lib/supabaseClient';
import { User } from '@/types/users';

// Hàm này chỉ lấy user từ bảng `users` trong DB
export async function syncUserToDb(user: any): Promise<User | null> {
  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user from DB:', error.message ?? error);
    return null;
  }

  return data as User | null;
}
