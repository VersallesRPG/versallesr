// lib/firebase.ts
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
// Opcional: Importe outros serviços do Firebase que você possa usar no cliente
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// --- Configuração do Firebase ---
// Lê as variáveis de ambiente expostas ao cliente (prefixo NEXT_PUBLIC_)
// (Implícito, pois as variáveis são definidas lá)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional
};

// --- Inicialização do Firebase ---
// Garante que a inicialização ocorra apenas uma vez (importante no Next.js com HMR)
let app: FirebaseApp;
let auth: Auth;

if (!getApps().length) {
  // Se nenhuma app Firebase foi inicializada ainda, inicializa uma nova
  try {
    app = initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully!"); // Log para debug
  } catch (error) {
    console.error("Firebase initialization error:", error);
    // Lida com o erro de inicialização, talvez mostrando uma mensagem ao usuário
    // ou lançando um erro mais específico se necessário.
    // Em um cenário real, você pode querer ter um fallback ou logar isso.
    throw new Error("Could not initialize Firebase. Check config.");
  }
} else {
  // Se já existe uma app, pega a instância existente
  app = getApp();
  console.log("Firebase app already exists."); // Log para debug
}

// Obtém a instância do serviço de Autenticação
auth = getAuth(app);

// Opcional: Inicializar outros serviços
// const firestore = getFirestore(app);
// const storage = getStorage(app);

// --- Exportações ---
// Exporta a instância da app e dos serviços para serem usados em outros lugares
export { app, auth };
// export { firestore, storage }; // Exporte outros serviços se os inicializou