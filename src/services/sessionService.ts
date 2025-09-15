import { supabase } from '@/lib/supabaseClient';

export async function getSessions() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch('/api/sessions', {
    headers: {
      Authorization: `Bearer ${session?.access_token}`, 
    },
  });

  if (!res.ok) throw new Error('Failed to fetch sessions');
  return res.json();
}
export async function createSession(projectName: string, description: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session?.access_token}`, // 👈 gửi token
    },
    body: JSON.stringify({ project_name: projectName, description }),
  });

  if (!res.ok) throw new Error('Failed to create session');
  return res.json();
}

export async function deleteSession(id: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api/sessions/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${session?.access_token}`, // 👈 gửi token
    },
  });

  if (!res.ok) throw new Error('Failed to delete session');
  return res.json();
}

export async function getSessionById(id: string) {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const res = await fetch(`/api/sessions/${id}`, {
    headers: {
      Authorization: `Bearer ${session?.access_token}`,
    },
  });

  if (!res.ok) throw new Error('Failed to fetch session');
  return res.json();
}
