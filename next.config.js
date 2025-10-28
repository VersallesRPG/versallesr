/** @type {import('next').NextConfig} */

const nextConfig = {
  // === Configurações Essenciais ===
  reactStrictMode: true, // Habilita o Strict Mode do React para ajudar a identificar problemas potenciais
  swcMinify: true, // Usa o compilador SWC da Vercel para minificação mais rápida

  // === Internacionalização (i18n) ===
  // Configuração para suportar os idiomas que você definiu
  i18n: {
    // Lista de todos os idiomas suportados pela sua aplicação
    locales: ["pt-BR", "en-US", "ja-JP", "es-ES", "pl-PL"],
    // Idioma padrão usado quando o idioma do navegador do usuário não é suportado
    defaultLocale: "pt-BR",
    // Opcional: Desabilitar a detecção automática de localidade se preferir gerenciar manualmente
    // localeDetection: false,
  },

  // === Otimização de Imagens ===
  images: {
    // remotePatterns permite que você defina quais domínios externos
    // o componente <Image> do Next.js pode otimizar.
    // Adicione aqui os domínios de onde você carrega imagens (ex: placeholders, CDNs)
    // Se você for servir imagens do Firebase Storage, adicione o domínio dele aqui.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co", // Exemplo do seu código PHP
        port: "",
        pathname: "/**", // Permite qualquer caminho nesse domínio
      },
      // Exemplo para Firebase Storage (ajuste conforme seu bucket):
      // {
      //   protocol: 'https',
      //   hostname: 'firebasestorage.googleapis.com',
      //   port: '',
      //   pathname: '/v0/b/seuprojeto.appspot.com/**',
      // },
      // Adicione outros domínios se necessário
    ],
  },

  // === Variáveis de Ambiente ===
  // O Next.js carrega automaticamente as variáveis de .env.local.
  // Variáveis prefixadas com NEXT_PUBLIC_ são expostas ao navegador.
  // Variáveis sem o prefixo só estão disponíveis no lado do servidor (API Routes, getServerSideProps).
  // Geralmente, não é necessário listar as variáveis aqui, a menos que
  // você precise de alguma lógica específica durante o build.

  // === Outras Configurações (Opcional) ===
  // Exemplo: Redirecionamentos
  // async redirects() {
  //   return [
  //     {
  //       source: '/old-page',
  //       destination: '/new-page',
  //       permanent: true,
  //     },
  //   ]
  // },

  // Exemplo: Cabeçalhos Customizados
  // async headers() {
  //   return [
  //     {
  //       source: '/api/:path*',
  //       headers: [
  //         { key: 'Access-Control-Allow-Origin', value: '*' }, // Exemplo: CORS (CUIDADO em produção)
  //       ],
  //     },
  //   ]
  // },
};

module.exports = nextConfig;
