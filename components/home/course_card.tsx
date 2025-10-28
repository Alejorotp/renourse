import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

type Course = { id?: string | number; name?: string; userRole?: string };

export default function CourseCard({ courseInfo }: { courseInfo: Course }) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85}>
      <Text style={styles.title}>{courseInfo?.name || 'Curso'}</Text>
      <Text style={styles.role}>{courseInfo?.userRole || ''}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#fff',
    padding: 16,
    marginRight: 12,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  role: {
    marginTop: 8,
    color: '#666',
  },
});
