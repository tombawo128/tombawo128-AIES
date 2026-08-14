import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { Data, User, Internship, Application, Report, Evaluation, Notification, Company, University } from '../types';
import { supabase } from '../supabaseClient';

interface AppContextType {
  data: Data;
  setData: React.Dispatch<React.SetStateAction<Data>>;
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshData: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const fetchAllData = async (): Promise<Data> => {
  const [
    { data: users },
    { data: internships },
    { data: applications },
    { data: reports },
    { data: evaluations },
    { data: notifications },
    { data: companies },
    { data: universities },
  ] = await Promise.all([
    supabase.from('users').select('*'),
    supabase.from('internships').select('*'),
    supabase.from('applications').select('*'),
    supabase.from('reports').select('*'),
    supabase.from('evaluations').select('*'),
    supabase.from('notifications').select('*'),
    supabase.from('companies').select('*'),
    supabase.from('universities').select('*'),
  ]);

  return {
    users: users || [],
    internships: internships || [],
    applications: applications || [],
    reports: reports || [],
    evaluations: evaluations || [],
    notifications: notifications || [],
    companies: companies || [],
    universities: universities || [],
  };
};

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [data, setData] = useState<Data>({
    users: [],
    internships: [],
    applications: [],
    reports: [],
    evaluations: [],
    notifications: [],
    companies: [],
    universities: [],
  });
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (authId: string, email?: string) => {
    // Try by auth_id first
    let { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', authId)
      .maybeSingle();

    // If not found and email is provided, try by email
    if (!profile && email) {
      const { data: byEmail, error: emailError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();
      if (byEmail) {
        profile = byEmail;
        // Optionally update the profile with auth_id for future
        if (profile && !profile.auth_id) {
          await supabase
            .from('users')
            .update({ auth_id: authId })
            .eq('id', profile.id);
        }
      }
    }

    if (error || !profile) {
      setUser(null);
      return null;
    }
    setUser(profile as User);
    return profile;
  };

  const refreshData = async () => {
    if (!user) return;
    try {
      const newData = await fetchAllData();
      setData(newData);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email);
        if (profile) {
          await refreshData();
        }
      }
      setLoading(false);
    };
    init();

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        const profile = await loadProfile(session.user.id, session.user.email);
        if (profile) {
          await refreshData();
        }
      } else {
        setUser(null);
        setData({
          users: [],
          internships: [],
          applications: [],
          reports: [],
          evaluations: [],
          notifications: [],
          companies: [],
          universities: [],
        });
      }
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    if (authData.user) {
      const profile = await loadProfile(authData.user.id, authData.user.email);
      if (!profile) throw new Error('Profile not found. Please contact support or re-register.');

      if (!profile.active) {
        await supabase.auth.signOut();
        setUser(null);
        throw new Error('Your account is pending admin approval.');
      }

      await refreshData();
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setData({
      users: [],
      internships: [],
      applications: [],
      reports: [],
      evaluations: [],
      notifications: [],
      companies: [],
      universities: [],
    });
    window.location.href = '/login';
  };

  return (
    <AppContext.Provider value={{ data, setData, user, setUser, loading, login, logout, refreshData }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const ctx = React.useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};