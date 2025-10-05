import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';

export default function QuizScreen() {
  const route = useRoute();
  const { quizId } = route.params;
  const { user, supabase } = useAuth();
  const navigation = useNavigation();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selected, setSelected] = useState(null);
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
    setSelected(index);
  };

  const handleNext = () => {
    if (selected === parseInt(questions[currentQuestion].correct_answer)) {
      setScore(score + 1);
    }
    setSelected(null);
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishQuiz(score + (selected === parseInt(questions[currentQuestion].correct_answer) ? 1 : 0));
    }
  };

  const finishQuiz = async (finalScore) => {
    setFinished(true);
    const { error } = await supabase
      .from('scores')
      .insert([{ user_id: user.id, quiz_id: quizId, score: finalScore }]);
    if (error) console.error(error);
  };

  if (finished) {
    return (
      <View style={styles.container}>
        <Text>Quiz Finished!</Text>
        <Text>Your Score: {score}/5</Text>
        <Button title="Back to Dashboard" onPress={() => navigation.navigate('Dashboard')} />
      </View>
    );
  }

  if (questions.length === 0) {
    return <Text>Loading questions...</Text>;
  }

  const question = questions[currentQuestion];

  return (
    <View style={styles.container}>
      <Text>{question.text} - Question {currentQuestion + 1}</Text>
      {[question.option1, question.option2, question.option3, question.option4].map((option, index) => (
        <Button
          key={index}
          title={option}
          onPress={() => handleSelect(index)}
          color={selected === index ? 'blue' : 'gray'}
        />
      ))}
      <Button title="Next" onPress={handleNext} disabled={selected === null} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
});