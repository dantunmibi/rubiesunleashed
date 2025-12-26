import { NextResponse } from 'next/server';

export async function GET(request) {
  const BLOG_ID = 'rubyapks.blogspot.com';
  
  // Parse the query parameter "limit" from the URL
  const { searchParams } = new URL(request.url);
  // Default to 8 (Homepage size) if not specified, but allow up to 50
  const limit = searchParams.get('limit') || '8';
  
  try {
    const res = await fetch(`https://${BLOG_ID}/feeds/posts/default?alt=json&max-results=${limit}`, {
        next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!res.ok) {
        throw new Error(`Blogger API responded with ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "Failed to fetch games" }, { status: 500 });
  }
}