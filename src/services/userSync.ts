import { supabase } from '@/lib/supabaseClient';

export async function syncUserToDb(user: any) {
  if (!user) return;

  // Dùng maybeSingle để tránh lỗi khi không có dữ liệu
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    console.error('Error checking user:', error);
    return;
  }

  if (!data) {
    // Insert user mới
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || null,
      company: user.user_metadata?.company || null,
      role: 'developer', // default
    });

    if (insertError) {
      console.error('Error inserting user:', insertError);
    } else {
      console.log('User inserted successfully');
    }
  } else {
    console.log('User already exists in DB');
  }
}
