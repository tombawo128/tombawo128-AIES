import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Data, User } from '../types';
import { seed } from '../data/seed';
import { supabase } from '../supabaseClient';

interface AppContextType {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Data>(seed);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authId: string) => {
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .single();

    if (error || !profile) {
      setUser(null);
      return;
    }
    setUser(profile as User);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event: any, session: any) =>  {
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setUser(null);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (authData.user) {
      await loadProfile(authData.user.id);

      const { data: profile } = await supabase
        .from('users')
        .select('active')
        .eq('auth_id', authData.user.id)
        .single();

      if (profile && !profile.active) {
        await supabase.auth.signOut();
        setUser(null);
        throw new Error('Your account is pending admin approval.');
      }
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AppContext.Provider value={{ data, setData, user, setUser, loading, login, logout }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};