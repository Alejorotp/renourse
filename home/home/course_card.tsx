import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface CourseInfo {
  id?: string | number;
  name?: string;
  userRole?: string;
  memberNames?: string[];
  professorName?: string;
}

export default function CourseCard({ 
  courseInfo, 
  onPress 
}: { 
  courseInfo: CourseInfo; 
  onPress?: () => void;
}) {
  const isProfessor = courseInfo?.userRole?.toLowerCase() !== 'estudiante';
  const studentCount = (courseInfo?.memberNames?.length || 1) - 1;

  const borderColor = isProfessor ? '#7C4DFF' : '#03A9F4';
  const backgroundColor = isProfessor ? 'rgba(124, 77, 255, 0.1)' : 'rgba(3, 169, 244, 0.1)';

  return (
    <TouchableOpacity 
      style={[styles.card, { 
        borderColor, 
        backgroundColor 
      }]} 
      activeOpacity={0.7} 
      onPress={onPress}
    >
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {courseInfo?.name || 'Curso'}
        </Text>
        <View style={{ height: 8 }} />
        <Text style={styles.role}>{courseInfo?.userRole || ''}</Text>
        <View style={styles.studentRow}>
          <Ionicons name="people" size={16} color="#666" />
          <Text style={styles.studentText}>{studentCount} Estudiantes</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 160,
    minHeight: 120,
    borderRadius: 12,
    borderWidth: 2,
    padding: 12,
    marginRight: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#222',
  },
  role: {
    fontSize: 14,
    color: '#666',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  studentText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
});
