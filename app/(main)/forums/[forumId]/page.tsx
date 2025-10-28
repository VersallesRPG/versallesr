// app/(main)/forums/[forumId]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// Server-side Data Fetching
import { getForumDetails } from '@/lib/api/forums'; // Busca nome, descrição do fórum
import { getForumThreads } from '@/lib/api/forumThreads'; // Busca tópicos paginados
import { getCurrentUser } from '@/lib/auth/server'; // Para verificar permissão de postar

// Components
import PaginationControls from '@/components/ui/PaginationControls'; // Componente de paginação
import UserAvatarMini from '@/components/ui/UserAvatarMini'; // Componente pequeno de avatar

// Types (Defina em @/types/index.ts)
import { ForumDetails, ForumThreadSummary, User } from '@/types'; // ForumThreadSummary: id, title, authorUsername, authorAvatarUrl, replyCount, lastPostTimestamp, lastPostUserUsername, isPinned, isLocked

interface ForumPageProps {
  params: {
    forumId: string;
  };
  searchParams?: { // Para paginação
    page?: string;
  };
}

// Metadata Dinâmica
export async function generateMetadata({ params }: ForumPageProps): Promise<Metadata> {
  try {
    const forumId = params.forumId;
    const forum = await getForumDetails(forumId);

    if (!forum) {
      return { title: 'Fórum Não Encontrado' };
    }

    return {
      title: forum.name,
      description: `Discussões em ${forum.name}. ${forum.description ?? ''}`,
    };
  } catch (error) {
    return { title: 'Erro ao Carregar Fórum' };
  }
}

// --- Componente Principal da Página (Server Component) ---
export default async function ForumPage({ params, searchParams }: ForumPageProps) {
  const forumId = params.forumId;
  const currentPage = parseInt(searchParams?.page || '1', 10);
  const itemsPerPage = 20; // Quantos tópicos por página

  // --- Buscar Dados Concorrentemente ---
  let forum: ForumDetails | null = null;
  let threadsResult: { threads: ForumThreadSummary[], totalPages: number } | null = null;
  let user: User | null = null;
  let fetchError: string | null = null;

  try {
    [forum, threadsResult, user] = await Promise.all([
      getForumDetails(forumId),
      getForumThreads(forumId, { page: currentPage, limit: itemsPerPage }),
      getCurrentUser(), // Verificar se usuário pode postar
    ]);

    if (!forum) {
      notFound(); // Fórum não existe
    }
  } catch (error: any) {
    console.error(`Erro ao carregar fórum ${forumId} ou seus tópicos:`, error);
    fetchError = `Não foi possível carregar o fórum ou seus tópicos: ${error.message || 'Erro desconhecido'}`;
    if (!forum) notFound(); // Erro fatal se nem o fórum carregou
  }

  const threads = threadsResult?.threads ?? [];
  const totalPages = threadsResult?.totalPages ?? 1;

  // Função helper para formatar datas (pode ir para lib/utils)
  const formatRelativeDate = (date: Date | string | undefined): string => {
    if (!date) return '-';
    // Implementação básica, use 'date-fns' ou 'dayjs' para algo mais robusto
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInHours < 24) return `${diffInHours}h atrás`;
    if (diffInDays < 7) return `${diffInDays}d atrás`;
    return past.toLocaleDateString('pt-BR');
  };

  return (
    // Container principal
    <div className="forum-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header do Fórum e Breadcrumbs */}
      <header className="mb-8">
         {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-4 text-sm font-light text-gray-whisper">
          <ol className="list-none p-0 inline-flex">
            <li className="flex items-center">
              <Link href="/forums" className="hover:text-vintage-gold">Fóruns</Link>
              <svg className="fill-current w-3 h-3 mx-2 text-gray-whisper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"></path></svg>
            </li>
            <li className="flex items-center">
              <span className="text-bone-white">{forum?.name ?? 'Carregando...'}</span>
            </li>
          </ol>
        </nav>

        {/* Título e Botão Novo Tópico */}
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="font-title text-3xl sm:text-4xl text-vintage-gold">{forum?.name ?? 'Carregando...'}</h1>
            {forum?.description && <p className="text-base font-light text-gray-whisper mt-1">{forum.description}</p>}
          </div>
          {user && ( // Só mostra botão se logado
            <Link
              href={`/forums/${forumId}/create-thread`}
              className="inline-block px-5 py-2 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-sm transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md whitespace-nowrap"
            >
              Novo Tópico
            </Link>
          )}
        </div>
      </header>

      {/* Mensagem de Erro */}
      {fetchError && (
        <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {fetchError}
        </div>
      )}

      {/* Tabela/Lista de Tópicos */}
      {!fetchError && (
        <div className="forum-threads-list bg-transparent-dark border border-gold-glow/30 rounded-lg overflow-hidden shadow-lg backdrop-blur-10">
          {threads.length === 0 ? (
            <p className="text-center font-light text-gray-whisper text-lg py-16">
              Nenhum tópico foi criado neste fórum ainda. {user ? 'Seja o primeiro!' : ''}
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gold-glow/20">
              <thead className="bg-slate-blue/10 hidden md:table-header-group">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-whisper uppercase tracking-wider font-title">
                    Tópico
                  </th>
                  <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-whisper uppercase tracking-wider font-title w-24">
                    Respostas
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-whisper uppercase tracking-wider font-title w-48">
                    Última Resposta
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-glow/20">
                {threads.map((thread) => (
                  <tr key={thread.id} className="hover:bg-vintage-gold/5 transition-colors duration-150">
                    {/* Coluna Tópico (com avatar e autor) */}
                    <td className="px-4 py-4 md:px-6 align-top md:align-middle">
                      <div className="flex items-start md:items-center">
                        <div className="flex-shrink-0 mr-3 hidden sm:block">
                           <UserAvatarMini user={{ username: thread.authorUsername, avatarUrl: thread.authorAvatarUrl }} />
                        </div>
                        <div className="flex-grow overflow-hidden">
                          <Link href={`/forums/threads/${thread.id}`} className="text-sm font-semibold text-bone-white hover:text-vintage-gold line-clamp-2 break-words">
                            {thread.isPinned && <PinnedIcon />} {/* Ícone Pin */}
                            {thread.title}
                          </Link>
                          <div className="text-xs font-light text-gray-whisper mt-1">
                            por{' '}
                            <Link href={`/profile/${thread.authorUsername}`} className="hover:text-vintage-gold hover:underline">
                              {thread.authorUsername}
                            </Link>
                            {/* , {formatRelativeDate(thread.createdAt)} Opcional: data de criação */}
                          </div>
                        </div>
                      </div>
                    </td>
                    {/* Coluna Respostas */}
                    <td className="px-4 py-4 md:px-6 text-center text-sm text-gray-whisper align-top md:align-middle">
                       <span className="md:hidden text-xs text-gray-whisper/70 block">Respostas: </span>
                       {thread.replyCount ?? 0}
                    </td>
                    {/* Coluna Última Resposta */}
                    <td className="px-4 py-4 md:px-6 text-xs text-gray-whisper align-top md:align-middle whitespace-nowrap">
                      <span className="md:hidden text-xs text-gray-whisper/70 block">Última: </span>
                      {thread.lastPostTimestamp ? (
                        <>
                          <Link href={`/profile/${thread.lastPostUserUsername}`} className="hover:text-vintage-gold hover:underline">
                             {thread.lastPostUserUsername}
                          </Link>
                          <br />
                          {formatRelativeDate(thread.lastPostTimestamp)}
                        </>
                      ) : (
                        '-'
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

       {/* Controles de Paginação */}
       {!fetchError && threads.length > 0 && totalPages > 1 && (
            <PaginationControls
                currentPage={currentPage}
                totalPages={totalPages}
                baseUrl={`/forums/${forumId}`} // Base da URL para os links de página
            />
       )}

    </div>
  );
}