// middleware.ts
import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'fr', 'es']
const defaultLocale = 'en'

export function middleware(request: NextRequest) {
  // 1. Check if the request already has a locale
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  
  if (pathnameHasLocale) return

  // 2. Check cookie for language preference
  const cookieLang = request.cookies.get('NEXT_LOCALE')?.value
  
  if (cookieLang && locales.includes(cookieLang)) {
    request.nextUrl.pathname = `/${cookieLang}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  // 3. Check Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  if (acceptLanguage) {
    const preferredLang = acceptLanguage.split(',')[0].split('-')[0]
    if (locales.includes(preferredLang)) {
      request.nextUrl.pathname = `/${preferredLang}${pathname}`
      return NextResponse.redirect(request.nextUrl)
    }
  }

  // 4. Fall back to default locale
  request.nextUrl.pathname = `/${defaultLocale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|images).*)'],
}