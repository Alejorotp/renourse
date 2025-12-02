import { Evaluation } from '@/evaluations/domain/models/evaluation';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function EvaluationListCard({ 
  evaluation, 
  onTap 
}: { 
  evaluation: Evaluation; 
  onTap?: () => void 
}) {
  return (
    <TouchableOpacity onPress={onTap} activeOpacity={0.85} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <Ionicons name="document-text" size={24} color="#2BD5F3" />
        </View>
        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>{evaluation.name}</Text>
          <Text style={styles.subtitle} numberOfLines={1}>ID: {evaluation.evaluationID}</Text>
          <View style={styles.footer}>
            <Ionicons name="eye" size={12} color="#666" />
            <Text style={styles.footerText}>{evaluation.visibility}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginRight: 12,
  },
  card: {
    width: 280,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 12,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  iconContainer: {
    backgroundColor: '#CDEEFF',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: { 
    fontWeight: 'bold', 
    color: '#222',
    fontSize: 14,
    marginBottom: 4,
  },
  subtitle: { 
    color: '#666',
    fontSize: 12,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    color: '#666',
    marginLeft: 4,
  },
});
