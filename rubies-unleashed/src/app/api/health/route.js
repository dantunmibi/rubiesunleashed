import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js'; // ✅ Use direct import

// ✅ Create client directly with your env vars
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for server-side
);

export async function GET() {
  const startTime = performance.now();
  const results = {};
  let overallStatus = 'operational';
  
  try {
    // Test 1: Database Core (profiles)
    try {
      const dbStart = performance.now();
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);
      
      const dbTime = Math.round(performance.now() - dbStart);
      
      if (dbError) throw new Error(`Database: ${dbError.message}`);
      
      results.database = {
        status: 'operational',
        responseTime: dbTime
      };
      
      // Use same result for related services
      results.projects_api = {
        status: 'operational',
        responseTime: dbTime
      };
      
      results.wishlist_api = {
        status: 'operational', 
        responseTime: dbTime
      };
      
    } catch (error) {
      results.database = {
        status: 'degraded',
        error: error.message
      };
      results.projects_api = {
        status: 'degraded',
        error: error.message
      };
      results.wishlist_api = {
        status: 'degraded',
        error: error.message
      };
      overallStatus = 'degraded';
    }
    
    // Test 2: Auth System
    try {
      const authStart = performance.now();
      const { error: authError } = await supabase.auth.getSession();
      
      const authTime = Math.round(performance.now() - authStart);
      
      if (authError) throw new Error(`Auth: ${authError.message}`);
      
      results.auth = {
        status: 'operational',
        responseTime: authTime
      };
    } catch (error) {
      results.auth = {
        status: 'degraded',
        error: error.message
      };
      overallStatus = 'degraded';
    }
    
    const totalTime = Math.round(performance.now() - startTime);
    
    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: totalTime,
      services: results
    });
    
  } catch (error) {
    return NextResponse.json({
      status: 'outage',
      error: error.message,
      timestamp: new Date().toISOString(),
      responseTime: Math.round(performance.now() - startTime)
    }, { status: 500 });
  }
}