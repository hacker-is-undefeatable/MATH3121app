import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';
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
    <Button
      title={item.name}
      onPress={() => navigation.navigate('Quiz', { quizId: item.id })}
    />
  );

  const renderScore = ({ item }) => (
    <Text>Quiz {item.quiz_id}: Score {item.score}/5 - {new Date(item.created_at).toLocaleString()}</Text>
  );

  if (!user) {
    return <Text>Loading or not authenticated...</Text>;
  }

  return (
    <View style={styles.container}>
      <Text>Welcome, {user.email}</Text>
      <Text>Available Quizzes:</Text>
      <FlatList
        data={quizzes}
        renderItem={renderQuiz}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
      <Text>Score History:</Text>
      <FlatList
        data={scores}
        renderItem={renderScore}
        keyExtractor={item => item.id.toString()}
        style={styles.list}
      />
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  list: { marginBottom: 20 },
});