import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import { SafeTop } from '@/components/ui/safe-top';
import { useGroups } from '@/groups/context/group_context';
import { Category } from '@/categories/domain/models/category';
import { Group } from '@/groups/domain/models/group';
import { getUserNameById } from '@/shared/utils/user_utils';
import { Ionicons } from '@expo/vector-icons';

export default function GroupDetailPage() {
  const params = useLocalSearchParams();
  const { removeMemberFromGroup, getAllGroups } = useGroups();

  // Parse params
  const group: Group = params.group ? JSON.parse(params.group as string) : null;
  const category: Category = params.category ? JSON.parse(params.category as string) : null;
  const canEdit = params.canEdit === 'true';
  const groupIndex = params.groupIndex || '1';

  const [memberNames, setMemberNames] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

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

  if (!group || !category) {
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
