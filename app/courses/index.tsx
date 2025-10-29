import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuthSession } from '@/auth/context/auth_context';
import CreateCourseDialog from '@/components/courses/create_course_dialog';
import JoinCourseDialog from '@/components/courses/join_course_dialog';
import RoleToggleButtons from '@/components/courses/role_toggle_buttons';
import CourseCard from '@/components/home/course_card';
import { useCourses } from '@/courses/context/course_context';

const lilac = 'rgba(124, 77, 255, 1)';
const blue = 'rgba(43, 213, 243, 1)';

export default function CoursesPage() {
  const router = useRouter();
  const { user } = useAuthSession();
  const { userCourses, loadUserCourses } = useCourses();

  const [isProfessor, setIsProfessor] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (user?.id != null) {
      loadUserCourses(String(user.id));
    }
  }, [user?.id, loadUserCourses]);

  const filtered = useMemo(() => {
    return userCourses.filter(c => (isProfessor ? c.userRole === 'Profesor' : c.userRole !== 'Profesor'));
  }, [userCourses, isProfessor]);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F4FA' }}>
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>Flourse</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.rowBetween}>
          <Text style={styles.sectionTitle}>Mis cursos</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowMenu(true)}>
            <Ionicons name="add" color="#222" size={18} />
            <Text style={styles.addText}>Agregar</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <RoleToggleButtons isProfessor={isProfessor} onChange={setIsProfessor} />
        <View style={{ height: 12 }} />
        {filtered.length === 0 ? (
          <View style={styles.empty}><Text>No hay cursos disponibles.</Text></View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.course.id}
            numColumns={2}
            columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 16 }}
            renderItem={({ item }) => (
              <CourseCard
                courseInfo={{ id: item.course.id, name: item.course.name ?? item.course.courseCode, userRole: item.userRole }}
                onPress={() => router.push({ pathname: '/courses/[id]', params: { id: item.course.id } })}
              />
            )}
          />
        )}
      </View>

      {/* Menu popup */}
      <Modal visible={showMenu} transparent animationType="fade" onRequestClose={() => setShowMenu(false)}>
        <TouchableOpacity style={styles.menuBackdrop} activeOpacity={1} onPress={() => setShowMenu(false)}>
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowCreate(true);
              }}
            >
              <View style={styles.menuIconLilac}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.menuTextLilac}>Crear un curso</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setShowMenu(false);
                setShowJoin(true);
              }}
            >
              <View style={styles.menuIconBlue}>
                <Ionicons name="person-add-outline" size={20} color="#fff" />
              </View>
              <Text style={styles.menuTextBlue}>Unirse a un curso</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <CreateCourseDialog visible={showCreate} onClose={() => setShowCreate(false)} />
      <JoinCourseDialog visible={showJoin} onClose={() => setShowJoin(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  appBar: { backgroundColor: '#EFE5F8', alignItems: 'center', justifyContent: 'center', padding: 12 },
  appBarTitle: { fontWeight: 'bold', color: '#222', fontSize: 20 },
  container: { flex: 1, padding: 16 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 6, backgroundColor: 'rgba(224,224,224,0.5)', borderRadius: 8 },
  addText: { marginLeft: 6, color: '#222', fontWeight: 'bold', fontSize: 15 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 12, opacity: 0.5 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' },
  menuCard: { backgroundColor: '#fff', borderRadius: 12, minWidth: 240, paddingVertical: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  menuIconLilac: { backgroundColor: lilac, borderRadius: 6, padding: 6, marginRight: 10 },
  menuIconBlue: { backgroundColor: blue, borderRadius: 6, padding: 6, marginRight: 10 },
  menuTextLilac: { color: lilac, fontWeight: '600', fontSize: 15 },
  menuTextBlue: { color: blue, fontWeight: '600', fontSize: 15 },
  menuDivider: { height: 1, backgroundColor: '#eee', marginVertical: 4 },
});
