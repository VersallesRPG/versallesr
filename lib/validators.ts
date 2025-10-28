// lib/validators.ts
import { z } from 'zod';

// --- Validações Comuns ---
const passwordSchema = z.string().min(6, { message: "Senha deve ter no mínimo 6 caracteres." });
const usernameSchema = z.string()
  .min(3, { message: "Nome de usuário deve ter no mínimo 3 caracteres." })
  .max(20, { message: "Nome de usuário não pode exceder 20 caracteres." })
  .regex(/^[a-zA-Z0-9_]+$/, { message: "Nome de usuário pode conter apenas letras, números e underscore (_)." });

// --- Esquemas de Validação Específicos ---

// Registro de Usuário (usado na API /api/users)
//
export const RegisterUserSchema = z.object({
  uid: z.string().min(1, { message: "Firebase UID é obrigatório."}), // UID do Firebase
  username: usernameSchema,
  email: z.string().email({ message: "Formato de email inválido." }),
  // Senha não é validada aqui, pois a validação ocorre no Firebase Auth e não enviamos para esta API.
});

// Login de Usuário (usado no frontend, antes de chamar Firebase)
//
export const LoginUserSchema = z.object({
    email: z.string().email({ message: "Formato de email inválido." }),
    password: z.string().min(1, { message: "Senha é obrigatória."}), // Mínimo 1 só para garantir que não está vazio
});

// Atualização de Perfil (usado na API PUT /api/users/me)
//
// Nota: Arquivos (avatar, banner, background) são validados separadamente na API Route.
export const UpdateProfileSchema = z.object({
    bio: z.string().max(1000, { message: "Biografia não pode exceder 1000 caracteres." }).optional(), // Exemplo de limite
    clan: z.enum(['Triskelion', 'Versalles', 'Targaryen', '']).optional(), // Permite string vazia para "Sem Afiliação"
    genre: z.string().max(50).optional(), // Gênero como string, pode validar com enum se preferir
});

// Criação de Campanha (usado na API POST /api/campaigns)
//
// Nota: Arquivo banner_image validado separadamente.
export const CreateCampaignSchema = z.object({
    title: z.string().min(1, { message: "Título é obrigatório."}).max(100, { message: "Título muito longo."}),
    system: z.string().min(1, { message: "Sistema é obrigatório."}).max(50),
    description: z.string().min(1, { message: "Descrição é obrigatória."}).max(5000), // Limite maior para descrição
    next_session: z.string().max(100).optional(),
    status: z.enum(['Recrutando', 'Privada', 'Pausada']), // Status válidos
});

// Upload de Item da Oficina (usado na API POST /api/workshop/items)
//
// Nota: Arquivos preview_image e item_file validados separadamente.
export const CreateWorkshopItemSchema = z.object({
    title: z.string().min(1, { message: "Título é obrigatório."}).max(150),
    description: z.string().min(10, { message: "Descrição muito curta."}).max(10000),
    system: z.string().min(1, { message: "Sistema é obrigatório."}), // Poderia ser enum se as opções forem fixas
    type: z.string().min(1, { message: "Tipo é obrigatório."}),       // Poderia ser enum
    price: z.number().min(0).optional(), // Para monetização futura
});

// Criação de Tópico do Fórum (usado na API POST /api/forums/[forumId]/threads)
///create-thread/page.tsx]
export const CreateForumThreadSchema = z.object({
    title: z.string().min(1, { message: "Título é obrigatório." }).max(150),
    content: z.string().min(5, { message: "Conteúdo muito curto." }).max(20000), // Conteúdo do primeiro post
});

// Criação de Post do Fórum (usado na API POST /api/threads/[threadId]/posts)
///page.tsx]
export const CreateForumPostSchema = z.object({
    content: z.string().min(1, { message: "Conteúdo não pode estar vazio." }).max(20000),
});

// Criação de Guilda (usado na API POST /api/guilds)
//
// Nota: Arquivos avatar/banner validados separadamente.
export const CreateGuildSchema = z.object({
    name: z.string().min(3, { message: "Nome deve ter no mínimo 3 caracteres." }).max(50),
    tag: z.string().max(5, { message: "Tag não pode exceder 5 caracteres." }).optional(),
    description: z.string().max(2000).optional(),
    isPrivate: z.preprocess((val) => String(val).toLowerCase() === 'true', z.boolean()), // Converte string 'true'/'false' para boolean
});

// Adicione mais schemas conforme necessário (ex: Wishlist, Comentários, Avaliações, Pedidos de Amizade, etc.)

// --- Funções Auxiliares (Opcional) ---

/**
 * Tenta validar dados com um schema Zod e retorna um objeto com sucesso/erro/dados.
 * Útil para usar dentro das API Routes.
 */
export function safeValidate<T extends z.ZodTypeAny>(
    schema: T,
    data: unknown
): { success: true; data: z.infer<T> } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    } else {
        return { success: false, error: result.error };
    }
}