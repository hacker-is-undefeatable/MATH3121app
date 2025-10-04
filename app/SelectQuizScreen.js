import { useNavigation } from '@react-navigation/native';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';

// Hardcoded quizzes for simplicity
const quizzes = [
  { id: 1, title: 'Math Quiz', description: 'Test your basic math skills' },
  { id: 2, title: 'Geography Quiz', description: 'Explore world capitals and more' },
  { id: 3, title: 'General Knowledge', description: 'Challenge your trivia expertise' },
];

const { width } = Dimensions.get('window');

export default function SelectQuizScreen() {
  const navigation = useNavigation();

  const handleSelectQuiz = (quizId) => {
    navigation.navigate('Quiz'); // Matches app/Quiz.tsx
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Choose a Quiz</Text>
        {quizzes.map((quiz) => (
          <Pressable
            key={quiz.id}
            style={({ pressed }) => [styles.quizButton, { opacity: pressed ? 0.8 : 1 }]}
            onPress={() => handleSelectQuiz(quiz.id)}
          >
            <Text style={styles.quizTitle}>{quiz.title}</Text>
            <Text style={styles.quizDescription}>{quiz.description}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    width: width * 0.9,
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
  quizButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  quizTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  quizDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#e6f0ff',
    marginTop: 5,
  },
});