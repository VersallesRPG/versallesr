// app/(main)/store/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// Server-side utilities & Data Fetching
import { getProductBySlug } from '@/lib/api/products'; // Função para buscar produto pelo slug
import { getProductReviews } from '@/lib/api/reviews'; // Função para buscar reviews do produto
import { getCurrentUser } from '@/lib/auth/server'; // Para verificar se já comprou/está na wishlist

// Client Components (Você precisará criá-los)
import ProductGallery from '@/components/store/ProductGalleryClient';
import ProductActions from '@/components/store/ProductActionsClient';
import ProductReviewsSection from '@/components/store/ProductReviewsSectionClient';
import ProfileWidget from '@/components/profile/ProfileWidget'; // Reutilizar

// Types (Defina em @/types/index.ts)
import { ProductDetails, Review, User } from '@/types'; // ProductDetails com todas as infos, incluindo galleryUrls, creatorUsername, etc.

interface ProductPageProps {
  params: {
    slug: string;
  };
}

// Metadata Dinâmica
export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  try {
    const slug = decodeURIComponent(params.slug);
    const product = await getProductBySlug(slug); // Busca básica para o título

    if (!product) {
      return { title: 'Relíquia Não Encontrada' };
    }

    return {
      title: product.title,
      description: `Detalhes sobre ${product.title}. ${product.description?.substring(0, 150) ?? ''}`,
    };
  } catch (error) {
    return { title: 'Erro ao Carregar Relíquia' };
  }
}

// --- Componente Principal da Página (Server Component) ---
export default async function ProductPage({ params }: ProductPageProps) {
  const slug = decodeURIComponent(params.slug);

  // --- Buscar Dados Concorrentemente ---
  let product: ProductDetails | null = null;
  let reviews: Review[] = [];
  let user: User | null = null;
  let fetchError: string | null = null;
  // TODO: Adicionar lógica para buscar status da wishlist/compra do usuário logado

  try {
    [product, reviews, user] = await Promise.all([
      getProductBySlug(slug),
      getProductReviews(slug, 3), // Pega as 3 reviews mais recentes, por exemplo
      getCurrentUser(), // Opcional, para lógica de botões
    ]);

    if (!product) {
      notFound(); // Produto não encontrado
    }

    // Dados placeholder se a busca falhar ou retornar vazio (como no product.php)
    if (reviews.length === 0) {
        reviews = [
            { id: 'r1', userId: 'u1', username: 'Arcanist_Alex', avatarUrl: 'https://placehold.co/100x100/4a5568/E8C468?text=A', rating: 5, comment: 'Absolutamente incrível. O sistema de clãs é genial e a arte é de tirar o fôlego.', createdAt: new Date() },
            { id: 'r2', userId: 'u2', username: 'Rogue_Shadow', avatarUrl: 'https://placehold.co/100x100/4a5568/E8C468?text=R', rating: 4, comment: 'Muito bom! A aventura introdutória é um pouco linear, mas o mundo é fantástico.', createdAt: new Date() },
        ];
        // product.reviewCount = product.reviewCount || reviews.length; // Ajustar contagem se necessário
    }


  } catch (error: any) {
    console.error("Erro ao carregar dados do produto:", error);
    fetchError = `Não foi possível carregar a relíquia: ${error.message || 'Erro desconhecido'}`;
    // Se nem o produto carregou, usamos notFound
    if (!product) notFound();
  }

  // --- Preparar Dados para Renderização ---
  const galleryImages = [product?.imageCoverUrl, ...(product?.galleryUrls || [])].filter(Boolean) as string[]; // Junta capa e galeria

  // Formatar preço (Exemplo simples)
  const formattedPrice = product?.price ? `R$ ${product.price.toFixed(2).replace('.', ',')}` : 'Gratuito'; // Ou Indisponível

  // Renderizar descrição com quebras de linha
  const formattedDescription = product?.description?.replace(/\n/g, '<br />') || 'Descrição não disponível.';

  // Placeholder Rating (Calcular média real no backend)
  const averageRating = product?.averageRating ?? 4.8; // Pegar do produto ou calcular
  const reviewCount = product?.reviewCount ?? 132; // Pegar do produto


  return (
    // Container
    <div className="product-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 animate-fadeIn">

      {/* Mensagem de Erro (se houver, mas produto carregou) */}
      {fetchError && (
        <div className="mb-8 p-4 bg-orange-900/30 border border-orange-500/50 rounded-lg text-orange-300 text-sm">
          Atenção: {fetchError} Alguns dados podem estar indisponíveis.
        </div>
      )}

      {/* Grid Principal (Galeria + Info) */}
      {/* */}
      {product && (
        <div className="product-grid-main grid grid-cols-1 md:grid-cols-5 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 mb-16">

          {/* Coluna da Galeria (Client Component) */}
          <div className="md:col-span-3 lg:col-span-1">
            <ProductGallery images={galleryImages} title={product.title} />
          </div>

          {/* Coluna de Informações e Ações (Sticky) */}
          <div className="md:col-span-2 lg:col-span-1 md:sticky md:top-28 lg:top-32 self-start"> {/* Ajuste o 'top' conforme altura do seu header */}
            <div className="product-info">
              {/* Título */}
              <h1 className="product-title font-epic text-3xl sm:text-4xl lg:text-5xl text-vintage-gold leading-tight text-shadow-gold-glow break-words">
                {product.title}
              </h1>
              {/* Criador */}
              <h2 className="product-creator font-title text-lg sm:text-xl text-bone-white mt-2">
                Criado por:{' '}
                <Link href={`/profile/${product.creatorUsername}`} className="text-vintage-gold hover:underline">
                  {product.creatorUsername}
                </Link>
              </h2>

              {/* Avaliação */}
              <div className="product-rating my-6 text-base sm:text-lg flex items-center gap-2">
                <span className="rating-stars text-vintage-gold text-xl">★★★★☆</span> {/* TODO: Renderizar estrelas dinamicamente */}
                <span className="rating-count text-gray-whisper">({reviewCount} avaliações)</span>
              </div>

              {/* Preço */}
              <div className="product-price font-title text-3xl sm:text-4xl font-bold text-bone-white mb-8">
                {formattedPrice}
              </div>

              {/* Botões de Ação (Client Component) */}
              {/* */}
              <ProductActions productId={product.id} productName={product.title} userId={user?.id} />

              {/* Meta Informações */}
              {/* */}
              <div className="product-meta mt-8 text-sm text-gray-whisper font-light space-y-2">
                <h3 className="font-title text-bone-white text-lg mb-3">Sobre esta Relíquia</h3>
                {product.systemRequirements && <p><strong>Requisitos:</strong> {product.systemRequirements}</p>}
                {product.type && <p><strong>Tipo:</strong> {product.type}</p>}
                {product.publishDate && <p><strong>Publicado:</strong> {new Date(product.publishDate).toLocaleDateString('pt-BR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                {/* Adicionar mais metadados se necessário (tags, formato, etc.) */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Detalhes (Descrição + Reviews) */}
      {/* */}
      {product && (
        <div className="product-details-grid grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* Coluna Descrição */}
          <div className="product-description lg:col-span-2">
            <ProfileWidget title="Descrição da Relíquia">
              <div
                className="prose prose-invert prose-sm sm:prose-base max-w-none text-gray-whisper font-light leading-relaxed whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formattedDescription }}
              />
            </ProfileWidget>
          </div>

          {/* Coluna Reviews (Client Component ou Server Component renderizando a lista) */}
          <div className="product-reviews lg:col-span-1">
             <ProductReviewsSection
                productId={product.id}
                initialReviews={reviews}
                totalReviews={reviewCount}
                averageRating={averageRating}
            />
          </div>
        </div>
      )}
    </div>
  );
}