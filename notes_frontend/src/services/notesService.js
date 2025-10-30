//
// Notes CRUD service using Supabase
//
import { getSupabase } from '../lib/supabaseClient';
import { reportError } from '../utils/errors';

/**
 * PUBLIC_INTERFACE
 */
export async function listNotes({ userId = null, search = '' } = {}) {
  /** List notes; filters by userId if provided, supports simple title/content search */
  const supabase = getSupabase();
  if (!supabase) return { data: [], error: new Error('Supabase not configured') };
  try {
    let query = supabase.from('notes').select('*').order('updated_at', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    if (search) {
      // Basic ilike on title/content
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }
    const { data, error } = await query;
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    reportError(e);
    return { data: [], error: e };
  }
}

/**
 * PUBLIC_INTERFACE
 */
export async function getNote(id) {
  /** Get a single note by id */
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  try {
    const { data, error } = await supabase.from('notes').select('*').eq('id', id).single();
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    reportError(e);
    return { data: null, error: e };
  }
}

/**
 * PUBLIC_INTERFACE
 */
export async function createNote({ title = 'Untitled', content = '', userId = null }) {
  /** Create a new note; userId optional for anon mode */
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  try {
    const payload = { title, content };
    if (userId) payload.user_id = userId;
    const { data, error } = await supabase.from('notes').insert(payload).select().single();
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    reportError(e);
    return { data: null, error: e };
  }
}

/**
 * PUBLIC_INTERFACE
 */
export async function updateNote(id, { title, content }) {
  /** Update an existing note */
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  try {
    const { data, error } = await supabase
      .from('notes')
      .update({ title, content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return { data, error: null };
  } catch (e) {
    reportError(e);
    return { data: null, error: e };
  }
}

/**
 * PUBLIC_INTERFACE
 */
export async function deleteNote(id) {
  /** Delete a note by id */
  const supabase = getSupabase();
  if (!supabase) return { data: null, error: new Error('Supabase not configured') };
  try {
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (error) throw error;
    return { data: true, error: null };
  } catch (e) {
    reportError(e);
    return { data: null, error: e };
  }
}
