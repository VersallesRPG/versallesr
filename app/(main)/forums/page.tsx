// app/(main)/forums/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

// Server-side Data Fetching
import { getForumCategoriesAndForums } from '@/lib/api/forums'; // Implemente esta função

// Types (Defina em @/types/index.ts)
import { ForumCategoryWithForums } from '@/types'; // Tipo que agrupa categorias com seus fóruns

export const metadata: Metadata = {
  title: 'Fóruns da Comunidade',
  description: 'Participe das discussões, tire dúvidas e compartilhe ideias com outros aventureiros.',
};

// --- Ícones (Exemplo - Substitua por SVGs ou uma biblioteca de ícones) ---
const ForumIcon = () => <svg className="w-5 h-5 mr-2 text-slate-blue group-hover:text-vintage-gold" fill="currentColor" viewBox="0 0 20 20"><path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z"></path><path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z"></path></svg>;
const PinnedIcon = () => <svg className="w-4 h-4 text-vintage-gold ml-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L3.707 10.707a1 1 0 01-1.414-1.414l6-6z" clipRule="evenodd"></path></svg>; // Exemplo


export default async function ForumsPage() {
  // --- Buscar Dados ---
  let forumCategories: ForumCategoryWithForums[] = [];
  let fetchError: string | null = null;

  try {
    forumCategories = await getForumCategoriesAndForums();
  } catch (error: any) {
    console.error("Erro ao buscar fóruns:", error);
    fetchError = `Não foi possível carregar os fóruns: ${error.message || 'Erro desconhecido'}`;
  }

  return (
    // Container principal (similar a outras páginas)
    <div className="forums-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header da página */}
      <header className="page-header text-center mb-12">
        <h1 className="page-title font-epic text-4xl sm:text-5xl lg:text-6xl text-vintage-gold text-shadow-gold-glow">
          Fóruns da Comunidade
        </h1>
        <p className="page-subtitle text-lg font-light text-gray-whisper mt-2">
          Conecte-se, discuta e compartilhe suas experiências no universo Versalles.
        </p>
        {/* Opcional: Barra de busca ou botão "Novo Tópico" global */}
        {/* <div className="mt-6"> ... </div> */}
      </header>

      {/* Mensagem de Erro */}
      {fetchError && (
        <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {fetchError}
        </div>
      )}

      {/* Listagem de Fóruns por Categoria */}
      {!fetchError && forumCategories.length === 0 && (
          <p className="text-center font-light text-gray-whisper text-lg py-10">
              Nenhum fórum encontrado. Volte em breve!
          </p>
      )}

      {!fetchError && forumCategories.length > 0 && (
        <div className="space-y-10">
          {forumCategories.map((category) => (
            <section key={category.id} className="forum-category bg-transparent-dark border border-gold-glow/30 rounded-lg overflow-hidden shadow-lg backdrop-blur-10">
              {/* Cabeçalho da Categoria */}
              <header className="category-header bg-gradient-to-r from-slate-blue/30 to-transparent p-4 border-b border-gold-glow/30">
                <h2 className="font-title text-xl text-vintage-gold">{category.name}</h2>
                {category.description && <p className="text-sm font-light text-gray-whisper mt-1">{category.description}</p>}
              </header>

              {/* Lista de Fóruns na Categoria */}
              <ul className="forum-list divide-y divide-gold-glow/20">
                {category.forums.map((forum) => (
                  <li key={forum.id} className="forum-item group hover:bg-vintage-gold/5 transition-colors duration-200">
                    <Link href={`/forums/${forum.id}`} className="flex items-center justify-between p-4 ">
                      <div className="flex items-center">
                         <ForumIcon />
                        <div>
                          <h3 className="font-semibold text-bone-white group-hover:text-vintage-gold">{forum.name}</h3>
                          {forum.description && <p className="text-sm font-light text-gray-whisper line-clamp-1">{forum.description}</p>}
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-whisper flex-shrink-0 ml-4">
                        <p>{forum.threadCount ?? 0} Tópicos</p>
                        <p>{forum.postCount ?? 0} Posts</p>
                        {/* Opcional: Último Post */}
                        {/* {forum.lastPost && <p className="text-xs mt-1">Último: {forum.lastPost.title} por @{forum.lastPost.username}</p>} */}
                      </div>
                    </Link>
                  </li>
                ))}
                {category.forums.length === 0 && (
                    <li className="p-4 text-center text-sm font-light text-gray-whisper">Nenhum fórum nesta categoria.</li>
                )}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}