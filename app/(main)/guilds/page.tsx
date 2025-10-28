// app/(main)/guilds/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// Server-side Data Fetching
import { getPublicGuilds } from '@/lib/api/guilds'; // Implemente esta função
import { getCurrentUser } from '@/lib/auth/server'; // Para o botão "Criar Guilda"

// Components
import GuildCard from '@/components/guilds/GuildCard'; // Componente para exibir cada guilda

// Types (Defina em @/types/index.ts)
import { GuildSummary, User } from '@/types'; // GuildSummary: id, name, tag, memberCount, avatarUrl, description(short)

export const metadata: Metadata = {
  title: 'Guildas',
  description: 'Encontre ou crie sua guilda e junte-se a outros aventureiros em Versalles RPG.',
};

export default async function GuildsPage() {
  // --- Buscar Dados ---
  let guilds: GuildSummary[] = [];
  let fetchError: string | null = null;
  let user: User | null = null;

  try {
    // Buscar guildas públicas (com paginação/limite se necessário) e usuário logado
    [guilds, user] = await Promise.all([
        getPublicGuilds({ page: 1, limit: 20 }), // Exemplo: Pega as 20 primeiras
        getCurrentUser()
    ]);
  } catch (error: any) {
    console.error("Erro ao buscar guildas:", error);
    fetchError = `Não foi possível carregar as guildas: ${error.message || 'Erro desconhecido'}`;
  }

  return (
    // Container principal
    <div className="guilds-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header da página */}
      <header className="page-header text-center mb-12">
        <h1 className="page-title font-epic text-4xl sm:text-5xl lg:text-6xl text-vintage-gold text-shadow-gold-glow">
          Guildas de Versalles
        </h1>
        <p className="page-subtitle text-lg font-light text-gray-whisper mt-2">
          Encontre seu clã, forje alianças e deixe sua marca no universo.
        </p>
      </header>

      {/* Barra de Ação (Busca + Criar Guilda) */}
      <div className="guilds-action-bar flex flex-wrap justify-between items-center gap-4 mb-12 p-4 bg-transparent-dark border border-gold-glow/30 rounded-lg">
         {/* TODO: Implementar Busca/Filtro (Pode ser Client Component ou Server com searchParams) */}
        <div className="search-group relative flex-grow min-w-[250px]">
             <label htmlFor="guild-search" className="sr-only">Buscar guildas...</label>
             <input
                 type="text"
                 id="guild-search"
                 name="search"
                 placeholder="Buscar guildas por nome ou tag..."
                 className="w-full bg-transparent border border-gray-whisper/30 rounded-lg py-2 px-4 text-sm text-bone-white placeholder-gray-whisper/50 focus:border-vintage-gold focus:outline-none"
             />
             {/* Ícone de busca */}
             <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-whisper hover:text-vintage-gold">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
             </button>
         </div>

         {user && ( // Só mostra botão se logado
            <Link
                href="/guilds/create"
                className="create-guild-button flex-shrink-0 px-5 py-2 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-sm whitespace-nowrap transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md"
            >
                Criar Guilda
            </Link>
         )}
      </div>

      {/* Mensagem de Erro */}
      {fetchError && (
        <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {fetchError}
        </div>
      )}

      {/* Grid de Guildas */}
      {!fetchError && (
        guilds.length === 0 ? (
          <p className="text-center font-light text-gray-whisper text-lg py-16">
            Nenhuma guilda encontrada. Que tal{' '}
            {user ? (
                <Link href="/guilds/create" className="font-semibold text-vintage-gold hover:underline">
                    criar a primeira
                </Link>
             ) : (
                'ser o primeiro a criar uma quando estiver logado'
             )}?
          </p>
        ) : (
          <div className="guilds-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {guilds.map((guild) => (
              <GuildCard key={guild.id} guild={guild} />
            ))}
          </div>
        )
      )}

      {/* TODO: Adicionar Paginação se houver muitas guildas */}

    </div>
  );
}