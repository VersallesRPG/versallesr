// app/(main)/workshop/items/[itemId]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// Server-side utilities & Data Fetching
import { getWorkshopItemDetails } from '@/lib/api/workshop'; // Implemente esta função
import { getWorkshopItemComments } from '@/lib/api/comments'; // Implemente esta função (exemplo)
// import { getWorkshopItemRatings } from '@/lib/api/ratings'; // Implemente esta função (exemplo)
import { getCurrentUser } from '@/lib/auth/server';

// Client Components (Você precisará criá-los)
import WorkshopItemActions from '@/components/workshop/WorkshopItemActionsClient';
import WorkshopItemRating from '@/components/workshop/WorkshopItemRatingClient';
import WorkshopItemComments from '@/components/workshop/WorkshopItemCommentsClient';
import ProfileWidget from '@/components/profile/ProfileWidget'; // Reutilizar

// Types (Defina em @/types/index.ts)
import { WorkshopItemDetails, Comment, User } from '@/types'; // WorkshopItemDetails com TUDO (descrição, arquivos, criador, etc.)

interface WorkshopItemPageProps {
  params: {
    itemId: string; // O ID do item virá da URL
  };
}

// Metadata Dinâmica
export async function generateMetadata({ params }: WorkshopItemPageProps): Promise<Metadata> {
  try {
    const itemId = params.itemId;
    const item = await getWorkshopItemDetails(itemId); // Busca básica

    if (!item) {
      return { title: 'Criação Não Encontrada' };
    }

    return {
      title: item.title,
      description: `Detalhes da criação "${item.title}" por ${item.authorUsername} na Oficina Versalles. ${item.description?.substring(0, 150) ?? ''}`,
    };
  } catch (error) {
     return { title: 'Erro ao Carregar Criação' };
  }
}

// --- Componente Principal da Página (Server Component) ---
export default async function WorkshopItemPage({ params }: WorkshopItemPageProps) {
  const itemId = params.itemId;

  // --- Buscar Dados Concorrentemente ---
  let item: WorkshopItemDetails | null = null;
  let comments: Comment[] = [];
  let user: User | null = null;
  let fetchError: string | null = null;
  // TODO: Buscar rating médio e rating do usuário logado

  try {
    [item, comments, user] = await Promise.all([
      getWorkshopItemDetails(itemId),
      getWorkshopItemComments(itemId, { limit: 10, page: 1 }), // Ex: Pega os 10 primeiros comentários
      getCurrentUser(),
    ]);

    if (!item) {
      notFound(); // Item não encontrado
    }

     // Placeholder de Comentários (apenas para exemplo, remova se buscar do DB)
     if (comments.length === 0) {
        comments = [
            { id: 'c1', userId: 'u1', username: 'Tester1', avatarUrl: null, content: 'Parece promissor! Vou testar na minha próxima sessão.', createdAt: new Date(Date.now() - 3600000), editedAt: null },
            { id: 'c2', userId: 'u2', username: 'MestreDasSombras', avatarUrl: null, content: 'Ótima adição! Faltava algo assim para o sistema X.', createdAt: new Date(Date.now() - 7200000), editedAt: null },
        ];
        // item.commentCount = item.commentCount || comments.length; // Ajustar contagem se necessário
     }


  } catch (error: any) {
    console.error("Erro ao carregar detalhes do item da Oficina:", error);
    fetchError = `Não foi possível carregar esta criação: ${error.message || 'Erro desconhecido'}`;
    if (!item) notFound(); // Erro fatal se nem o item básico carregou
  }

  // --- Preparar Dados ---
  const previewImageUrl = item?.previewImageUrl || 'https://placehold.co/1200x675/0a0f1e/E8C468?text=Preview'; // 16:9 Placeholder
  const formattedDescription = item?.description?.replace(/\n/g, '<br />') || 'Descrição não disponível.';
  // Placeholder - buscar/calcular dados reais
  const averageRating = item?.averageRating ?? 4.5;
  const ratingCount = item?.ratingCount ?? 25;
  const downloads = item?.downloads ?? 150;
  const formattedPrice = item?.price ? `R$ ${item.price.toFixed(2).replace('.', ',')}` : 'Gratuito';

  return (
    // Container similar ao product.css
    <div className="product-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fadeIn">

      {/* Mensagem de Erro */}
      {fetchError && !item && ( // Só mostra erro fatal
        <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
          {fetchError}
        </div>
      )}

      {item && ( // Só renderiza o resto se o item foi carregado
        <>
          {/* --- Header do Item (Título, Criador, Preview) --- */}
          <header className="mb-12">
            {/* Imagem Preview Grande */}
            <div className="relative w-full aspect-video rounded-lg overflow-hidden border border-gold-glow/30 shadow-lg mb-6">
               <Image
                src={previewImageUrl}
                alt={`Preview de ${item.title}`}
                fill
                sizes="(max-width: 768px) 100vw, 70vw"
                style={{ objectFit: 'cover' }}
                priority // Carrega a imagem principal mais rápido
               />
            </div>
            {/* Título e Criador */}
            <h1 className="product-title font-epic text-3xl sm:text-4xl lg:text-5xl text-vintage-gold leading-tight text-shadow-gold-glow break-words mb-1">
              {item.title}
            </h1>
            <h2 className="product-creator font-title text-lg sm:text-xl text-bone-white">
              Criado por:{' '}
              <Link href={`/profile/${item.authorUsername}`} className="text-vintage-gold hover:underline">
                @{item.authorUsername}
              </Link>
            </h2>
             {/* Stats Resumidos (Rating, Downloads) */}
             <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-whisper">
                 {/* Rating */}
                <WorkshopItemRating
                    itemId={itemId}
                    initialRating={averageRating}
                    ratingCount={ratingCount}
                    userId={user?.id}
                />
                {/* Downloads */}
                <span className="flex items-center gap-1" title={`Downloads: ${downloads}`}>
                    <svg className="w-4 h-4 text-slate-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                    {downloads}
                </span>
                {/* Tipo e Sistema */}
                 {item.type && <span className="px-2 py-0.5 bg-slate-blue/50 text-bone-white rounded text-xs font-semibold">{item.type}</span>}
                 {item.system && <span className="px-2 py-0.5 bg-slate-blue/50 text-bone-white rounded text-xs font-semibold">{item.system}</span>}
            </div>

          </header>

          {/* Grid Principal (Descrição/Detalhes + Ações/Meta) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">

            {/* Coluna Principal (Descrição, Comentários) */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Widget: Descrição */}
              <ProfileWidget title="Descrição Detalhada">
                <div
                  className="prose prose-invert prose-sm sm:prose-base max-w-none text-gray-whisper font-light leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formattedDescription }}
                />
                 {/* Opcional: Lista de arquivos incluídos, se aplicável */}
                 {/* {item.includedFiles && ... } */}
              </ProfileWidget>

              {/* Widget: Comentários (Client Component) */}
               <ProfileWidget title={`Comentários (${item.commentCount ?? comments.length})`}>
                  <WorkshopItemComments
                     itemId={itemId}
                     initialComments={comments}
                     user={user} // Passa o usuário logado para habilitar postagem/edição
                  />
               </ProfileWidget>
            </div>

            {/* Coluna Lateral (Ações, Meta) */}
            <div className="lg:col-span-1 self-start lg:sticky lg:top-28"> {/* Sticky Sidebar */}
               <ProfileWidget title="Ações">
                  {/* Preço (se aplicável) */}
                  {item.price !== null && item.price > 0 && (
                     <div className="product-price font-title text-3xl font-bold text-bone-white mb-6 text-center">
                         {formattedPrice}
                     </div>
                  )}
                  {/* Botões de Ação (Client Component) */}
                  <WorkshopItemActions
                     item={item} // Passa o objeto item completo
                     user={user} // Passa o usuário logado
                     // Passar status de compra/wishlist se buscado
                  />
                  {/* Meta Informações (Datas, Versão, etc.) */}
                   <div className="product-meta mt-6 text-sm text-gray-whisper font-light space-y-1 border-t border-gold-glow/30 pt-4">
                       {item.createdAt && <p><strong>Publicado em:</strong> {new Date(item.createdAt).toLocaleDateString('pt-BR')}</p>}
                       {item.updatedAt && <p><strong>Última Atualização:</strong> {new Date(item.updatedAt).toLocaleDateString('pt-BR')}</p>}
                       {item.version && <p><strong>Versão:</strong> {item.version}</p>}
                       {/* Adicionar tamanho do arquivo se disponível */}
                   </div>
               </ProfileWidget>
            </div>

          </div>
        </>
      )}
    </div>
  );
}