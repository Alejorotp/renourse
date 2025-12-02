import { useAuthSession } from '@/auth/context/auth_context';
import { Category } from '@/categories/domain/models/category';
import { SafeTop } from '@/components/ui/safe-top';
import { useEvaluations } from '@/evaluations/context/evaluation_context';
import { useGroups } from '@/groups/context/group_context';
import { Group } from '@/groups/domain/models/group';
import { useReports } from '@/reports/context/report_context';
import { getUserNameById } from '@/shared/utils/user_utils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function GroupDetailScreen() {
    const params = useLocalSearchParams();
    const router = useRouter();
    const { removeMemberFromGroup, getAllGroups } = useGroups();
    const { fetchReportsByGroupId, groupAverageScore, userAverageScore } = useReports();
    const { evaluations, fetchEvaluationsByCategory } = useEvaluations();
    const { user } = useAuthSession();

    // Parse params
    const idParam = Array.isArray(params.id) ? params.id[0] : (params.id as string | undefined);
    const hasGroupJson = typeof params.group === 'string' && params.group.length > 2;
    const hasCategoryJson = typeof params.category === 'string' && params.category.length > 2;
    const group: Group = hasGroupJson ? JSON.parse(params.group as string) : null;
    const category: Category = hasCategoryJson ? JSON.parse(params.category as string) : null;
    const canEdit = params.canEdit === 'true';
    const groupIndex = params.groupIndex || '1';

    const [memberNames, setMemberNames] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [reportsLoaded, setReportsLoaded] = useState(false);
    const [isPublicEvaluation, setIsPublicEvaluation] = useState(false);

    useEffect(() => {
        console.log('[GroupDetailScreen] mounted with params', params);
    }, [params]);

    // Safety redirect
    const redirectedOnce = useRef(false);
    useEffect(() => {
        const shouldRedirect = (idParam === 'index') || !hasGroupJson || !hasCategoryJson;
        if (shouldRedirect && !redirectedOnce.current) {
            redirectedOnce.current = true;
            console.warn('[GroupDetailScreen] Invalid params for detail, redirecting to /groups', { idParam, hasGroupJson, hasCategoryJson });
            router.replace({
                pathname: '/groups' as any,
                params: {
                    category: (params.category as string) ?? '',
                    canEdit: String(params.canEdit ?? 'false'),
                    groupNumber: String(params.groupNumber ?? '0'),
                    redirectMessage: 'Te hemos redirigido a la lista de grupos.',
                },
            });
        }
    }, [idParam, hasGroupJson, hasCategoryJson, router, params.category, params.canEdit, params.groupNumber]);

    useEffect(() => {
        if (group) {
            loadMemberNames();
            loadReports();
            checkVisibility();
        }
    }, [group]);

    const checkVisibility = async () => {
        if (category?.id) {
            // Fetch evaluations for this category to check visibility
            // We assume if ANY evaluation in this category is public, we show scores? 
            // Or usually there is one active evaluation.
            // For now, let's fetch and check if any is public.
            try {
                await fetchEvaluationsByCategory(category.id);
                // We need to access the updated evaluations from context, but `fetchEvaluationsByCategory` 
                // updates the context state. We might need to wait for the state update or check the result if it returned it.
                // The context method returns Promise<void> in the interface I saw earlier, but let's check.
                // Actually, `useEvaluations` gives us `evaluations`.
            } catch (e) {
                console.error("Error fetching evaluations for visibility check", e);
            }
        }
    };

    // Effect to update isPublicEvaluation when evaluations change
    useEffect(() => {
        if (evaluations.length > 0 && category?.id) {
            const hasPublic = evaluations.some(e => e.categoryID === category.id && e.visibility === 'Publica'); // Check exact string from Flutter/DB
            setIsPublicEvaluation(hasPublic);
            console.log('[GroupDetailScreen] Visibility check:', { hasPublic, count: evaluations.length });
        }
    }, [evaluations, category?.id]);


    const loadMemberNames = async () => {
        setLoading(true);
        const names: { [key: string]: string } = {};

        for (const memberId of group.memberIDs) {
            try {
                const name = await getUserNameById(memberId);
                names[memberId] = name;
            } catch (error) {
                console.error('Error loading member name:', error);
                names[memberId] = 'Usuario Desconocido';
            }
        }

        setMemberNames(names);
        setLoading(false);
    };

    const loadReports = async () => {
        try {
            await fetchReportsByGroupId(group.id);
            setReportsLoaded(true);
        } catch (error) {
            console.error('Error loading reports:', error);
        }
    };

    const handleRemoveMember = (memberId: string, memberName: string) => {
        Alert.alert(
            'Remover Miembro',
            `¿Estás seguro de que deseas remover a ${memberName} del grupo?`,
            [
                {
                    text: 'Cancelar',
                    style: 'cancel',
                },
                {
                    text: 'Remover',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const success = await removeMemberFromGroup(group.id, memberId, category.id!);
                            if (success) {
                                await getAllGroups(category.id!);
                                await loadMemberNames();
                            }
                        } catch (error) {
                            console.error('Error removing member:', error);
                            Alert.alert('Error', 'No se pudo remover al miembro del grupo');
                        }
                    },
                },
            ]
        );
    };

    const renderAverageColumn = (label: string, value: number) => (
        <View style={styles.avgColumn}>
            <Text style={styles.avgValue}>{value.toFixed(1)}</Text>
            <Text style={styles.avgLabel}>{label}</Text>
        </View>
    );

    const renderMiniAvg = (label: string, value: number) => (
        <View style={styles.miniAvgChip}>
            <Text style={styles.miniAvgText}>{label}:{value.toFixed(1)}</Text>
        </View>
    );

    const renderMemberItem = ({ item: memberId }: { item: string }) => {
        const memberName = memberNames[memberId] || 'Cargando...';
        const userAvg = userAverageScore(memberId, { groupId: group.id });
        const isMe = user?.id === memberId;

        // Show scores if:
        // 1. User is professor (canEdit)
        // 2. OR (Evaluation is Public AND User is viewing themselves)
        const showScores = canEdit || (isPublicEvaluation && isMe);

        return (
            <View style={styles.memberCard}>
                <View style={styles.memberContent}>
                    <View style={styles.memberHeader}>
                        <View style={styles.memberInfo}>
                            <View style={styles.avatar}>
                                <Ionicons name="person" size={24} color="#666" />
                            </View>
                            <Text style={styles.memberName}>{memberName}</Text>
                        </View>
                        {canEdit && (
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveMember(memberId, memberName)}
                            >
                                <Ionicons name="close-circle" size={28} color="#f44336" />
                            </TouchableOpacity>
                        )}
                    </View>

                    {showScores && (
                        <View style={styles.memberStats}>
                            <View style={styles.miniAvgRow}>
                                {renderMiniAvg("P", userAvg[0])}
                                {renderMiniAvg("C", userAvg[1])}
                                {renderMiniAvg("Co", userAvg[2])}
                                {renderMiniAvg("A", userAvg[3])}
                            </View>
                            <TouchableOpacity
                                style={styles.viewButton}
                                onPress={() => {
                                    router.push({
                                        pathname: '/reports/averages',
                                        params: { scores: JSON.stringify(userAvg) },
                                    });
                                }}
                            >
                                <Ionicons name="bar-chart" size={16} color="#fff" />
                                <Text style={styles.viewButtonText}>Ver</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </View>
        );
    };

    if (!group || !category || idParam === 'index') {
        return (
            <View style={styles.container}>
                <SafeTop backgroundColor="#fff" />
                <Stack.Screen options={{ title: 'Detalle del Grupo' }} />
                <View style={styles.centerContent}>
                    <Text style={styles.errorText}>No se encontró el grupo</Text>
                </View>
            </View>
        );
    }

    const groupAverage = groupAverageScore(group.id);

    return (
        <View style={styles.container}>
            <SafeTop backgroundColor="#fff" />
            <Stack.Screen options={{ title: `Grupo ${groupIndex}` }} />

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Miembros del Grupo</Text>
                    <Text style={styles.headerSubtitle}>
                        {group.memberIDs.length} / {category.maxMembers} miembros
                    </Text>
                </View>

                {canEdit && (
                    <View style={styles.groupAvgCard}>
                        <View style={styles.groupAvgRow}>
                            {renderAverageColumn('Puntualidad', groupAverage[0])}
                            {renderAverageColumn('Contribuciones', groupAverage[1])}
                            {renderAverageColumn('Compromiso', groupAverage[2])}
                            {renderAverageColumn('Actitud', groupAverage[3])}
                        </View>
                    </View>
                )}

                {group.memberIDs.length === 0 ? (
                    <View style={styles.centerContent}>
                        <Text style={styles.emptyText}>El grupo no tiene miembros.</Text>
                    </View>
                ) : (
                    <FlatList
                        data={group.memberIDs}
                        keyExtractor={(item) => item}
                        renderItem={renderMemberItem}
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
    header: {
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
    },
    memberCard: {
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    memberContent: {
        flexDirection: 'column',
    },
    memberHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    memberInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#e0e0e0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    memberName: {
        fontSize: 16,
        color: '#333',
        flex: 1,
        fontWeight: '500',
    },
    removeButton: {
        padding: 4,
    },
    memberStats: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    miniAvgRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
        flex: 1,
    },
    miniAvgChip: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 12,
    },
    miniAvgText: {
        fontSize: 11,
        color: '#1565C0',
    },
    viewButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2196F3',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginLeft: 8,
    },
    viewButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
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
    },
    errorText: {
        fontSize: 16,
        color: '#f44336',
        textAlign: 'center',
    },
    groupAvgCard: {
        backgroundColor: '#E3F2FD',
        borderRadius: 8,
        padding: 12,
        marginBottom: 16,
    },
    groupAvgRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    avgColumn: {
        alignItems: 'center',
    },
    avgValue: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    avgLabel: {
        fontSize: 12,
        color: '#555',
    },
});
