import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: !!process.env.DATABASE_URL,
        auth: !!process.env.BETTER_AUTH_SECRET,
        google: !!process.env.GOOGLE_CLIENT_ID,
        github: !!process.env.GITHUB_CLIENT_ID,
      },
      urls: {
        authUrl: process.env.BETTER_AUTH_URL,
      }
    }

    return NextResponse.json(health)
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
