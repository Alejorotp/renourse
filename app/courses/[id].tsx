import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useAuthSession } from '@/auth/context/auth_context';
import { useCategories } from '@/categories/context/category_context';
import type { Category } from '@/categories/domain/models/category';
import CreateCategoryDialog from '@/components/categories/create_category_dialog';
import CourseCodeBox from '@/components/courses/course_code_box';
import MemberCard from '@/components/courses/member_card';
import NavItem from '@/components/courses/nav_item';
import ProfessorBox from '@/components/courses/professor_box';
import { useCourses } from '@/courses/context/course_context';
import { useEvaluations } from '@/evaluations/context/evaluation_context';
import { useReports } from '@/reports/context/report_context';
import type { Report } from '@/reports/domain/models/report';
import { SafeTop } from '../../components/ui/safe-top';

export default function CurrentCoursePage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getCourseById } = useCourses();
  const { user } = useAuthSession();
  const router = useRouter();
  const [selected, setSelected] = useState(0);
  const [courseInfo, setCourseInfo] = useState<Awaited<ReturnType<typeof getCourseById>> | null>(null);
  const { categories, loadCategories, createCategory, deleteCategory } = useCategories();
  const { getUserEvaluations } = useEvaluations();
   const { fetchAllReports, fetchReportsByCategoryId } = useReports();
  const [showCreate, setShowCreate] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [userEvaluations, setUserEvaluations] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      if (id) {
        const ci = await getCourseById(String(id));
        setCourseInfo(ci);
      }
    })();
  }, [id, getCourseById]);

  useEffect(() => {
    // Load categories once when this screen mounts (for this course filtering)
    loadCategories().catch(() => {});
  }, [loadCategories]);

  const isProfessor = useMemo(() => {
    if (!courseInfo) return false;
    return String(courseInfo.course.professorId ?? '') === String(user?.id ?? '');
  }, [courseInfo, user?.id]);

  useEffect(() => {
    // Load reports if professor, or user evaluations if student
    if (courseInfo && user) {
      if (isProfessor) {
         // Load reports for professors by fetching from all categories of the course
         const courseCode = courseInfo.course.courseCode || '';
         const courseCats = categories.filter(c => String(c.courseId ?? '') === String(courseCode));
       
         if (courseCats.length > 0) {
           // Fetch reports for each category and combine them
           Promise.all(
             courseCats.map(cat => fetchReportsByCategoryId(cat.id || ''))
           )
             .then((reportsArrays) => {
               const allReports = reportsArrays.flat();
               setReports(allReports);
               console.log('[CurrentCoursePage] Loaded reports:', allReports.length);
             })
             .catch((err) => {
               console.error('[CurrentCoursePage] Error loading reports:', err);
             });
         } else {
           console.log('[CurrentCoursePage] No categories found for course, no reports to load');
           setReports([]);
         }
      } else {
        // Load user evaluations for students
        getUserEvaluations(String(user.id || ''))
          .then((evals) => {
            setUserEvaluations(evals);
            console.log('[CurrentCoursePage] Loaded user evaluations:', evals.length);
          })
          .catch((err) => {
            console.error('[CurrentCoursePage] Error loading evaluations:', err);
          });
      }
    }
   }, [courseInfo, user, isProfessor, categories, fetchAllReports, fetchReportsByCategoryId, getUserEvaluations]);

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
              <Ionicons name="people" size={26} color={darkBlue} style={{ marginRight: 6 }} />
              <Text style={styles.chipText}>Total de estudiantes: {(courseInfo?.memberNames?.length || 1) - 1}</Text>
            </View>
            <View style={{ height: 8 }} />
            {(courseInfo?.memberNames || [])
              .filter(n => n !== (courseInfo?.professorName || 'Profesor'))
              .map(name => <MemberCard key={name} name={name} />)}
          </ScrollView>
        )}
        {selected === 1 && (
          <ScrollView contentContainerStyle={styles.container}>
            {isProfessor ? (
              <>
                <Text style={styles.sectionTitle}>Reportes de Evaluación</Text>
                <View style={styles.divider} />
                {reports.length === 0 ? (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>No hay reportes disponibles</Text>
                  </View>
                ) : (
                  <View style={{ gap: 10 }}>
                    {reports.map((report) => (
                      <View key={report.id} style={styles.reportCard}>
                        <Text style={styles.reportTitle}>Reporte #{report.id.substring(0, 8)}</Text>
                        <View style={styles.reportRow}>
                          <Text style={styles.reportLabel}>Usuario:</Text>
                          <Text style={styles.reportValue}>{report.userId}</Text>
                        </View>
                        <View style={styles.reportRow}>
                          <Text style={styles.reportLabel}>Evaluación:</Text>
                          <Text style={styles.reportValue}>{report.evaluationId}</Text>
                        </View>
                        <View style={styles.divider} />
                        <View style={styles.scoresGrid}>
                          <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>Puntualidad</Text>
                            <Text style={styles.scoreValue}>{report.punctuality.toFixed(1)}</Text>
                          </View>
                          <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>Contribuciones</Text>
                            <Text style={styles.scoreValue}>{report.contributions.toFixed(1)}</Text>
                          </View>
                          <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>Compromiso</Text>
                            <Text style={styles.scoreValue}>{report.commitment.toFixed(1)}</Text>
                          </View>
                          <View style={styles.scoreItem}>
                            <Text style={styles.scoreLabel}>Actitud</Text>
                            <Text style={styles.scoreValue}>{report.attitude.toFixed(1)}</Text>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Mis Evaluaciones</Text>
                <View style={styles.divider} />
                {userEvaluations.length === 0 ? (
                  <View style={styles.placeholder}>
                    <Text style={styles.placeholderText}>No hay evaluaciones activas</Text>
                  </View>
                ) : (
                  <View style={{ gap: 12 }}>
                    {userEvaluations.map((evaluation) => (
                      <TouchableOpacity
                        key={evaluation.evaluationID}
                        style={styles.evaluationCard}
                        onPress={() => {
                          router.push({
                            pathname: '/evaluations/[id]',
                            params: {
                              id: evaluation.evaluationID,
                              evaluation: JSON.stringify(evaluation),
                            },
                          } as any);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={{ flex: 1 }}>
                          <Text style={styles.evaluationName}>{evaluation.name}</Text>
                          <Text style={styles.evaluationMeta}>
                            Fecha: {evaluation.creationDate}
                          </Text>
                          <Text style={styles.evaluationMeta}>
                            Visibilidad: {evaluation.visibility}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color="#999" />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        )}
        {selected === 2 && (
          <ScrollView contentContainerStyle={styles.container}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Categorías</Text>
              {isProfessor && (
                <TouchableOpacity style={styles.addBtn} onPress={() => setShowCreate(true)}>
                  <Text style={styles.addText}>Crear</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.divider} />
            {(() => {
              const courseCode = courseInfo?.course?.courseCode ?? '';
              const list = categories.filter(c => String(c.courseId ?? '') === String(courseCode));
              if (list.length === 0) {
                return <View style={styles.placeholder}><Text>No hay categorías.</Text></View>;
              }
              return (
                <View style={{ gap: 10 }}>
                  {list.map((cat) => (
                    <CategoryRow 
                      key={cat.id} 
                      cat={cat} 
                      canDelete={isProfessor} 
                      isProfessor={isProfessor}
                      onDelete={async () => {
                        if (cat.id) {
                          try { await deleteCategory(cat.id); } catch {}
                        }
                      }}
                      onPress={() => {
                        console.log('[CurrentCoursePage] navigate → /groups with category', cat.id);
                        router.push({
                          // Use segment root to reliably hit index route
                          pathname: '/groups' as any,
                          params: {
                            category: JSON.stringify(cat),
                            canEdit: String(isProfessor),
                            groupNumber: String(0),
                          },
                        });
                      }}
                    />
                  ))}
                </View>
              );
            })()}
          </ScrollView>
        )}
      </View>

      <View style={styles.bottomBar}>
        <View style={styles.bottomInner}>
          <NavItem icon={<Ionicons name="book-outline" size={20} color={isProfessor ? lilac : darkBlue} />} label="Curso" isActive={selected === 0} onPress={() => setSelected(0)} color={isProfessor ? lilac : darkBlue} />
          <NavItem icon={<MaterialIcons name="assignment" size={20} color={isProfessor ? lilac : darkBlue} />} label="Coevaluaciones" isActive={selected === 1} onPress={() => setSelected(1)} color={isProfessor ? lilac : darkBlue} />
          <NavItem icon={<Ionicons name="people-outline" size={20} color={isProfessor ? lilac : darkBlue} />} label="Grupos" isActive={selected === 2} onPress={() => setSelected(2)} color={isProfessor ? lilac : darkBlue} />
        </View>
      </View>

      {/* Create Category Dialog */}
      {showCreate && (
        <CreateCategoryDialog
          visible={showCreate}
          courseCode={courseInfo?.course?.courseCode || ''}
          onClose={() => setShowCreate(false)}
        />
      )}
    </View>
  );
}

function CategoryRow({ 
  cat, 
  canDelete, 
  isProfessor,
  onDelete, 
  onPress 
}: { 
  cat: Category; 
  canDelete: boolean; 
  isProfessor: boolean;
  onDelete: () => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.catRow} onPress={onPress} activeOpacity={0.7}>
      <View style={{ flex: 1 }}>
        <Text style={styles.catName}>{cat.name}</Text>
        <Text style={styles.catMeta}>Método: {cat.groupingMethod} • Máx integrantes: {cat.maxMembers}</Text>
      </View>
      {canDelete && (
        <TouchableOpacity 
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }} 
          style={styles.deleteBtn}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Eliminar</Text>
        </TouchableOpacity>
      )}
      <Ionicons name="chevron-forward" size={24} color="#999" style={{ marginLeft: 8 }} />
    </TouchableOpacity>
  );
}

const lilac = 'rgba(124, 77, 255, 1)';
const darkBlue = 'rgba(0,124,182,1)';

const styles = StyleSheet.create({
  appBar: { backgroundColor: '#EFE5F8', alignItems: 'center', justifyContent: 'center', padding: 12 },
  appBarTitle: { fontWeight: 'bold', color: '#222', fontSize: 18 },
  container: { padding: 12 },
  divider: { height: 1, backgroundColor: '#ccc', marginVertical: 8, opacity: 0.5 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  addBtn: { backgroundColor: 'rgba(224,224,224,0.5)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  addText: { fontWeight: 'bold', color: '#222' },
  chipRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    alignSelf: 'flex-start', 
    backgroundColor: 'rgba(43,213,243,0.15)', 
    borderRadius: 10, 
    paddingHorizontal: 12, 
    paddingVertical: 4 
  },
  chipText: { color: darkBlue, fontWeight: '600', fontSize: 16 },
  bottomBar: { backgroundColor: '#fff', shadowColor: 'rgba(0,0,0,0.15)', shadowOpacity: 0.4, shadowRadius: 6, elevation: 6 },
  bottomInner: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingVertical: 8 },
  placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  placeholderText: { fontSize: 16, color: '#999', textAlign: 'center' },
  catRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', borderRadius: 10, padding: 12 },
  catName: { fontWeight: '700', fontSize: 16 },
  catMeta: { color: '#666', marginTop: 4 },
  deleteBtn: { backgroundColor: '#e53935', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8 },
  // Report styles
  reportCard: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#e0e0e0', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  reportLabel: { fontSize: 14, color: '#666', fontWeight: '600' },
  reportValue: { fontSize: 14, color: '#333' },
  scoresGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 12, 
    marginTop: 8 
  },
  scoreItem: { 
    flex: 1, 
    minWidth: '45%', 
    backgroundColor: '#f5f5f5', 
    padding: 12, 
    borderRadius: 8, 
    alignItems: 'center' 
  },
  scoreLabel: { fontSize: 12, color: '#666', marginBottom: 4, textAlign: 'center' },
  scoreValue: { fontSize: 20, fontWeight: 'bold', color: '#B794F6' },
  // Evaluation card styles
  evaluationCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  evaluationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  evaluationMeta: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
});
