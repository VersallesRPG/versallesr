// tailwind.config.ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    // Informa ao Tailwind para escanear essas pastas em busca de classes
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Se usar o antigo 'pages' router
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',    // Inclui o 'app' router
  ],
  theme: {
    extend: {
      // === Cores ===
      // Mapeia as variáveis CSS do seu projeto original para o tema do Tailwind
      colors: {
        'deep-space-blue': '#0a0f1e',
        'slate-blue': '#4a5568',
        'vintage-gold': '#E8C468',
        'gold-glow': 'rgba(232, 196, 104, 0.3)', // Usado em text-shadow ou box-shadow, não diretamente como cor de texto/fundo
        'bone-white': '#EAEAEA',
        'gray-whisper': 'rgba(234, 234, 234, 0.5)',
        'transparent-dark': 'rgba(10, 15, 30, 0.2)',
        'transparent-darker': 'rgba(10, 15, 30, 0.8)',
        // Você pode adicionar mais cores aqui se precisar
      },
      // === Fontes ===
      // Mapeia as famílias de fontes do seu projeto original
      fontFamily: {
        // O nome da chave (ex: 'epic') será usado nas classes (ex: font-epic)
        epic: ['"Cinzel Decorative"', 'serif'],
        title: ['Cinzel', 'serif'],
        body: ['Poppins', 'sans-serif'],
      },
      // === Outras Extensões (Exemplos) ===
      backgroundImage: {
        // Exemplo para recriar o gradiente do body, se necessário
        'gradient-primary': 'linear-gradient(145deg, var(--tw-gradient-stops))',
        // Adicione aqui imagens de fundo comuns se usar classes bg-* com URLs
        // 'bg-campaigns': "url('/img/bg-campaigns.jpg')", // Exige que a imagem esteja em /public/img
      },
      // Adiciona suporte para text-shadow (Tailwind não tem por padrão)
      textShadow: {
        DEFAULT: '0 0 15px var(--tw-shadow-color)', // Mapeia para text-shadow-gold-glow
        sm: '0 1px 2px var(--tw-shadow-color)',
        md: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 0 15px var(--tw-shadow-color)', // Corresponde ao seu --gold-glow
        xl: '0 0 20px var(--tw-shadow-color)',
      },
      // Adiciona suporte para box-shadow com a cor gold-glow
      boxShadow: {
        'gold-glow-sm': '0 0 10px 0 rgba(232, 196, 104, 0.3)',
        'gold-glow-md': '0 0 15px 0 rgba(232, 196, 104, 0.3)',
        'gold-glow-lg': '0 0 20px 0 rgba(232, 196, 104, 0.3)',
      },
       // Adiciona animação fadeIn (se não quiser depender apenas do CSS global)
       keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out forwards', // 'forwards' mantém o estado final
      },
    },
  },
  plugins: [
     // Adiciona plugin para text-shadow (instalar via npm/yarn: @tailwindcss/typography ou outro plugin específico)
    // require('@tailwindcss/typography'), // Exemplo, pode não ser o melhor para text-shadow
    // --- Plugin para Text Shadow (Exemplo usando plugin de terceiros) ---
    // Você precisaria instalar um plugin como 'tailwindcss-textshadow'
    // Ex: require('tailwindcss-textshadow'),
    // E então configurar as variantes no tema: textShadow: theme => theme('textShadow')

     // Adiciona um plugin customizado se precisar de utilitários mais complexos
    function ({ addUtilities, theme }: { addUtilities: Function, theme: Function }) {
      addUtilities({
        '.text-shadow-gold-glow': {
          textShadow: `0 0 15px ${theme('colors.gold-glow')}`
        },
        '.backdrop-blur-10': { // Exemplo para backdrop-filter
           'backdrop-filter': 'blur(10px)',
           '-webkit-backdrop-filter': 'blur(10px)',
        },
         '.backdrop-blur-12': {
           'backdrop-filter': 'blur(12px)',
           '-webkit-backdrop-filter': 'blur(12px)',
         },
         '.backdrop-blur-15': {
           'backdrop-filter': 'blur(15px)',
           '-webkit-backdrop-filter': 'blur(15px)',
         }
        // Adicione mais utilitários customizados aqui se necessário
      })
    }
  ],
};

export default config;