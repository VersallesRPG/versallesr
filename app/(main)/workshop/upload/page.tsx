// app/(main)/workshop/upload/page.tsx
'use client';

import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProfileWidget from '@/components/profile/ProfileWidget'; // Reutilizar

// Opções para os selects (baseado em workshop-upload.php)
//
const systemOptions = [
    { value: "", label: "Selecione o Sistema Principal", disabled: true },
    { value: "Versalles", label: "Versalles" },
    { value: "Inseption RPG", label: "Inseption RPG" },
    { value: "Contrato de Sangue", label: "Contrato de Sangue" },
    { value: "Souls Of Abiss", label: "Souls Of Abiss" },
    { value: "Cronofobia RPG", label: "Cronofobia RPG" },
    { value: "D&D 5e", label: "D&D 5e" },
    { value: "Ordem Paranormal", label: "Ordem Paranormal" },
    { value: "Chamado de Cthulhu", label: "Chamado de Cthulhu" },
    { value: "Sistema Agnostico", label: "Sistema Agnóstico" },
    { value: "Outro", label: "Outro" },
];

const typeOptions = [
    { value: "", label: "Selecione o Tipo Principal", disabled: true },
    { value: "Aventura", label: "Aventura / Crônica" },
    { value: "Bestiário", label: "Bestiário / Criaturas" },
    { value: "Mapas", label: "Mapas" },
    { value: "Tokens", label: "Tokens" },
    { value: "Sistema Completo", label: "Sistema Completo" },
    { value: "Suplemento", label: "Suplemento de Regras" },
    { value: "Módulo VTT", label: "Módulo VTT (Foundry, Roll20)" },
    { value: "Trilha Sonora", label: "Trilha Sonora / Música" },
    { value: "Arte", label: "Pacote de Arte" },
    { value: "Ferramenta", label: "Ferramenta / Gerador" },
    { value: "Outro", label: "Outro" },
];


export default function WorkshopUploadPage() {
  const router = useRouter();

  // Estados do formulário
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [system, setSystem] = useState('');
  const [type, setType] = useState('');

  // Estados dos arquivos
  const [previewImageFile, setPreviewImageFile] = useState<File | null>(null);
  const [itemFile, setItemFile] = useState<File | null>(null);

  // Estados dos previews e nomes de arquivos
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [itemFileName, setItemFileName] = useState<string>('Nenhum arquivo selecionado');

  // Refs para inputs de arquivo
  const previewInputRef = useRef<HTMLInputElement>(null);
  const itemFileInputRef = useRef<HTMLInputElement>(null);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Handler para mudança de arquivos (reutilizável) ---
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFileState: (file: File | null) => void,
    setPreviewState?: (url: string | null) => void, // Para imagem
    setNameState?: (name: string) => void, // Para arquivo principal
    maxSizeMB: number = 5 // Padrão 5MB, pode ser sobrescrito
  ) => {
    const file = event.target.files?.[0];
    // Limpa estados anteriores
    setFileState(null);
    if (setPreviewState) setPreviewState(null);
    if (setNameState) setNameState('Nenhum arquivo selecionado');
    setError(null);

    if (!file) return;

    // Validação
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo ${file.name} excede o limite de ${maxSizeMB}MB.`);
      event.target.value = '';
      return;
    }
    // Validação de tipo específica para imagem preview
    if (setPreviewState && !file.type.startsWith('image/')) {
        setError('Por favor, selecione uma imagem válida para a capa.');
        event.target.value = '';
        return;
    }
    // Validação de tipo para arquivo principal (exemplo: zip ou pdf)
    //
    if (setNameState && !['application/zip', 'application/pdf', 'application/x-zip-compressed'].includes(file.type)) {
         setError('Arquivo principal deve ser .zip ou .pdf.');
         event.target.value = '';
         return;
    }


    setFileState(file);

    // Gerar preview OU mostrar nome do arquivo
    if (setPreviewState) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewState(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else if (setNameState) {
      setNameState(file.name);
    }
  };

  // --- Handlers para acionar inputs escondidos ---
  const handlePreviewBoxClick = () => previewInputRef.current?.click();
  const handleItemFileLabelClick = () => itemFileInputRef.current?.click();

  // --- Handler para submissão do formulário ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validação básica
    if (!title || !description || !system || !type || !previewImageFile || !itemFile) {
        setError('Todos os campos e arquivos são obrigatórios.');
        setIsLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('system', system);
    formData.append('type', type);
    formData.append('preview_image', previewImageFile); // Nome esperado pela API
    formData.append('item_file', itemFile);             // Nome esperado pela API

    try {
      // Chama a API Route POST /api/workshop/items
      //
      const response = await fetch('/api/workshop/items', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Falha ao publicar na oficina.');
      }

      setSuccessMessage('Sua criação foi enviada! Redirecionando para a Oficina...');

      // Redireciona para a Oficina (aba itens) após um delay
      //
      setTimeout(() => {
        router.push('/workshop#items');
      }, 2000);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
      setIsLoading(false);
    }
  };

  return (
     // Container principal
    <div className="upload-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header da página */}
      {/* */}
      <header className="page-header text-center mb-12">
        <h1 className="page-title font-epic text-4xl sm:text-5xl lg:text-6xl text-vintage-gold text-shadow-gold-glow">
          Forjar uma Criação
        </h1>
        <p className="page-subtitle text-lg font-light text-gray-whisper mt-2">
          Compartilhe sua visão com o universo de Versalles.
        </p>
      </header>

      {/* Formulário em Grid */}
      {/* */}
      <form id="workshop-upload-form" onSubmit={handleSubmit} className="upload-form-grid grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Coluna 1: Arquivos */}
        <div className="md:col-span-1">
          <ProfileWidget title="Arquivos da Criação">
             {/* Upload Imagem de Capa */}
             {/* */}
            <div className="form-group upload-group mb-6">
              <label className="block text-sm font-light text-gray-whisper mb-1">Imagem de Capa (Preview)</label>
              <p className="upload-instructions text-xs text-gray-whisper/70 mb-2">A primeira impressão da sua obra. Recomendado: 16:9, máx 5MB.</p>
              <div
                id="image-preview-container"
                onClick={handlePreviewBoxClick}
                className="upload-preview-box relative w-full aspect-video border-2 border-dashed border-gray-whisper/30 rounded-lg flex justify-center items-center cursor-pointer transition-colors hover:border-vintage-gold overflow-hidden bg-slate-blue/10"
              >
                {previewImageUrl ? (
                  <Image
                    id="image-preview-element"
                    src={previewImageUrl}
                    alt="Preview da Imagem"
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
                name="preview_image" // Nome esperado pela API
                ref={previewInputRef}
                className="file-input hidden"
                accept="image/*"
                required
                onChange={(e) => handleFileChange(e, setPreviewImageFile, setPreviewImageUrl, undefined, 5)}
              />
            </div>

            {/* Upload Arquivo Principal */}
            {/* */}
            <div className="form-group upload-group">
                <label className="block text-sm font-light text-gray-whisper mb-1">Arquivo Principal (.zip, .pdf)</label>
                <p className="upload-instructions text-xs text-gray-whisper/70 mb-2">O conteúdo da sua criação. Empacote tudo, máx 50MB.</p>
                <input
                    type="file"
                    id="item-file-input"
                    name="item_file" // Nome esperado pela API
                    ref={itemFileInputRef}
                    className="file-input hidden"
                    required
                    accept=".zip,.pdf" // Limita seleção no navegador
                    onChange={(e) => handleFileChange(e, setItemFile, undefined, setItemFileName, 50)}
                 />
                <button
                    type="button" // Impede submit do form
                    onClick={handleItemFileLabelClick}
                    className="file-input-label inline-block px-4 py-2 bg-transparent border border-vintage-gold text-vintage-gold rounded-full cursor-pointer transition-all duration-300 hover:bg-vintage-gold hover:text-deep-space-blue text-sm font-semibold"
                 >
                   Selecionar Arquivo
                </button>
                <span id="file-info" className="file-info-text ml-4 italic text-gray-whisper text-sm">
                    {itemFileName}
                </span>
            </div>
          </ProfileWidget>
        </div>

        {/* Coluna 2: Detalhes */}
        <div className="md:col-span-2">
          <ProfileWidget title="Detalhes da Criação">
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
              <label htmlFor="title">Título da Criação</label>
            </div>

            {/* Descrição */}
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
              <label htmlFor="description">Descrição Detalhada</label>
            </div>

            {/* Select Sistema */}
             {/* */}
            <div className="form-group select-group relative mb-6">
               <label htmlFor="system" className="block text-sm font-light text-gray-whisper mb-1">Sistema de Regras</label>
               <select
                id="system"
                name="system"
                value={system}
                onChange={(e) => setSystem(e.target.value)}
                required
                className="w-full bg-transparent border border-gray-whisper/20 rounded-lg p-3 text-bone-white font-body text-base outline-none appearance-none cursor-pointer focus:border-vintage-gold"
              >
                 {systemOptions.map(opt => <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-deep-space-blue">{opt.label}</option>)}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-whisper">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
               </div>
            </div>

             {/* Select Tipo */}
             <div className="form-group select-group relative">
               <label htmlFor="type" className="block text-sm font-light text-gray-whisper mb-1">Tipo de Conteúdo</label>
               <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                className="w-full bg-transparent border border-gray-whisper/20 rounded-lg p-3 text-bone-white font-body text-base outline-none appearance-none cursor-pointer focus:border-vintage-gold"
              >
                 {typeOptions.map(opt => <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-deep-space-blue">{opt.label}</option>)}
               </select>
               <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-whisper">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
               </div>
            </div>

            {/* TODO: Adicionar campo de Preço se a monetização estiver ativa */}

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
            {isLoading ? 'Publicando...' : 'Publicar na Oficina'}
          </button>
        </div>
      </form>
    </div>
  );
}