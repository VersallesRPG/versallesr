// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession, SessionData } from 'iron-session';
import { sessionOptions, SessionUser } from '@/lib/auth'; // Importaremos as opções e tipo da sessão

// Defina as rotas que NÃO exigem login
const publicPaths = [
  '/', // Homepage pode ser pública ou não, ajuste conforme necessário
  '/login',
  '/register',
  '/about',
  '/terms',
  '/privacy',
  '/faq',
  '/ogl',
  '/updates',
  '/library', // Biblioteca oficial
  '/store', // Permitir ver a loja sem login
  // '/store/:slug*', // Permitir ver produtos específicos sem login (use regex no matcher)
  '/api/auth/session', // API para criar sessão precisa ser pública
  '/api/users', // API para criar usuário precisa ser pública
  // Adicione outras rotas públicas aqui (ex: /api/products, /api/workshop/items públicos)
];

// Defina as rotas que SÓ devem ser acessadas por usuários NÃO logados
const authPaths = ['/login', '/register'];

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const session = await getIronSession<SessionUser>(request, response, sessionOptions);

  const { user } = session;
  const { pathname } = request.nextUrl;

  const isPublicPath = publicPaths.some((path) => {
    // Trata rotas dinâmicas básicas (ex: /store/[slug])
    if (path.includes(':')) {
      const regex = new RegExp(`^${path.replace(/:\w+\*/, '.*')}$`);
      return regex.test(pathname);
    }
    return pathname === path || (path !== '/' && pathname.startsWith(path + '/'));
  });

  const isAuthPath = authPaths.includes(pathname);

  // --- Lógica de Redirecionamento ---

  // 1. Se o usuário ESTÁ logado e tenta acessar uma página de autenticação (login/register)
  if (user && isAuthPath) {
    // Redireciona para a homepage ou dashboard principal
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 2. Se o usuário NÃO ESTÁ logado e tenta acessar uma página protegida
  if (!user && !isPublicPath && !isAuthPath) {
    // Redireciona para a página de login, guardando a URL que ele tentou acessar
    const loginUrl = new URL('/login', request.url);
    // loginUrl.searchParams.set('redirect_to', pathname); // Opcional: para redirecionar de volta após login
    return NextResponse.redirect(loginUrl);
  }

  // 3. Em todos os outros casos (logado em página protegida, não logado em pública), permite continuar
  // Inclui salvar a sessão se ela foi modificada (ex: atualizada)
  await session.save();
  return response;
}

// === Configuração do Middleware ===
export const config = {
  /*
   * O Matcher define quais rotas passarão por este middleware.
   * Evita rodar em arquivos estáticos (_next/static, _next/image, favicon.ico)
   * e geralmente em rotas de API (a menos que a API precise da sessão via middleware).
   * A regex negativa '?!' exclui os padrões listados.
   */
  matcher: ['/((?!api/webhooks|_next/static|_next/image|favicon.ico|img/).*)'],
};