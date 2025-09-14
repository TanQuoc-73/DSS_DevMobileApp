import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createServerClient(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: { headers: { Authorization: token ? `Bearer ${token}` : '' } },
    }
  );
}

// 👉 GET: lấy tất cả sessions của user hiện tại
export async function GET(req: Request) {
  const supabase = createServerClient(req);

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('analysis_sessions')
    .select('*')
    .eq('user_id', user.id) // chỉ lấy của user hiện tại
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Fetch sessions error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// 👉 POST: tạo session mới
export async function POST(req: Request) {
  const supabase = createServerClient(req);
  const body = await req.json();
  const { project_name, description } = body;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('analysis_sessions')
    .insert([{ project_name, description, user_id: user.id }])
    .select()
    .single();

  if (error) {
    console.error('Insert session error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
