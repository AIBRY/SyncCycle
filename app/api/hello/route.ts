import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: "Hello from the Next.js Node backend!",
    timestamp: new Date().toISOString() 
  });
}