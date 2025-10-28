// lib/auth.ts
import type { IronSessionOptions } from 'iron-session';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers'; // Para usar getIronSession em Server Components/API Routes
import { User } from '@/types'; // Importe seu tipo User completo do MongoDB
import { getUserById } from './api/users'; // Função hipotética para buscar user pelo ID no DB

// --- 1. Definição da Estrutura da Sessão ---
// Define os dados mínimos que queremos armazenar diretamente no cookie de sessão.
// Mantenha isso o mais leve possível por segurança e performance.
export interface SessionData {
  userId?: string; // Armazena apenas o ID do nosso banco de dados MongoDB
  isLoggedIn: boolean;
  // Não armazene dados sensíveis ou que mudam frequentemente aqui.
}

// --- 2. Configuração do Iron Session ---
// (Referência implícita à configuração usada lá)
export const sessionOptions: IronSessionOptions = {
  // Senha secreta para criptografar o cookie. DEVE ter pelo menos 32 caracteres.
  // Lida do .env.local
  password: process.env.SESSION_SECRET as string,
  cookieName: 'versalles-session', // Nome do cookie que será armazenado no navegador
  cookieOptions: {
    // secure: true em produção (HTTPS), false em desenvolvimento (HTTP)
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true, // Impede acesso ao cookie via JavaScript no cliente (XSS protection)
    sameSite: 'lax', // Proteção contra CSRF
    // path: '/', // Padrão é '/', aplica a todo o site
    // maxAge: undefined, // undefined = Cookie de sessão (expira quando o navegador fecha)
    // Se quiser que a sessão persista (ex: 7 dias):
    // maxAge: 60 * 60 * 24 * 7,
  },
};

// --- 3. Declaração de Módulo para Tipagem ---
// Isso informa ao TypeScript sobre a estrutura `session.user` que usaremos.
// Ajuste a interface `IronSessionData` para corresponder à sua estrutura `SessionData`.
declare module 'iron-session' {
  interface IronSessionData {
    user?: SessionData; // Informa que a sessão pode ter uma chave 'user' com a estrutura SessionData
  }
}

// --- 4. Função Auxiliar Server-Side para Obter Usuário Logado ---
/**
 * Obtém os dados completos do usuário logado no contexto de Server Components,
 * API Routes ou getServerSideProps (se usar Pages Router).
 * Retorna os dados do usuário do banco de dados ou null se não estiver logado.
 */
export async function getCurrentUser(): Promise<User | null> {
  // 1. Tenta obter a sessão a partir dos cookies da requisição atual
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  // 2. Verifica se o usuário está logado e se temos o ID
  if (!session.user?.isLoggedIn || !session.user?.userId) {
    return null; // Não está logado ou sessão inválida
  }

  // 3. Busca os dados completos e atualizados do usuário no banco de dados
  try {
    const user = await getUserById(session.user.userId); // Função que busca no MongoDB
    if (!user) {
        // Usuário existia na sessão mas não mais no DB? Limpa a sessão.
        session.destroy();
        await session.save();
        console.warn(`User ID ${session.user.userId} found in session but not in DB. Session destroyed.`);
        return null;
    }
    // Retorna o objeto User completo (sem a senha, claro)
    // Certifique-se que getUserById retorne o tipo User definido em @/types
    return user as User;
  } catch (error) {
    console.error("Error fetching current user from DB:", error);
    // Em caso de erro ao buscar no DB, consideramos como não logado por segurança
    return null;
  }
}

// --- 5. Função Auxiliar Server-Side para Obter Dados da Sessão (se necessário) ---
/**
 * Obtém apenas os dados armazenados diretamente na sessão (userId, isLoggedIn).
 * Mais rápido que getCurrentUser se você só precisa verificar o login ou pegar o ID.
 */
export async function getSessionData(): Promise<SessionData | null> {
    const session = await getIronSession<SessionData>(cookies(), sessionOptions);
    if (!session.user?.isLoggedIn) {
        return null;
    }
    return session.user;
}