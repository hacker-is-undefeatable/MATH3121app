import { useEffect } from 'react';
import Layout from './app/(tabs)/_layout';
import { supabase } from './app/utils/supabase';

export default function App() {
  useEffect(() => {
    // Optional: Preload Supabase session if needed
    supabase.auth.getSession();
  }, []);

  return <Layout />;
}