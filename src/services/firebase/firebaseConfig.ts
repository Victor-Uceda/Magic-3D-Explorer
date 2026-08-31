/**
 * Inicialización del SDK Modular de Firebase (firebaseConfig.ts)
 * 
 * Centraliza la inicialización de:
 * 1. Firebase App: Instancia de conexión con el proyecto magic-3d-81be2.
 * 2. Firebase Auth: Servicio de autenticación (Email/Contraseña, Google, Anónimo).
 * 3. Cloud Firestore: Base de datos NoSQL para sincronización de mazos en la nube.
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Evita re-inicializaciones en entornos de desarrollo con Hot Module Replacement (HMR)
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
