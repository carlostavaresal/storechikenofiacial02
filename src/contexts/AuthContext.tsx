
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';

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
    console.log('AuthProvider: Initializing...');
    
    // Verificar se há uma sessão ativa armazenada
    try {
      const storedAuth = localStorage.getItem('admin_auth');
      console.log('AuthProvider: Stored auth:', storedAuth);
      
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        if (authData.isAuthenticated && authData.username === 'romenia12') {
          console.log('AuthProvider: Restoring session from localStorage');
          
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
    } catch (error) {
      console.error('AuthProvider: Error restoring session:', error);
    }
    
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log('AuthProvider: Login attempt for:', username);
      
      // Verificar credenciais hardcoded
      if (username === 'romenia12' && password === 'romenia12') {
        console.log('AuthProvider: Login successful');
        
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
        const authData = {
          isAuthenticated: true,
          username: username,
          timestamp: Date.now()
        };
        
        localStorage.setItem('admin_auth', JSON.stringify(authData));
        console.log('AuthProvider: Session saved to localStorage');

        setUser(mockUser);
        setSession(mockSession);
        
        return {};
      } else {
        console.log('AuthProvider: Invalid credentials');
        return { error: 'Usuário ou senha incorretos' };
      }
    } catch (error) {
      console.error('AuthProvider: Login exception:', error);
      return { error: 'Erro inesperado durante o login' };
    }
  };

  const logout = async () => {
    try {
      console.log('AuthProvider: Logging out');
      
      // Limpar dados do localStorage
      localStorage.removeItem('admin_auth');
      setUser(null);
      setSession(null);
      
      console.log('AuthProvider: Logout complete');
    } catch (error) {
      console.error('AuthProvider: Logout exception:', error);
    }
  };

  const isAuthenticated = !!session && !!user;

  console.log('AuthProvider: Current state:', { 
    isAuthenticated, 
    hasUser: !!user, 
    hasSession: !!session, 
    loading 
  });

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
