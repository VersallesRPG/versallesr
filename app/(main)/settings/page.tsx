// app/(main)/settings/page.tsx
'use client'; // Necessário para hooks e interatividade

import { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import ProfileWidget from '@/components/profile/ProfileWidget'; // Reutilizar o widget

// Tipos (definir em @/types/index.ts)
interface UserProfileData {
  username?: string; // Para redirecionamento pós-salvar
  bio?: string;
  clan?: string;
  genre?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  backgroundUrl?: string;
}

export default function SettingsPage() {
  const router = useRouter();

  // Estados para dados do formulário
  const [initialDataLoading, setInitialDataLoading] = useState(true);
  const [bio, setBio] = useState('');
  const [clan, setClan] = useState('');
  const [genre, setGenre] = useState('');
  const [username, setUsername] = useState(''); // Para redirecionar

  // Estados para arquivos e previews
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  // O preview do background é aplicado diretamente no body via JS

  // Estados de UI
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // --- Buscar dados iniciais do usuário ---
  useEffect(() => {
    const fetchUserData = async () => {
      setInitialDataLoading(true);
      setError(null);
      try {
        // Você precisará de uma API Route GET /api/users/me que retorne os dados do usuário logado
        const response = await fetch('/api/users/me'); // Exemplo de endpoint
        if (!response.ok) {
          throw new Error('Falha ao buscar dados do usuário.');
        }
        const data: UserProfileData = await response.json();
        setBio(data.bio || '');
        setClan(data.clan || '');
        setGenre(data.genre || '');
        setAvatarPreview(data.avatarUrl || '/img/default-avatar.png');
        setBannerPreview(data.bannerUrl || null); // Começa null se não houver banner
        setUsername(data.username || ''); // Guardar para redirecionar
        // Aplicar background inicial se existir
        if (data.backgroundUrl) {
          document.body.style.backgroundImage = `url(${data.backgroundUrl})`;
          document.body.style.backgroundSize = 'cover';
          document.body.style.backgroundPosition = 'center center';
          document.body.style.backgroundAttachment = 'fixed';
        }

      } catch (err: any) {
        setError('Não foi possível carregar suas informações: ' + err.message);
      } finally {
        setInitialDataLoading(false);
      }
    };

    fetchUserData();

    // Cleanup: Remover background customizado ao sair da página
    return () => {
       document.body.style.backgroundImage = ''; // Volta ao padrão do CSS global/layout
       document.body.style.backgroundSize = '';
       document.body.style.backgroundPosition = '';
       document.body.style.backgroundAttachment = '';
    };

  }, []); // Roda apenas uma vez ao montar o componente

  // --- Handler para mudança de arquivos ---
  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
    setFile: (file: File | null) => void,
    setPreview: (url: string | null) => void,
    isBackground: boolean = false
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      // Opcional: reverter preview se o usuário cancelar
      // setFile(null);
      // setPreview(null); // Ou voltar ao original
      return;
    }

    // Validação básica
    const maxSizeMB = 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`O arquivo ${file.name} é muito grande! Máximo: ${maxSizeMB}MB.`);
      event.target.value = ''; // Limpa o input
      return;
    }
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione um arquivo de imagem válido.');
      event.target.value = '';
      return;
    }

    setError(null); // Limpa erro anterior
    setFile(file);

    // Gerar preview local
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (isBackground) {
        // Aplica diretamente no body para preview ao vivo
        document.body.style.backgroundImage = `url(${result})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center center';
        document.body.style.backgroundAttachment = 'fixed';
        // Não precisamos de um estado de preview separado para o background
      } else {
        setPreview(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Handler para submissão do formulário ---
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('clan', clan);
    formData.append('genre', genre);

    // Anexa arquivos apenas se foram selecionados
    if (avatarFile) formData.append('avatar_input', avatarFile);
    if (bannerFile) formData.append('banner_input', bannerFile);
    if (backgroundFile) formData.append('background_input', backgroundFile);

    try {
      // Usar PUT para atualização é semanticamente correto
      // Certifique-se que sua API Route /api/users/me aceita PUT
      const response = await fetch('/api/users/me', {
        method: 'PUT',
        body: formData,
        // Não defina Content-Type, o navegador faz isso com FormData
      });

      const result = await response.json();

      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Falha ao salvar as alterações.');
      }

      setSuccessMessage('Perfil atualizado com sucesso!');
      // Opcional: Resetar estados de arquivo após sucesso
      setAvatarFile(null);
      setBannerFile(null);
      setBackgroundFile(null);

      // Opcional: Redirecionar para o perfil após um pequeno delay
       setTimeout(() => {
           if (username) {
             router.push(`/profile/${username}`);
           }
       }, 1500);

    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro desconhecido.');
    } finally {
      setIsLoading(false);
    }
  };

  // Se os dados iniciais ainda estão carregando, mostre um loader
  if (initialDataLoading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
        <p className="text-vintage-gold font-title text-xl">Carregando sua identidade...</p>
        {/* Adicione um spinner visual aqui se desejar */}
      </div>
    );
  }


  return (
    // Container principal com padding extra no bottom devido à barra fixa
    //
    <div className="settings-container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
      {/* Header da página */}
      {/* */}
      <div className="settings-header text-center mb-12">
        <h1 className="settings-title font-epic text-4xl sm:text-5xl lg:text-6xl text-vintage-gold text-shadow-gold-glow">
          Forjar Identidade
        </h1>
        <p className="settings-subtitle text-lg font-light text-gray-whisper mt-2">
          Molde como o universo de Versalles vê você.
        </p>
      </div>

      {/* Formulário em Grid */}
      {/* */}
      <form id="profile-edit-form" onSubmit={handleSubmit} className="settings-form-grid grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Widget: Lenda e Afiliações */}
        <ProfileWidget title="Lenda e Afiliações">
          {/* Campo Bio */}
          <div className="form-group">
             <textarea
              id="bio"
              name="bio"
              rows={8}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder=" "
              className="min-h-[150px] peer"
            />
            <label htmlFor="bio">Sua Lenda (Biografia)</label>
          </div>

          {/* Campo Clã */}
          <div className="form-group select-group relative">
            <label htmlFor="clan" className="block text-sm font-light text-gray-whisper mb-1">Seu Clã</label>
            <select
              id="clan"
              name="clan"
              value={clan}
              onChange={(e) => setClan(e.target.value)}
              className="w-full bg-transparent border border-gray-whisper/20 rounded-lg p-3 text-bone-white font-body text-base outline-none appearance-none cursor-pointer focus:border-vintage-gold"
            >
              <option value="" className="bg-deep-space-blue">Sem Afiliação</option>
              <option value="Triskelion" className="bg-deep-space-blue">Triskelion</option>
              <option value="Versalles" className="bg-deep-space-blue">Versalles</option>
              <option value="Targaryen" className="bg-deep-space-blue">Casa Targaryen</option>
              {/* Adicione outros clãs aqui */}
            </select>
             {/* Seta para o select */}
            <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-whisper">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

          {/* Campo Gênero Favorito */}
          <div className="form-group select-group relative">
            <label htmlFor="genre" className="block text-sm font-light text-gray-whisper mb-1">Seu Gênero de Jogo Favorito</label>
            <select
              id="genre"
              name="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full bg-transparent border border-gray-whisper/20 rounded-lg p-3 text-bone-white font-body text-base outline-none appearance-none cursor-pointer focus:border-vintage-gold"
            >
              <option value="" className="bg-deep-space-blue">Indefinido</option>
              <option value="Horror" className="bg-deep-space-blue">Horror</option>
              <option value="Investigação" className="bg-deep-space-blue">Investigação</option>
              <option value="Medieval" className="bg-deep-space-blue">Medieval</option>
              <option value="Sci-Fi" className="bg-deep-space-blue">Sci-Fi</option>
              <option value="Cyberpunk" className="bg-deep-space-blue">Cyberpunk</option>
              {/* Adicione outros gêneros */}
            </select>
             <div className="pointer-events-none absolute inset-y-0 right-0 top-6 flex items-center px-3 text-gray-whisper">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>

        </ProfileWidget>

        {/* Widget: Aparência do Perfil */}
        <ProfileWidget title="Aparência do Perfil">
          {/* Upload Avatar */}
          <div className="form-group upload-group mb-8">
            <label className="block text-sm font-light text-gray-whisper mb-2">Avatar (Sua Face)</label>
            <div className='flex items-center gap-4'>
                 <Image
                    id="avatar-preview"
                    src={avatarPreview || '/img/default-avatar.png'}
                    alt="Preview do Avatar"
                    width={100}
                    height={100}
                    className="avatar-preview rounded-full object-cover border-2 border-gold-glow/70 flex-shrink-0"
                 />
                 <div>
                    <input
                       type="file"
                       id="avatar-input"
                       name="avatar_input"
                       className="file-input hidden" // Esconde o input padrão
                       accept="image/*"
                       onChange={(e) => handleFileChange(e, setAvatarFile, setAvatarPreview)}
                    />
                    <label
                      htmlFor="avatar-input"
                      className="file-input-label inline-block px-4 py-2 bg-transparent border border-vintage-gold text-vintage-gold rounded-full cursor-pointer transition-all duration-300 hover:bg-vintage-gold hover:text-deep-space-blue text-sm font-semibold"
                    >
                      Mudar Avatar
                    </label>
                    <p className="text-xs text-gray-whisper mt-1">Máx 5MB. Recomendado 1:1.</p>
                 </div>
            </div>
          </div>

          {/* Upload Banner */}
          <div className="form-group upload-group mb-8">
            <label className="block text-sm font-light text-gray-whisper mb-2">Banner do Perfil (Seu Estandarte)</label>
            <div
              id="banner-preview"
              className="banner-preview w-full aspect-video rounded-lg bg-cover bg-center border border-dashed border-gray-whisper/30 mb-2 bg-slate-blue/20"
              style={{ backgroundImage: bannerPreview ? `url(${bannerPreview})` : 'none' }}
            >
                {!bannerPreview && <span className="flex items-center justify-center h-full text-gray-whisper text-sm">Preview do Banner</span>}
            </div>
            <input
              type="file"
              id="banner-input"
              name="banner_input"
              className="file-input hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setBannerFile, setBannerPreview)}
            />
            <label
              htmlFor="banner-input"
              className="file-input-label inline-block px-4 py-2 bg-transparent border border-vintage-gold text-vintage-gold rounded-full cursor-pointer transition-all duration-300 hover:bg-vintage-gold hover:text-deep-space-blue text-sm font-semibold"
            >
              Mudar Banner
            </label>
             <p className="text-xs text-gray-whisper mt-1">Máx 5MB. Recomendado 16:9.</p>
          </div>

          {/* Upload Background */}
          <div className="form-group upload-group">
            <label className="block text-sm font-light text-gray-whisper mb-2">Fundo do Perfil (Seu Domínio)</label>
            <p className="background-preview-info text-xs text-gray-whisper mb-2">
              Preview ao vivo. A imagem será aplicada ao fundo da página.
            </p>
            <input
              type="file"
              id="background-input"
              name="background_input"
              className="file-input hidden"
              accept="image/*"
              onChange={(e) => handleFileChange(e, setBackgroundFile, () => {}, true)} // Passa true para isBackground
            />
            <label
              htmlFor="background-input"
              className="file-input-label inline-block px-4 py-2 bg-transparent border border-vintage-gold text-vintage-gold rounded-full cursor-pointer transition-all duration-300 hover:bg-vintage-gold hover:text-deep-space-blue text-sm font-semibold"
            >
              Mudar Fundo
            </label>
             <p className="text-xs text-gray-whisper mt-1">Máx 5MB.</p>
          </div>
        </ProfileWidget>

        {/* Barra de Salvar Fixa */}
        {/* */}
        <div className="settings-save-bar fixed bottom-0 left-0 w-full bg-transparent-darker backdrop-blur-10 p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] text-right z-50 border-t border-gold-glow/30">
          {/* Mensagens de status */}
          {error && <span className="text-red-400 text-sm mr-4">{error}</span>}
          {successMessage && <span className="text-green-400 text-sm mr-4">{successMessage}</span>}

          <button
            type="submit"
            disabled={isLoading || initialDataLoading}
            className={`submit-button inline-block min-w-[200px] px-6 py-3 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-base transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:ring-offset-2 focus:ring-offset-deep-space-blue disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? 'Salvando...' : 'Salvar Alterações'}
          </button>
        </div>
      </form>
    </div>
  );
}