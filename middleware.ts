import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Rotas públicas - não precisam de autenticação
  const publicRoutes = ['/login', '/auth/callback', '/invite'];
  const isPublicRoute = publicRoutes.some(route => 
    request.nextUrl.pathname.startsWith(route)
  );

  // Permitir acesso a rotas públicas
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Para outras rotas, a verificação de autenticação será feita no componente
  // usando o AuthContext, que verifica o localStorage
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

