// app/layout.tsx
import type { Metadata } from 'next';
import { Cinzel_Decorative, Cinzel, Poppins } from 'next/font/google'; // Importa as fontes do Google via next/font

import './globals.css'; // Importa os estilos globais (incluindo Tailwind)

// Componentes de Layout (você precisará criá-los)
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
// import AuthProvider from '@/components/providers/AuthProvider'; // Opcional: Se precisar de um Contexto de Autenticação global

// --- Configuração das Fontes ---
// Baseado no seu style.css: Cinzel Decorative (epic), Cinzel (title), Poppins (body)
// Veja a documentação do next/font para mais opções (pesos, subsets, etc.)
const cinzelDecorative = Cinzel_Decorative({
  weight: ['700'], // Apenas o peso 700 usado no CSS
  subsets: ['latin'],
  variable: '--font-cinzel-decorative', // Define uma variável CSS
  display: 'swap',
});

const cinzel = Cinzel({
  weight: ['700'], // Apenas o peso 700 usado no CSS
  subsets: ['latin'],
  variable: '--font-cinzel', // Define uma variável CSS
  display: 'swap',
});

const poppins = Poppins({
  weight: ['200', '400', '600', '700'], // Pesos usados nos seus CSS
  subsets: ['latin'],
  variable: '--font-poppins', // Define uma variável CSS
  display: 'swap',
});

// --- Metadados Padrão ---
// Define o título padrão e outras meta tags para SEO
export const metadata: Metadata = {
  title: {
    default: 'Versalles RPG', // Título padrão
    template: '%s | Versalles RPG', // Template para títulos de páginas específicas
  },
  description: 'A plataforma definitiva para suas aventuras de RPG de Mesa.',
  icons: {
    icon: '/img/favicon.png', // Caminho para o favicon na pasta /public/img
  },
};

// --- Componente RootLayout ---
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      {/* Combina as variáveis CSS das fontes com as classes do Tailwind */}
      <body
        className={`${cinzelDecorative.variable} ${cinzel.variable} ${poppins.variable} font-body bg-deep-space-blue text-bone-white antialiased overflow-x-hidden`}
        // Aplica o gradiente de fundo diretamente ou via classe Tailwind se definida
        style={{
          backgroundImage: 'linear-gradient(145deg, #4a5568 0%, #0a0f1e 74%)', // Recria o gradiente do style.css
        }}
      >
        {/* <AuthProvider> Opcional: Envolver com provedor de contexto */}
          {/* Renderiza o Header */}
          <Header />

          {/* Área principal onde o conteúdo da página (children) será renderizado */}
          {/* Adiciona padding-top para compensar o header fixo, como no style.css */}
          <main className="site-content pt-[100px] min-h-[calc(100vh-100px)]">
            {children}
          </main>

          {/* Renderiza o Footer */}
          <Footer />
        {/* </AuthProvider> */}
      </body>
    </html>
  );
}