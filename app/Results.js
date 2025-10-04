// import { useNavigation, useRoute } from '@react-navigation/native';
// import { useEffect } from 'react';
// import { Alert, Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
// import { supabase } from './utils/supabase';

// const { width } = Dimensions.get('window');

// export default function Results() {
//   const navigation = useNavigation();
//   const route = useRoute();
//   const { score } = route.params;

//   useEffect(() => {
//     const saveScore = async () => {
//       try {
//         const { data: { user }, error: userError } = await supabase.auth.getUser();
//         if (!user) throw new Error('No user logged in');
//         const { error } = await supabase
//           .from('quiz_scores')
//           .insert({ user_id: user.id, score });
//         if (error) throw error;
//         console.log('Score saved to Supabase');
//       } catch (error) {
//         Alert.alert('Error', 'Failed to save score: ' + error.message);
//       }
//     };
//     saveScore();
//   }, [score]);

//   return (
//     <View style={styles.container}>
//       <View style={styles.formContainer}>
//         <Text style={styles.title}>Quiz Results</Text>
//         <View style={styles.scoreContainer}>
//           <Text style={styles.scoreText}>{score}%</Text>
//           <Text style={styles.scoreLabel}>Your Score</Text>
//         </View>
//         <Pressable
//           style={({ pressed }) => [
//             styles.button,
//             { opacity: pressed ? 0.8 : 1 },
//           ]}
//           onPress={() => navigation.navigate('Quiz')}
//         >
//           <Text style={styles.buttonText}>Retake Quiz</Text>
//         </Pressable>
//         <Pressable
//           style={({ pressed }) => [
//             styles.button,
//             styles.logoutButton,
//             { opacity: pressed ? 0.8 : 1 },
//           ]}
//           onPress={async () => {
//             await supabase.auth.signOut();
//           }}
//         >
//           <Text style={styles.buttonText}>Logout</Text>
//         </Pressable>
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#1a1a1a',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   formContainer: {
//     width: width * 0.9,
//     backgroundColor: '#fff',
//     borderRadius: 12,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.3,
//     shadowRadius: 10,
//     elevation: 8,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: '700',
//     color: '#1a1a1a',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   scoreContainer: {
//     alignItems: 'center',
//     marginBottom: 30,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 10,
//     padding: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   scoreText: {
//     fontSize: 48,
//     fontWeight: '800',
//     color: '#007AFF',
//   },
//   scoreLabel: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#666',
//     marginTop: 5,
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     paddingVertical: 15,
//     borderRadius: 10,
//     marginVertical: 8,
//     alignItems: 'center',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   logoutButton: {
//     backgroundColor: '#ff4d4f',
//   },
//   buttonText: {
//     fontSize: 18,
//     fontWeight: '600',
//     color: '#fff',
//   },
// });