import { useCategories } from '@/categories/context/category_context';
import React, { useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function CreateCategoryDialog({ visible, onClose, courseCode }: { visible: boolean; onClose: () => void; courseCode: string }) {
  const { createCategory, loadCategories } = useCategories();
  const [name, setName] = useState('');
  const [method, setMethod] = useState<'Aleatorio' | 'Auto-asignado'>('Aleatorio');
  const [maxMembers, setMaxMembers] = useState('3');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => name.trim().length > 0 && Number(maxMembers) > 0, [name, maxMembers]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <View style={styles.card}>
          <Text style={styles.title}>Crear categoría</Text>

          <TextInput
            placeholder="Nombre"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          <Text style={styles.label}>Método de agrupación</Text>
          <View style={styles.row}>
            {(['Aleatorio', 'Auto-asignado'] as const).map((m) => {
              const active = method === m;
              return (
                <TouchableOpacity key={m} onPress={() => setMethod(m)} style={[styles.pill, active && styles.pillActive]}>
                  <Text style={[styles.pillText, active && styles.pillTextActive]}>{m}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.label}>Máximo de integrantes</Text>
          <TextInput
            placeholder="3"
            keyboardType="numeric"
            value={maxMembers}
            onChangeText={(v) => setMaxMembers(v.replace(/[^0-9]/g, ''))}
            style={styles.input}
          />

          <View style={styles.rowEnd}>
            <TouchableOpacity style={[styles.btn, styles.btnCancel]} disabled={submitting} onPress={onClose}><Text>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity
              style={[styles.btn, styles.btnOk, (!canSubmit || submitting) && styles.btnDisabled]}
              disabled={!canSubmit || submitting}
              onPress={async () => {
                try {
                  setSubmitting(true);
                  await createCategory({ name: name.trim(), groupingMethod: method, maxMembers: Number(maxMembers), courseId: courseCode });
                  await loadCategories();
                  onClose();
                } catch (e) {
                } finally {
                  setSubmitting(false);
                }
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '600' }}>{submitting ? 'Creando…' : 'Crear'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', padding: 24 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, gap: 10 },
  title: { fontWeight: '700', fontSize: 16 },
  label: { fontWeight: '600', color: '#444', marginTop: 6 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  row: { flexDirection: 'row', gap: 8 },
  pill: { paddingVertical: 6, paddingHorizontal: 10, borderWidth: 1, borderColor: '#ddd', borderRadius: 999 },
  pillActive: { backgroundColor: 'rgba(124,77,255,0.12)', borderColor: 'rgb(124,77,255)' },
  pillText: { color: '#333', fontWeight: '600' },
  pillTextActive: { color: 'rgb(124,77,255)' },
  rowEnd: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 6 },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 8 },
  btnCancel: { backgroundColor: '#eee' },
  btnOk: { backgroundColor: 'rgb(124,77,255)' },
  btnDisabled: { opacity: 0.6 },
});
