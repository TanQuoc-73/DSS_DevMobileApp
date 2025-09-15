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

// GET current recommendation for a session
export async function GET(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const supabase = createServerClient(req);

  const { data, error } = await supabase
    .from('recommendations')
    .select('id, session_id, recommended_platform_id, confidence, rationale, created_at, updated_at')
    .eq('session_id', id)
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data || null);
}

// PUT upsert recommendation for a session
export async function PUT(
  req: Request,
  context: { params: { id: string } }
) {
  const { id } = context.params;
  const supabase = createServerClient(req);
  const body = await req.json();
  const { recommended_platform_id, confidence, rationale } = body || {};
  if (!recommended_platform_id || confidence == null) {
    return NextResponse.json({ error: 'recommended_platform_id and confidence are required' }, { status: 400 });
  }

  const payload = {
    session_id: id,
    recommended_platform_id,
    confidence,
    rationale: rationale ?? null,
  };

  const { data, error } = await supabase
    .from('recommendations')
    .upsert(payload, { onConflict: 'session_id' })
    .select('*')
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
