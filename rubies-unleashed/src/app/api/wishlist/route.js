import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, game_id } = body; // IGNORE user_id from body, get it from token
    
    // 1. Extract Token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        return NextResponse.json({ error: "Unauthorized: No Token" }, { status: 401 });
    }

    // 2. Initialize Supabase with ANON KEY + USER TOKEN
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        global: { headers: { Authorization: `Bearer ${token}` } }, // 👈 RESTORE THIS
        auth: { persistSession: false }
      }
    );

    // Then use getUser() without arguments, relying on the header
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
        console.error("Auth Failed:", authError);
        return NextResponse.json({ error: "Invalid Token" }, { status: 403 });
    }

    const user_id = user.id; // Safe ID

    let error = null;

    // 4. Perform Action
    if (action === 'add') {
        const { data, error: insertError } = await supabase
            .from('wishlists')
            .insert({ user_id, game_id: String(game_id) })
            .select(); // Optional debug
        error = insertError;
    } 
    else if (action === 'remove') {
        const { error: deleteError } = await supabase
            .from('wishlists')
            .delete()
            .eq('user_id', user_id)
            .eq('game_id', String(game_id));
        error = deleteError;
    }

    if (error) {
        console.error("DB Error:", error);
        throw error;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}