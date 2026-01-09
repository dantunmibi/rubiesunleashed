import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // 1. Extract Token
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];

    if (!token) {
        console.error("No token provided");
        return NextResponse.json({ error: "Unauthorized: No Token" }, { status: 401 });
    }

    // 2. Initialize Supabase with ANON KEY and set auth token in options
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        auth: { persistSession: false },
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      }
    );

    // 3. Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
        console.error("Auth Failed:", authError);
        return NextResponse.json({ error: "Invalid or expired token" }, { status: 403 });
    }

    console.log("Updating profile for user:", user.id);
    console.log("Update data:", body);

    // 4. UPDATE profile (not upsert - profile should already exist)
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update(body)
      .eq('id', user.id)
      .select();

    if (updateError) {
        console.error("Update Error:", updateError);
        return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log("Update result:", data);

    if (!data || data.length === 0) {
        console.error("No rows updated - profile may not exist");
        return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    console.error('API Error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}