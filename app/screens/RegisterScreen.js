import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Animated, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigation = useNavigation();

  // State for star animations and positions
  const starAnim1 = useState(new Animated.Value(0))[0];
  const starAnim2 = useState(new Animated.Value(0))[0];
  const starAnim3 = useState(new Animated.Value(0))[0];
  const starAnim4 = useState(new Animated.Value(0))[0];
  const starAnim5 = useState(new Animated.Value(0))[0];
  const [starPositions, setStarPositions] = useState([]);

  // Generate random positions for stars and set up animations
  useEffect(() => {
    // Generate random positions for 5 stars
    const positions = Array.from({ length: 5 }, () => ({
      top: `${Math.random() * 90}%`, // Random top position (0-90% to avoid edges)
      left: `${Math.random() * 90}%`, // Random left position (0-90% to avoid edges)
    }));
    setStarPositions(positions);

    const createBlinkAnimation = (anim) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 1,
            duration: 1000 + Math.random() * 2000, // Randomize blink speed
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

  const handleRegister = async () => {
    try {
      await signUp(email, password);
      // Show success pop-up
      Alert.alert(
        'Success',
        'Registration successful! You can now go to Email and verify your account.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate('Login'),
          },
        ],
        { cancelable: false }
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleBack = () => {
    navigation.navigate('Login');
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

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backButtonText}>← Back to Login</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Register</Text>
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
      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
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
    backgroundColor: '#1f1f1fff', // Dark navy for night sky
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 1,
    padding: 10,
    backgroundColor: 'rgba(46, 58, 59, 0.8)', // Semi-transparent dark to fit theme
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  backButtonText: {
    color: '#E0E0E0',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E0E0E0', // Light gray for contrast
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1e1e1eff', // Darker shade for input fields
    borderRadius: 12,
    padding: 15,
    marginVertical: 10,
    fontSize: 16,
    color: '#E0E0E0',
    borderWidth: 1,
    borderColor: '#4A5859', // Subtle border for depth
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0,
    shadowRadius: 5,
    elevation: 3,
  },
  error: {
    color: '#E57373', // Soft red for errors
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
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