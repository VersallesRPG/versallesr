// app/(main)/forums/[forumId]/create-thread/page.tsx
'use client';

import { useState, FormEvent } from 'react';
import { useRouter, useParams } from 'next/navigation'; // Hooks para navegação e parâmetros da URL
import Link from 'next/link';
import ProfileWidget from '@/components/profile/ProfileWidget'; // Reutilizar

// Tipos
interface NewThreadResponse {
  threadId: string; // ID do novo tópico criado
  // Inclua outros campos se a API retornar
}

export default function CreateThreadPage() {
  const router = useRouter();
  const params = useParams(); // Hook para pegar parâmetros dinâmicos da rota
  const forumId = params.forumId as string; // Pega o [forumId] da URL

  // Estados do formulário
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Conteúdo do primeiro post

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handler para submissão
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validação básica
    if (!title.trim() || !content.trim()) {
      setError('Título e Conteúdo são obrigatórios.');
      setIsLoading(false);
      return;
    }
    if (title.length > 150) { // Exemplo de limite
        setError('O título não pode exceder 150 caracteres.');
        setIsLoading(false);
        return;
    }

    try {
      // Chama a API Route POST /api/forums/[forumId]/threads
      const response = await fetch(`/api/forums/${forumId}/threads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content }), // Envia título e o primeiro post
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Falha ao criar o tópico.');
      }

      setSuccessMessage('Tópico criado com sucesso! Redirecionando...');
      const newThreadId = result.data.threadId as string;

      // Redireciona para a página do tópico recém-criado
      setTimeout(() => {
        router.push(`/forums/threads/${newThreadId}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
      setIsLoading(false); // Permite tentar novamente
    }
     // Não desabilitar o loading aqui por causa do redirect
  };

  // Se forumId não estiver presente (pouco provável com App Router, mas bom verificar)
  if (!forumId) {
     return <div className="p-8 text-center text-red-400">ID do Fórum não encontrado na URL.</div>;
  }

  return (
    // Container principal (similar a outras páginas de criação)
    //
    <div className="upload-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
       {/* Breadcrumbs e Header */}
       <header className="mb-8">
           <nav aria-label="Breadcrumb" className="mb-4 text-sm font-light text-gray-whisper">
             <ol className="list-none p-0 inline-flex">
               <li className="flex items-center">
                 <Link href="/forums" className="hover:text-vintage-gold">Fóruns</Link>
                 <svg className="fill-current w-3 h-3 mx-2 text-gray-whisper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"></path></svg>
               </li>
               <li className="flex items-center">
                  {/* Idealmente, buscar o nome do fórum ou passar como prop, mas linkar de volta é suficiente */}
                 <Link href={`/forums/${forumId}`} className="hover:text-vintage-gold">Fórum</Link>
                 <svg className="fill-current w-3 h-3 mx-2 text-gray-whisper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"></path></svg>
               </li>
               <li className="flex items-center">
                 <span className="text-bone-white">Novo Tópico</span>
               </li>
             </ol>
           </nav>
           <h1 className="page-title font-title text-3xl sm:text-4xl text-vintage-gold">
             Iniciar Nova Discussão
           </h1>
           <p className="page-subtitle text-base font-light text-gray-whisper mt-1">
             Compartilhe suas ideias ou tire suas dúvidas com a comunidade.
           </p>
       </header>

      {/* Formulário */}
      {/* Estrutura similar a workshop-discussion-create.php */}
      {/* */}
      <form id="discussion-create-form" onSubmit={handleSubmit}>
         <ProfileWidget title="Conteúdo do Tópico">
            {/* Campo Título */}
            <div className="form-group">
              <input
                type="text"
                id="title"
                name="title"
                required
                maxLength={150} // Limite de exemplo
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=" "
                className="peer"
              />
              <label htmlFor="title">Título do Tópico</label>
            </div>

            {/* Campo Conteúdo (Textarea) */}
            {/* Estilo similar a workshop-discussion-create.css */}
            {/* */}
            <div className="form-group">
               <textarea
                id="body_content"
                name="body_content"
                rows={15} // Altura inicial
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder=" "
                className="min-h-[250px] peer" // Altura mínima
              />
              <label htmlFor="body_content">Escreva sua mensagem...</label>
              {/* Opcional: Adicionar barra de formatação (Bold, Italic, etc.) com Markdown ou Rich Text Editor */}
            </div>
          </ProfileWidget>

        {/* Barra de Salvar Fixa (reutilizada) */}
        <div className="upload-save-bar fixed bottom-0 left-0 w-full bg-transparent-darker backdrop-blur-10 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] text-right z-50 border-t border-gold-glow/30">
          {/* Mensagens de status */}
          {error && <span className="text-red-400 text-sm mr-4">{error}</span>}
          {successMessage && <span className="text-green-400 text-sm mr-4">{successMessage}</span>}

          <button
            type="submit"
            disabled={isLoading}
            className={`submit-button inline-block min-w-[200px] px-6 py-3 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-base transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:ring-offset-2 focus:ring-offset-deep-space-blue disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Publicando...' : 'Publicar Tópico'}
          </button>
        </div>
      </form>
    </div>
  );
}