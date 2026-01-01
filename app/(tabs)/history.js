import { useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import MathText from '../components/MathText';
import { useAuth } from '../contexts/AuthContext';

export default function HistoryScreen() {
  const { user, supabase } = useAuth();
  const insets = useSafeAreaInsets();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const fetchScores = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching scores:', error);
      } else {
        setScores(data || []);
      }
    } catch (error) {
      console.error('Error in fetchScores:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
  }, [user]);

  const handleSelectQuiz = async (quiz) => {
    setSelectedQuiz(quiz);
    setCurrentQuestion(0);
    
    // Fetch answers for this quiz
    const { data: answers, error } = await supabase
      .from('user_answers')
      .select(`
        *,
        questions:question_id (*)
      `)
      .eq('score_id', quiz.id)
      .order('created_at', { ascending: true });
    
    if (error) {
      console.error('Error fetching answers:', error);
    } else {
      setSelectedQuizAnswers(answers || []);
    }
  };

  const renderScoreItem = ({ item }) => {
    const topic = item.topic || 'General Quiz';
    const percentage = Math.round((item.score / item.total_questions) * 100);
    
    return (
      <Pressable 
        style={({ pressed }) => [styles.scoreCard, pressed && styles.pressedCard]}
        onPress={() => handleSelectQuiz(item)}
      >
        <View style={styles.scoreHeader}>
          <View style={styles.quizInfo}>
            <Text style={styles.quizName}>{topic}</Text>
            <Text style={styles.dateText}>
              {new Date(item.created_at).toLocaleString()}
            </Text>
          </View>
          <View style={styles.scoreSection}>
            <Text style={styles.scoreText}>
              {item.score}/{item.total_questions}
            </Text>
            <Text style={[styles.percentageText, { color: percentage >= 70 ? '#2E8B57' : '#E57373' }]}>
              {percentage}%
            </Text>
          </View>
        </View>
      </Pressable>
    );
  };

  const handleNext = () => {
    if (selectedQuiz && currentQuestion < selectedQuiz.total_questions - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Review screen
  if (selectedQuiz && selectedQuizAnswers.length > 0) {
    const answerData = selectedQuizAnswers[currentQuestion];
    
    if (!answerData || !answerData.questions) {
      return (
        <View style={styles.container}>
          <Text style={styles.text}>Question not found</Text>
          <Pressable
            style={styles.navButton}
            onPress={() => setSelectedQuiz(null)}
          >
            <Text style={styles.buttonText}>Back to History</Text>
          </Pressable>
        </View>
      );
    }

    const question = answerData.questions;
    const userAnswerIndex = answerData.selected_option;
    const correctAnswerIndex = parseInt(question.correct_option);
    const isCorrect = answerData.is_correct;
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
              Question {currentQuestion + 1} of {selectedQuiz.total_questions}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: `${((currentQuestion + 1) / selectedQuiz.total_questions) * 100}%` 
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
            {options.map((option, index) => {
              const isUserAnswer = index === userAnswerIndex;
              const isCorrectAnswer = index === correctAnswerIndex;
              let optionStyle = styles.option;
              let optionTextStyle = styles.optionText;

              if (isCorrectAnswer) {
                optionStyle = [styles.option, styles.correctOption];
                optionTextStyle = [styles.optionText, styles.correctOptionText];
              } else if (isUserAnswer && !isCorrect) {
                optionStyle = [styles.option, styles.wrongOption];
                optionTextStyle = [styles.optionText, styles.wrongOptionText];
              }

              return (
                <View
                  key={index}
                  style={optionStyle}
                >
                  <MathText
                    text={option}
                    style={optionTextStyle}
                  />
                  {isCorrectAnswer && <Text style={styles.correctLabel}>✓ Correct</Text>}
                  {isUserAnswer && !isCorrect && <Text style={styles.wrongLabel}>✗ Your Answer</Text>}
                </View>
              );
            })}
          </View>
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
              currentQuestion === selectedQuiz.total_questions - 1 && styles.disabledButton,
            ]}
            onPress={currentQuestion === selectedQuiz.total_questions - 1 ? () => setSelectedQuiz(null) : handleNext}
          >
            <Text style={styles.buttonText}>
              {currentQuestion === selectedQuiz.total_questions - 1 ? 'Back to History' : 'Next'}
            </Text>
          </Pressable>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Quiz History</Text>
      {scores.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No quiz attempts yet</Text>
          <Text style={styles.emptySubText}>Complete quizzes to see your history here</Text>
        </View>
      ) : (
        <FlatList
          data={scores}
          renderItem={renderScoreItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchScores}
              colors={['#4A5859']}
              tintColor="#4A5859"
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1f1f1fff',
    borderTopWidth: 50,
    borderTopColor: '#1f1f1fff',
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E0E0E0',
    marginBottom: 25,
    textAlign: 'center',
  },
  scoreCard: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#4A5859',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  quizInfo: {
    flex: 1,
  },
  quizName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#E0E0E0',
    marginBottom: 5,
  },
  scoreSection: {
    alignItems: 'flex-end',
    marginLeft: 10,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  percentageText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#B0B0B0',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 20,
    color: '#E0E0E0',
    marginBottom: 10,
  },
  emptySubText: {
    fontSize: 16,
    color: '#B0B0B0',
    textAlign: 'center',
  },
  pressedCard: {
    opacity: 0.7,
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
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
  correctOption: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
  },
  wrongOption: {
    backgroundColor: '#E57373',
    borderColor: '#E57373',
  },
  optionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  correctOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  wrongOptionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  correctLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '600',
  },
  wrongLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    fontWeight: '600',
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
    color: '#FFFFFF',
    fontWeight: '500',
  },
  pressedStyle: {
    opacity: 0.7,
  },
  text: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
});