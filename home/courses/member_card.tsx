import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function MemberCard({ name }: { name: string }) {
  const initial = (name?.[0] || '?').toUpperCase();
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={styles.avatarWrap}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>👤</Text>
          </View>
        </View>
        <Text style={styles.name}>{name}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12, marginVertical: 4, elevation: 1 },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatarWrap: { width: 40, height: 40, marginRight: 10 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgb(205,237,255)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: 'rgb(43, 213, 243)', fontWeight: 'bold', fontSize: 18 },
  badge: { position: 'absolute', bottom: -2, right: -2, backgroundColor: 'rgb(43, 213, 243)', width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FAF7FC' },
  badgeIcon: { color: '#fff', fontSize: 10 },
  name: { fontSize: 16 },
});

export default MemberCard;
