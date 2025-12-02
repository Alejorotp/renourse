import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function JoinCourseCard({ onTap }: { onTap?: () => void }) {
  return (
    <TouchableOpacity onPress={onTap} activeOpacity={0.85}>
      <View style={styles.card}>
        <Text style={styles.plus}>＋</Text>
        <Text style={styles.label}>Unirse a curso</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 220,
    height: 160,
    borderRadius: 16,
    backgroundColor: '#E6F9FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  plus: { fontSize: 32, color: '#00A5C6' },
  label: { marginTop: 8, fontWeight: 'bold', color: '#00A5C6' },
});
