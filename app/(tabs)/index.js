import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

export default function Login() {
  const navigation = useNavigation();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const { control, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      let result;
      if (isSignup) {
        result = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
        });
      } else {
        result = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
      }

      if (result.error) {
        Alert.alert('Error', result.error.message);
      } else {
        Alert.alert('Success', isSignup ? 'Account created! Please log in.' : 'Logged in successfully!');
        if (!isSignup) {
          navigation.navigate('(tabs)');
        } else {
          setIsSignup(false);
        }
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, !isSignup && styles.activeTab]}
          onPress={() => setIsSignup(false)}
          disabled={loading}
        >
          <Text style={[styles.tabText, !isSignup && styles.activeTabText]}>Login</Text>
        </Pressable>
        <Pressable
          style={[styles.tab, isSignup && styles.activeTab]}
          onPress={() => setIsSignup(true)}
          disabled={loading}
        >
          <Text style={[styles.tabText, isSignup && styles.activeTabText]}>Sign Up</Text>
        </Pressable>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.title}>{isSignup ? 'Join the Adventure' : 'Welcome Back'}</Text>
        <Controller
          control={control}
          name="email"
          rules={{
            required: 'Email is required',
            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputContainer, errors.email && styles.inputErrorContainer]}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#888"
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          )}
        />
        {errors.email && <Text style={styles.errorText}>{errors.email.message}</Text>}
        <Controller
          control={control}
          name="password"
          rules={{
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          }}
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputContainer, errors.password && styles.inputErrorContainer]}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#888"
                secureTextEntry
                value={value}
                onChangeText={onChange}
              />
            </View>
          )}
        />
        {errors.password && <Text style={styles.errorText}>{errors.password.message}</Text>}
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.8 : 1 },
          ]}
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{isSignup ? 'Sign Up' : 'Login'}</Text>
        </Pressable>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </View>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1a1a', justifyContent: 'center' },
  tabContainer: {
    flexDirection: 'row',
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#2c2c2c',
    borderRadius: 12,
    marginTop: 40,
    marginBottom: 20,
    overflow: 'hidden',
  },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center', backgroundColor: '#2c2c2c' },
  activeTab: { backgroundColor: '#007AFF' },
  tabText: { fontSize: 18, fontWeight: '600', color: '#888' },
  activeTabText: { color: '#fff' },
  formContainer: {
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    marginVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputErrorContainer: { borderWidth: 1, borderColor: '#ff4d4f' },
  input: { paddingVertical: 12, fontSize: 16, color: '#1a1a1a' },
  errorText: { color: '#ff4d4f', fontSize: 14, marginBottom: 10, marginLeft: 10 },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    marginVertical: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  forgotPassword: { color: '#007AFF', fontSize: 16, textAlign: 'center', marginTop: 10 },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});