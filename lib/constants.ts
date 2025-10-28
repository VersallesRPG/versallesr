// lib/constants.ts

// --- Roles ---
export const ROLES = {
    MESTRE: 'Mestre',
    JOGADOR: 'Jogador',
  } as const; // 'as const' torna os valores readonly e literais
  
  export const GUILD_ROLES = {
    OWNER: 'owner',
    ADMIN: 'admin',
    MEMBER: 'member',
  } as const;
  
  // --- Status ---
  export const CAMPAIGN_STATUS = {
    RECRUTANDO: 'Recrutando',
    PRIVADA: 'Privada',
    PAUSADA: 'Pausada',
    // CONCLUIDA: 'Concluída', // Adicionar se necessário
  } as const;
  
  export const WORKSHOP_ITEM_STATUS = {
      PENDING: 'pending', // Ou o valor real que você usará no DB (ex: 'pendente')
      APPROVED: 'approved', // Ou 'aprovado'
      REJECTED: 'rejected', // Ou 'rejeitado'
  } as const;
  
  export const FRIEND_REQUEST_STATUS = {
      PENDING: 'pending',
      ACCEPTED: 'accepted',
      REJECTED: 'rejected',
  } as const;
  
  // --- Limites e Configurações ---
  export const ITEMS_PER_PAGE = {
    FORUM_THREADS: 20,
    FORUM_POSTS: 15,
    WORKSHOP_ITEMS: 12,
    GUILDS: 20,
    MEMBERS: 50, // Ex: Membros por página em lista grande
  } as const;
  
  export const MAX_FILE_SIZE = {
    AVATAR_MB: 2,
    BANNER_MB: 5, // Banner de perfil/campanha
    GUILD_AVATAR_MB: 2,
    GUILD_BANNER_MB: 3,
    WORKSHOP_PREVIEW_MB: 5,
    WORKSHOP_ITEM_MB: 50,
  } as const;
  
  // Convertendo MB para Bytes para comparações
  export const MAX_FILE_SIZE_BYTES = {
      AVATAR: MAX_FILE_SIZE.AVATAR_MB * 1024 * 1024,
      BANNER: MAX_FILE_SIZE.BANNER_MB * 1024 * 1024,
      GUILD_AVATAR: MAX_FILE_SIZE.GUILD_AVATAR_MB * 1024 * 1024,
      GUILD_BANNER: MAX_FILE_SIZE.GUILD_BANNER_MB * 1024 * 1024,
      WORKSHOP_PREVIEW: MAX_FILE_SIZE.WORKSHOP_PREVIEW_MB * 1024 * 1024,
      WORKSHOP_ITEM: MAX_FILE_SIZE.WORKSHOP_ITEM_MB * 1024 * 1024,
  } as const;
  
  
  export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  export const ALLOWED_WORKSHOP_FILE_TYPES = ['application/zip', 'application/pdf', 'application/x-zip-compressed'];
  
  
  // --- URLs Padrão ---
  // Caminhos relativos à pasta /public
  export const DEFAULT_AVATAR_URL = '/img/default-avatar.png';
  export const DEFAULT_GUILD_AVATAR_URL = '/img/default-guild-avatar.png';
  // Placeholders podem ser URLs completas ou caminhos locais se você os tiver
  export const DEFAULT_BANNER_PLACEHOLDER = 'https://placehold.co/1200x350/0a0f1e/4a5568';
  export const DEFAULT_WORKSHOP_PREVIEW_PLACEHOLDER = 'https://placehold.co/600x400/0a0f1e/E8C468?text=Preview';
  
  // --- Chaves de Cache ou Outras Constantes ---
  // export const CACHE_KEY_FORUMS = 'forums_list';
  
  // --- Nomes de Cookies ---
  export const SESSION_COOKIE_NAME = 'versalles-session'; // Deve ser igual ao `cookieName` em lib/auth.ts
  
  // Adicione outras constantes que se repetem no seu código