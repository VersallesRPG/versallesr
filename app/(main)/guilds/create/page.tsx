// app/(main)/guilds/create/page.tsx
'use client';

import { useState, ChangeEvent, FormEvent, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ProfileWidget from '@/components/profile/ProfileWidget'; // Reutilizar

// Tipos
interface NewGuildResponse {
  guildId: string; // ID da nova guilda criada
  // Inclua outros campos se a API retornar
}

export default function CreateGuildPage() {
  const router = useRouter();

  // Estados do formulário
  const [name, setName] = useState('');
  const [tag, setTag] = useState(''); // Opcional: ex: [CLAN]
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false); // Pública por padrão

  // Estados opcionais para Avatar/Banner da Guilda
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Handler para mudança de arquivos (reutilizado de settings) ---
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFileState: (file: File | null) => void,
    setPreviewState: (url: string | null) => void,
    maxSizeMB: number = 2 // Tamanho menor para avatares/banners de guilda
  ) => {
    const file = event.target.files?.[0];
    setFileState(null);
    setPreviewState(null);
    setError(null);

    if (!file) return;

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Arquivo ${file.name} excede o limite de ${maxSizeMB}MB.`);
      event.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      event.target.value = '';
      return;
    }

    setFileState(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewState(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // --- Handlers para acionar inputs escondidos ---
  const handleAvatarLabelClick = () => avatarInputRef.current?.click();
  const handleBannerLabelClick = () => bannerInputRef.current?.click();

  // --- Handler para submissão do formulário ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    // Validação básica
    if (!name.trim()) {
      setError('O Nome da Guilda é obrigatório.');
      setIsLoading(false);
      return;
    }
    if (tag.length > 5) {
        setError('A Tag da Guilda não pode exceder 5 caracteres.');
        setIsLoading(false);
        return;
    }
     if (name.length > 50) {
        setError('O Nome da Guilda não pode exceder 50 caracteres.');
        setIsLoading(false);
        return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('tag', tag);
    formData.append('description', description);
    formData.append('isPrivate', String(isPrivate)); // Enviar como string 'true'/'false'

    if (avatarFile) formData.append('avatar', avatarFile);
    if (bannerFile) formData.append('banner', bannerFile);

    try {
      // Chama a API Route POST /api/guilds
      const response = await fetch('/api/guilds', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Falha ao criar a guilda.');
      }

      setSuccessMessage('Guilda criada com sucesso! Redirecionando...');
      const newGuildId = result.data.guildId as string;

      // Redireciona para a página da guilda recém-criada
      setTimeout(() => {
        router.push(`/guilds/${newGuildId}`);
      }, 1500);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
      setIsLoading(false);
    }
  };

  return (
    // Container principal
    <div className="create-guild-container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header da página */}
      <header className="page-header text-center mb-12">
        <h1 className="page-title font-epic text-4xl sm:text-5xl lg:text-6xl text-vintage-gold text-shadow-gold-glow">
          Forjar uma Nova Guilda
        </h1>
        <p className="page-subtitle text-lg font-light text-gray-whisper mt-2">
          Reúna seus aliados e estabeleça seu estandarte.
        </p>
         {/* Breadcrumbs */}
         <nav aria-label="Breadcrumb" className="mt-4 text-sm font-light text-gray-whisper">
             <ol className="list-none p-0 inline-flex">
               <li className="flex items-center">
                 <Link href="/guilds" className="hover:text-vintage-gold">Guildas</Link>
                 <svg className="fill-current w-3 h-3 mx-2 text-gray-whisper" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"></path></svg>
               </li>
               <li className="flex items-center">
                 <span className="text-bone-white">Criar Guilda</span>
               </li>
             </ol>
         </nav>
      </header>

      {/* Formulário */}
      <form id="create-guild-form" onSubmit={handleSubmit}>
         {/* Usando ProfileWidget para consistência visual */}
         <ProfileWidget title="Informações da Guilda">
            {/* Nome da Guilda */}
            <div className="form-group">
              <input
                type="text"
                id="name"
                name="name"
                required
                maxLength={50}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder=" "
                className="peer"
              />
              <label htmlFor="name">Nome da Guilda (Obrigatório)</label>
            </div>

            {/* Tag da Guilda */}
            <div className="form-group">
              <input
                type="text"
                id="tag"
                name="tag"
                maxLength={5}
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder=" "
                className="peer"
              />
              <label htmlFor="tag">Tag Curta (Opcional, Ex: VRLS)</label>
               <p className="text-xs text-gray-whisper mt-1">Máximo 5 caracteres. Será exibida entre colchetes: [{tag || 'TAG'}]</p>
            </div>

            {/* Descrição */}
            <div className="form-group">
               <textarea
                id="description"
                name="description"
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder=" "
                className="min-h-[120px] peer"
              />
              <label htmlFor="description">Descrição (Opcional)</label>
               <p className="text-xs text-gray-whisper mt-1">Conte um pouco sobre sua guilda, seus objetivos ou regras.</p>
            </div>

            {/* Visibilidade */}
            <div className="form-group flex items-center gap-4 mb-6">
                 <label htmlFor="isPrivate" className="text-sm font-light text-gray-whisper cursor-pointer">Visibilidade:</label>
                 <div className="flex items-center gap-2">
                    <input
                        type="radio"
                        id="public"
                        name="visibility"
                        value="public"
                        checked={!isPrivate}
                        onChange={() => setIsPrivate(false)}
                        className="form-radio h-4 w-4 text-vintage-gold bg-transparent border-gray-whisper/50 focus:ring-vintage-gold"
                    />
                    <label htmlFor="public" className="text-sm text-bone-white cursor-pointer">Pública (Qualquer um pode ver e aplicar)</label>
                 </div>
                 <div className="flex items-center gap-2">
                    <input
                        type="radio"
                        id="private"
                        name="visibility"
                        value="private"
                        checked={isPrivate}
                        onChange={() => setIsPrivate(true)}
                        className="form-radio h-4 w-4 text-vintage-gold bg-transparent border-gray-whisper/50 focus:ring-vintage-gold"
                    />
                    <label htmlFor="private" className="text-sm text-bone-white cursor-pointer">Privada (Apenas por convite)</label>
                 </div>
            </div>

             {/* Upload Avatar (Opcional) */}
            <div className="form-group upload-group mb-6 border-t border-gold-glow/20 pt-6">
                <label className="block text-sm font-light text-gray-whisper mb-2">Avatar da Guilda (Opcional)</label>
                <div className='flex items-center gap-4'>
                    <Image
                        id="avatar-preview"
                        src={avatarPreview || '/img/default-guild-avatar.png'} // Use um placeholder específico para guildas
                        alt="Preview do Avatar da Guilda"
                        width={80}
                        height={80}
                        className="avatar-preview rounded-full object-cover border-2 border-gold-glow/70 flex-shrink-0"
                    />
                    <div>
                        <input
                           type="file" id="avatar-input" name="avatar"
                           ref={avatarInputRef}
                           className="file-input hidden" accept="image/*"
                           onChange={(e) => handleFileChange(e, setAvatarFile, setAvatarPreview, 2)}
                        />
                        <button type="button" onClick={handleAvatarLabelClick}
                          className="file-input-label inline-block px-4 py-2 bg-transparent border border-vintage-gold text-vintage-gold rounded-full cursor-pointer transition-all duration-300 hover:bg-vintage-gold hover:text-deep-space-blue text-sm font-semibold"
                        >
                          Escolher Avatar
                        </button>
                        <p className="text-xs text-gray-whisper mt-1">Máx 2MB. Recomendado 1:1.</p>
                    </div>
                </div>
            </div>

             {/* Upload Banner (Opcional) */}
            <div className="form-group upload-group">
                <label className="block text-sm font-light text-gray-whisper mb-2">Banner da Guilda (Opcional)</label>
                <div
                  id="banner-preview"
                  className="banner-preview w-full aspect-[3/1] rounded-lg bg-cover bg-center border border-dashed border-gray-whisper/30 mb-2 bg-slate-blue/20"
                  style={{ backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none' }}
                >
                    {!bannerPreview && <span className="flex items-center justify-center h-full text-gray-whisper text-sm">Preview do Banner (3:1)</span>}
                </div>
                <input
                  type="file" id="banner-input" name="banner"
                  ref={bannerInputRef}
                  className="file-input hidden" accept="image/*"
                  onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview, 3)} // Max 3MB para banner
                />
                <button type="button" onClick={handleBannerLabelClick}
                  className="file-input-label inline-block px-4 py-2 bg-transparent border border-vintage-gold text-vintage-gold rounded-full cursor-pointer transition-all duration-300 hover:bg-vintage-gold hover:text-deep-space-blue text-sm font-semibold"
                >
                  Escolher Banner
                </button>
                 <p className="text-xs text-gray-whisper mt-1">Máx 3MB. Recomendado 3:1.</p>
            </div>

          </ProfileWidget>

        {/* Barra de Salvar Fixa */}
        <div className="upload-save-bar fixed bottom-0 left-0 w-full bg-transparent-darker backdrop-blur-10 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] text-right z-50 border-t border-gold-glow/30">
          {error && <span className="text-red-400 text-sm mr-4">{error}</span>}
          {successMessage && <span className="text-green-400 text-sm mr-4">{successMessage}</span>}
          <button
            type="submit"
            disabled={isLoading}
            className={`submit-button inline-block min-w-[200px] px-6 py-3 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-base transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:ring-offset-2 focus:ring-offset-deep-space-blue disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Forjando...' : 'Forjar Guilda'}
          </button>
        </div>
      </form>
    </div>
  );
}