import React from 'react';
import { Alert, Clipboard, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function CourseCodeBox({ courseCode }: { courseCode: string }) {
  const onCopy = async () => {
    try {
      // Clipboard API compatibility
      if (Platform.OS === 'web' && 'clipboard' in navigator) {
        await (navigator as any).clipboard.writeText(courseCode);
      } else {
        // @ts-ignore - Clipboard from react-native
        Clipboard.setString(courseCode);
      }
      Alert.alert('Éxito', 'Código copiado al portapapeles');
    } catch {
      Alert.alert('Error', 'No se pudo copiar el código');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.title}>Código del curso</Text>
        <TouchableOpacity onPress={onCopy}>
          <Text style={styles.copy}>Copiar</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.code}>{courseCode}</Text>
      <Text style={styles.help}>Comparte este código con tus estudiantes</Text>
    </View>
  );
}

const lilac = 'rgba(124, 77, 255, 1)';

const styles = StyleSheet.create({
  card: { backgroundColor: '#F3E5F5', borderRadius: 12, padding: 12, marginBottom: 8 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontWeight: 'bold', fontSize: 18, color: '#4F2FA7' },
  copy: { color: '#4F2FA7', fontWeight: '600' },
  code: { marginTop: 6, fontSize: 20, color: lilac, fontWeight: '300' },
  help: { marginTop: 4, fontSize: 13, color: '#949494' },
});

export default CourseCodeBox;
