
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se há uma sessão ativa armazenada
    const storedAuth = localStorage.getItem('admin_auth');
    if (storedAuth) {
      const authData = JSON.parse(storedAuth);
      if (authData.isAuthenticated && authData.username === 'romenia12') {
        // Simular um usuário autenticado
        const mockUser = {
          id: 'admin-user',
          email: 'romenia12',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
        } as User;
        
        const mockSession = {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: mockUser
        } as Session;
        
        setUser(mockUser);
        setSession(mockSession);
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      // Verificar credenciais hardcoded
      if (username === 'romenia12' && password === 'romenia12') {
        // Criar uma sessão simulada
        const mockUser = {
          id: 'admin-user',
          email: 'romenia12',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
        } as User;
        
        const mockSession = {
          access_token: 'mock-token',
          refresh_token: 'mock-refresh',
          expires_in: 3600,
          token_type: 'bearer',
          user: mockUser
        } as Session;

        // Armazenar no localStorage
        localStorage.setItem('admin_auth', JSON.stringify({
          isAuthenticated: true,
          username: username,
          timestamp: Date.now()
        }));

        setUser(mockUser);
        setSession(mockSession);
        
        return {};
      } else {
        return { error: 'Usuário ou senha incorretos' };
      }
    } catch (error) {
      console.error('Login exception:', error);
      return { error: 'Erro inesperado durante o login' };
    }
  };

  const logout = async () => {
    try {
      // Limpar dados do localStorage
      localStorage.removeItem('admin_auth');
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Logout exception:', error);
    }
  };

  const isAuthenticated = !!session && !!user;

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isAuthenticated, 
      login, 
      logout, 
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
