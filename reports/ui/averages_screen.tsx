import { SafeTop } from '@/components/ui/safe-top';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function AveragesScreen() {
    const params = useLocalSearchParams();
    const scoresParam = typeof params.scores === 'string' ? JSON.parse(params.scores) : [0, 0, 0, 0];
    const scores: number[] = Array.isArray(scoresParam) ? scoresParam : [0, 0, 0, 0];

    const getPunctualityRubric = (value: number) => {
        if (value < 3) {
            return "Llegó tarde a todas las sesiones o se ausentó constantemente.";
        } else if (value < 4) {
            return "Llegó tarde con mucha frecuencia y se ausentó varias veces del trabajo del equipo.";
        } else if (value < 5) {
            return "En la mayoría de las sesiones llegó puntualmente y no se ausentó con frecuencia.";
        } else {
            return "Acudió puntualmente a todas las sesiones de trabajo.";
        }
    };

    const getContributionsRubric = (value: number) => {
        if (value < 3) {
            return "En todo momento estuvo como observador y no aportó al trabajo del equipo.";
        } else if (value < 4) {
            return "En algunas ocasiones participó dentro del equipo y en los intercambios generales.";
        } else if (value < 5) {
            return "Hizo varios aportes al equipo; sin embargo, puede ser más crítico y propositivo.";
        } else {
            return "Sus aportes fueron muy enriquecedores en todo momento al trabajo del equipo.";
        }
    };

    const getCommitmentRubric = (value: number) => {
        if (value < 3) {
            return "Mostró poco compromiso con las tareas y roles asignados y en ocasiones no aportó en las tareas propuestas al equipo.";
        } else if (value < 4) {
            return "En algunos momentos asumió tareas y roles, pero en otros momentos no aportó en las tareas propuestas.";
        } else if (value < 5) {
            return "La mayor parte del tiempo asumió tareas con compromiso y responsabilidad y ha aportado más al trabajo del equipo.";
        } else {
            return "Mostró en todo momento un compromiso con las tareas asignadas y los roles que tuvo en el equipo.";
        }
    };

    const getAttitudeRubric = (value: number) => {
        if (value < 3) {
            return "Actuó de manera pasiva y su actitud afectó negativamente las tareas y la colaboración.";
        } else if (value < 4) {
            return "En algunas ocasiones mostró actitud positiva y afectó positivamente el impacto en el equipo.";
        } else if (value < 5) {
            return "La mayor parte del tiempo mostró actitud positiva y buena disposición.";
        } else {
            return "Siempre mostró actitud positiva y disposición para colaborar con calidad.";
        }
    };

    const punctuality = scores[0];
    const contributions = scores[1];
    const commitment = scores[2];
    const attitude = scores[3];

    const renderScoreCard = (
        icon: keyof typeof Ionicons.glyphMap,
        iconColor: string,
        label: string,
        value: number,
        rubric: string
    ) => (
        <View style={styles.card}>
            <View style={styles.cardContent}>
                <View style={[styles.iconContainer, { backgroundColor: `${iconColor}26` }]}>
                    <Ionicons name={icon} size={28} color={iconColor} />
                </View>
                <View style={styles.textContainer}>
                    <Text style={[styles.scoreLabel, { color: iconColor }]}>
                        {label}: {value.toFixed(2)}
                    </Text>
                    <Text style={styles.rubricText}>{rubric}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeTop backgroundColor="#fff" />
            <Stack.Screen options={{ title: 'Resultados de la evaluación' }} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>Promedios de desempeño</Text>

                {renderScoreCard(
                    "time-outline",
                    "#2196F3",
                    "Puntualidad",
                    punctuality,
                    getPunctualityRubric(punctuality)
                )}

                {renderScoreCard(
                    "people-outline",
                    "#FF9800",
                    "Contribuciones",
                    contributions,
                    getContributionsRubric(contributions)
                )}

                {renderScoreCard(
                    "checkmark-circle-outline",
                    "#4CAF50",
                    "Compromiso",
                    commitment,
                    getCommitmentRubric(commitment)
                )}

                {renderScoreCard(
                    "happy-outline",
                    "#9C27B0",
                    "Actitud",
                    attitude,
                    getAttitudeRubric(attitude)
                )}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    scrollContent: {
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#512DA8',
        textAlign: 'center',
        marginBottom: 28,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 22,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
        borderWidth: 1,
        borderColor: '#f0f0f0',
    },
    cardContent: {
        padding: 18,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    iconContainer: {
        width: 52,
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 18,
    },
    textContainer: {
        flex: 1,
    },
    scoreLabel: {
        fontSize: 17,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    rubricText: {
        fontSize: 14,
        fontStyle: 'italic',
        color: 'rgba(0, 0, 0, 0.87)',
        lineHeight: 20,
    },
});
