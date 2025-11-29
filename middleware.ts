import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export default async function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const isBoRoute = pathname.startsWith("/bo")

    if (isBoRoute) {
        // Check for NextAuth session cookie (authjs.session-token or next-auth.session-token)
        const sessionToken = 
            req.cookies.get("authjs.session-token")?.value ||
            req.cookies.get("__Secure-authjs.session-token")?.value ||
            req.cookies.get("next-auth.session-token")?.value ||
            req.cookies.get("__Secure-next-auth.session-token")?.value

        if (!sessionToken) {
            return NextResponse.redirect(new URL("/login", req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/bo/:path*"],
}
