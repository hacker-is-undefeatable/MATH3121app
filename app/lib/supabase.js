// app/lib/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Import your config - using require for JSON files
const config = require('../../supabaseConfig.json');

// Extract credentials from your config
const supabaseUrl = config.supabaseUrl;
const supabaseAnonKey = config.supabaseAnonKey;

// Validate credentials
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('ERROR: Supabase credentials are missing!');
  console.error('Please check your supabaseConfig.json file');
  throw new Error('Supabase credentials missing');
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

console.log('Supabase client initialized successfully');

export { supabase };

