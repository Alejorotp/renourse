import { useAuthSession } from '@/auth/context/auth_context';
import { SafeTop } from '@/components/ui/safe-top';
import { useEvaluations } from '@/evaluations/context/evaluation_context';
import { Evaluation } from '@/evaluations/domain/models/evaluation';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function EvaluationsListScreen() {
    const router = useRouter();
    const { user } = useAuthSession();
    const { getUserEvaluations } = useEvaluations();

    const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvaluations();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const loadEvaluations = async () => {
        if (!user?.id) return;

        setLoading(true);
        try {
            const userEvals = await getUserEvaluations(String(user.id));
            setEvaluations(userEvals);
        } catch (error) {
            console.error('Error loading evaluations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEvaluationPress = (evaluation: Evaluation) => {
        router.push({
            pathname: '/evaluations/[id]' as any,
            params: {
                id: evaluation.evaluationID,
                evaluation: JSON.stringify(evaluation),
            },
        });
    };

    const renderEvaluationCard = ({ item }: { item: Evaluation }) => {
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => handleEvaluationPress(item)}
                activeOpacity={0.7}
            >
                <View style={styles.iconContainer}>
                    <Ionicons name="document-text" size={32} color="#2BD5F3" />
                </View>
                <View style={styles.cardContent}>
                    <Text style={styles.cardTitle} numberOfLines={2}>
                        {item.name}
                    </Text>
                    <Text style={styles.cardSubtitle} numberOfLines={1}>
                        ID: {item.evaluationID}
                    </Text>
                    <View style={styles.cardFooter}>
                        <View style={styles.footerItem}>
                            <Ionicons name="eye" size={14} color="#666" />
                            <Text style={styles.footerText}>{item.visibility}</Text>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <SafeTop backgroundColor="#fff" />
            <Stack.Screen options={{ title: 'Evaluaciones' }} />

            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Mis evaluaciones</Text>
                <View style={styles.divider} />

                {loading ? (
                    <View style={styles.centerContent}>
                        <ActivityIndicator size="large" color="#B794F6" />
                    </View>
                ) : evaluations.length === 0 ? (
                    <View style={styles.centerContent}>
                        <Ionicons name="clipboard-outline" size={64} color="#ccc" />
                        <Text style={styles.emptyText}>No tienes evaluaciones pendientes.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={evaluations}
                        keyExtractor={(item) => item.evaluationID}
                        renderItem={renderEvaluationCard}
                        numColumns={2}
                        columnWrapperStyle={styles.row}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                    />
                )}
            </View>
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
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    divider: {
        height: 1,
        backgroundColor: '#e0e0e0',
        marginBottom: 16,
    },
    row: {
        justifyContent: 'space-between',
    },
    card: {
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        padding: 12,
        marginBottom: 16,
        width: '48%',
        borderWidth: 1,
        borderColor: '#e0e0e0',
        alignItems: 'center',
    },
    iconContainer: {
        backgroundColor: '#CDEEFF',
        borderRadius: 8,
        padding: 8,
        marginBottom: 10,
    },
    cardContent: {
        width: '100%',
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        marginBottom: 4,
    },
    cardSubtitle: {
        fontSize: 11,
        color: '#666',
        textAlign: 'center',
        marginBottom: 8,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    footerItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerText: {
        fontSize: 11,
        color: '#666',
        marginLeft: 4,
    },
    listContent: {
        paddingBottom: 20,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        textAlign: 'center',
        marginTop: 16,
    },
});
