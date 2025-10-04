import { useEffect, useState } from 'react';
import { Alert, Dimensions, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../utils/supabase';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndScores = async () => {
      try {
        setLoading(true);
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        setUser(user);

        const { data: scoresData, error: scoresError } = await supabase
          .from('quiz_scores')
          .select('score, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        if (scoresError) throw scoresError;
        setScores(scoresData);
      } catch (error) {
        Alert.alert('Error', 'Failed to load profile: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndScores();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Profile</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <>
            <View style={styles.userContainer}>
              <Text style={styles.userLabel}>Username</Text>
              <Text style={styles.userText}>{user?.email || 'Unknown'}</Text>
            </View>
            <Text style={styles.subtitle}>Previous Scores</Text>
            {scores.length === 0 ? (
              <Text style={styles.noScoresText}>No scores yet</Text>
            ) : (
              scores.map((score, index) => (
                <View key={index} style={styles.scoreItem}>
                  <Text style={styles.scoreText}>{score.score}%</Text>
                  <Text style={styles.scoreDate}>
                    {new Date(score.created_at).toLocaleDateString()}
                  </Text>
                </View>
              ))
            )}
          </>
        )}
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
  userContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  userText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 5,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 10,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  noScoresText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  scoreItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    padding: 15,
    marginVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#007AFF',
  },
  scoreDate: {
    fontSize: 14,
    fontWeight: '400',
    color: '#666',
  },
});