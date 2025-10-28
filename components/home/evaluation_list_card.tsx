import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Evaluation = { id?: string | number; title?: string };

export default function EvaluationListCard({ evaluation, onTap }: { evaluation: Evaluation; onTap?: () => void }) {
  return (
    <TouchableOpacity onPress={onTap} activeOpacity={0.85}>
      <View style={styles.card}>
        <Text style={styles.title}>{evaluation?.title || 'Evaluación'}</Text>
        <Text style={styles.subtitle}>Toca para abrir</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
    marginRight: 12,
    elevation: 1,
  },
  title: { fontWeight: 'bold', color: '#222' },
  subtitle: { marginTop: 6, color: '#666' },
});
