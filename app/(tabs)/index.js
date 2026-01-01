import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useAuth } from '../contexts/AuthContext';

const topics = [
  'Simplification and factorization',
  'Rate and ratio',
  'Percentage and compound interest',
  'Measurement',
  'Transformation',
  'Parallel lines, similar triangles and congruent triangles',
  'Pythagoras Theorem',
  'Quadrilaterals',
  'Linear equations in one unknown',
  'Linear equations in two unknowns',
  'Trigonometry',
  'Perimeter, area and volume',
  'Imaginary numbers',
  'Quadratic equation',
  'Graph of functions',
  'Variations',
  'Equation of straight lines',
  'Logarithm',
  'Polynomial',
  'Sine formula, Cosine formula and Heron\'s formula',
  'Properties of circles',
  'Equation of circles',
  'Permutation, combinations and probability',
  '3D geometry',
  'Measure of dispersion and statistics',
  'Arithmetic sequence and geometric sequence',
  'Inequalities and linear programming'
];

const questionCounts = [5, 10, 15, 20];

export default function HomeScreen() {
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedCount, setSelectedCount] = useState(5);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const router = useRouter();
  const { supabase } = useAuth();
  const insets = useSafeAreaInsets();

  const handleStartQuiz = async () => {
    if (!selectedTopic) {
      Alert.alert('Select Topic', 'Please select a topic to start the quiz');
      return;
    }

    try {
      // Fetch questions based on selected topic
      const { data, error, count } = await supabase
        .from('questions')
        .select('*', { count: 'exact' })
        .or(`topic_1.eq.${selectedTopic},topic_2.eq.${selectedTopic}`);

      if (error) throw error;

      if (!data || data.length === 0) {
        Alert.alert('No Questions', 'No questions available for this topic');
        return;
      }

      // Shuffle and limit questions
      const shuffledQuestions = [...data].sort(() => Math.random() - 0.5);
      const finalQuestions = shuffledQuestions.slice(0, Math.min(selectedCount, data.length));

      if (finalQuestions.length < selectedCount) {
        Alert.alert(
          'Limited Questions',
          `Only ${finalQuestions.length} questions available for this topic`
        );
      }

      // Navigate to Quiz screen with questions
      router.push({
        pathname: '/quiz',
        params: { 
          questions: JSON.stringify(finalQuestions),
          topic: selectedTopic,
          totalQuestions: selectedCount,
          actualQuestions: finalQuestions.length
        }
      });
    } catch (error) {
      console.error('Error fetching questions:', error);
      Alert.alert('Error', 'Failed to load questions. Please try again.');
    }
  };

  const renderTopic = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSelectedTopic(item);
        setDropdownVisible(false);
      }}
    >
      <Text style={styles.dropdownItemText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView 
      style={{ flex: 1, backgroundColor: '#1f1f1fff', borderTopWidth: 50, borderTopColor: '#1f1f1fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 80}
    >
      <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView} contentContainerStyle={{ paddingBottom: 80 }}>
        <Text style={styles.header}>Welcome to Math Quiz</Text>
        <Text style={styles.subHeader}>Select Topic</Text>
        
        {/* Dropdown Menu */}
        <TouchableOpacity
          style={[styles.dropdownButton, selectedTopic && styles.dropdownButtonActive]}
          onPress={() => setDropdownVisible(true)}
        >
          <Text style={styles.dropdownButtonText}>
            {selectedTopic || 'Choose a topic...'}
          </Text>
          <Icon name="expand-more" size={24} color="#E0E0E0" />
        </TouchableOpacity>

        {/* Dropdown Modal */}
        <Modal
          visible={dropdownVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setDropdownVisible(false)}
        >
          <TouchableOpacity
            style={styles.dropdownOverlay}
            onPress={() => setDropdownVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.dropdownContent}>
              <FlatList
                data={topics}
                renderItem={renderTopic}
                keyExtractor={(item, index) => index.toString()}
                showsVerticalScrollIndicator={true}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={styles.subHeader}>Number of Questions</Text>
        <View style={styles.countContainer}>
          {questionCounts.map((count) => (
            <TouchableOpacity
              key={count}
              style={[
                styles.countButton,
                selectedCount === count && styles.selectedCount
              ]}
              onPress={() => setSelectedCount(count)}
            >
              <Text style={[
                styles.countText,
                selectedCount === count && styles.selectedCountText
              ]}>
                {count}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={[
            styles.startButton,
            !selectedTopic && styles.disabledButton
          ]}
          onPress={handleStartQuiz}
          disabled={!selectedTopic}
        >
          <Text style={styles.startButtonText}>Start Quiz</Text>
        </TouchableOpacity>
      </ScrollView>
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1fff',
    borderTopWidth: 50,
    borderTopColor: '#1f1f1fff',
  },
  scrollView: {
    padding: 20,
    paddingBottom: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    color: '#E0E0E0',
    marginBottom: 30,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 20,
    fontWeight: '600',
    color: '#E0E0E0',
    marginVertical: 15,
  },
  dropdownButton: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#4A5859',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownButtonActive: {
    borderColor: '#2E8B57',
    backgroundColor: '#1e1e1eff',
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
    flex: 1,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dropdownContent: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    width: '100%',
    maxHeight: '70%',
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  dropdownItem: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2aff',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  topicsList: {
    marginBottom: 20,
  },
  topicButton: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  selectedTopic: {
    backgroundColor: '#4A5859',
    borderColor: '#6D7D7D',
  },
  topicText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  selectedTopicText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  countContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    flexWrap: 'wrap',
  },
  countButton: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 25,
    marginVertical: 5,
    minWidth: 70,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  selectedCount: {
    backgroundColor: '#4A5859',
    borderColor: '#6D7D7D',
  },
  countText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  selectedCountText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  startButton: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginVertical: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: '#3A4A4A',
    opacity: 0.6,
  },
  startButtonText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
});