/**
 * Modal de Autenticación de Usuario (AuthModal.tsx)
 * 
 * Modos:
 * 1. 'login': Inicio de sesión con correo y contraseña.
 * 2. 'register': Creación de cuenta con correo, contraseña y nombre.
 * 3. 'reset': Recuperación de contraseña por correo.
 */

import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  LogIn,
  UserPlus,
  ShieldAlert,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast?: (title: string, subtitle?: string) => void;
}

type AuthMode = 'login' | 'register' | 'reset';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const {
    registerUser,
    loginUser,
    loginWithGoogleProvider,
    loginAsGuest,
    sendPasswordReset,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginUser(email.trim(), password);
        if (onSuccessToast) onSuccessToast('Sesion iniciada', 'Tus mazos estan sincronizados');
        onClose();
      } else if (mode === 'register') {
        if (password.length < 6) {
          setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
          setIsLoading(false);
          return;
        }
        await registerUser(email.trim(), password, name.trim() || undefined);
        if (onSuccessToast) onSuccessToast('Cuenta creada', 'Bienvenido a Magic 3D Explorer');
        onClose();
      } else if (mode === 'reset') {
        await sendPasswordReset(email.trim());
        setSuccessMsg('Se ha enviado un enlace de recuperacion a tu correo.');
      }
    } catch (err: unknown) {
      console.error('Firebase Auth Error:', err);
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/operation-not-allowed') {
        setErrorMsg('Debes habilitar "Correo/Contraseña" en la consola de Firebase (Authentication > Sign-in method).');
      } else if (error.code === 'auth/email-already-in-use') {
        setErrorMsg('Este correo ya esta registrado. Inicia sesion en su lugar.');
      } else if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrorMsg('Correo o contraseña incorrectos.');
      } else if (error.code === 'auth/user-not-found') {
        setErrorMsg('No existe una cuenta registrada con este correo.');
      } else if (error.code === 'auth/weak-password') {
        setErrorMsg('La contraseña es muy debil. Usa al menos 6 caracteres.');
      } else if (error.code === 'auth/invalid-email') {
        setErrorMsg('Ingresa un formato de correo electronico valido.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setErrorMsg('Dominio no autorizado en Firebase Console (Authentication > Settings > Authorized domains).');
      } else {
        setErrorMsg(error.message || 'Error en la autenticacion. Revisa la consola.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogleProvider();
      if (onSuccessToast) onSuccessToast('Sesion iniciada', 'Conectado mediante Google');
      onClose();
    } catch (err: unknown) {
      console.error('Firebase Google Auth Error:', err);
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/operation-not-allowed') {
        setErrorMsg('Debes habilitar el proveedor "Google" en la consola de Firebase (Authentication > Sign-in method).');
      } else if (error.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Se cerro la ventana de Google antes de completar el acceso.');
      } else if (error.code === 'auth/popup-blocked') {
        setErrorMsg('El navegador bloqueo la ventana emergente de Google. Permite ventanas emergentes.');
      } else if (error.code === 'auth/unauthorized-domain') {
        setErrorMsg('Dominio no autorizado en Firebase Console (Authorized domains).');
      } else {
        setErrorMsg(error.message || 'No se pudo completar el inicio de sesion con Google.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginAsGuest();
      if (onSuccessToast) onSuccessToast('Modo Invitado', 'Mazos guardados temporalmente');
      onClose();
    } catch (err: unknown) {
      console.error('Firebase Guest Auth Error:', err);
      const error = err as { code?: string; message?: string };
      if (error.code === 'auth/operation-not-allowed') {
        setErrorMsg('Debes habilitar "Anonimo" en la consola de Firebase (Authentication > Sign-in method).');
      } else {
        setErrorMsg(error.message || 'Error al iniciar como invitado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div
        className="auth-modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
      >
        {/* Header */}
        <div className="auth-modal-header">
          <div>
            <h3 id="auth-modal-title" className="auth-modal-title">
              {mode === 'login' && 'Iniciar Sesion'}
              {mode === 'register' && 'Crear Cuenta'}
              {mode === 'reset' && 'Recuperar Contraseña'}
            </h3>
            <p className="auth-modal-subtitle">
              {mode === 'login' && 'Accede para sincronizar tus mazos en la nube'}
              {mode === 'register' && 'Guarda y comparte tus barajas en cualquier dispositivo'}
              {mode === 'reset' && 'Ingresa tu correo para restablecer tu clave'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="deck-delete-btn"
            title="Cerrar ventana"
          >
            <X size={16} />
          </button>
        </div>

        {/* Tab Selector */}
        {mode !== 'reset' && (
          <div className="auth-modal-tabs">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`auth-modal-tab-btn ${mode === 'login' ? 'active' : ''}`}
            >
              Iniciar Sesion
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`auth-modal-tab-btn ${mode === 'register' ? 'active' : ''}`}
            >
              Registrarse
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="auth-modal-body">
          {/* Alerts */}
          {errorMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                color: '#f87171',
                fontSize: '0.76rem',
              }}
            >
              <ShieldAlert size={15} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: '8px',
                padding: '0.55rem 0.75rem',
                color: '#34d399',
                fontSize: '0.76rem',
              }}
            >
              <CheckCircle2 size={15} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mode === 'register' && (
              <div className="auth-form-field">
                <label htmlFor="authName">Nombre de Usuario</label>
                <div className="auth-input-wrapper">
                  <UserIcon size={14} className="auth-input-icon" />
                  <input
                    id="authName"
                    type="text"
                    placeholder="Tu nombre de usuario"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="auth-form-field">
              <label htmlFor="authEmail">Correo Electronico</label>
              <div className="auth-input-wrapper">
                <Mail size={14} className="auth-input-icon" />
                <input
                  id="authEmail"
                  type="email"
                  placeholder="nombre@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div className="auth-form-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label htmlFor="authPassword">Contraseña</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => { setMode('reset'); setErrorMsg(null); }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.7rem',
                        cursor: 'pointer',
                        textDecoration: 'underline',
                      }}
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="auth-input-wrapper">
                  <Lock size={14} className="auth-input-icon" />
                  <input
                    id="authPassword"
                    type="password"
                    placeholder="Minimo 6 caracteres"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="auth-submit-btn"
            >
              {isLoading ? (
                <Loader2 size={15} style={{ animation: 'spin 1.2s linear infinite' }} />
              ) : mode === 'login' ? (
                <>
                  <LogIn size={15} />
                  <span>Iniciar Sesion</span>
                </>
              ) : mode === 'register' ? (
                <>
                  <UserPlus size={15} />
                  <span>Registrar Cuenta</span>
                </>
              ) : (
                <span>Enviar Enlace de Recuperacion</span>
              )}
            </button>

            {mode === 'reset' && (
              <button
                type="button"
                onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  marginTop: '0.25rem',
                }}
              >
                Volver a Iniciar Sesion
              </button>
            )}
          </form>

          {/* Social / Guest Options */}
          {mode !== 'reset' && (
            <div style={{ marginTop: '0.5rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={isLoading}
                  className="auth-secondary-btn"
                  title="Continuar con Google"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={handleGuestLogin}
                  disabled={isLoading}
                  className="auth-secondary-btn"
                  title="Continuar en Modo Invitado"
                >
                  <UserIcon size={14} />
                  <span>Invitado</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
