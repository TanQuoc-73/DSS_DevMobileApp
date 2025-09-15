import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function createServerClient(req: Request) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      },
    }
  );
}

export async function GET(req: Request) {
  const supabase = createServerClient(req);
  const { searchParams } = new URL(req.url);
  const level = Number(searchParams.get('level') ?? '1');
  const parentId = searchParams.get('parent_id');

  let query = supabase
    .from('ahp_criteria')
    .select('id, code, name, level, description, parent_id')
    .eq('active', true)
    .eq('level', level);

  if (level === 2 && parentId) {
    query = query.eq('parent_id', parentId);
  }

  const { data, error } = await query.order('code');

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
