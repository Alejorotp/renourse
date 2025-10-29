import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ProfessorBox({ professorName }: { professorName: string }) {
  return (
    <View style={styles.card}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{(professorName?.[0] || '?').toUpperCase()}</Text>
          </View>
          <View style={styles.badge}><Text style={styles.badgeIcon}>🎓</Text></View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={styles.chip}><Text style={styles.chipText}>Profesor del curso</Text></View>
          <Text style={styles.name}>{professorName || 'Sin nombre'}</Text>
        </View>
      </View>
    </View>
  );
}

const lilac = 'rgba(124, 77, 255, 1)';

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 10, marginBottom: 16, elevation: 1 },
  avatarWrap: { width: 52, height: 52, marginRight: 12 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: 'rgb(232,212,255)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 22, fontWeight: 'bold', color: lilac },
  badge: { position: 'absolute', bottom: -4, right: -4, backgroundColor: lilac, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  badgeIcon: { color: '#fff', fontSize: 10 },
  chip: { alignSelf: 'flex-start', backgroundColor: 'rgba(124,77,255,0.12)', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  chipText: { color: lilac, fontWeight: '700', fontSize: 16 },
  name: { marginTop: 2, fontSize: 18 },
});

export default ProfessorBox;
