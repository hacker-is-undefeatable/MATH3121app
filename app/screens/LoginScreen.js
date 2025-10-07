import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();
  const navigation = useNavigation();

  const starAnim1 = useState(new Animated.Value(0))[0];
  const starAnim2 = useState(new Animated.Value(0))[0];
  const starAnim3 = useState(new Animated.Value(0))[0];
  const starAnim4 = useState(new Animated.Value(0))[0];
  const starAnim5 = useState(new Animated.Value(0))[0];
  const [starPositions, setStarPositions] = useState([]);

  useEffect(() => {
    const positions = Array.from({ length: 5 }, () => ({
      top: `${Math.random() * 90}%`,
      left: `${Math.random() * 90}%`,
    }));
    setStarPositions(positions);

    const createBlinkAnimation = (anim) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 1000 + Math.random() * 2000,
            useNativeDriver: true,
          }),
        ])
      );
    };

    const animations = [
      createBlinkAnimation(starAnim1),
      createBlinkAnimation(starAnim2),
      createBlinkAnimation(starAnim3),
      createBlinkAnimation(starAnim4),
      createBlinkAnimation(starAnim5),
    ];

    animations.forEach((anim) => anim.start());

    return () => animations.forEach((anim) => anim.stop());
  }, [starAnim1, starAnim2, starAnim3, starAnim4, starAnim5]);

  const handleLogin = async () => {
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Star elements with animated opacity and random positions */}
      {starPositions.map((position, index) => (
        <Animated.View
          key={index}
          style={[
            styles.star,
            { top: position.top, left: position.left },
            { opacity: [starAnim1, starAnim2, starAnim3, starAnim4, starAnim5][index] },
          ]}
        />
      ))}

      <Text style={styles.header}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.registerButton}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#1f1f1fff',
  },
  star: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    fontSize: 16,
    color: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#4A5859',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0,
    shadowRadius: 5,
    elevation: 3,
  },
  error: {
    color: '#E57373',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#1a1a1aff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  registerButton: {
    backgroundColor: '#1a1a1aff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  buttonText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
  },
});