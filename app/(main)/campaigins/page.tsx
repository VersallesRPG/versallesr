// app/(main)/campaigns/page.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

// Server-side utilities
import { getCurrentUser } from '@/lib/auth/server'; // Função para obter usuário logado (servidor)
import { getCampaignsForUser } from '@/lib/api/campaigns'; // Função para buscar campanhas do usuário (servidor)

// Componente para o Card da Campanha (pode ser movido para '@/components/campaigns/CampaignCard')
import CampaignCard from '@/components/campaigns/CampaignCard';

// Tipos (definir em @/types/index.ts)
import { CampaignWithDetails } from '@/types'; // Supondo que você tenha um tipo Campaign com detalhes do GM e Role

// Metadata da Página
export const metadata: Metadata = {
  title: 'Minhas Crônicas',
  description: 'Visualize todas as campanhas de RPG que você joga ou mestra na plataforma Versalles.',
};

// Componente da Página (Server Component)
export default async function MyCampaignsPage() {
  // --- Buscar Dados ---
  const user = await getCurrentUser(); // Garante que o usuário está logado (ou redireciona via middleware/proteção na função)
  let myCampaigns: CampaignWithDetails[] = [];
  let fetchError: string | null = null;

  if (user) {
    try {
      myCampaigns = await getCampaignsForUser(user.id); // Busca as campanhas do usuário logado
    } catch (error) {
      console.error("Erro ao buscar campanhas:", error);
      fetchError = "Não foi possível carregar suas crônicas no momento.";
    }
  } else {
     // Teoricamente, o middleware já deve ter redirecionado, mas é bom ter um fallback
     fetchError = "Você precisa estar logado para ver suas crônicas.";
  }


  return (
    // Container principal
    <div className="campaign-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header da página */}
      {/* */}
      <header className="page-header text-center mb-12">
        <h1 className="page-title font-epic text-4xl sm:text-5xl lg:text-6xl text-vintage-gold text-shadow-gold-glow">
          Minhas Crônicas
        </h1>
        <p className="page-subtitle text-lg font-light text-gray-whisper mt-2">
          Todas as aventuras que você joga ou mestra em um só lugar.
        </p>
      </header>

      {/* Barra de Ação */}
      {/* */}
      <div className="campaign-action-bar flex justify-end items-center mb-12">
        <Link
          href="/campaigns/create"
          className="create-campaign-button inline-block px-6 py-2.5 bg-vintage-gold text-deep-space-blue rounded-full font-title font-bold text-base transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md transform hover:scale-105"
        >
          Criar Nova Crônica
        </Link>
      </div>

      {/* Mensagem de Erro ao buscar dados */}
      {fetchError && (
        <div className="text-center py-10 px-6 bg-red-900/20 border border-red-500/50 rounded-lg">
           <p className="text-red-400">{fetchError}</p>
        </div>
      )}

      {/* Grid de Campanhas */}
      {/* */}
      {!fetchError && (
         <div className="campaign-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {myCampaigns.length === 0 ? (
              // Mensagem de Grimório Vazio
              //
              <p className="campaign-empty-message sm:col-span-2 lg:col-span-3 text-center font-light text-gray-whisper text-lg py-10">
                Seu grimório está vazio.{' '}
                <Link href="/lfg" className="font-semibold text-vintage-gold hover:underline">
                  Encontre uma aventura na Taverna
                </Link>{' '}
                ou{' '}
                <Link href="/campaigns/create" className="font-semibold text-vintage-gold hover:underline">
                  crie a sua
                </Link>!
              </p>
            ) : (
              // Renderiza os cards das campanhas
              myCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} currentUserId={user?.id} />
              ))
            )}
         </div>
      )}
    </div>
  );
}