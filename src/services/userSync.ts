import { supabase } from '@/lib/supabaseClient';

export async function syncUserToDb(user: any) {
  if (!user) return;

  // Kiểm tra user đã tồn tại chưa
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking user:', error);
    return;
  }

  if (!data) {
    // Insert user mới
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || null,
      company: user.user_metadata?.company || null,
      role: 'developer',
    });

    if (insertError) {
      console.error(
        'Error inserting user:',
        insertError.message,
        insertError.details,
        insertError.hint,
        insertError.code,
      );
    }
  }
}
