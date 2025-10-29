import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export function NavItem({ icon, label, isActive, onPress, color }: { icon: React.ReactNode; label: string; isActive?: boolean; onPress?: () => void; color?: string; }) {
  const tint = color || (isActive ? '#6A5ACD' : '#9E9E9E');
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={[styles.iconWrap, isActive && { backgroundColor: hexWithAlpha(tint, 0.12) }]}>
        {icon}
      </View>
      <Text style={[styles.label, { color: tint, fontWeight: isActive ? '700' as const : '400' }]}>{label}</Text>
    </Pressable>
  );
}

function hexWithAlpha(color: string, alpha: number) {
  // color is rgb/rgba or hex; fallback to rgba
  if (color.startsWith('#')) return color + Math.round(alpha * 255).toString(16).padStart(2, '0');
  return `rgba(${color.replace(/rgba?\(|\)/g, '')}, ${alpha})`;
}

const styles = StyleSheet.create({
  item: { alignItems: 'center', paddingVertical: 8, paddingHorizontal: 6 },
  iconWrap: { padding: 6, borderRadius: 999 },
  label: { fontSize: 12, marginTop: 6 },
});

export default NavItem;
