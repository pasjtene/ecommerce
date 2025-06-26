// middleware.ts
import { NextRequest } from 'next/server'

const locales = ['en', 'fr', 'es']

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const pathMissingLocale = locales.every(
    (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
  )

  if (pathMissingLocale) {
    const locale = 'en' // Default or detect from headers
    return Response.redirect(
      new URL(`/${locale}${pathname}`, request.url)
    )
  }
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
}