// app/(auth)/login/page.tsx
'use client'; // Marcar como Client Component para interatividade e hooks

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Hook para redirecionamento
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app as firebaseApp } from '@/lib/firebase'; // Importar a instância inicializada do Firebase

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  // Função para criar a sessão no backend Next.js
  async function createApiSession(idToken: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session', { // Chama a API Route
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Falha ao criar sessão no servidor.');
      }
      return true;
    } catch (apiError: any) {
      console.error('API Error (createApiSession):', apiError);
      setError(apiError.message || 'Erro ao conectar ao servidor.');
      return false;
    }
  }

  // Handler para submissão do formulário
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Fazer login no Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Obter o ID Token do Firebase
      const idToken = await user.getIdToken();

      // 3. Chamar a API do Next.js para criar a sessão no servidor
      const sessionCreated = await createApiSession(idToken);

      // 4. Se a sessão foi criada com sucesso, redirecionar
      if (sessionCreated) {
        // Redireciona para a homepage ou dashboard principal
        router.push('/'); // Ou '/dashboard', '/home', etc.
        // O middleware cuidará de futuras verificações
      }
      // Se sessionCreated for false, o erro já foi setado dentro de createApiSession

    } catch (firebaseError: any) {
      // Tratar erros específicos do Firebase
      console.error('Firebase Login Error:', firebaseError.code, firebaseError.message);
      if (firebaseError.code === 'auth/invalid-credential' || firebaseError.code === 'auth/user-not-found' || firebaseError.code === 'auth/wrong-password') {
        setError('Email ou senha inválidos.');
      } else if (firebaseError.code === 'auth/invalid-email') {
         setError('Formato de email inválido.');
      } else {
        setError('Ocorreu um erro durante o login. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Container principal centralizado (similar a auth-container do style.css)
    //
    <div className="flex justify-center items-center min-h-screen px-6 py-8 animate-fadeIn">
      {/* Card de autenticação (similar a auth-card) */}
      {/* */}
      <div className="w-full max-w-md bg-transparent-dark border border-gold-glow/50 rounded-2xl p-8 sm:p-10 shadow-xl backdrop-blur-12">

        {/* Logo (similar a logo-container) */}
        {/* */}
        <div className="text-center mb-10">
          <h1 className="font-epic text-4xl sm:text-5xl text-vintage-gold tracking-wider leading-none text-shadow-gold-glow">
            Versalles
          </h1>
          <h2 className="font-title text-sm sm:text-base text-vintage-gold tracking-[8px] uppercase mt-1 opacity-80">
            RPG
          </h2>
        </div>

        {/* Formulário de Login */}
        <form id="login-form" onSubmit={handleSubmit} noValidate>
          {/* Campo Email (similar a form-group com label flutuante) */}
          {/* */}
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" " // Necessário para o CSS :not(:placeholder-shown) funcionar
              className="peer" // Adiciona a classe peer para o CSS adjacente (+) funcionar
            />
            <label htmlFor="email">
              Seu Email de Aventureiro
            </label>
          </div>

          {/* Campo Senha */}
          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="peer"
            />
            <label htmlFor="password">
              Sua Senha Secreta
            </label>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}

          {/* Botão de Submit (similar a submit-button) */}
          {/* */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-3 mt-4 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-lg transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:ring-offset-2 focus:ring-offset-deep-space-blue disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5`}
          >
            {isLoading ? 'Entrando...' : 'Entrar no Universo'}
          </button>
        </form>

        {/* Link para Registro (similar a footer-link) */}
        {/* */}
        <p className="text-center mt-8 text-sm font-light text-gray-whisper">
          Ainda não é uma lenda?{' '}
          <Link href="/register" className="font-medium text-vintage-gold hover:text-bone-white hover:underline">
            Forje sua identidade aqui.
          </Link>
        </p>

        {/* Opcional: Link "Esqueceu a senha?" */}
        {/*
        <p className="text-center mt-4 text-sm font-light">
          <Link href="/forgot-password" className="text-gray-whisper hover:text-vintage-gold hover:underline">
            Esqueceu sua senha?
          </Link>
        </p>
        */}
      </div>
    </div>
  );
}