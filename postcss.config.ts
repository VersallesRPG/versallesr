// postcss.config.ts

// Define a estrutura esperada para a configuração do PostCSS
interface PostCSSConfig {
    plugins: {
      [key: string]: object; // Permite qualquer plugin com um objeto de configuração vazio
    };
  }
  
  const config: PostCSSConfig = {
    plugins: {
      tailwindcss: {}, // Inclui o plugin do Tailwind CSS
      autoprefixer: {}, // Inclui o plugin Autoprefixer para adicionar prefixos de navegador automaticamente
    },
  };
  
  export default config; // Exporta a configuração como padrão