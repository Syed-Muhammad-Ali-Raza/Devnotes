import { revalidatePath } from 'next/cache'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { paths, token } = await request.json()

    // Optional token validation
    const secretToken = process.env.REVALIDATION_SECRET
    if (secretToken && token !== secretToken) {
      return NextResponse.json({ error: 'Unauthorized token' }, { status: 401 })
    }

    if (paths && Array.isArray(paths)) {
      paths.forEach((path) => {
        revalidatePath(path)
      })
      return NextResponse.json({ revalidated: true, now: Date.now() })
    }

    return NextResponse.json({ error: 'Paths must be an array' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
