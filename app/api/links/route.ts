import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  let client;
  try {
    console.log('Fetching all links...');
    client = await pool.connect();
    const result = await client.query(`
      SELECT code, original_url, clicks, last_clicked, created_at 
      FROM links 
      ORDER BY created_at DESC
    `);
    console.log('Links fetched successfully:', result.rows.length);
    
    return NextResponse.json(result.rows);
  } catch (error: any) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Failed to fetch links: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

export async function POST(request: Request) {
  let client;
  try {
    const body = await request.json();
    console.log('Received POST data:', body);
    
    const { url, customCode } = body;
    
    // Validate required fields
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }
    
    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }
    
    // Generate or validate code
    const code = customCode || generateRandomCode();
    if (!/^[A-Za-z0-9]{1,8}$/.test(code)) {
      return NextResponse.json(
        { error: 'Code must be 1-8 characters and contain only letters and numbers' },
        { status: 400 }
      );
    }
    
    client = await pool.connect();
    
    // Check if code already exists
    const existing = await client.query(
      'SELECT code FROM links WHERE code = $1',
      [code]
    );
    
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'This short code already exists' },
        { status: 409 }
      );
    }
    
    // Insert new link
    const result = await client.query(
      'INSERT INTO links (code, original_url) VALUES ($1, $2) RETURNING code, original_url, clicks, created_at',
      [code, url]
    );
    
    console.log('Link created successfully:', result.rows[0]);
    return NextResponse.json(result.rows[0], { status: 201 });
    
  } catch (error: any) {
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Failed to create link: ' + error.message },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}

function generateRandomCode(): string {
  return Math.random().toString(36).substring(2, 8);
}