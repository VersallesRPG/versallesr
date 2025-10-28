// app/(main)/workshop/layout.tsx
import React from 'react';

// Este layout envolve todas as páginas dentro da rota /workshop/*
// Ele herda automaticamente o RootLayout (com Header e Footer globais).
// Não precisamos adicionar Header ou Footer aqui novamente.

export default function WorkshopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Renderiza diretamente o conteúdo específico da rota da Oficina (page.tsx, items/[itemId]/page.tsx, etc.)
  return <>{children}</>;
}

// Nota: Você *poderia* adicionar elementos de layout compartilhados por TODAS
// as páginas da oficina aqui, como um sub-header específico da Oficina,
// mas baseado na estrutura atual, o cabeçalho principal está no page.tsx.
// Exemplo:
// return (
//   <div>
//     {/* <WorkshopSubHeader /> Componente hipotético */}
//     {children}
//   </div>
// );