import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

interface RouteParams {
  params: {
    code: string;
  };
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  let client;
  try {
    // Await the params to get the code
    const params = await context.params;
    const { code } = params;
    
    console.log('🔍 Attempting to delete link with code:', code);
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      );
    }
    
    client = await pool.connect();
    
    // First, check if the link exists
    const checkResult = await client.query(
      'SELECT code FROM links WHERE code = $1',
      [code]
    );
    
    console.log('📊 Links found:', checkResult.rows);
    
    if (checkResult.rows.length === 0) {
      console.log('❌ Link not found in database');
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    // Delete the link
    const deleteResult = await client.query(
      'DELETE FROM links WHERE code = $1 RETURNING code',
      [code]
    );
    
    console.log('✅ Successfully deleted:', deleteResult.rows[0]);
    
    return NextResponse.json({ 
      success: true,
      deleted: deleteResult.rows[0] 
    });
    
  } catch (error: any) {
    console.error('❌ Error deleting link:', error);
    return NextResponse.json(
      { error: 'Failed to delete link: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
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
    
    if (!code) {
      return NextResponse.json(
        { error: 'Code parameter is required' },
        { status: 400 }
      );
    }
    
    client = await pool.connect();
    const result = await client.query(
      'SELECT code, original_url, clicks, last_clicked, created_at FROM links WHERE code = $1',
      [code]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Failed to fetch link' },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}