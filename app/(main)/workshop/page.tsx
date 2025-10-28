// app/(main)/workshop/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

// Server-side Data Fetching
import { getWorkshopItems } from '@/lib/api/workshop'; // Implemente esta função
// TODO: Importar funções para buscar Discussões e Guias se necessário carregar inicialmente

// Client Component for Tabs & Filtering
import WorkshopClient from '@/components/workshop/WorkshopClient';

// Types
import { WorkshopItemSummary } from '@/types'; // Tipo resumido para o card do item

export const metadata: Metadata = {
  title: 'Oficina de Criação',
  description: 'Explore criações, mods e ferramentas forjadas pela comunidade Versalles RPG.',
};

export default async function WorkshopPage() {
  // --- Buscar Dados Iniciais (Itens para a primeira aba) ---
  let initialItems: WorkshopItemSummary[] = [];
  let fetchError: string | null = null;
  // TODO: Adicionar parâmetros de paginação e filtros padrão se necessário
  const defaultFilters = { status: 'approved', page: 1, limit: 12 }; // Exemplo

  try {
    // Busca os itens aprovados, ordenados por data (como no PHP original)
    //
    initialItems = await getWorkshopItems(defaultFilters);
  } catch (error: any) {
    console.error("Erro ao buscar itens da Oficina:", error);
    fetchError = `Não foi possível carregar os itens da oficina: ${error.message || 'Erro desconhecido'}`;
  }

  // TODO: Buscar dados iniciais para outras abas se necessário (ex: discussões recentes)

  return (
    // Container principal
    <div className="workshop-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">
      {/* Header da página */}
      {/* */}
      <header className="page-header text-center mb-12">
        <h1 className="page-title font-epic text-4xl sm:text-5xl lg:text-6xl text-vintage-gold text-shadow-gold-glow">
          Oficina de Criação
        </h1>
        <p className="page-subtitle text-lg font-light text-gray-whisper mt-2">
          Explore criações, mods e ferramentas forjadas pela comunidade.
        </p>
      </header>

      {/* Renderiza o Client Component que gerencia as abas e conteúdo */}
      <WorkshopClient initialItems={initialItems} initialError={fetchError} />
    </div>
  );
}