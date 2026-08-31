/**
 * Custom Hook: useAuth (useAuth.ts)
 * 
 * Responsabilidad:
 * Expone el estado del usuario autenticado, carga inicial y métodos
 * de registro, login con correo, login con Google, invitado y logout.
 */

import { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  subscribeToAuthState,
  registerWithEmail,
  loginWithEmail,
  loginWithGoogle,
  loginAnonymously,
  logout,
  resetPassword,
  updateUserName,
} from '../services/firebase/authService';

export interface UseAuthReturn {
  user: UserProfile | null;
  isLoading: boolean;
  registerUser: (email: string, pass: string, name?: string) => Promise<UserProfile>;
  loginUser: (email: string, pass: string) => Promise<UserProfile>;
  loginWithGoogleProvider: () => Promise<UserProfile>;
  loginAsGuest: () => Promise<UserProfile>;
  logoutCurrentUser: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuthState((profile) => {
      setUser(profile);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const registerUser = useCallback(async (email: string, pass: string, name?: string) => {
    return await registerWithEmail(email, pass, name);
  }, []);

  const loginUser = useCallback(async (email: string, pass: string) => {
    return await loginWithEmail(email, pass);
  }, []);

  const loginWithGoogleProvider = useCallback(async () => {
    return await loginWithGoogle();
  }, []);

  const loginAsGuest = useCallback(async () => {
    return await loginAnonymously();
  }, []);

  const logoutCurrentUser = useCallback(async () => {
    await logout();
    setUser(null);
  }, []);

  const sendPasswordReset = useCallback(async (email: string) => {
    await resetPassword(email);
  }, []);

  const updateProfileName = useCallback(async (name: string) => {
    await updateUserName(name);
    setUser((prev) => (prev ? { ...prev, displayName: name } : null));
  }, []);

  return {
    user,
    isLoading,
    registerUser,
    loginUser,
    loginWithGoogleProvider,
    loginAsGuest,
    logoutCurrentUser,
    sendPasswordReset,
    updateProfileName,
  };
}
