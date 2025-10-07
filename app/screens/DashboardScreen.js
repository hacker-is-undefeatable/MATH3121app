import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function DashboardScreen() {
  const { user, signOut, supabase } = useAuth();
  const navigation = useNavigation();
  const [quizzes, setQuizzes] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    if (!user) return;

    // Fetch quizzes
    const fetchQuizzes = async () => {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('id');
      if (error) console.error(error);
      else setQuizzes(data);
    };

    // Fetch scores
    const fetchScores = async () => {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) console.error(error);
      else setScores(data);
    };

    fetchQuizzes();
    fetchScores();
  }, [user, supabase]);

  const handleLogout = async () => {
    await signOut();
  };

  const renderQuiz = ({ item }) => (
    <TouchableOpacity
      style={styles.quizButton}
      onPress={() => navigation.navigate('Quiz', { quizId: item.id })}
    >
      <Text style={styles.quizButtonText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderScore = ({ item }) => (
    <View style={styles.scoreCard}>
      <Text style={styles.scoreText}>
        Quiz {item.quiz_id}: Score {item.score}/5 - {new Date(item.created_at).toLocaleString()}
      </Text>
    </View>
  );

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading or not authenticated...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Welcome, {user.email}</Text>
      <Text style={styles.subHeader}>Available Quizzes</Text>
      <FlatList
        data={quizzes}
        renderItem={renderQuiz}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
      <Text style={styles.subHeader}>Score History</Text>
      <FlatList
        data={scores}
        renderItem={renderScore}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#1f1f1fff', // Dark navy for night sky (from RegisterScreen)
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#E0E0E0', // Light gray for contrast (from RegisterScreen)
    marginBottom: 20,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 18,
    fontWeight: '500',
    color: '#E0E0E0', // Light gray for contrast (from RegisterScreen)
    marginVertical: 10,
  },
  list: {
    marginBottom: 20,
  },
  quizButton: {
    backgroundColor: '#1a1a1aff', 
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1, 
    shadowRadius: 5,
    elevation: 5, 
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  quizButtonText: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
    fontWeight: '500',
  },
  scoreCard: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#4A5859'
  },
  scoreText: {
    fontSize: 14,
    color: '#E0E0E0',
  },
  logoutButton: {
    backgroundColor: '#1a1a1aff',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#E0E0E0',
    fontWeight: '500',
  },
  text: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
  },
});