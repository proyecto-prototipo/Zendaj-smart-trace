import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Role } from '@/app/types';
import { demoCredentials } from '@/app/mocks/mockUsers';

interface AuthSession {
  email: string;
  name: string;
  role: Role;
  loginAt: string;
}

interface AuthStore {
  session: AuthSession | null;
  login: (email: string, password: string) => { ok: boolean; message?: string; role?: Role };
  loginAs: (role: Role) => void;
  logout: () => void;
}

const roleToEmail: Record<Role, string> = {
  administrador: 'admin@zendaj.com',
  asesor: 'postventa@zendaj.com',
  tecnico: 'tecnico@zendaj.com',
  cliente: 'cliente@zendaj.com',
  gerencia: 'gerencia@zendaj.com',
};

export const useAuth = create<AuthStore>()(
  persist(
    (set) => ({
      session: null,
      login: (email, password) => {
        const cred = demoCredentials[email.toLowerCase().trim()];
        if (!cred) return { ok: false, message: 'Usuario no encontrado' };
        if (cred.password !== password) return { ok: false, message: 'Contraseña incorrecta' };
        set({
          session: { email: email.toLowerCase().trim(), name: cred.name, role: cred.role, loginAt: new Date().toISOString() },
        });
        return { ok: true, role: cred.role };
      },
      loginAs: (role) => {
        const email = roleToEmail[role];
        const cred = demoCredentials[email];
        set({ session: { email, name: cred.name, role, loginAt: new Date().toISOString() } });
      },
      logout: () => set({ session: null }),
    }),
    { name: 'zendaj-auth' }
  )
);

export const roleLabels: Record<Role, string> = {
  administrador: 'Administrador',
  asesor: 'Asesor Postventa',
  tecnico: 'Técnico Evaluador',
  cliente: 'Cliente',
  gerencia: 'Gerencia',
};

export const rolePaths: Record<Role, string> = {
  administrador: '/app/dashboard',
  asesor: '/app/dashboard',
  tecnico: '/app/dashboard',
  cliente: '/app/cliente',
  gerencia: '/app/dashboard',
};
