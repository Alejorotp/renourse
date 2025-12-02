import { useAuthSession } from '@/auth/context/auth_context';
import { useCourses } from '@/courses/context/course_context';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function JoinCourseDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [code, setCode] = useState('');
  const { joinCourse } = useCourses();
  const { user } = useAuthSession();

  const submit = async () => {
    if (!code.trim()) return;
    const ok = await joinCourse({ courseCode: code.trim(), userId: String(user?.id ?? '') });
    if (ok) onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Unirse a un curso</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>El código del curso es proporcionado por el profesor.</Text>
          </View>
          <Text style={styles.label}>Código del curso</Text>
          <TextInput style={styles.input} placeholder="Ej: ABC123" value={code} onChangeText={setCode} />
          <TouchableOpacity onPress={submit} style={styles.button}><Text style={styles.buttonText}>Unirse al curso</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const blue = 'rgba(43, 213, 243, 1)';

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '88%', maxWidth: 420, backgroundColor: '#F7FDFF', borderRadius: 18, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: '#007CB6' },
  close: { color: '#007CB6', fontSize: 18 },
  infoBox: { backgroundColor: 'rgba(32,210,241,0.12)', borderRadius: 10, padding: 10, marginTop: 4 },
  infoText: { fontSize: 13.5, color: '#007CB6' },
  label: { marginTop: 18, fontWeight: '600', color: '#007CB6' },
  input: { marginTop: 6, backgroundColor: 'rgba(43,213,243,0.1)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(43,213,243,0.2)', paddingHorizontal: 12, paddingVertical: 10 },
  button: { marginTop: 20, backgroundColor: blue, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default JoinCourseDialog;
