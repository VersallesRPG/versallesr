// app/(main)/my-library/page.tsx
import { Metadata } from 'next';
import Link from 'next/link';

// Server-side utilities & Data Fetching
import { getCurrentUser } from '@/lib/auth/server';
import { getPurchasedProducts } from '@/lib/api/library'; // Função para buscar produtos comprados

// Client Component for interactive UI
import MyLibraryClient from '@/components/library/MyLibraryClient';

// Types (Defina em @/types/index.ts)
import { PurchasedProduct } from '@/types'; // Tipo para o produto comprado (id, title, description, bannerImageUrl, slug, downloadUrl?)

export const metadata: Metadata = {
  title: 'Minha Estante',
  description: 'Acesse todos os seus sistemas, aventuras e ferramentas adquiridos na Versalles RPG.',
};

export default async function MyLibraryPage() {
  // --- Buscar Dados ---
  const user = await getCurrentUser();
  let purchasedItems: PurchasedProduct[] = [];
  let fetchError: string | null = null;

  if (user) {
    try {
      purchasedItems = await getPurchasedProducts(user.id);
    } catch (error: any) {
      console.error("Erro ao buscar itens da estante:", error);
      fetchError = `Não foi possível carregar sua estante: ${error.message || 'Erro desconhecido'}`;
    }
  } else {
    // Middleware deve ter redirecionado, mas para garantir:
    fetchError = "Você precisa estar logado para acessar sua estante.";
    // Poderia redirecionar aqui também, mas vamos deixar o Client Component mostrar a mensagem.
  }

  // Passa os dados buscados para o Client Component
  return <MyLibraryClient initialItems={purchasedItems} error={fetchError} />;
}