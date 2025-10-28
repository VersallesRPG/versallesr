// app/(main)/wishlist/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// Server-side utilities & Data Fetching
import { getCurrentUser } from '@/lib/auth/server';
import { getWishlistItems } from '@/lib/api/wishlist'; // Função para buscar itens da wishlist do usuário

// Client Components (para botões de ação)
import AddToCartButton from '@/components/wishlist/AddToCartButtonClient';
import RemoveFromWishlistButton from '@/components/wishlist/RemoveFromWishlistButtonClient';

// Types (Defina em @/types/index.ts)
import { WishlistItem, User } from '@/types'; // WishlistItem: id, productId, title, creatorUsername, imageUrl, price, productSlug

export const metadata: Metadata = {
  title: 'Lista de Desejos',
  description: 'Veja e gerencie os tesouros que você cobiça para suas próximas aventuras.',
};

export default async function WishlistPage() {
  // --- Buscar Dados ---
  const user = await getCurrentUser();
  let wishlistItems: WishlistItem[] = [];
  let fetchError: string | null = null;

  if (user) {
    try {
      wishlistItems = await getWishlistItems(user.id);
    } catch (error: any) {
      console.error("Erro ao buscar itens da wishlist:", error);
      fetchError = `Não foi possível carregar sua lista de desejos: ${error.message || 'Erro desconhecido'}`;
    }
  } else {
    // Middleware deve ter redirecionado
    fetchError = "Você precisa estar logado para ver sua lista de desejos.";
  }

  return (
    // Container principal
    <div className="wishlist-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header da página */}
      {/* */}
      <header className="page-header text-center mb-12">
        <h1 className="page-title font-epic text-4xl sm:text-5xl lg:text-6xl text-vintage-gold text-shadow-gold-glow">
          Lista de Desejos
        </h1>
        <p className="page-subtitle text-lg font-light text-gray-whisper mt-2">
          Os tesouros e relíquias que você cobiça para suas próximas aventuras.
        </p>
      </header>

      {/* Conteúdo da Wishlist */}
      <div className="wishlist-content">
        {/* Mensagem de Erro */}
        {fetchError && (
          <div className="mb-8 p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
            {fetchError}
          </div>
        )}

        {/* Lista de Itens ou Mensagem de Vazio */}
        {!fetchError && user && ( // Só mostra a lista/vazio se não houve erro e o user existe
          wishlistItems.length === 0 ? (
            // Mensagem de Vazio
            <div className="wishlist-empty-message text-center py-16 px-6 bg-transparent-dark border border-gold-glow/30 rounded-2xl">
              <h2 className="font-title text-2xl text-bone-white mb-2">Sua arca está vazia.</h2>
              <p className="text-lg font-light text-gray-whisper">
                Explore o{' '}
                <Link href="/store" className="font-semibold text-vintage-gold hover:underline">
                  Mercado
                </Link>{' '}
                para encontrar relíquias dignas de seus desejos.
              </p>
            </div>
          ) : (
            // Lista de Itens
            <ul className="wishlist-list flex flex-col gap-4">
              {wishlistItems.map((item) => (
                <li
                  key={item.id} // ID da entrada na wishlist
                  // Card do item
                  // Usando grid CSS para replicar o layout complexo
                  className="wishlist-card grid grid-cols-[auto_1fr_auto] grid-rows-[auto_auto] md:grid-cols-[auto_1fr_auto] md:grid-rows-[auto] items-center gap-x-6 gap-y-2 md:gap-y-0 bg-transparent-dark rounded-xl p-4 transition-colors duration-300 hover:bg-vintage-gold/5 border border-transparent hover:border-gold-glow/50"
                  // Definindo as áreas do grid (simplificado para Tailwind)
                  style={{ gridTemplateAreas: '"image info price" "image info actions"' }}
                >
                  {/* Imagem */}
                  <Link
                    href={`/store/${item.productSlug}`}
                    className="wishlist-item-image-link block row-span-2 md:row-span-1"
                    style={{ gridArea: 'image' }}
                  >
                    <Image
                      src={item.imageUrl || 'https://placehold.co/80x106/0a0f1e/E8C468?text=?'}
                      alt={`Capa de ${item.title}`}
                      width={80}
                      height={106}
                      className="wishlist-item-image rounded-md object-cover"
                    />
                  </Link>

                  {/* Informações (Título, Criador) */}
                  <div className="wishlist-item-info overflow-hidden" style={{ gridArea: 'info' }}>
                    <h3 className="wishlist-item-title text-lg font-semibold text-bone-white truncate" title={item.title}>
                      <Link href={`/store/${item.productSlug}`} className="hover:text-vintage-gold">
                        {item.title}
                      </Link>
                    </h3>
                    <p className="wishlist-item-creator text-sm font-light text-gray-whisper truncate">
                      Por:{' '}
                      <Link href={`/profile/${item.creatorUsername}`} className="hover:underline hover:text-bone-white">
                        @{item.creatorUsername}
                      </Link>
                    </p>
                  </div>

                  {/* Preço */}
                  <div className="wishlist-item-price justify-self-start md:justify-self-end md:self-center" style={{ gridArea: 'price' }}>
                    <span className="font-title text-xl font-bold text-bone-white">{item.price ? `R$ ${item.price.toFixed(2).replace('.', ',')}` : 'Gratuito'}</span>
                  </div>

                  {/* Ações (Client Components) */}
                  {/* */}
                  <div className="wishlist-item-actions flex flex-row md:flex-col gap-2 justify-self-end self-center" style={{ gridArea: 'actions' }}>
                    <AddToCartButton productId={item.productId} className="wishlist-button add-to-cart text-sm px-3 py-1.5" />
                    <RemoveFromWishlistButton wishlistItemId={item.id} className="wishlist-button remove text-sm px-3 py-1.5" />
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </div>
    </div>
  );
}