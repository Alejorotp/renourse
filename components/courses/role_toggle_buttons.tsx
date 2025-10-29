import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function RoleToggleButtons({ isProfessor, onChange }: { isProfessor: boolean; onChange: (val: boolean) => void }) {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.button, isProfessor ? styles.profActive : styles.profInactive]} onPress={() => onChange(true)}>
        <Text style={[styles.text, isProfessor ? styles.textActive : styles.profText]}>Profesor</Text>
      </TouchableOpacity>
      <View style={{ width: 8 }} />
      <TouchableOpacity style={[styles.button, !isProfessor ? styles.stuActive : styles.stuInactive]} onPress={() => onChange(false)}>
        <Text style={[styles.text, !isProfessor ? styles.textActive : styles.stuText]}>Estudiante</Text>
      </TouchableOpacity>
    </View>
  );
}

const lilac = 'rgba(124, 77, 255, 1)';
const blue = 'rgba(43, 213, 243, 1)';

const styles = StyleSheet.create({
  container: { flexDirection: 'row' },
  button: { flex: 1, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  text: { fontWeight: '600' },
  textActive: { color: '#fff' },
  profActive: { backgroundColor: lilac, borderColor: lilac },
  profInactive: { backgroundColor: 'transparent', borderColor: lilac },
  stuActive: { backgroundColor: blue, borderColor: blue },
  stuInactive: { backgroundColor: 'transparent', borderColor: blue },
  profText: { color: lilac },
  stuText: { color: blue },
});

export default RoleToggleButtons;
