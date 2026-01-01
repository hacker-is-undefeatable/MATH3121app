// app/contexts/AuthContext.js
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    console.log('🔍 AuthContext: Starting initialization...');
    
    // Check if supabase is available
    if (!supabase) {
      console.error('❌ AuthContext: Supabase client is undefined!');
      setLoading(false);
      return;
    }

    console.log('🔍 AuthContext: Supabase client available, checking session...');

    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        console.log('📋 AuthContext: Session data received:', session ? `User: ${session.user?.email}` : 'No user');
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('❌ AuthContext: Error getting session:', error.message);
        setLoading(false);
      });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log(`🔐 AuthContext: Auth event - ${event}`, session ? `User: ${session.user?.email}` : 'User logged out');
        setSession(session);
        setUser(session?.user ?? null);
        if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
          setLoading(false);
        }
      }
    );

    return () => {
      console.log('🔄 AuthContext: Cleaning up subscription');
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    console.log(`🔐 Attempting login for: ${email}`);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.error('❌ Login error:', error.message);
      throw error;
    }
    console.log('✅ Login successful');
  };

  const signUp = async (email, password) => {
    console.log(`📝 Attempting registration for: ${email}`);
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.error('❌ Registration error:', error.message);
      throw error;
    }
    console.log('✅ Registration successful');
  };

  const signOut = async () => {
    console.log('🚪 Attempting logout');
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ Logout error:', error.message);
      throw error;
    }
    console.log('✅ Logout successful');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      signIn, 
      signUp, 
      signOut, 
      supabase,
      loading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};