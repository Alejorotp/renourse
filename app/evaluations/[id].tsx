import { useAuthSession } from '@/auth/context/auth_context';
import { SafeTop } from '@/components/ui/safe-top';
import { Evaluation } from '@/evaluations/domain/models/evaluation';
import { useGroups } from '@/groups/context/group_context';
import { Group } from '@/groups/domain/models/group';
import { getUserNameById } from '@/shared/utils/user_utils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CurrentEvaluationPage() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuthSession();
  const { groups, getAllGroups } = useGroups();

  const hasEvaluationJson = typeof params.evaluation === 'string' && params.evaluation.length > 2;
  const evaluation: Evaluation | null = hasEvaluationJson
    ? JSON.parse(params.evaluation as string)
    : null;

  const [loading, setLoading] = useState(true);
  const [userGroup, setUserGroup] = useState<Group | null>(null);
  const [teammates, setTeammates] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    if (evaluation?.categoryID) {
      loadGroupData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [evaluation?.categoryID]);

  const loadGroupData = async () => {
    if (!evaluation?.categoryID || !user?.id) return;

    setLoading(true);
    try {
      await getAllGroups(evaluation.categoryID);
      
      // Find user's group for this category
      const categoryGroups = groups.filter((g) => g.categoryID === evaluation.categoryID);
      const foundGroup = categoryGroups.find((g) => g.memberIDs.includes(String(user.id)));

      if (foundGroup) {
        setUserGroup(foundGroup);

        // Get teammates (exclude current user)
        const teammateIds = foundGroup.memberIDs.filter((id) => id !== String(user.id));
        
        // Fetch names
        const teammateData = await Promise.all(
          teammateIds.map(async (id) => {
            try {
              const name = await getUserNameById(id);
              return { id, name };
            } catch (error) {
              console.error('Error loading teammate name:', error);
              return { id, name: 'Usuario Desconocido' };
            }
          })
        );

        setTeammates(teammateData);
      }
    } catch (error) {
      console.error('Error loading group data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEvaluateTeammate = (teammate: { id: string; name: string }) => {
    if (!evaluation || !userGroup) return;

    router.push({
      pathname: '/evaluations/evaluate' as any,
      params: {
        teammateId: teammate.id,
        teammateName: teammate.name,
        evaluation: JSON.stringify(evaluation),
        groupID: userGroup.id,
      },
    });
  };

  if (!evaluation) {
    return (
      <View style={styles.container}>
        <SafeTop backgroundColor="#fff" />
        <Stack.Screen options={{ title: 'Detalles de Evaluación' }} />
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>No se encontró la evaluación</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeTop backgroundColor="#fff" />
      <Stack.Screen options={{ title: 'Detalles de Evaluación' }} />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Nombre: {evaluation.name}</Text>
        
        <Text style={styles.subtitle}>ID de Evaluación: {evaluation.evaluationID}</Text>
        
        <Text style={styles.infoText}>ID de Categoría: {evaluation.categoryID}</Text>
        
        <Text style={styles.infoText}>Fecha de creación: {evaluation.creationDate}</Text>
        
        <Text style={styles.infoText}>Visibilidad: {evaluation.visibility}</Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Compañeros en tu grupo:</Text>

        {loading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#B794F6" />
          </View>
        ) : !userGroup ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No estás en ningún grupo para esta categoría.</Text>
          </View>
        ) : teammates.length === 0 ? (
          <View style={styles.centerContent}>
            <Text style={styles.emptyText}>No tienes compañeros en este grupo.</Text>
          </View>
        ) : (
          <View style={styles.teammatesContainer}>
            {teammates.map((teammate) => (
              <TouchableOpacity
                key={teammate.id}
                style={styles.teammateChip}
                onPress={() => handleEvaluateTeammate(teammate)}
              >
                <View style={styles.chipContent}>
                  <Ionicons name="person" size={18} color="#B794F6" />
                  <Text style={styles.chipText}>{teammate.name}</Text>
                </View>
                <Ionicons name="arrow-forward" size={18} color="#666" />
              </TouchableOpacity>
            ))}
          </View>
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
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  teammatesContainer: {
    gap: 12,
  },
  teammateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chipText: {
    fontSize: 16,
    color: '#333',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 32,
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
