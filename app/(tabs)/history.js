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
  
  // IMPORTANT: Keep values as they are in the database (1-indexed: 1,2,3,4)
  // Only convert to 0-indexed when accessing array indices
  const correctAnswerValue = question.correct_option; // Should be 1, 2, 3, or 4
  const userAnswerValue = answerData.selected_option; // Should be 1, 2, 3, 4, or null
  
  // Convert to 0-indexed for array access
  const correctAnswerIndex = correctAnswerValue ? parseInt(correctAnswerValue) - 1 : 0;
  const userAnswerIndex = userAnswerValue ? parseInt(userAnswerValue) - 1 : -1;
  
  // Use the is_correct flag from the database directly
  const isCorrect = answerData.is_correct === true;
  
  // Create options array
  const options = [
    question.option_1 || 'Option 1',
    question.option_2 || 'Option 2', 
    question.option_3 || 'Option 3',
    question.option_4 || 'Option 4'
  ];

  // Ensure we have valid option text for display
  const safeOptions = options.map(option => option || 'No option text');

  // Validate indices are within bounds
  const validCorrectIndex = correctAnswerIndex >= 0 && correctAnswerIndex <= 3 ? correctAnswerIndex : 0;
  const validUserIndex = userAnswerIndex >= 0 && userAnswerIndex <= 3 ? userAnswerIndex : -1;

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
            text={question.question || 'No question text available'}
            style={styles.questionText}
          />
        </View>

        <View style={styles.optionsContainer}>
          {safeOptions.map((option, index) => {
            const isUserAnswer = index === validUserIndex;
            const isCorrectAnswer = index === validCorrectIndex;
            
            // Determine if this option needs special styling
            const showCorrect = isCorrectAnswer;
            const showWrong = isUserAnswer && !isCorrect;
            const showUserCorrect = isUserAnswer && isCorrect;

            return (
              <View
                key={index}
                style={[
                  styles.option,
                  showCorrect && styles.correctOption,
                  showWrong && styles.wrongOption,
                  showUserCorrect && styles.correctOption
                ]}
              >
                <MathText
                  text={option}
                  style={[
                    styles.optionText,
                    showCorrect && styles.correctOptionText,
                    showWrong && styles.wrongOptionText,
                    showUserCorrect && styles.correctOptionText
                  ]}
                />
                
                {/* Correct Answer Indicator (always show for correct answer) */}
                {showCorrect && (
                  <View style={styles.indicatorContainer}>
                    <View style={[styles.indicatorBox, styles.correctBox]}>
                      <Text style={styles.indicatorText}>
                        {showUserCorrect ? '✓ Your Answer' : '✓ Correct Answer'}
                      </Text>
                    </View>
                  </View>
                )}
                
                {/* Wrong Answer Indicator - Only show if user selected wrong answer */}
                {showWrong && (
                  <View style={styles.indicatorContainer}>
                    <View style={[styles.indicatorBox, styles.wrongBox]}>
                      <Text style={styles.indicatorText}>✗ Your Answer</Text>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
        
        {/* Result Summary Card */}
        <View style={[
          styles.resultCard,
          isCorrect ? styles.resultCardCorrect : styles.resultCardWrong
        ]}>
          <View style={styles.resultHeader}>
            <View style={[styles.resultIcon, isCorrect ? styles.resultIconCorrect : styles.resultIconWrong]}>
              <Text style={styles.resultIconText}>
                {isCorrect ? '✓' : '✗'}
              </Text>
            </View>
            <Text style={styles.resultTitle}>
              {isCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
          </View>
          <Text style={styles.resultDescription}>
            {isCorrect 
              ? 'You answered this question correctly.' 
              : validUserIndex === -1 
                ? 'You did not answer this question.'
                : `You selected "${safeOptions[validUserIndex]}". The correct answer is "${safeOptions[validCorrectIndex]}".`}
          </Text>
        </View>
        
        {/* Debug info - remove in production */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugText}>
              Debug: DB correct_option: {correctAnswerValue} (1-indexed)
            </Text>
            <Text style={styles.debugText}>
              Array index: {validCorrectIndex} (0-indexed)
            </Text>
            <Text style={styles.debugText}>
              DB selected_option: {userAnswerValue} (1-indexed)
            </Text>
            <Text style={styles.debugText}>
              Array index: {validUserIndex} (0-indexed)
            </Text>
            <Text style={styles.debugText}>
              Is correct in DB: {answerData.is_correct?.toString()}
            </Text>
          </View>
        )}
      </ScrollView>

      <SafeAreaView style={styles.buttonContainer}>
        <View style={styles.navigationButtonRow}>
          {currentQuestion > 0 ? (
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.pressedStyle,
              ]}
              onPress={handlePrevious}
            >
              <Text style={styles.buttonText}>Previous</Text>
            </Pressable>
          ) : (
            <View style={[styles.navButton, styles.invisibleButton]} />
          )}
          
          {currentQuestion < selectedQuiz.total_questions - 1 ? (
            <Pressable
              style={({ pressed }) => [
                styles.navButton,
                pressed && styles.pressedStyle,
              ]}
              onPress={handleNext}
            >
              <Text style={styles.buttonText}>Next</Text>
            </Pressable>
          ) : (
            <View style={[styles.navButton, styles.invisibleButton]} />
          )}
        </View>
        
        <Pressable
          style={({ pressed }) => [
            styles.backButton,
            pressed && styles.pressedStyle,
          ]}
          onPress={() => setSelectedQuiz(null)}
        >
          <Text style={styles.buttonText}>Back to History</Text>
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
    position: 'relative',
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
  indicatorContainer: {
    position: 'absolute',
    right: 10,
    top: 10,
  },
  indicatorBox: {
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  correctBox: {
    backgroundColor: '#FFFFFF',
  },
  wrongBox: {
    backgroundColor: '#FFFFFF',
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '600',
  },
  resultCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    marginBottom: 10,
  },
  resultCardCorrect: {
    backgroundColor: '#2E8B57',
    borderColor: '#2E8B57',
  },
  resultCardWrong: {
    backgroundColor: '#E57373',
    borderColor: '#E57373',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  resultIconCorrect: {
    backgroundColor: '#FFFFFF',
  },
  resultIconWrong: {
    backgroundColor: '#FFFFFF',
  },
  resultIconText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  resultDescription: {
    fontSize: 14,
    color: '#FFFFFF',
    lineHeight: 20,
  },
  buttonContainer: {
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1f1f1fff',
    borderTopWidth: 1,
    borderTopColor: '#4A5859',
  },
  navigationButtonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
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
  invisibleButton: {
    opacity: 0,
  },
  backButton: {
    backgroundColor: '#1a1a1aff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5859',
    alignSelf: 'center',
    width: '60%',
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
  debugContainer: {
    backgroundColor: '#2a2a2a',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  debugText: {
    color: '#B0B0B0',
    fontSize: 12,
    fontFamily: 'monospace',
  },
});