import { useRouter } from 'expo-router';
import React from 'react';
import { Button, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuth } from '@/auth/context/auth_context';
import { useAuthController } from '@/auth/controller/auth_controller';

// Importa los componentes traducidos
import CourseCard from '../components/home/course_card';
import CreateCourseCard from '../components/home/create_course_card';
import EvaluationListCard from '../components/home/evaluation_list_card';
import JoinCourseCard from '../components/home/join_course_card';

// TODO: Importar controladores y modelos reales
// import { useCoursesController } from '...';
// import { useEvaluationController } from '...';

const lilac = 'rgba(124, 77, 255, 1)';
const blue = 'rgba(43, 213, 243, 1)';

export default function HomeScreen() {
  const authUseCase = useAuth();
  const { logout, user } = useAuthController(authUseCase);
  const router = useRouter();

  // TODO: Reemplazar con hooks/controladores reales
  const courses: Array<{ id?: string | number; name?: string; userRole?: string }> = [];
  const evaluations: Array<{ id?: string | number; title?: string }> = [];
  const profCourses = courses.filter(c => c.userRole === 'profesor');
  const studentCourses = courses.filter(c => c.userRole === 'estudiante');

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F4FA' }}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Flourse</Text>
        <Button title="Cerrar sesión" onPress={async () => {
          await logout();
          router.replace('/modal');
        }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Bienvenida */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user?.name?.[0] || 'U').toUpperCase()}
              </Text>
            </View>
            <Text style={styles.welcomeText}>
              👋 Bienvenido, {user?.name || 'User'}
            </Text>
          </View>
        </View>
        <View style={styles.divider} />

        {/* Mis cursos */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Mis cursos</Text>
          <TouchableOpacity onPress={() => router.push('/courses' as any)}>
            <Text style={styles.linkText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        {/* Etiqueta Profesor */}
        <View style={styles.labelLilac}>
          <Text style={styles.labelText}>Profesor</Text>
        </View>
        {/* Carrusel de profesor */}
        <ScrollView horizontal style={{ height: 180 }}>
          {profCourses.map((course, idx) => (
            <CourseCard key={course.id} courseInfo={course} />
          ))}
          {profCourses.length <= 2 && (
            <CreateCourseCard onTap={() => {/* TODO: show create dialog */}} />
          )}
        </ScrollView>

        {/* Etiqueta Estudiante */}
        <View style={styles.labelBlue}>
          <Text style={styles.labelText}>Estudiante</Text>
        </View>
        {/* Carrusel de estudiante */}
        <ScrollView horizontal style={{ height: 180 }}>
          {studentCourses.map((course, idx) => (
            <CourseCard key={course.id} courseInfo={course} />
          ))}
          <JoinCourseCard onTap={() => {/* TODO: show join dialog */}} />
        </ScrollView>

        {/* Evaluaciones pendientes */}
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Evaluaciones pendientes</Text>
          <TouchableOpacity onPress={() => router.push('/evaluations' as any)}>
            <Text style={styles.linkText}>Ver todos</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal style={{ height: 120 }}>
          {evaluations.length === 0 ? (
            <View style={styles.noEval}>
              <Text style={styles.noEvalText}>No tienes evaluaciones pendientes.</Text>
            </View>
          ) : (
            evaluations.map((evalItem, idx) => (
              <EvaluationListCard key={evalItem.id} evaluation={evalItem} onTap={() => {/* TODO: go to evaluation */}} />
            ))
          )}
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: {
    backgroundColor: '#EFE5F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
  },
  appBarTitle: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 20,
  },
  container: {
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    marginBottom: 8,
    elevation: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DFDFDF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeText: {
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
    color: '#222',
  },
  divider: {
    height: 1,
    backgroundColor: '#ccc',
    marginVertical: 8,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    fontWeight: 'bold',
    color: blue,
  },
  labelLilac: {
    backgroundColor: 'rgba(124,77,255,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  labelBlue: {
    backgroundColor: 'rgba(43,213,243,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 8,
    alignSelf: 'flex-start',
  },
  labelText: {
    fontWeight: 'bold',
    color: '#007CB6',
    fontSize: 15,
  },
  noEval: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 320,
    height: 120,
  },
  noEvalText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
});