/**
 * Servicio de Autenticación de Firebase (authService.ts)
 * 
 * Funcionalidades:
 * - Registro con Email y Contraseña propia.
 * - Inicio de sesión con Email y Contraseña.
 * - Inicio de sesión con Google (Opcional).
 * - Inicio de sesión como Invitado / Anónimo.
 * - Recuperación de contraseña por correo electrónico.
 * - Cierre de sesión.
 * - Suscripción al estado de autenticación (Patrón Observer).
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { auth } from './firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

/** Transforma el objeto User de Firebase a un modelo limpio de dominio */
export function mapFirebaseUser(user: User | null): UserProfile | null {
  if (!user) return null;
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Planeswalker'),
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  };
}

/** Registro con Correo y Contraseña */
export async function registerWithEmail(email: string, pass: string, name?: string): Promise<UserProfile> {
  const cred = await createUserWithEmailAndPassword(auth, email, pass);
  if (name && cred.user) {
    await updateProfile(cred.user, { displayName: name });
  }
  return mapFirebaseUser(cred.user)!;
}

/** Inicio de sesión con Correo y Contraseña */
export async function loginWithEmail(email: string, pass: string): Promise<UserProfile> {
  const cred = await signInWithEmailAndPassword(auth, email, pass);
  return mapFirebaseUser(cred.user)!;
}

/** Inicio de sesión rápido con Google */
export async function loginWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  return mapFirebaseUser(cred.user)!;
}

/** Inicio de sesión anónimo (Modo Invitado) */
export async function loginAnonymously(): Promise<UserProfile> {
  const cred = await signInAnonymously(auth);
  return mapFirebaseUser(cred.user)!;
}

/** Recuperación de contraseña */
export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

/** Cerrar sesión */
export async function logout(): Promise<void> {
  await signOut(auth);
}

/** Actualizar nombre del perfil */
export async function updateUserName(name: string): Promise<void> {
  if (auth.currentUser) {
    await updateProfile(auth.currentUser, { displayName: name });
  }
}

/** Suscripción a cambios de sesión (Observer) */
export function subscribeToAuthState(callback: (user: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, (firebaseUser) => {
    callback(mapFirebaseUser(firebaseUser));
  });
}
