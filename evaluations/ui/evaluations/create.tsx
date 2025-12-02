import { useCategories } from '@/categories/context/category_context';
import { useEvaluations } from '@/evaluations/context/evaluation_context';
import { SafeTop } from '@/home/ui/safe-top';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CreateEvaluationPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const courseId = params.courseId as string;

  const { categories, loadCategories } = useCategories();
  const { createEvaluation } = useEvaluations();

  const [name, setName] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [selectedVisibility, setSelectedVisibility] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const courseCategories = categories.filter((cat) => cat.courseId === courseId);

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'El nombre de la evaluación es requerido');
      return;
    }
    if (!selectedCategoryId) {
      Alert.alert('Error', 'Selecciona una categoría');
      return;
    }
    if (!selectedVisibility) {
      Alert.alert('Error', 'Selecciona la visibilidad');
      return;
    }

    setSubmitting(true);
    try {
      await createEvaluation({
        name: name.trim(),
        categoryId: selectedCategoryId,
        visibility: selectedVisibility,
        creationDate: new Date().toISOString(),
      });

      Alert.alert('Éxito', 'Evaluación creada correctamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      console.error('Error creating evaluation:', error);
      Alert.alert('Error', 'No se pudo crear la evaluación. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <SafeTop backgroundColor="#fff" />
      <Stack.Screen options={{ title: 'Crear Evaluación' }} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Nombre de la evaluación</Text>
          <TextInput
            style={styles.input}
            placeholder="Ingresa el nombre"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Categoría</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedCategoryId}
              onValueChange={(itemValue: string) => setSelectedCategoryId(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona una categoría" value="" />
              {courseCategories.map((cat) => (
                <Picker.Item key={cat.id} label={cat.name} value={cat.id} />
              ))}
            </Picker>
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Visibilidad</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedVisibility}
              onValueChange={(itemValue: string) => setSelectedVisibility(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Selecciona visibilidad" value="" />
              <Picker.Item label="Publica" value="Publica" />
              <Picker.Item label="Privada" value="Privada" />
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={submitting}
        >
          <Ionicons name="add-circle" size={20} color="#fff" />
          <Text style={styles.submitButtonText}>
            {submitting ? 'Creando...' : 'Crear Evaluación'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  picker: {
    height: 50,
  },
  submitButton: {
    backgroundColor: '#B794F6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
