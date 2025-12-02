import { SafeTop } from '@/components/ui/safe-top';
import { useEvaluations } from '@/evaluations/context/evaluation_context';
import { Evaluation } from '@/evaluations/domain/models/evaluation';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

export default function EvaluateScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { submitScore } = useEvaluations();

    const teammateId = params.teammateId as string;
    const teammateName = params.teammateName as string;
    const groupID = params.groupID as string;
    const hasEvaluationJson = typeof params.evaluation === 'string' && params.evaluation.length > 2;
    const evaluation: Evaluation | null = hasEvaluationJson
        ? JSON.parse(params.evaluation as string)
        : null;

    const [punctuality, setPunctuality] = useState(3.0);
    const [contributions, setContributions] = useState(3.0);
    const [commitment, setCommitment] = useState(3.0);
    const [attitude, setAttitude] = useState(3.0);
    const [submitting, setSubmitting] = useState(false);

    const getPunctualityRubric = (value: number): string => {
        if (value < 2.5) {
            return 'Llegó tarde a todas las sesiones o se ausentó constantemente.';
        } else if (value < 3.5) {
            return 'Llegó tarde con mucha frecuencia y se ausentó varias veces del trabajo del equipo.';
        } else if (value < 4.5) {
            return 'En la mayoría de las sesiones llegó puntualmente y no se ausentó con frecuencia.';
        } else {
            return 'Acudió puntualmente a todas las sesiones de trabajo.';
        }
    };

    const getContributionsRubric = (value: number): string => {
        if (value < 2.5) {
            return 'En todo momento estuvo como observador y no aportó al trabajo del equipo.';
        } else if (value < 3.5) {
            return 'En algunas ocasiones participó dentro del equipo y en los intercambios generales.';
        } else if (value < 4.5) {
            return 'Hizo varios aportes al equipo; sin embargo, puede ser más crítico y propositivo.';
        } else {
            return 'Sus aportes fueron muy enriquecedores en todo momento al trabajo del equipo.';
        }
    };

    const getCommitmentRubric = (value: number): string => {
        if (value < 2.5) {
            return 'Mostró poco compromiso con las tareas y roles asignados y en ocasiones no aportó en las tareas propuestas al equipo.';
        } else if (value < 3.5) {
            return 'En algunos momentos asumió tareas y roles, pero en otros momentos no aportó en las tareas propuestas.';
        } else if (value < 4.5) {
            return 'La mayor parte del tiempo asumió tareas con compromiso y responsabilidad y ha aportado más al trabajo del equipo.';
        } else {
            return 'Mostró en todo momento un compromiso con las tareas asignadas y los roles que tuvo en el equipo.';
        }
    };

    const getAttitudeRubric = (value: number): string => {
        if (value < 2.5) {
            return 'Actuó de manera pasiva y su actitud afectó negativamente las tareas y la colaboración.';
        } else if (value < 3.5) {
            return 'En algunas ocasiones mostró actitud positiva y afectó positivamente el impacto en el equipo.';
        } else if (value < 4.5) {
            return 'La mayor parte del tiempo mostró actitud positiva y buena disposición.';
        } else {
            return 'Siempre mostró actitud positiva y disposición para colaborar con calidad.';
        }
    };

    const handleSubmit = async () => {
        if (!evaluation) return;

        setSubmitting(true);
        try {
            await submitScore({
                userId: teammateId,
                evaluationId: evaluation.evaluationID,
                groupID: groupID,
                categoryID: evaluation.categoryID,
                scores: {
                    punctuality: punctuality.toFixed(1),
                    contributions: contributions.toFixed(1),
                    commitment: commitment.toFixed(1),
                    attitude: attitude.toFixed(1),
                },
            });

            Alert.alert(
                'Evaluación enviada',
                `Evaluación enviada exitosamente para ${teammateName}`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error) {
            console.error('Error submitting evaluation:', error);
            Alert.alert('Error', 'No se pudo enviar la evaluación. Intenta de nuevo.');
        } finally {
            setSubmitting(false);
        }
    };

    const renderSlider = (
        label: string,
        value: number,
        rubric: string,
        onValueChange: (val: number) => void
    ) => {
        return (
            <View style={styles.sliderContainer}>
                <Text style={styles.sliderLabel}>{label}</Text>
                <View style={styles.sliderRow}>
                    <Text style={styles.sliderValue}>{value.toFixed(1)}</Text>
                    <Slider
                        style={styles.slider}
                        minimumValue={1}
                        maximumValue={5}
                        step={0.1}
                        value={value}
                        onValueChange={onValueChange}
                        minimumTrackTintColor="#B794F6"
                        maximumTrackTintColor="#e0e0e0"
                        thumbTintColor="#B794F6"
                    />
                </View>
                <View style={styles.rubricContainer}>
                    <Ionicons name="information-circle-outline" size={16} color="#666" />
                    <Text style={styles.rubricText}>{rubric}</Text>
                </View>
            </View>
        );
    };

    if (!evaluation) {
        return (
            <View style={styles.container}>
                <SafeTop backgroundColor="#fff" />
                <Stack.Screen options={{ title: 'Evaluar' }} />
                <View style={styles.centerContent}>
                    <Text style={styles.errorText}>No se encontró la evaluación</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <SafeTop backgroundColor="#fff" />
            <Stack.Screen options={{ title: `Evaluar a ${teammateName}` }} />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.title}>Evalúa a tu compañero</Text>

                {renderSlider('Puntualidad', punctuality, getPunctualityRubric(punctuality), setPunctuality)}
                {renderSlider('Contribuciones', contributions, getContributionsRubric(contributions), setContributions)}
                {renderSlider('Compromiso', commitment, getCommitmentRubric(commitment), setCommitment)}
                {renderSlider('Actitud', attitude, getAttitudeRubric(attitude), setAttitude)}

                <TouchableOpacity
                    style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                    onPress={handleSubmit}
                    disabled={submitting}
                >
                    {submitting ? (
                        <Text style={styles.submitButtonText}>Enviando...</Text>
                    ) : (
                        <Text style={styles.submitButtonText}>Enviar Evaluación</Text>
                    )}
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 24,
    },
    sliderContainer: {
        marginBottom: 32,
    },
    sliderLabel: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    sliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    sliderValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#B794F6',
        minWidth: 50,
    },
    slider: {
        flex: 1,
        height: 40,
    },
    rubricContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        backgroundColor: '#f9f9f9',
        padding: 12,
        borderRadius: 8,
        borderLeftWidth: 3,
        borderLeftColor: '#B794F6',
    },
    rubricText: {
        fontSize: 14,
        color: '#666',
        flex: 1,
        marginLeft: 8,
        lineHeight: 20,
    },
    submitButton: {
        backgroundColor: '#B794F6',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
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
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        fontSize: 16,
        color: '#f44336',
        textAlign: 'center',
    },
});
