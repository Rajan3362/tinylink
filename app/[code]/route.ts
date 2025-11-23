import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface RouteParams {
  params: {
    code: string;
  };
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  let client;
  try {
    // Await the params to get the code
    const params = await context.params;
    const { code } = params;
    
    console.log('🔗 Redirect attempt for code:', code);
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      );
    }
    
    client = await pool.connect();
    
    // Find the link and update click count
    const result = await client.query(
      'SELECT original_url FROM links WHERE code = $1',
      [code]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    const originalUrl = result.rows[0].original_url;
    
    // Update click count and last_clicked
    await client.query(
      'UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1',
      [code]
    );
    
    console.log('✅ Redirecting to:', originalUrl);
    
    // Perform redirect
    return NextResponse.redirect(originalUrl);
    
  } catch (error: any) {
    console.error('❌ Error redirecting:', error);
    return NextResponse.json(
      { error: 'Failed to redirect' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}