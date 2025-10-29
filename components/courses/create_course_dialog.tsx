import { useAuthSession } from '@/auth/context/auth_context';
import { useCourses } from '@/courses/context/course_context';
import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export function CreateCourseDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const { createCourse, userCourses } = useCourses();
  const { user } = useAuthSession();

  const submit = async () => {
    if (!name.trim()) return;
    const profCount = userCourses.filter(c => c.userRole === 'Profesor').length;
    if (profCount >= 3) {
      // mirror Flutter constraint
      onClose();
      return;
    }
    await createCourse({
      id: '',
      name: name.trim(),
      courseCode: '',
      professorId: String(user?.id ?? ''),
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Crear nuevo curso</Text>
            <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
          </View>
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Puedes crear hasta 3 cursos. Al crear un curso se generará un código para compartir.</Text>
          </View>
          <Text style={styles.label}>Nombre del curso</Text>
          <TextInput style={styles.input} placeholder="Ej: Matemáticas 101" value={name} onChangeText={setName} />
          <TouchableOpacity onPress={submit} style={styles.button}><Text style={styles.buttonText}>Crear curso</Text></TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const lilac = 'rgba(124, 77, 255, 1)';

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  card: { width: '88%', maxWidth: 420, backgroundColor: '#F7EDFF', borderRadius: 18, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  headerText: { fontSize: 20, fontWeight: 'bold', color: lilac },
  close: { color: lilac, fontSize: 18 },
  infoBox: { backgroundColor: 'rgba(124,77,255,0.15)', borderRadius: 10, padding: 10, marginTop: 4 },
  infoText: { fontSize: 13.5, color: lilac },
  label: { marginTop: 18, fontWeight: '600', color: lilac },
  input: { marginTop: 6, backgroundColor: 'rgba(124,77,255,0.1)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(124,77,255,0.2)', paddingHorizontal: 12, paddingVertical: 10 },
  button: { marginTop: 20, backgroundColor: lilac, borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});

export default CreateCourseDialog;
