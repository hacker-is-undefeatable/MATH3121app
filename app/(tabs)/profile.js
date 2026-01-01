import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function ProfileScreen() {
  const { user, signOut, supabase } = useAuth();
  const insets = useSafeAreaInsets();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const fetchUserStats = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Fetch total quizzes taken
      const { count, error: countError } = await supabase
        .from('scores')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      if (countError) throw countError;

      // Fetch average score
      const { data: scoresData, error: scoresError } = await supabase
        .from('scores')
        .select('score, total_questions')
        .eq('user_id', user.id);

      if (scoresError) throw scoresError;

      const totalScore = scoresData.reduce((sum, item) => sum + item.score, 0);
      const totalPossible = scoresData.reduce((sum, item) => sum + (item.total_questions || 5), 0);
      const averagePercentage = scoresData.length > 0 
        ? ((totalScore / totalPossible) * 100).toFixed(1) 
        : 0;

      setStats({
        totalQuizzes: count || 0,
        averagePercentage: parseFloat(averagePercentage),
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            await signOut();
            router.replace('/login');
          }
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Not authenticated</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.email ? user.email.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        
        {loading ? (
          <ActivityIndicator size="large" color="#4A5859" />
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.totalQuizzes || 0}</Text>
              <Text style={styles.statLabel}>Quizzes Taken</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{stats?.averagePercentage || 0}%</Text>
              <Text style={styles.statLabel}>Average Score</Text>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
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
  profileHeader: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#4A5859',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  avatarText: {
    fontSize: 40,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  email: {
    fontSize: 20,
    color: '#E0E0E0',
    fontWeight: '600',
  },
  statsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#E0E0E0',
    marginBottom: 25,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#4A5859',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2E8B57',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  logoutButton: {
    backgroundColor: '#1a1a1aff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5859',
    marginTop: 20,
  },
  logoutButtonText: {
    fontSize: 18,
    color: '#E57373',
    fontWeight: '600',
  },
  text: {
    fontSize: 16,
    color: '#E0E0E0',
    textAlign: 'center',
  },
});