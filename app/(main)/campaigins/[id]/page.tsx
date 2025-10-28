// app/(main)/campaigns/[id]/page.tsx
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

// Server-side utilities & Data Fetching Functions (Implement these in lib/)
import { getCurrentUser } from '@/lib/auth/server';
import { getCampaignDetails } from '@/lib/api/campaigns'; // Fetches campaign basic info + GM username
import { getCampaignMembers } from '@/lib/api/campaignMembers'; // Fetches members list with roles/chars
import { getCampaignLogs } from '@/lib/api/campaignLogs';     // Fetches diary logs
import { getCampaignGallery } from '@/lib/api/campaignGallery'; // Fetches gallery images

// Client Component for Tabs
import CampaignTabs from '@/components/campaigns/CampaignTabs'; // We'll create this next

// Types (Define these in @/types/index.ts)
import { CampaignDetails, CampaignMember, CampaignLog, CampaignGalleryItem } from '@/types';

interface CampaignHubPageProps {
  params: {
    id: string; // O ID da campanha virá da URL
  };
}

// Metadata Dinâmica (Título da Página)
export async function generateMetadata({ params }: CampaignHubPageProps): Promise<Metadata> {
  try {
    const campaignId = params.id;
    const campaign = await getCampaignDetails(campaignId); // Fetch basic details for title

    if (!campaign) {
      return { title: 'Crônica Não Encontrada' };
    }

    return {
      title: campaign.title,
      description: `Hub da crônica ${campaign.title}. Sistema: ${campaign.system}.`,
    };
  } catch (error) {
     return { title: 'Erro ao Carregar Crônica' };
  }
}


// --- Componente Principal da Página (Server Component) ---
export default async function CampaignHubPage({ params }: CampaignHubPageProps) {
  const campaignId = params.id;

  // --- Buscar Dados Concorrentemente ---
  let campaign: CampaignDetails | null = null;
  let members: CampaignMember[] = [];
  let logs: CampaignLog[] = [];
  let gallery: CampaignGalleryItem[] = [];
  let loggedInUser = null;
  let fetchError: string | null = null;
  let isMember = false;
  let userRole = '';
  let isMestre = false;

  try {
     // Usar Promise.all para buscar dados em paralelo
     [campaign, members, logs, gallery, loggedInUser] = await Promise.all([
        getCampaignDetails(campaignId),
        getCampaignMembers(campaignId),
        getCampaignLogs(campaignId),
        getCampaignGallery(campaignId),
        getCurrentUser(),
     ]);

     // --- Verificações e Permissões ---
     if (!campaign) {
       notFound(); // Campanha não existe
     }

     if (!loggedInUser) {
        // Middleware deveria ter pego isso, mas como fallback:
        // Idealmente redirecionar para login, mas notFound() é mais simples em Server Component
        notFound();
     }

     // Verificar se o usuário logado é membro
     const memberInfo = members.find(m => m.userId === loggedInUser?.id);
     if (memberInfo) {
        isMember = true;
        userRole = memberInfo.role;
        isMestre = userRole === 'Mestre';
     } else {
        // Se não for membro, negar acesso (ou redirecionar via middleware/função)
        // Por simplicidade, vamos usar notFound aqui também
        // Em um app real, poderia mostrar uma página de "Acesso Negado"
        console.warn(`User ${loggedInUser.id} tried to access campaign ${campaignId} but is not a member.`);
        notFound();
     }

  } catch (error: any) {
     console.error("Erro ao carregar dados do Hub da Crônica:", error);
     fetchError = `Não foi possível carregar os detalhes da crônica: ${error.message || 'Erro desconhecido'}`;
     // Mesmo com erro, tentamos renderizar o básico se a campanha foi encontrada
     if (!campaign) notFound(); // Se nem a campanha básica carregou, 404
  }

  // --- Preparar URLs e Dados ---
  const bannerImageUrl = campaign?.bannerImageUrl || 'https://placehold.co/1600x500/4a5568/E8C468?text=Banner+da+Cronica';


  return (
    <div className="hub-page animate-fadeIn"> {/* Classe do body original */}
      {/* --- Header/Banner da Crônica --- */}
      {/* */}
      <header
        className="hub-header h-[400px] bg-cover bg-center flex justify-center items-center text-center p-8 relative"
        style={{ backgroundImage: `linear-gradient(rgba(10, 15, 30, 0.8), rgba(10, 15, 30, 0.8)), url('${bannerImageUrl}')` }}
      >
        <div className="hub-header-content animate-fadeIn" style={{ animationDelay: '0.3s' }}>
          <h1 className="hub-title font-epic text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white text-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            {campaign?.title || 'Carregando Título...'}
          </h1>
          <p className="hub-system font-title text-xl sm:text-2xl text-vintage-gold text-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mt-1">
            {campaign?.system || ''}
          </p>
        </div>
      </header>

      {/* --- Barra de Informações --- */}
      {/* */}
      <div className="hub-info-bar flex flex-wrap justify-center items-stretch bg-deep-space-blue border-b border-gold-glow/50 px-6 py-4 gap-x-8 gap-y-4">
        <div className="info-item text-center">
          <span className="info-label block text-xs font-light text-gray-whisper uppercase tracking-wider">Mestre</span>
          <span className="info-value text-base font-semibold text-bone-white">
            <Link href={`/profile/${campaign?.gmUsername || '#'}`} className="hover:text-vintage-gold hover:underline">
               @{campaign?.gmUsername || '...'}
            </Link>
          </span>
        </div>
        <div className="info-item text-center">
          <span className="info-label block text-xs font-light text-gray-whisper uppercase tracking-wider">Próxima Sessão</span>
          <span className="info-value text-base font-semibold text-bone-white">
            {campaign?.nextSession || 'Não definida'}
          </span>
        </div>
        <div className="info-item text-center">
          <span className="info-label block text-xs font-light text-gray-whisper uppercase tracking-wider">Jogadores</span>
          <span className="info-value text-base font-semibold text-bone-white">{members.length} Membros</span>
        </div>
        {isMestre && (
          <div className="mt-2 sm:mt-0 sm:ml-auto self-center"> {/* Alinha botão à direita em telas maiores */}
            <Link
                href={`/campaigns/${campaignId}/settings`} // Link para página de configurações da campanha
                className="hub-mestre-button inline-block px-5 py-2 bg-vintage-gold text-deep-space-blue rounded-full font-title font-bold text-sm transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md"
            >
              Gerenciar Crônica
            </Link>
          </div>
        )}
      </div>

       {/* Container Principal das Abas */}
       {/* */}
       <div className="hub-container max-w-5xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
            {/* Mensagem de Erro Geral (se houver) */}
            {fetchError && !campaign && ( // Só mostra erro fatal se nem a campanha carregou
                <div className="text-center py-10 px-6 bg-red-900/20 border border-red-500/50 rounded-lg mb-8">
                    <p className="text-red-400 font-semibold">Erro Crítico</p>
                    <p className="text-red-300 mt-2">{fetchError}</p>
                </div>
            )}

            {/* Renderiza o componente de Abas (Client Component) passando os dados */}
            {campaign && loggedInUser && (
                <CampaignTabs
                    campaignId={campaignId}
                    isMestre={isMestre}
                    initialLogs={logs}
                    initialMembers={members}
                    initialGallery={gallery}
                    fetchError={fetchError} // Passa erro não fatal para o componente filho
                />
            )}
       </div>
    </div>
  );
}