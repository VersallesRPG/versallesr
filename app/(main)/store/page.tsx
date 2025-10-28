// app/(main)/store/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

// Server-side utilities & Data Fetching
import { getCurrentUser } from '@/lib/auth/server';
import { getFeaturedProduct, getNewReleases, getPopularSystems, getNewAdventures } from '@/lib/api/products'; // Implement these fetch functions

// Components (Create these in @/components/store/ or similar)
import ProductCard from '@/components/store/ProductCard';
import SidebarProductItem from '@/components/store/SidebarProductItem';
import StoreCarousel from '@/components/store/StoreCarousel'; // Componente para gerenciar o scroll do carrossel
import ProfileWidget from '@/components/profile/ProfileWidget'; // Reutilizar

// Types (Define in @/types/index.ts)
import { ProductSummary, User } from '@/types'; // ProductSummary teria id, title, slug, imageCoverUrl, imageBannerUrl, price, description etc.

export const metadata: Metadata = {
  title: 'Mercado',
  description: 'Explore e adquira sistemas de RPG, aventuras e ferramentas no Mercado Versalles.',
};

export default async function StorePage() {
  // --- Buscar Dados Concorrentemente ---
  let user: User | null = null;
  let featuredItem: ProductSummary | null = null;
  let newReleases: ProductSummary[] = [];
  let popularSystems: ProductSummary[] = [];
  let newAdventures: ProductSummary[] = [];
  let fetchError: string | null = null;

  try {
    // Buscar todos os dados necessários em paralelo
    [user, featuredItem, newReleases, popularSystems, newAdventures] = await Promise.all([
      getCurrentUser(), // Pode ser null se a página for pública
      getFeaturedProduct(),
      getNewReleases(3), // Limite de 3 para sidebar
      getPopularSystems(5), // Limite de 5 para carrossel
      getNewAdventures(5), // Limite de 5 para carrossel
    ]);
  } catch (error: any) {
    console.error("Erro ao buscar dados do Mercado:", error);
    fetchError = `Não foi possível carregar os produtos no momento: ${error.message || 'Erro desconhecido'}`;
    // Continuar a renderização mesmo com erro, mostrando o que foi possível carregar
  }

  // Fallback para imagem de banner em destaque
  const featuredBannerUrl = featuredItem?.imageBannerUrl || '/img/logo-versalles.png'; // Usar logo como fallback

  return (
    // Container principal
    <div className="store-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">

      {/* Header da Loja */}
      {/* */}
      <header className="store-header mb-8">
        <h1 className="font-title text-2xl sm:text-3xl font-semibold">
          {user ? (
            <>
              Bem-vindo ao Mercado,{' '}
              <span className="text-vintage-gold">{user.username}</span>!
            </>
          ) : (
            'Bem-vindo ao Mercado Versalles' // Mensagem para visitante
          )}
        </h1>
      </header>

      {/* Creator Callout Section */}
      {/* */}
      <section
        className="creator-callout bg-transparent-dark border border-gold-glow/50 rounded-2xl p-8 text-center mb-12 backdrop-blur-10"
      >
        <h2 className="font-title text-2xl text-vintage-gold mb-3">
          Torne-se um Criador Oficial Versalles!
        </h2>
        <p className="font-light text-gray-whisper max-w-3xl mx-auto mb-6 leading-relaxed">
          Publique suas criações na maior plataforma de RPG da América Latina e receba 97% das suas vendas. Explore as possibilidades e compartilhe sua visão com a comunidade.
        </p>
        {/* Usar Link se for rota interna, 'a' se for externa */}
        <Link
          href="/creator-program" // Ou o link correto
          className="cta-button inline-block px-8 py-3 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-base transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md transform hover:scale-105"
        >
          Saiba Mais
        </Link>
      </section>

      {/* Mensagem de Erro Geral */}
      {fetchError && (
          <div className="mb-8 p-4 bg-red-900/30 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {fetchError}
          </div>
      )}

      {/* Grid Principal (Conteúdo + Sidebar) */}
      {/* */}
      <div className="store-grid grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Coluna Principal (Destaque e Carrosséis) */}
        <div className="store-main-column lg:col-span-2 flex flex-col gap-12">

          {/* Item em Destaque */}
          {/* */}
          <Link
            href={featuredItem ? `/store/${featuredItem.slug}` : '#'}
            className="featured-item-card relative flex flex-col justify-end min-h-[400px] bg-slate-blue bg-cover bg-center rounded-2xl p-6 sm:p-8 border border-gold-glow/50 overflow-hidden group"
            style={{ backgroundImage: `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.8)), url('${featuredBannerUrl}')` }}
          >
            <div className="featured-content relative z-10 transition-transform duration-300 group-hover:translate-y-[-5px]">
              <h2 className="font-epic text-3xl sm:text-4xl lg:text-5xl text-white text-shadow-[0_2px_10px_rgba(0,0,0,0.8)] mb-2">
                {featuredItem?.title || 'Explorando o Mercado'}
              </h2>
              <p className="font-light text-base sm:text-lg text-bone-white text-shadow-[0_1px_5px_rgba(0,0,0,0.7)] max-w-lg mb-6 line-clamp-3">
                {featuredItem?.description || 'Descubra novos sistemas, aventuras e ferramentas para suas próximas lendas.'}
              </p>
              {featuredItem && (
                 <span className="featured-buy-button inline-block px-5 py-2.5 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-base transition duration-300 ease-in-out group-hover:bg-bone-white group-hover:scale-105">
                   {featuredItem.price ? `R$ ${featuredItem.price.toFixed(2).replace('.', ',')} - ` : ''}Ver Mais
                 </span>
              )}
            </div>
          </Link>

          {/* Seção: Sistemas Populares */}
          {/* */}
          {popularSystems.length > 0 && (
            <section className="store-section">
              <header className="store-section-header flex justify-between items-baseline mb-4 px-2">
                <h2 className="font-title text-2xl">Sistemas Populares</h2>
                <Link href="/store/systems" className="font-light text-sm hover:underline">
                  Ver todos
                </Link>
              </header>
              <StoreCarousel>
                {popularSystems.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </StoreCarousel>
            </section>
          )}

          {/* Seção: Novas Aventuras */}
          {/* */}
          {newAdventures.length > 0 && (
            <section className="store-section">
              <header className="store-section-header flex justify-between items-baseline mb-4 px-2">
                <h2 className="font-title text-2xl">Novas Crônicas e Aventuras</h2>
                <Link href="/store/adventures" className="font-light text-sm hover:underline">
                  Ver todas
                </Link>
              </header>
              <StoreCarousel>
                {newAdventures.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </StoreCarousel>
            </section>
          )}
           {/* Mensagem se não houver aventuras */}
           {newAdventures.length === 0 && !fetchError &&(
                <section className="store-section">
                     <header className="store-section-header mb-4 px-2">
                         <h2 className="font-title text-2xl">Novas Crônicas e Aventuras</h2>
                     </header>
                     <p className="px-2 py-4 text-gray-whisper font-light">Nenhuma aventura publicada ainda. Fique de olho!</p>
                 </section>
           )}

        </div>

        {/* Coluna da Sidebar (Novos Lançamentos) */}
        {/* */}
        <div className="store-sidebar-column lg:col-span-1">
          {newReleases.length > 0 && (
            <ProfileWidget title="Novos Lançamentos"> {/* Reutiliza o estilo do widget */}
               <ul className="sidebar-list divide-y divide-gold-glow/30">
                 {newReleases.map((item) => (
                   <SidebarProductItem key={item.id} product={item} />
                 ))}
               </ul>
            </ProfileWidget>
          )}
          {/* Pode adicionar outros widgets na sidebar aqui (Ex: Categorias, Promoções) */}
        </div>

      </div>
    </div>
  );
}