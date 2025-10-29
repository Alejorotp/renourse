import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { useAuthSession } from '@/auth/context/auth_context';
import CourseCodeBox from '@/components/courses/course_code_box';
import MemberCard from '@/components/courses/member_card';
import NavItem from '@/components/courses/nav_item';
import ProfessorBox from '@/components/courses/professor_box';
import { useCourses } from '@/courses/context/course_context';
import { SafeTop } from '../../components/ui/safe-top';

export default function CurrentCoursePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCourseById } = useCourses();
  const { user } = useAuthSession();
  const [selected, setSelected] = useState(0);
  const [courseInfo, setCourseInfo] = useState<Awaited<ReturnType<typeof getCourseById>> | null>(null);

  useEffect(() => {
    (async () => {
      if (id) {
        const ci = await getCourseById(String(id));
        setCourseInfo(ci);
      }
    })();
  }, [id, getCourseById]);

  const isProfessor = useMemo(() => {
    if (!courseInfo) return false;
    return String(courseInfo.course.professorId ?? '') === String(user?.id ?? '');
  }, [courseInfo, user?.id]);

  const title = courseInfo?.course?.name || 'Curso';

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F4FA' }}>
      <SafeTop />
      <View style={styles.appBar}>
        <Text style={styles.appBarTitle}>{title}</Text>
      </View>
      <View style={{ flex: 1 }}>
        {selected === 0 && (
          <ScrollView contentContainerStyle={styles.container}>
            <ProfessorBox professorName={courseInfo?.professorName || 'Profesor'} />
            {isProfessor && (
              <CourseCodeBox courseCode={courseInfo?.course?.courseCode || ''} />
            )}
            <View style={styles.divider} />
            <View style={styles.chipRow}>
              <Text style={styles.chipText}>Total de estudiantes: {(courseInfo?.memberNames?.length || 1) - 1}</Text>
            </View>
            <View style={{ height: 8 }} />
            {(courseInfo?.memberNames || [])
              .filter(n => n !== (courseInfo?.professorName || 'Profesor'))
              .map(name => <MemberCard key={name} name={name} />)}
          </ScrollView>
        )}
        {selected === 1 && (
          <View style={styles.placeholder}><Text>Coevaluaciones próximamente…</Text></View>
        )}
        {selected === 2 && (
          <View style={styles.placeholder}><Text>Grupos próximamente…</Text></View>
        )}
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.bottomInner}>
          <NavItem icon={<Ionicons name="book-outline" size={20} color={isProfessor ? lilac : darkBlue} />} label="Curso" isActive={selected === 0} onPress={() => setSelected(0)} color={isProfessor ? lilac : darkBlue} />
          <NavItem icon={<MaterialIcons name="assignment" size={20} color={isProfessor ? lilac : darkBlue} />} label="Coevaluaciones" isActive={selected === 1} onPress={() => setSelected(1)} color={isProfessor ? lilac : darkBlue} />
          <NavItem icon={<Ionicons name="people-outline" size={20} color={isProfessor ? lilac : darkBlue} />} label="Grupos" isActive={selected === 2} onPress={() => setSelected(2)} color={isProfessor ? lilac : darkBlue} />
        </View>
      </View>
    </View>
  );
}

const lilac = 'rgba(124, 77, 255, 1)';
const darkBlue = 'rgba(0,124,182,1)';

const styles = StyleSheet.create({
  appBar: { backgroundColor: '#EFE5F8', alignItems: 'center', justifyContent: 'center', padding: 12 },
  appBarTitle: { fontWeight: 'bold', color: '#222', fontSize: 18 },
  container: { padding: 12 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 8, opacity: 0.5 },
  chipRow: { alignSelf: 'flex-start', backgroundColor: 'rgba(43,213,243,0.15)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 4 },
  chipText: { color: darkBlue, fontWeight: '600', fontSize: 16 },
  bottomBar: { backgroundColor: '#fff', shadowColor: 'rgba(0,0,0,0.15)', shadowOpacity: 0.4, shadowRadius: 6, elevation: 6 },
  bottomInner: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
