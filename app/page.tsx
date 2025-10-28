// app/page.tsx
import Link from 'next/link';
import Image from 'next/image';

// Funções/Helpers para buscar dados (exemplo, a implementação real dependerá da sua lógica de sessão/API)
import { getCurrentUser } from '@/lib/auth/server'; // Função hipotética para buscar dados do usuário logado no servidor
import { getNewsFeed } from '@/lib/api/news';     // Função hipotética para buscar notícias
import { getQuickAccessLinks } from '@/lib/api/config'; // Função hipotética para buscar links de acesso rápido

// Tipos (você definiria isso em @/types/index.ts ou similar)
interface User {
  username: string;
}

interface NewsItem {
  id: string;
  title: string;
  tag: string;
  imageUrl: string;
  description: string;
  link: string; // Link para a notícia completa (opcional)
}

interface QuickAccessLink {
  id: string;
  title: string;
  description: string;
  href: string;
  bgClass?: string; // Classe Tailwind para background (ex: 'bg-campaigns')
  icon?: React.ReactNode; // Opcional: Ícone
}

export default async function HomePage() {
  // --- Busca de Dados (Server Component) ---
  const user: User | null = await getCurrentUser(); // Busca o usuário logado

  // Exemplo de como buscar notícias (poderia vir de um CMS ou DB)
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Contrato de Sangue',
      tag: 'Novo Sistema',
      imageUrl: '/img/news-contrato-sangue.jpg', // Caminho na pasta /public/img
      description: 'Mergulhe nas sombras com \'Contrato de Sangue\', nosso novo sistema de horror gótico e corporal inspirado no Mundo das Trevas...',
      link: '/store/contrato-de-sangue', // Exemplo de link
    },
    {
      id: '2',
      title: 'Oficina de Criação Aberta!',
      tag: 'Atualização',
      imageUrl: '/img/news-oficina-update.jpg', // Caminho na pasta /public/img
      description: 'A Oficina agora aceita uploads de mapas e tokens customizados. Mostre ao mundo suas criações...',
      link: '/workshop',
    },
    // Adicione mais notícias aqui ou busque dinamicamente
  ];

  // Exemplo de links de acesso rápido (poderia vir de um JSON de config ou DB)
  // Incluindo links externos para futuros sites
  const quickAccessLinks: QuickAccessLink[] = [
    { id: 'campaigns', title: 'Suas Crônicas', description: 'Ver suas campanhas ativas', href: '/campaigns', bgClass: 'bg-[url(/img/bg-campaigns.jpg)]' }, // Exemplo usando bg customizado
    { id: 'store', title: 'O Mercado', description: 'Descobrir novos sistemas', href: '/store', bgClass: 'bg-[url(/img/bg-store.jpg)]' },
    { id: 'profile', title: 'Seu Perfil', description: 'Editar sua identidade', href: user ? `/profile/${user.username}` : '/login' }, // Link dinâmico
    { id: 'lfg', title: 'A Taverna', description: 'Encontrar um novo grupo', href: '/lfg', bgClass: 'bg-[url(/img/bg-lfg.jpg)]' },
    // --- Links Refatorados/Adicionais ---
    { id: 'rp', title: 'Fichas RP', description: 'Acesse o gerenciador de fichas', href: 'https://rp.versallesrpg.com', bgClass: 'bg-slate-blue' }, // Link externo
    { id: 'canvas', title: 'Canvas Mapas', description: 'Crie seus mapas interativos', href: 'https://canvas.versallesrpg.com', bgClass: 'bg-slate-blue' }, // Link externo
    { id: 'vtt', title: 'Versalles VTT', description: 'Entre no nosso VTT 3D', href: 'https://vtt.versallesrpg.com', bgClass: 'bg-slate-blue' }, // Link externo futuro
    // Adicione mais links conforme necessário
  ];


  return (
    // Container principal com padding e largura máxima, animação fadeIn
    <div className="home-container max-w-[1400px] mx-auto px-6 py-8 animate-fadeIn">

      {/* --- Seção Hero --- */}
      {/* Similar a home-hero */}
      <section className="text-center py-12 mb-12 border-b border-gold-glow">
        <h1 className="hero-title font-epic text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-bone-white leading-tight">
          {user ? (
            <>
              Bem-vindo de volta,{' '}
              <span className="hero-username text-vintage-gold text-shadow-gold-glow">{user.username}</span>.
            </>
          ) : (
            'Bem-vindo ao Universo Versalles.' // Mensagem para visitantes
          )}
        </h1>
        <p className="hero-subtitle font-body font-light text-base sm:text-lg md:text-xl text-gray-whisper mt-4">
          Sua próxima lenda o aguarda. O que você deseja forjar hoje?
        </p>
      </section>

      {/* --- Seção de Acesso Rápido (Refatorada) --- */}
      {/* Similar a quick-access-grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {quickAccessLinks.map((link) => (
          // Usar 'a' para links externos, 'Link' para internos
          link.href.startsWith('http') ? (
            <a
              key={link.id}
              href={link.href}
              target="_blank" // Abrir links externos em nova aba
              rel="noopener noreferrer"
              className={`quick-card relative block p-8 rounded-2xl border border-gold-glow bg-transparent-dark backdrop-blur-10 overflow-hidden group transition-all duration-300 ease-in-out hover:border-vintage-gold hover:-translate-y-1 hover:shadow-lg ${link.bgClass ? `${link.bgClass} bg-cover bg-center` : 'bg-slate-blue/30'}`}
            >
              {/* Overlay para legibilidade em cima de imagens de fundo */}
              <div className="absolute inset-0 bg-gradient-to-t from-deep-space-blue/80 via-deep-space-blue/60 to-transparent transition-opacity duration-300 ease-in-out group-hover:from-deep-space-blue/60 group-hover:via-deep-space-blue/40"></div>
              <div className="relative z-10">
                <h2 className="font-title text-2xl text-vintage-gold mb-2">{link.title}</h2>
                <p className="font-light text-bone-white text-base">{link.description}</p>
              </div>
            </a>
          ) : (
            <Link
              key={link.id}
              href={link.href}
              className={`quick-card relative block p-8 rounded-2xl border border-gold-glow bg-transparent-dark backdrop-blur-10 overflow-hidden group transition-all duration-300 ease-in-out hover:border-vintage-gold hover:-translate-y-1 hover:shadow-lg ${link.bgClass ? `${link.bgClass} bg-cover bg-center` : 'bg-slate-blue/30'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-deep-space-blue/80 via-deep-space-blue/60 to-transparent transition-opacity duration-300 ease-in-out group-hover:from-deep-space-blue/60 group-hover:via-deep-space-blue/40"></div>
              <div className="relative z-10">
                <h2 className="font-title text-2xl text-vintage-gold mb-2">{link.title}</h2>
                <p className="font-light text-bone-white text-base">{link.description}</p>
              </div>
            </Link>
          )
        ))}
      </section>

      {/* --- Seção de Notícias --- */}
      {/* Similar a news-feed e news-grid */}
      <section className="news-feed">
        <div className="section-header pb-2 border-b border-border-color mb-8">
          <h2 className="font-title text-3xl text-bone-white">Notícias do Universo</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {newsItems.map((item) => (
            <Link key={item.id} href={item.link} className="news-card block bg-transparent-dark border border-gold-glow/30 rounded-xl overflow-hidden transition-all duration-300 ease-in-out hover:border-vintage-gold hover:-translate-y-1 hover:shadow-xl">
              <div className="relative w-full aspect-video bg-black">
                {/* Usar next/image para otimização */}
                <Image
                  src={item.imageUrl}
                  alt={`Imagem para ${item.title}`}
                  fill // Preenche o container pai
                  style={{ objectFit: 'cover' }} // Equivalente a object-fit: cover
                  className="opacity-80 group-hover:opacity-100 transition-opacity"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Ajuda na otimização de tamanhos
                />
              </div>
              <div className="p-6">
                <span className="news-tag inline-block px-3 py-1 bg-vintage-gold text-deep-space-blue rounded-full font-title font-bold text-xs uppercase tracking-wide mb-4">
                  {item.tag}
                </span>
                <h3 className="font-title text-xl text-bone-white mb-2">{item.title}</h3>
                <p className="font-light text-sm leading-relaxed text-gray-whisper line-clamp-3"> {/* Limita a 3 linhas */}
                  {item.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}