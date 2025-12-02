import { Category } from '@/categories/domain/models/category';
import { SafeTop } from '@/components/ui/safe-top';
import { useGroups } from '@/groups/context/group_context';
import { Group } from '@/groups/domain/models/group';
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

    useEffect(() => {
        console.log('[GroupDetailPage] mounted with params', params);
    }, [params]);

    // Safety redirect: if we got here with id = "index" or missing group/category, go back to the list view
    const redirectedOnce = useRef(false);
    useEffect(() => {
        const shouldRedirect = (idParam === 'index') || !hasGroupJson || !hasCategoryJson;
        if (shouldRedirect && !redirectedOnce.current) {
            redirectedOnce.current = true;
            console.warn('[GroupDetailPage] Invalid params for detail, redirecting to /groups', { idParam, hasGroupJson, hasCategoryJson });
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
        }
    }, [group]);

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
                                // Refresh the group list and member names
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

    const renderMemberItem = ({ item: memberId }: { item: string }) => {
        const memberName = memberNames[memberId] || 'Cargando...';

        return (
            <View style={styles.memberCard}>
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
        );
    };

    if (!group || !category || idParam === 'index') {
        // We already triggered a replace to the list; render nothing while navigating.
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#f9f9f9',
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
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
    },
    removeButton: {
        padding: 4,
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
});
