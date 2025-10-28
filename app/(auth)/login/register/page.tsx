// app/(auth)/register/page.tsx
'use client'; // Marcar como Client Component

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app as firebaseApp } from '@/lib/firebase';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const auth = getAuth(firebaseApp);

  // Função para criar o usuário no backend Next.js (MongoDB)
  async function createApiUser(uid: string, username: string, email: string): Promise<boolean> {
    try {
      const response = await fetch('/api/users', { // Chama a API Route POST /api/users
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, username, email }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        // Tenta pegar a mensagem de erro específica do backend
        throw new Error(result.message || 'Falha ao registrar usuário no servidor.');
      }
      return true;
    } catch (apiError: any) {
      console.error('API Error (createApiUser):', apiError);
      setError(apiError.message || 'Erro ao conectar ao servidor.');
      return false;
    }
  }

  // Função para criar a sessão no backend Next.js
  async function createApiSession(idToken: string): Promise<boolean> {
    try {
      const response = await fetch('/api/auth/session', { // Chama a API Route POST /api/auth/session
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== 'success') {
        throw new Error(result.message || 'Falha ao iniciar sessão no servidor.');
      }
      return true;
    } catch (apiError: any) {
      console.error('API Error (createApiSession):', apiError);
      setError(apiError.message || 'Erro ao conectar ao servidor após registro.');
      return false;
    }
  }

  // Handler para submissão do formulário
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validação básica
    if (password !== confirmPassword) {
      setError('As senhas não coincidem!');
      setIsLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
       setIsLoading(false);
       return;
    }
     if (username.length < 3 || username.length > 20) {
        setError('O nome de usuário deve ter entre 3 e 20 caracteres.');
        setIsLoading(false);
        return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        setError('O nome de usuário pode conter apenas letras, números e underscores (_).');
        setIsLoading(false);
        return;
    }


    try {
      // 1. Criar usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Chamar a API do Next.js para criar o usuário no MongoDB
      //
      const userCreatedInDb = await createApiUser(user.uid, username, email);

      if (!userCreatedInDb) {
        // Se falhou em criar no DB, idealmente deveríamos tentar deletar o usuário do Firebase Auth
        // ou marcar a conta para verificação manual, mas por simplicidade, apenas mostramos o erro.
        // O erro já foi setado dentro de createApiUser
        setIsLoading(false); // Para o loading aqui
        return;
      }

      // 3. Obter o ID Token do Firebase para login automático
      const idToken = await user.getIdToken();

      // 4. Chamar a API do Next.js para criar a sessão no servidor
      //
      const sessionCreated = await createApiSession(idToken);

      // 5. Se a sessão foi criada com sucesso, redirecionar
      if (sessionCreated) {
        router.push('/'); // Redireciona para a homepage
      }
      // Se sessionCreated for false, o erro já foi setado

    } catch (firebaseError: any) {
      // Tratar erros específicos do Firebase
      console.error('Firebase Register Error:', firebaseError.code, firebaseError.message);
      if (firebaseError.code === 'auth/email-already-in-use') {
        setError('Este email já está sendo utilizado.');
      } else if (firebaseError.code === 'auth/invalid-email') {
        setError('O formato do email é inválido.');
      } else if (firebaseError.code === 'auth/weak-password') {
        setError('A senha é muito fraca. Use pelo menos 6 caracteres.');
      } else {
        setError('Ocorreu um erro durante o registro. Tente novamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Container e Card de Autenticação (reutiliza estilos da página de login)
    <div className="flex justify-center items-center min-h-screen px-6 py-8 animate-fadeIn">
      <div className="w-full max-w-md bg-transparent-dark border border-gold-glow/50 rounded-2xl p-8 sm:p-10 shadow-xl backdrop-blur-12">

        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-epic text-4xl sm:text-5xl text-vintage-gold tracking-wider leading-none text-shadow-gold-glow">
            Versalles
          </h1>
          <h2 className="font-title text-sm sm:text-base text-vintage-gold tracking-[8px] uppercase mt-1 opacity-80">
            RPG
          </h2>
        </div>

        {/* Formulário de Registro */}
        <form id="register-form" onSubmit={handleSubmit} noValidate>
          {/* Campo Username */}
          <div className="form-group">
            <input
              type="text"
              id="username"
              name="username"
              required
              minLength={3}
              maxLength={20}
              pattern="^[a-zA-Z0-9_]+$" // Validação básica no HTML
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder=" "
              className="peer"
            />
            <label htmlFor="username">
              Seu Nome de Aventureiro (Nickname)
            </label>
          </div>

          {/* Campo Email */}
          <div className="form-group">
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder=" "
              className="peer"
            />
            <label htmlFor="email">
              Seu Email
            </label>
          </div>

          {/* Campo Senha */}
          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder=" "
              className="peer"
            />
            <label htmlFor="password">
              Crie uma Senha Secreta (mín. 6 caracteres)
            </label>
          </div>

          {/* Campo Confirmar Senha */}
          <div className="form-group">
            <input
              type="password"
              id="confirm-password"
              name="confirm-password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder=" "
              className="peer"
            />
            <label htmlFor="confirm-password">
              Confirme sua Senha
            </label>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <p className="text-red-400 text-sm text-center mb-4">{error}</p>
          )}

          {/* Botão de Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full px-4 py-3 mt-4 bg-vintage-gold text-deep-space-blue rounded-lg font-title font-bold text-lg transition duration-300 ease-in-out hover:bg-bone-white hover:shadow-gold-glow-md focus:outline-none focus:ring-2 focus:ring-vintage-gold focus:ring-offset-2 focus:ring-offset-deep-space-blue disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5`}
          >
            {isLoading ? 'Forjando Identidade...' : 'Forjar Identidade'}
          </button>
        </form>

        {/* Link para Login */}
        <p className="text-center mt-8 text-sm font-light text-gray-whisper">
          Já possui uma lenda?{' '}
          <Link href="/login" className="font-medium text-vintage-gold hover:text-bone-white hover:underline">
            Entre no universo aqui.
          </Link>
        </p>
      </div>
    </div>
  );
}