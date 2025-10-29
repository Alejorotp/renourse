import { useAuthSession } from '@/auth/context/auth_context';
import { Category } from '@/categories/domain/models/category';
import { SafeTop } from '@/components/ui/safe-top';
import { useGroups } from '@/groups/context/group_context';
import { Group } from '@/groups/domain/models/group';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function GroupsPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { groups, getAllGroups, joinGroup, createGroup, ensureRandomGroups } = useGroups();
  const { user } = useAuthSession();

  // Parse category from params
  const category: Category = params.category ? JSON.parse(params.category as string) : null;
  const canEdit = params.canEdit === 'true';
  const groupNumber = parseInt(params.groupNumber as string) || 0;

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (category?.id) {
      loadGroups();
    }
  }, [category?.id]);

  const loadGroups = async () => {
    setLoading(true);
    try {
      await getAllGroups(category.id!);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate for Aleatorio categories when professor enters and no groups exist
  useEffect(() => {
    if (!category?.id) return;
    const method = String(category.groupingMethod || '').toLowerCase();
    if (!canEdit || !method.startsWith('aleatorio')) return;
    const maybeGenerate = async () => {
      try {
        const filtered = groups.filter(g => g.categoryID === category.id);
        if (filtered.length === 0 && category.courseId) {
          setLoading(true);
          console.log('[GroupsPage] Aleatorio: generating groups for category', category.id);
          await ensureRandomGroups({ categoryId: category.id!, maxMembers: category.maxMembers, courseId: String(category.courseId) });
          await getAllGroups(category.id!);
        }
      } catch (e) {
        console.error('[GroupsPage] ensureRandomGroups error', e);
      } finally {
        setLoading(false);
      }
    };
    // Trigger after initial load
    maybeGenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, category?.id, category?.courseId, category?.maxMembers, category?.groupingMethod, groups.length]);

  const handleCreateGroup = async () => {
    if (!category?.id) return;
    
    setCreating(true);
    try {
      await createGroup(category.maxMembers, category.id, groupNumber);
      await loadGroups();
    } catch (error) {
      console.error('Error creating group:', error);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user?.id || !category?.id) return;
    
    try {
      const success = await joinGroup(groupId, String(user.id), category.id);
      if (success) {
        await loadGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
    }
  };

  const handleGroupPress = (group: Group, index: number) => {
    router.push({
      pathname: '/groups/[id]',
      params: {
        id: group.id,
        group: JSON.stringify(group),
        category: JSON.stringify(category),
        canEdit: String(canEdit),
        groupIndex: String(index + 1),
      },
    });
  };

  const filteredGroups = groups.filter((g) => g.categoryID === category?.id);
  const userInGroup = filteredGroups.some((g) => g.memberIDs.includes(String(user?.id || '')));

  const renderGroupCard = ({ item, index }: { item: Group; index: number }) => {
    const isFull = item.memberIDs.length >= category.maxMembers;
    const isUserInThisGroup = item.memberIDs.includes(String(user?.id || ''));
    const method = String(category.groupingMethod || '').toLowerCase();
    const isAuto = method.startsWith('auto');
    const isRandom = method.startsWith('aleatorio');

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handleGroupPress(item, index)}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardLeft}>
            <Text style={styles.groupTitle}>Grupo {index + 1}</Text>
            <Text style={styles.groupSubtitle}>
              {item.memberIDs.length} / {category.maxMembers} miembros
            </Text>
          </View>
          <View style={styles.cardRight}>
            {!canEdit && !userInGroup && !isFull && isAuto && (
              <TouchableOpacity
                style={styles.joinButton}
                onPress={(e) => {
                  e.stopPropagation();
                  handleJoinGroup(item.id);
                }}
              >
                <Text style={styles.joinButtonText}>Unirse</Text>
              </TouchableOpacity>
            )}
            {isUserInThisGroup && (
              <Ionicons name="checkmark-circle" size={28} color="#4CAF50" />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (!category) {
    return (
      <View style={styles.container}>
        <SafeTop backgroundColor="#fff" />
        <Stack.Screen options={{ title: 'Grupos' }} />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No se encontró la categoría</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeTop backgroundColor="#fff" />
      <Stack.Screen options={{ title: `Grupos de ${category.name}` }} />

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Lista de Grupos</Text>

        {canEdit && (
          <TouchableOpacity
            style={[styles.createButton, creating && styles.createButtonDisabled]}
            onPress={handleCreateGroup}
            disabled={creating}
          >
            {creating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Crear Grupo</Text>
            )}
          </TouchableOpacity>
        )}
        {canEdit && String(category.groupingMethod || '').toLowerCase().startsWith('aleatorio') && (
          <Text style={{ color: '#666', marginBottom: 8 }}>
            Esta categoría es aleatoria: los grupos se crean y asignan automáticamente según los integrantes del curso.
          </Text>
        )}

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#B794F6" />
          </View>
        ) : filteredGroups.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>
              No hay grupos creados para esta categoría.
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredGroups}
            keyExtractor={(item) => item.id}
            renderItem={renderGroupCard}
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
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#B794F6',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardLeft: {
    flex: 1,
  },
  cardRight: {
    marginLeft: 12,
  },
  groupTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  groupSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  joinButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    fontStyle: 'italic',
    color: '#999',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#f44336',
    textAlign: 'center',
  },
});
