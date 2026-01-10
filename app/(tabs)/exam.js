import { Asset } from 'expo-asset';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
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

const CSV_MODULE = require('../../assets/exam_format.csv');

async function loadExamFormat() {
  const asset = Asset.fromModule(CSV_MODULE);
  await asset.downloadAsync();
  const uri = asset.localUri || asset.uri;
  const response = await fetch(uri);
  const text = await response.text();
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^"|"$/g, ''));
}

export default function ExamScreen() {
  const router = useRouter();
  const { supabase } = useAuth();
  const insets = useSafeAreaInsets();

  const [formatTopics, setFormatTopics] = useState([]);
  const [loadingFormat, setLoadingFormat] = useState(true);
  const [loadingExam, setLoadingExam] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const topics = await loadExamFormat();
        if (mounted) setFormatTopics(topics);
      } catch (error) {
        console.error('Failed to load exam format:', error);
        Alert.alert('Error', 'Unable to load exam format.');
      } finally {
        if (mounted) setLoadingFormat(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const uniqueTopics = useMemo(() => Array.from(new Set(formatTopics)), [formatTopics]);

  const buildQuestionPools = (questions) => {
    const pools = new Map();
    uniqueTopics.forEach((topic) => {
      pools.set(
        topic,
        questions.filter((q) => q.topic_1 === topic || q.topic_2 === topic)
      );
    });
    return pools;
  };

  const pickExamQuestions = (pools, countNeeded) => {
    // Count how many questions are required for each topic according to format.
    const neededCounts = new Map();
    for (const topic of formatTopics.slice(0, countNeeded)) {
      neededCounts.set(topic, (neededCounts.get(topic) || 0) + 1);
    }

    const byTopicSelection = new Map();
    const missingTopics = [];

    // Select for each topic without reusing the same question ID.
    for (const [topic, need] of neededCounts.entries()) {
      const pool = (pools.get(topic) || []).slice();
      if (pool.length < need) {
        missingTopics.push(`${topic} (need ${need}, found ${pool.length})`);
      }
      // Shuffle pool and take the first `need` items.
      const shuffled = pool.sort(() => Math.random() - 0.5);
      byTopicSelection.set(topic, shuffled.slice(0, need));
    }

    // Build final selection in the same order as formatTopics.
    const selected = [];
    for (const topic of formatTopics.slice(0, countNeeded)) {
      const arr = byTopicSelection.get(topic) || [];
      selected.push(arr.shift());
      byTopicSelection.set(topic, arr);
    }

    // Filter out any undefined entries (when not enough pool items).
    const filtered = selected.filter(Boolean);
    return { selected: filtered, missingTopics };
  };

  const handleGenerateExam = async () => {
    if (!formatTopics.length) {
      Alert.alert('Error', 'Exam format is not loaded yet.');
      return;
    }

    setLoadingExam(true);
    try {
      // Fetch by topic_1 and topic_2 separately using .in to avoid comma/quote parsing issues.
      const { data: data1, error: err1 } = await supabase
        .from('questions')
        .select('*')
        .in('topic_1', uniqueTopics);

      if (err1) throw err1;

      const { data: data2, error: err2 } = await supabase
        .from('questions')
        .select('*')
        .in('topic_2', uniqueTopics);

      if (err2) throw err2;

      const combined = [...(data1 || []), ...(data2 || [])];
      // Deduplicate by ID if present in both queries.
      const dedupedMap = new Map();
      for (const q of combined) {
        dedupedMap.set(q.id, q);
      }
      const data = Array.from(dedupedMap.values());

      if (!data || !data.length) {
        Alert.alert('No Questions', 'No questions available for the exam topics.');
        return;
      }

      const pools = buildQuestionPools(data);
      const { selected, missingTopics } = pickExamQuestions(pools, formatTopics.length);

      if (missingTopics.length) {
        Alert.alert(
          'Not enough questions',
          `Missing topics: ${missingTopics.join(', ')}`
        );
        return;
      }

      if (selected.length < formatTopics.length) {
        Alert.alert('Error', 'Could not build a full exam.');
        return;
      }

      router.push({
        pathname: '/quiz',
        params: {
          questions: JSON.stringify(selected),
          topic: 'Exam',
          totalQuestions: formatTopics.length,
          actualQuestions: selected.length
        }
      });
    } catch (err) {
      console.error('Error generating exam:', err);
      Alert.alert('Error', 'Failed to generate exam. Please try again.');
    } finally {
      setLoadingExam(false);
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>Exam Generator</Text>
      <Text style={styles.description}>
        Create a 45-question exam following the predefined format. Questions are randomly
        selected by topic from the database.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Exam Blueprint</Text>
        {loadingFormat ? (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#FFFFFF" />
            <Text style={styles.loadingText}>Loading format...</Text>
          </View>
        ) : (
          <View style={styles.topicList}>
            {formatTopics.map((topic, idx) => (
              <Text key={`${topic}-${idx}`} style={styles.topicText}>
                {idx + 1}. {topic}
              </Text>
            ))}
          </View>
        )}
      </View>

      <TouchableOpacity
        style={[styles.button, (loadingExam || loadingFormat) && styles.buttonDisabled]}
        onPress={handleGenerateExam}
        disabled={loadingExam || loadingFormat}
      >
        {loadingExam ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>Generate Exam</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1fff',
    borderTopWidth: 50,
    borderTopColor: '#1f1f1fff',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: '700',
    color: '#E0E0E0',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#B0B0B0',
    marginBottom: 16,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#1e1e1eff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#4A5859',
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  topicList: {
    gap: 6,
  },
  topicText: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 18,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2E8B57',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4A5859',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
