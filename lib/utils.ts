// lib/utils.ts
import { type ClassValue, clsx } from "clsx" // Biblioteca popular para juntar classes condicionalmente
import { twMerge } from "tailwind-merge"   // Biblioteca para mesclar classes Tailwind sem conflitos

/**
 * Combina classes do Tailwind CSS de forma inteligente, lidando com condicionais e mesclando conflitos.
 * @param inputs - Uma lista de classes (strings, objetos, arrays).
 * @returns Uma string com as classes combinadas e otimizadas.
 * Exemplo: cn('p-4', isActive && 'bg-blue-500', ['text-white', {'font-bold': isBold}])
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Sanitiza (escapa) caracteres HTML básicos. Embora React/Next.js geralmente
 * protejam contra XSS na renderização, esta função pode ser útil se você precisar
 * exibir dados em contextos onde a sanitização automática não ocorre, ou como
 * uma camada extra de segurança (embora raramente necessária para exibição direta no DOM).
 * Mais importante pode ser apenas remover espaços extras.
 *
 * @param input A string de entrada.
 * @returns A string com espaços extras removidos.
 */
export function simpleSanitize(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return '';
  }
  // Remove espaços extras no início/fim. Outras sanitizações mais complexas
  // (como remover tags HTML) exigiriam bibliotecas como 'dompurify'.
  return input.trim();
}

/**
 * Formata um número como moeda brasileira (Real).
 * @param amount - O valor numérico.
 * @returns String formatada (ex: "R$ 149,90").
 */
export function formatPrice(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) {
    return 'Indisponível'; // Ou 'Gratuito' se 0 for gratuito
  }
  if (amount === 0) {
      return 'Gratuito';
  }
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

/**
 * Formata uma data para exibição localizada em português.
 * @param date - Objeto Date, string de data ou timestamp.
 * @param options - Opções de formatação Intl.DateTimeFormat.
 * @returns String formatada (ex: "28 de outubro de 2025").
 */
export function formatDate(
    date: Date | string | number | undefined,
    options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' }
): string {
  if (!date) return 'Data indisponível';
  try {
    const dateObj = new Date(date);
    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }
    return new Intl.DateTimeFormat('pt-BR', options).format(dateObj);
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return 'Data inválida';
  }
}

/**
 * Formata uma data para exibição relativa (ex: "5 min atrás", "2d atrás").
 * Implementação básica. Para algo mais robusto, use bibliotecas como `date-fns` (formatDistanceToNow).
 * @param date - Objeto Date, string de data ou timestamp.
 * @returns String formatada relativa ao tempo atual.
 */
export function formatRelativeDate(date: Date | string | number | undefined): string {
    if (!date) return '-';
    try {
        const past = new Date(date);
        if (isNaN(past.getTime())) return 'Data inválida';

        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s atrás`;

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}min atrás`;

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h atrás`;

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays}d atrás`;

        // Se for mais antigo, apenas mostra a data
        return formatDate(past, { day: '2-digit', month: '2-digit', year: 'numeric' });

    } catch (error) {
        console.error("Erro ao formatar data relativa:", error);
        return 'Data inválida';
    }
}


/**
 * Trunca uma string para um comprimento máximo, adicionando reticências.
 * @param text - A string a ser truncada.
 * @param maxLength - O comprimento máximo desejado (incluindo reticências).
 * @returns A string truncada ou a original se for menor que o máximo.
 */
export function truncateText(text: string | null | undefined, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Gera um slug simples a partir de uma string (remove acentos, substitui espaços, etc.).
 * Pode ser útil no frontend para criar links, mas a geração final do slug
 * geralmente deve ocorrer no backend ao salvar dados.
 * @param text - A string de entrada.
 * @returns Uma versão simplificada da string para URLs.
 */
export function createSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD') // Remove acentos
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres não alfanuméricos (exceto espaço e hífen)
    .trim()
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-'); // Remove hífens duplicados
}

// Você pode adicionar mais funções utilitárias aqui conforme necessário
// Ex: Funções para validar email, gerar IDs aleatórios, etc.