// app/(main)/forums/threads/[threadId]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';

// Server-side Data Fetching
import { getThreadDetails } from '@/lib/api/forumThreads'; // Busca detalhes do tópico (título, autor, forumId, forumName)
import { getThreadPosts } from '@/lib/api/forumPosts';    // Busca posts paginados
import { getCurrentUser } from '@/lib/auth/server';     // Verifica usuário logado

// Client Components (precisam ser criados)
import PostListClient from '@/components/forums/PostListClient';
import ReplyFormClient from '@/components/forums/ReplyFormClient';
import PaginationControls from '@/components/ui/PaginationControls'; // Reutilizar

// Types (Defina em @/types/index.ts)
import { ForumThreadDetails, ForumPost, User } from '@/types'; // ForumThreadDetails: id, title, authorUsername, authorAvatarUrl, createdAt, forumId, forumName, isLocked, isPinned etc. ForumPost: id, authorUsername, authorAvatarUrl, content, createdAt, editedAt etc.

interface ThreadPageProps {
  params: {
    threadId: string;
  };
  searchParams?: { // Para paginação de posts
    page?: string;
  };
}

// Metadata Dinâmica
export async function generateMetadata({ params }: ThreadPageProps): Promise<Metadata> {
  try {
    const threadId = params.threadId;
    const thread = await getThreadDetails(threadId); // Busca básica

    if (!thread) {
      return { title: 'Tópico Não Encontrado' };
    }

    return {
      title: thread.title,
      description: `Discussão sobre "${thread.title}" no fórum ${thread.forumName}.`,
    };
  } catch (error) {
    return { title: 'Erro ao Carregar Tópico' };
  }
}

// --- Componente Principal da Página (Server Component) ---
export default async function ThreadPage({ params, searchParams }: ThreadPageProps) {
  const threadId = params.threadId;
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const postsPerPage = 15; // Quantos posts por página

  // --- Buscar Dados Concorrentemente ---
  let thread: ForumThreadDetails | null = null;
  let postsResult: { posts: ForumPost[], totalPages: number } | null = null;
  let user: User | null = null;
  let fetchError: string | null = null;

  try {
    [thread, postsResult, user] = await Promise.all([
      getThreadDetails(threadId),
      getThreadPosts(threadId, { page: currentPage, limit: postsPerPage }),
      getCurrentUser(),
    ]);

    if (!thread) {
      notFound(); // Tópico não existe
    }
  } catch (error: any) {
    console.error(`Erro ao carregar tópico ${threadId} ou seus posts:`, error);
    fetchError = `Não foi possível carregar o tópico ou suas postagens: ${error.message || 'Erro desconhecido'}`;
    if (!thread) notFound(); // Erro fatal
  }

  const initialPosts = postsResult?.posts ?? [];
  const totalPages = postsResult?.totalPages ?? 1;

  return (
    // Container principal
    <div className="thread-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
       {/* Header com Breadcrumbs e Título */}
       <header className="mb-8">
           {/* Breadcrumbs */}
           <nav aria-label="Breadcrumb" className="mb-4 text-sm font-light text-gray-whisper">
             <ol className="list-none p-0 inline-flex">
               <li className="flex items-center">
                 <Link href="/forums" className="hover:text-vintage-gold">Fóruns</Link>
                 <svg className="fill-current w-3 h-3 mx-2 text-gray-whisper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"></path></svg>
               </li>
               <li className="flex items-center">
                 <Link href={`/forums/${thread?.forumId}`} className="hover:text-vintage-gold">{thread?.forumName ?? 'Fórum'}</Link>
                 <svg className="fill-current w-3 h-3 mx-2 text-gray-whisper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"></path></svg>
               </li>
               <li className="flex items-center">
                 <span className="text-bone-white line-clamp-1">{thread?.title ?? 'Carregando...'}</span>
               </li>
             </ol>
           </nav>
           {/* Título */}
           <h1 className="font-title text-3xl sm:text-4xl text-vintage-gold break-words">
              {thread?.title ?? 'Carregando Tópico...'}
           </h1>
            {/* Opcional: Autor e Data */}
            {thread && (
                <p className="text-sm font-light text-gray-whisper mt-1">
                    Iniciado por{' '}
                    <Link href={`/profile/${thread.authorUsername}`} className="hover:text-vintage-gold hover:underline">
                        {thread.authorUsername}
                    </Link>
                    {thread.createdAt && ` em ${new Date(thread.createdAt).toLocaleDateString('pt-BR')}`}
                </p>
            )}
           {/* Opcional: Botões de Ação (Ex: Subscrever, Trancar/Fixar para Mods) */}
       </header>

       {/* Mensagem de Erro */}
       {fetchError && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
             {fetchError} - Algumas postagens podem não ter sido carregadas.
          </div>
       )}

        {/* Lista de Posts (Client Component) */}
        {thread && (
            <PostListClient
                threadId={threadId}
                initialPosts={initialPosts}
                initialPage={currentPage}
                postsPerPage={postsPerPage}
                totalPages={totalPages}
                currentUser={user} // Passa usuário logado para permissões (editar/deletar)
                isLocked={thread.isLocked ?? false} // Passa status de trancado
            />
        )}

       {/* Formulário de Resposta (Client Component) */}
       {user && thread && !thread.isLocked && ( // Só mostra se logado e tópico não trancado
          <ReplyFormClient threadId={threadId} currentUser={user} />
       )}
       {!user && thread && !thread.isLocked && ( // Mensagem para não logado
          <div className="mt-8 p-6 bg-transparent-dark border border-gold-glow/30 rounded-lg text-center backdrop-blur-10">
              <p className="text-gray-whisper">
                  Você precisa{' '}
                  <Link href={`/login?redirect_to=/forums/threads/${threadId}`} className="text-vintage-gold hover:underline font-semibold">entrar</Link>
                  {' '}ou{' '}
                  <Link href={`/register?redirect_to=/forums/threads/${threadId}`} className="text-vintage-gold hover:underline font-semibold">se registrar</Link>
                  {' '}para responder a este tópico.
              </p>
          </div>
       )}
        {thread?.isLocked && ( // Mensagem se trancado
          <div className="mt-8 p-6 bg-slate-blue/20 border border-slate-blue/50 rounded-lg text-center">
              <p className="text-gray-whisper font-semibold">Este tópico está trancado. Não é possível adicionar novas respostas.</p>
          </div>
        )}

    </div>
  );
}