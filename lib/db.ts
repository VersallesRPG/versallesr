// lib/db.ts
import mongoose from 'mongoose';

// Interface para definir a estrutura do cache de conexão global
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Declaração para estender o objeto global do Node.js de forma segura em TypeScript
// Isso evita erros de tipo ao acessar 'mongoose' no escopo global
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache;
}

// Pega a URI de conexão do MongoDB das variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI;

// Verifica se a MONGODB_URI foi definida no .env.local
if (!MONGODB_URI) {
  throw new Error(
    'Por favor, defina a variável de ambiente MONGODB_URI dentro de .env.local'
  );
}

// Inicializa o cache de conexão global se ainda não existir
// Isso é crucial para evitar múltiplas conexões em ambiente de desenvolvimento com hot-reloading
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

/**
 * Função assíncrona para conectar ao banco de dados MongoDB usando Mongoose.
 * Implementa cache de conexão para otimizar performance.
 */
async function connectDB(): Promise<typeof mongoose> {
  // Se já temos uma conexão cacheada, retorna ela diretamente
  if (cached.conn) {
    // console.log('=> Usando conexão de banco de dados cacheada');
    return cached.conn;
  }

  // Se não temos uma conexão, mas já existe uma promessa de conexão em andamento,
  // aguarda essa promessa resolver e retorna o resultado
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Desabilitar buffer se a conexão demorar (recomendado)
      // useNewUrlParser: true, // Opções depreciadas nas versões mais recentes do Mongoose
      // useUnifiedTopology: true,
    };

    // console.log('=> Criando NOVA conexão de banco de dados');
    // Inicia a conexão e armazena a promessa no cache
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongooseInstance) => {
      // console.log('   Conexão MongoDB estabelecida com sucesso!');
      return mongooseInstance;
    }).catch(error => {
        // Se a conexão inicial falhar, reseta a promessa no cache para permitir nova tentativa
        cached.promise = null;
        console.error('   Erro ao conectar ao MongoDB:', error);
        throw error; // Re-lança o erro para a aplicação saber que falhou
    });
  }

  try {
    // Aguarda a promessa de conexão (nova ou em andamento) resolver
    cached.conn = await cached.promise;
  } catch (e) {
    // Se a promessa for rejeitada, reseta o cache e re-lança o erro
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  // Retorna a conexão estabelecida
  return cached.conn;
}

export default connectDB;