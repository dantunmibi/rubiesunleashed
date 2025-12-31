import { NextResponse } from 'next/server';

export async function GET(request) {
  const BLOG_ID = 'rubyapks.blogspot.com';
  
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '500', 10);
  
  try {
    // ✅ FIX: Use actual limit, remove cache, add timestamp
    const timestamp = Date.now();
    const res = await fetch(
      `https://${BLOG_ID}/feeds/posts/default?alt=json&max-results=${limit}&_t=${timestamp}`,
      { 
        cache: 'no-store', // ✅ Disable Next.js cache
        next: { revalidate: 0 } // ✅ Disable ISR cache
      }
    );

    if (!res.ok) {
      throw new Error(`Blogger API responded with ${res.status}`);
    }

    const data = await res.json();
    
    // ✅ DEBUG: Log how many posts were actually fetched
    console.log(`✅ API Route: Fetched ${data.feed?.entry?.length || 0} posts (requested: ${limit})`);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}