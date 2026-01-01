import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MathText from './components/MathText';
import { useAuth } from './contexts/AuthContext';

export default function QuizScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { supabase } = useAuth();
  const insets = useSafeAreaInsets();
  
  // Parse questions from params
  const quizQuestions = params.questions ? JSON.parse(params.questions) : [];
  const topic = params.topic || 'General';
  const actualQuestions = params.actualQuestions || 0;
  
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const handleSelect = (index) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion]: index,
    });
  };

  const handleNext = () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate final score when finishing
      let finalScore = 0;
      quizQuestions.forEach((q, idx) => {
        if (selectedAnswers[idx] === parseInt(q.correct_option)) {
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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No user found');
        return;
      }
      
      // Save quiz attempt as a single entry with overall score
      const { data: scoreData, error: scoreError } = await supabase
        .from('scores')
        .insert([{
          user_id: user.id,
          score: finalScore,
          total_questions: quizQuestions.length,
          topic: topic
        }])
        .select();
      
      if (scoreError) {
        console.error('Error saving score:', scoreError);
        return;
      }

      const scoreId = scoreData[0].id;

      // Save individual answers to the user_answers table
      const answerRecords = quizQuestions.map((question, idx) => {
        const selectedOptionIndex = selectedAnswers[idx];
        const correctOptionIndex = parseInt(question.correct_option);
        
        return {
          score_id: scoreId,
          question_id: question.id,
          selected_option: selectedOptionIndex,
          is_correct: selectedOptionIndex === correctOptionIndex
        };
      });

      const { error: answersError } = await supabase
        .from('user_answers')
        .insert(answerRecords);
      
      if (answersError) console.error('Error saving answers:', answersError);
    } catch (error) {
      console.error('Error in finishQuiz:', error);
    }
  };

  const allQuestionsAnswered = () => {
    return quizQuestions.every((_, index) => selectedAnswers[index] !== undefined);
  };

  if (finished) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Quiz Finished!</Text>
        <Text style={styles.scoreText}>
          Your Score: {score}/{actualQuestions}
        </Text>
        <Text style={styles.topicText}>Topic: {topic}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.navButton,
            pressed && styles.pressedStyle,
          ]}
          onPress={() => router.replace('/(tabs)')}
        >
          <Text style={styles.buttonText}>Back to Home</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  if (quizQuestions.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No questions available</Text>
        <Pressable
          style={styles.navButton}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const question = quizQuestions[currentQuestion];
  const options = [question.option_1, question.option_2, question.option_3, question.option_4];

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Question {currentQuestion + 1} of {quizQuestions.length}
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { 
              width: `${((currentQuestion + 1) / quizQuestions.length) * 100}%` 
            }]} />
          </View>
        </View>

        {question.img_link && (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: question.img_link }}
              style={styles.questionImage}
              resizeMode="contain"
            />
          </View>
        )}

        <View style={styles.questionCard}>
          <MathText 
            text={question.question}
            style={styles.questionText}
          />
        </View>

        <View style={styles.optionsContainer}>
          {options.map((option, index) => (
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
              <MathText
                text={option}
                style={[
                  styles.optionText,
                  selectedAnswers[currentQuestion] === index && styles.selectedOptionText
                ]}
              />
            </Pressable>
          ))}
        </View>

        {currentQuestion === quizQuestions.length - 1 && !allQuestionsAnswered() && (
          <Text style={styles.warningText}>
            Please answer all questions before submitting.
          </Text>
        )}
      </ScrollView>

      <SafeAreaView style={styles.buttonContainer}>
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
            currentQuestion === quizQuestions.length - 1 &&
              !allQuestionsAnswered() &&
              styles.disabledButton,
          ]}
          onPress={handleNext}
          disabled={currentQuestion === quizQuestions.length - 1 && !allQuestionsAnswered()}
        >
          <Text style={styles.buttonText}>
            {currentQuestion === quizQuestions.length - 1 ? 'Submit' : 'Next'}
          </Text>
        </Pressable>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1fff',
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 16,
    color: '#FFFFFF', // WHITE
    marginBottom: 10,
    textAlign: 'center',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#1e1e1eff',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2E8B57',
    borderRadius: 4,
  },
  imageContainer: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4A5859',
    alignItems: 'center',
    justifyContent: 'center',
  },
  questionImage: {
    width: '100%',
    height: 200,
  },
  questionCard: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4A5859',
    minHeight: 120,
    justifyContent: 'center',
  },
  questionText: {
    // These styles will be passed to MathText
    color: '#FFFFFF', // WHITE
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  option: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#4A5859',
    minHeight: 70,
    justifyContent: 'center',
  },
  selectedOption: {
    backgroundColor: '#4A5859',
  },
  optionText: {
    // These styles will be passed to MathText
    color: '#FFFFFF', // WHITE
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  selectedOptionText: {
    // These styles will be passed to MathText
    color: '#FFFFFF', // WHITE
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressedStyle: {
    opacity: 0.7,
  },
  androidFix: {
    padding: 16,
    overflow: 'visible',
  },
  warningText: {
    color: '#E57373', // Keep warning text red
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1f1f1fff',
    borderTopWidth: 1,
    borderTopColor: '#4A5859',
  },
  navButton: {
    backgroundColor: '#1a1a1aff',
    borderRadius: 12,
    padding: 15,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  disabledButton: {
    backgroundColor: '#1a1a1aff',
    opacity: 0.5,
  },
  buttonText: {
    fontSize: 16,
    color: '#FFFFFF', // WHITE
    fontWeight: '500',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF', // WHITE
    marginBottom: 20,
    textAlign: 'center',
  },
  scoreText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF', // WHITE (was green)
    marginBottom: 10,
    textAlign: 'center',
  },
  topicText: {
    fontSize: 18,
    color: '#FFFFFF', // WHITE
    marginBottom: 30,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF', // WHITE
    textAlign: 'center',
    marginBottom: 20,
  },
});