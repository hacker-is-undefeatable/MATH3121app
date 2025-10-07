import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function QuizScreen() {
  const route = useRoute();
  const { quizId } = route.params;
  const { user, supabase } = useAuth();
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('quiz_id', quizId)
        .order('id');
      if (error) console.error(error);
      else setQuestions(data);
    };
    fetchQuestions();
  }, [quizId, supabase]);

  const handleSelect = (index) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: index,
    });
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate final score when finishing
      let finalScore = 0;
      questions.forEach((q, idx) => {
        if (selectedAnswers[idx] === parseInt(q.correct_answer)) {
          finalScore += 1;
        }
      });
      setScore(finalScore);
      finishQuiz(finalScore);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishQuiz = async (finalScore) => {
    setFinished(true);
    const { error } = await supabase
      .from('scores')
      .insert([{ user_id: user.id, quiz_id: quizId, score: finalScore }]);
    if (error) console.error(error);
  };

  // Check if all questions have been answered
  const allQuestionsAnswered = () => {
    return questions.every((_, index) => selectedAnswers[index] !== undefined);
  };

  if (finished) {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Quiz Finished!</Text>
        <Text style={styles.scoreText}>
          Your Score: {score}/{questions.length}
        </Text>
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.pressedStyle,
          ]}
          onPress={() => navigation.navigate('Dashboard')}
        >
          <Text style={styles.buttonText}>Back to Dashboard</Text>
        </Pressable>
      </View>
    );
  }

  if (questions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading questions...</Text>
      </View>
    );
  }

  const question = questions[currentQuestion];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>
        Question {currentQuestion + 1} of {questions.length}
      </Text>
      <Text style={styles.questionText}>{question.text}</Text>
      {[question.option1, question.option2, question.option3, question.option4].map(
        (option, index) => (
          <Pressable
            key={index}
            style={({ pressed }) => [
              styles.option,
              selectedAnswers[currentQuestion] === index && styles.selectedOption,
              pressed && styles.pressedStyle,
              Platform.OS === 'android' && styles.androidFix,
            ]}
            onPress={() => handleSelect(index)}
          >
            <Text style={styles.optionText}>{option}</Text>
          </Pressable>
        )
      )}
      {currentQuestion === questions.length - 1 && !allQuestionsAnswered() && (
        <Text style={styles.warningText}>
          Please answer all questions before submitting.
        </Text>
      )}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.pressedStyle,
            currentQuestion === 0 && styles.disabledButton,
          ]}
          onPress={handlePrevious}
          disabled={currentQuestion === 0}
        >
          <Text style={styles.buttonText}>Previous</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.pressedStyle,
            currentQuestion === questions.length - 1 &&
              !allQuestionsAnswered() &&
              styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={currentQuestion === questions.length - 1 && !allQuestionsAnswered()}
        >
          <Text style={styles.buttonText}>
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#F0F2F5', // Soft pastel background
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  questionText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    backgroundColor: '#E6E8EB', // Soft base for neumorphic effect
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: Platform.OS === 'android' ? 2 : 4, // Lower on Android
    borderWidth: 1,
    borderColor: '#D1D4D8', // Subtle border
  },
  selectedOption: {
    backgroundColor: '#4A90E2', // Opaque blue for selected
  },
  pressedStyle: {
    opacity: 0.7, // Press feedback for all platforms
  },
  androidFix: {
    padding: 16, // Extra padding for Android
    overflow: 'visible', // Avoid clipping
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    textAlign: 'center',
  },
  warningText: {
    color: '#E57373', // Soft red for warnings
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  navButton: {
    backgroundColor: '#E6E8EB',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: Platform.OS === 'android' ? 3 : 5,
    borderWidth: 1,
    borderColor: '#D1D4D8',
  },
  disabledButton: {
    backgroundColor: '#D8DADE', // Dimmed for disabled state
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
    marginVertical: 20,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
});