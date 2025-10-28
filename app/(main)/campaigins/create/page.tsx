// app/(main)/campaigns/create/page.tsx
'use client'; // Necessário para estado e eventos

import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProfileWidget from '@/components/profile/ProfileWidget'; // Reutilizar widget de perfil/settings

// Tipos
interface NewCampaignResponse {
  id: string; // Ou o tipo do seu ID no MongoDB
  // Inclua outros campos se a API retornar mais dados
}

export default function CreateCampaignPage() {
  const router = useRouter();

  // Estados do formulário
  const [title, setTitle] = useState('');
  const [system, setSystem] = useState('');
  const [description, setDescription] = useState('');
  const [nextSession, setNextSession] = useState('');
  const [status, setStatus] = useState('Recrutando'); // Valor padrão

  // Estados do banner
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null); // Ref para acionar o input

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);


  // --- Handler para mudança do arquivo de Banner ---
  const handleBannerChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setBannerFile(null); // Limpa seleção anterior
    setBannerPreview(null); // Limpa preview anterior
    setError(null); // Limpa erro anterior

    if (!file) {
      return;
    }

    // Validação
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Banner excede o limite de ${maxSizeMB}MB.`);
      event.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida para o banner.');
      event.target.value = '';
      return;
    }

    setBannerFile(file);

    // Gerar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- Handler para clique na área de preview ---
  const handlePreviewClick = () => {
    fileInputRef.current?.click(); // Aciona o input de arquivo escondido
  };

  // --- Handler para submissão do formulário ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validação básica de campos obrigatórios
    if (!title || !system || !description) {
        setError('Título, Sistema e Descrição são obrigatórios.');
        setIsLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('system', system);
    formData.append('description', description);
    formData.append('next_session', nextSession);
    formData.append('status', status);

    if (bannerFile) {
      formData.append('banner_image', bannerFile); // Nome deve corresponder ao esperado pela API
    }

    try {
      // Chama a API Route POST /api/campaigns
      const response = await fetch('/api/campaigns', {
        method: 'POST',
        body: formData,
        // Content-Type é definido automaticamente pelo navegador para FormData
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Falha ao forjar a crônica.');
      }

      setSuccessMessage('Crônica forjada com sucesso! Redirecionando...');
      const newCampaignId = result.data.id as string; // Pega o ID da resposta

      // Redireciona para o Hub da crônica recém-criada após um delay
      setTimeout(() => {
        router.push(`/campaigns/${newCampaignId}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
      setIsLoading(false); // Permite tentar novamente
    }
    // Não resetamos isLoading aqui porque o redirecionamento ocorrerá
  };

  return (
    // Container principal com padding extra no bottom
    <div className="upload-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header da página */}
      {/* */}
      <header className="page-header text-center mb-12">
        <h1 className="page-title font-epic text-4xl sm:text-5xl lg:text-6xl text-vintage-gold text-shadow-gold-glow">
          Forjar uma Crônica
        </h1>
        <p className="page-subtitle text-lg font-light text-gray-whisper mt-2">
          Molde o mundo da sua próxima grande aventura.
        </p>
      </header>

      {/* Formulário em Grid */}
      {/* */}
      <form id="campaign-create-form" onSubmit={handleSubmit} className="upload-form-grid grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Coluna 1: Arquivos e Configurações */}
        <div className="md:col-span-1">
          <ProfileWidget title="Arquivos e Configurações">
            {/* Upload Banner */}
            {/* */}
            <div className="form-group upload-group mb-6">
              <label className="block text-sm font-light text-gray-whisper mb-1">Banner da Crônica (Opcional)</label>
              <p className="upload-instructions text-xs text-gray-whisper/70 mb-2">A imagem que seus jogadores verão. Recomendado: 16:9, máx 5MB.</p>
              <div
                id="image-preview-container"
                onClick={handlePreviewClick}
                className="upload-preview-box relative w-full aspect-video border-2 border-dashed border-gray-whisper/30 rounded-lg flex justify-center items-center cursor-pointer transition-colors hover:border-vintage-gold overflow-hidden bg-slate-blue/10"
              >
                {bannerPreview ? (
                  <Image
                    id="image-preview-element"
                    src={bannerPreview}
                    alt="Preview do Banner"
                    fill
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <span className="preview-placeholder-text text-gray-whisper font-title text-sm">Clique para selecionar</span>
                )}
              </div>
              <input
                type="file"
                id="preview-image-input"
                name="banner_image" // Nome esperado pela API
                ref={fileInputRef}
                className="file-input hidden"
                accept="image/*"
                onChange={handleBannerChange}
              />
            </div>

            {/* Próxima Sessão */}
            <div className="form-group">
               <input
                type="text"
                id="next_session"
                name="next_session"
                value={nextSession}
                onChange={(e) => setNextSession(e.target.value)}
                placeholder=" "
                className="peer"
              />
              <label htmlFor="next_session">Próxima Sessão (Ex: Sábados, 20h)</label>
            </div>

            {/* Status da Crônica */}
            {/* */}
            <div className="form-group select-group relative">
               <label htmlFor="status" className="block text-sm font-light text-gray-whisper mb-1">Status da Crônica</label>
               <select
                id="status"
                name="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                className="w-full bg-transparent border border-gray-whisper/20 rounded-lg p-3 text-bone-white font-body text-base outline-none appearance-none cursor-pointer focus:border-vintage-gold"
              >
                 <option value="Recrutando" className="bg-deep-space-blue">Recrutando (Visível na Taverna)</option>
                 <option value="Privada" className="bg-deep-space-blue">Privada (Apenas para convidados)</option>
                 <option value="Pausada" className="bg-deep-space-blue">Pausada</option>
                 {/* Adicionar 'Concluída' se fizer sentido */}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-whisper">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
               </div>
            </div>

          </ProfileWidget>
        </div>

        {/* Coluna 2: Detalhes da Crônica */}
        <div className="md:col-span-2">
          <ProfileWidget title="Detalhes da Crônica">
            {/* Título */}
            <div className="form-group">
              <input
                type="text"
                id="title"
                name="title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder=" "
                className="peer"
              />
              <label htmlFor="title">Título da Crônica</label>
            </div>

            {/* Sistema */}
            <div className="form-group">
              <input
                type="text"
                id="system"
                name="system"
                required
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                placeholder=" "
                className="peer"
              />
              <label htmlFor="system">Sistema de Regras (Ex: Versalles, D&D 5e)</label>
            </div>

            {/* Descrição */}
            {/* */}
            <div className="form-group">
               <textarea
                id="description"
                name="description"
                rows={10}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder=" "
                className="min-h-[200px] peer"
              />
              <label htmlFor="description">Descrição da Crônica (Sinopse)</label>
            </div>
          </ProfileWidget>
        </div>

        {/* Barra de Salvar Fixa */}
        {/* */}
        <div className="upload-save-bar fixed bottom-0 left-0 w-full bg-transparent-darker backdrop-blur-10 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] text-right z-50 border-t border-gold-glow/30">
          {/* Mensagens de status */}
          {error && <span className="text-red-400 text-sm mr-4">{error}</span>}
          {successMessage && <span className="text-green-400 text-sm mr-4">{successMessage}</span>}

          <button
            type="submit"
            disabled={isLoading}
            className={`submit-button inline-block min-w-[200px] px-6 py-3 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-base transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:ring-offset-2 focus:ring-offset-deep-space-blue disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Forjando...' : 'Forjar Crônica'}
          </button>
        </div>
      </form>
    </div>
  );
}