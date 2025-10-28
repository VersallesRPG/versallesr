// app/(main)/profile/[username]/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Import Server-side utilities/functions
import { getCurrentUser } from '@/lib/auth/server'; // Função para obter usuário logado (servidor)
import { getUserByUsername } from '@/lib/api/users'; // Função para buscar usuário pelo username (servidor)
import { getAchievementsForUser } from '@/lib/api/achievements'; // Função para buscar conquistas (servidor)
import { getBadgesForUser } from '@/lib/api/badges'; // Função para buscar badges (servidor)
import { getFriendsForUser } from '@/lib/api/friends'; // Função para buscar amigos (servidor)
// import { getTopSystemsForUser } from '@/lib/api/systems'; // Função para buscar sistemas favoritos (servidor)

// Import Components
import ProfileWidget from '@/components/profile/ProfileWidget';
import AchievementIcon from '@/components/profile/AchievementIcon'; // Exemplo de componente
import FriendAvatar from '@/components/profile/FriendAvatar'; // Exemplo de componente
import SystemCard from '@/components/store/SystemCard'; // Reutilizar/criar componente

// Tipos (definir em @/types/index.ts)
interface ProfileUser {
  id: string;
  username: string;
  bio?: string;
  clan?: string;
  genre?: string;
  avatarUrl?: string;
  bannerUrl?: string;
  backgroundUrl?: string;
  // Adicionar outros campos: achievementPoints, reputationScore, guildMembership, etc.
}

interface Achievement {
  id: string;
  name: string;
  iconUrl: string;
}

interface Badge {
    id: string;
    name: string;
    iconUrl: string;
}

interface Friend {
    id: string;
    username: string;
    avatarUrl?: string;
}

interface TopSystem {
    id: string;
    title: string;
    imageUrl: string;
    slug: string;
}


// Props da Página (recebe 'params' com o [username])
interface ProfilePageProps {
  params: {
    username: string;
  };
}

// Metadata Dinâmica (Título da Página)
export async function generateMetadata({ params }: ProfilePageProps) {
  const username = decodeURIComponent(params.username); // Decodifica se houver caracteres especiais
  const profileUser = await getUserByUsername(username);

  if (!profileUser) {
    return {
      title: 'Perfil Não Encontrado',
    };
  }

  return {
    title: `Perfil de ${profileUser.username}`,
    // description: `Perfil de ${profileUser.username} na plataforma Versalles RPG. ${profileUser.bio?.substring(0, 150) ?? ''}`, // Opcional: descrição dinâmica
  };
}


// Componente da Página (Server Component)
export default async function ProfilePage({ params }: ProfilePageProps) {
  const username = decodeURIComponent(params.username);

  // --- Buscar Dados ---
  const profileUser: ProfileUser | null = await getUserByUsername(username);
  const loggedInUser = await getCurrentUser(); // Pega o usuário logado atualmente

  // Usuário não encontrado? Mostra 404
  if (!profileUser) {
    notFound();
  }

  // Verificar se o visitante é o dono do perfil
  const isOwner = loggedInUser?.id === profileUser.id;

  // Buscar dados adicionais (conquistas, amigos, etc.)
  const achievements: Achievement[] = await getAchievementsForUser(profileUser.id);
  const badges: Badge[] = await getBadgesForUser(profileUser.id); // Exemplo busca badges
  const friends: Friend[] = await getFriendsForUser(profileUser.id);
  // const topSystems: TopSystem[] = await getTopSystemsForUser(profileUser.id); // Placeholder
   const topSystems: TopSystem[] = [ // Placeholder data
       { id: '1', title: 'Sistema 1', imageUrl: 'https://placehold.co/300x400/0a0f1e/E8C468?text=Sistema+1', slug: '#' },
       { id: '2', title: 'Sistema 2', imageUrl: 'https://placehold.co/300x400/0a0f1e/E8C468?text=Sistema+2', slug: '#' },
       { id: '3', title: 'Sistema 3', imageUrl: 'https://placehold.co/300x400/0a0f1e/E8C468?text=Sistema+3', slug: '#' },
   ];


  // --- Preparar URLs de Imagem ---
  const bannerUrl = profileUser.bannerUrl || 'https://placehold.co/1200x350/0a0f1e/4a5568'; // Placeholder padrão
  const avatarUrl = profileUser.avatarUrl || '/img/default-avatar.png'; // Caminho na /public
  const backgroundUrl = profileUser.backgroundUrl;

  // Sanitizar Bio para exibição (se necessário, dependendo de como é salva)
  const profileBio = profileUser.bio ? profileUser.bio.replace(/\n/g, '<br />') : 'Este aventureiro ainda não escreveu sua lenda...';


  return (
    // Aplica o background dinâmico SE existir
    <div style={backgroundUrl ? { backgroundImage: `url(${backgroundUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : {}} className="profile-page-background min-h-screen">
      {/* Container principal */}
      {/* */}
      <div className="profile-container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fadeIn">

        {/* --- Header do Perfil --- */}
        {/* */}
        <header className="profile-header relative mb-8">
          {/* Banner */}
          <div
            className="profile-banner w-full h-[250px] sm:h-[300px] md:h-[350px] bg-slate-blue bg-cover bg-center rounded-2xl border border-gold-glow/50 shadow-lg"
            style={{ backgroundImage: `url(${bannerUrl})` }}
          ></div>

          {/* Informações do Usuário (Avatar, Nickname, Tags) */}
          <div className="profile-user-info flex flex-col items-center text-center sm:flex-row sm:text-left relative -mt-[80px] sm:-mt-[100px] md:-mt-[120px] sm:ml-8 z-10">
            {/* Avatar */}
            <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-52 md:h-52 mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
              <Image
                src={avatarUrl}
                alt={`Avatar de ${profileUser.username}`}
                fill
                sizes="(max-width: 640px) 160px, (max-width: 768px) 192px, 208px"
                className="profile-avatar rounded-full object-cover border-4 border-deep-space-blue shadow-2xl"
              />
            </div>

            {/* Texto Info */}
            <div className="profile-info-text mt-4 sm:mt-12 flex-grow">
              <h1 className="profile-nickname font-epic text-3xl sm:text-4xl lg:text-5xl text-vintage-gold text-shadow-gold-glow break-words">
                {profileUser.username}
              </h1>
              <p className="profile-unique-id font-body font-light text-gray-whisper mb-4">
                @{profileUser.username}
              </p>

              {/* Tags (Clã, Gênero, Badges) */}
              <div className="profile-tags flex flex-wrap justify-center sm:justify-start gap-3">
                {profileUser.clan && (
                  <span className="clan-tag inline-flex items-center gap-2 px-4 py-1.5 bg-transparent-dark border border-gold-glow/50 rounded-full font-title text-xs text-bone-white backdrop-blur-10">
                    <Image
                      src={`/img/clan-${profileUser.clan.toLowerCase()}.png`} // Assume .png, ajuste se tiver .svg
                      alt={`${profileUser.clan} Clan Emblem`}
                      width={20}
                      height={20}
                      className="object-contain"
                    />
                    {profileUser.clan}
                  </span>
                )}
                {profileUser.genre && (
                  <span className="genre-tag inline-flex items-center px-4 py-1.5 bg-transparent-dark border border-gold-glow/50 rounded-full font-title text-xs text-bone-white backdrop-blur-10">
                    {profileUser.genre}
                  </span>
                )}
                 {/* Exemplo: Exibir alguns Badges principais */}
                 {badges.slice(0, 2).map(badge => (
                    <span key={badge.id} className="inline-flex items-center gap-2 px-3 py-1 bg-transparent-dark border border-gold-glow/50 rounded-full font-title text-xs text-bone-white backdrop-blur-10" title={badge.name}>
                        <Image src={badge.iconUrl} alt={badge.name} width={18} height={18}/>
                        {/* {badge.name} Opcional: exibir nome */}
                    </span>
                 ))}
              </div>
            </div>

            {/* Botão Editar (Só para o dono) */}
            {isOwner && (
              <Link
                href="/settings"
                className="profile-edit-button absolute top-4 right-4 sm:top-auto sm:right-auto sm:relative sm:mt-12 sm:ml-auto px-5 py-2 bg-transparent border border-vintage-gold text-vintage-gold rounded-full font-title font-bold text-sm transition-all duration-300 hover:bg-vintage-gold hover:text-deep-space-blue hover:shadow-gold-glow-md whitespace-nowrap"
              >
                Editar Perfil
              </Link>
            )}
          </div>
        </header>

        {/* --- Grid de Conteúdo (Widgets) --- */}
        {/* */}
        <div className="profile-content-grid grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Coluna Principal (2/3) */}
          <div className="profile-main-col md:col-span-2 flex flex-col gap-8">
            {/* Widget: Bio */}
            <ProfileWidget title="Lenda do Aventureiro">
              <div
                className="bio-content font-light text-gray-whisper leading-relaxed whitespace-pre-wrap prose prose-invert prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: profileBio }} // Usa dangerouslySetInnerHTML porque já sanitizamos e convertemos \n para <br>
              />
            </ProfileWidget>

            {/* Widget: Pódio de Sistemas */}
            <ProfileWidget title="Pódio de Sistemas">
              <div className="pinnacle-grid grid grid-cols-2 sm:grid-cols-3 gap-4">
                 {topSystems.map((system) => (
                   <Link key={system.id} href={`/store/${system.slug}`} className="block group">
                     <Image
                       src={system.imageUrl}
                       alt={system.title}
                       width={300} // Largura base para cálculo do aspect ratio
                       height={400} // Altura base
                       className="system-card-image w-full h-auto object-cover rounded-lg shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:shadow-gold-glow-md"
                     />
                   </Link>
                 ))}
              </div>
            </ProfileWidget>
          </div>

          {/* Coluna Lateral (1/3) */}
          <div className="profile-side-col md:col-span-1 flex flex-col gap-8">
            {/* Widget: Estante de Conquistas */}
            <ProfileWidget title={`Estante de Conquistas (${achievements.length})`}>
              <div className="trophy-grid grid grid-cols-5 xs:grid-cols-6 sm:grid-cols-7 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {achievements.length > 0 ? (
                  achievements.map((ach) => (
                    <AchievementIcon key={ach.id} achievement={ach} />
                  ))
                ) : (
                  <p className="col-span-full text-center font-light text-gray-whisper text-sm">Nenhuma conquista desbloqueada.</p>
                )}
                 {/* Placeholder icons se vazio, como no PHP */}
                 {achievements.length === 0 && Array.from({ length: 10 }).map((_, i) => (
                     <div key={i} className="w-full aspect-square rounded-full bg-slate-blue/30" title="Conquista Bloqueada"></div>
                 ))}
              </div>
            </ProfileWidget>

            {/* Widget: Companheiros */}
            <ProfileWidget title={`Companheiros (${friends.length})`}>
                {friends.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {friends.map(friend => (
                            <FriendAvatar key={friend.id} friend={friend} size="small" />
                        ))}
                    </div>
                ) : (
                    <p className="font-light text-center text-gray-whisper text-sm">
                        Este aventureiro ainda não forjou alianças.
                    </p>
                )}
                 <Link href={isOwner ? "/friends" : `/friends?user=${profileUser.username}`} className="block text-center mt-4 text-sm text-vintage-gold hover:underline">
                    Ver todos
                 </Link>
            </ProfileWidget>

            {/* Widget: Guilda (Exemplo) */}
            {/* {profileUser.guildMembership && (
                <ProfileWidget title="Guilda">
                    <Link href={`/guilds/${profileUser.guildMembership.guildId}`} className="flex items-center gap-4 group">
                       <Image src="/path/to/guild/icon.png" width={50} height={50} alt="Guild Icon" className="rounded-md"/>
                       <div>
                           <p className="font-title text-bone-white group-hover:text-vintage-gold">Nome da Guilda</p>
                           <p className="text-sm text-gray-whisper">{profileUser.guildMembership.role}</p>
                       </div>
                    </Link>
                </ProfileWidget>
            )} */}

          </div>
        </div>
      </div>
    </div>
  );
}