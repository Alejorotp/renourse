# Reports Module

Este módulo maneja los reportes de evaluaciones de coevaluación. Los reportes son esencialmente las evaluaciones completadas que los profesores pueden visualizar.

## Arquitectura

Sigue Clean Architecture con las siguientes capas:

- **Domain**: Modelos e interfaces de repositorio
- **Data**: Implementaciones de datasources y repositorios
- **Controller**: Lógica de negocio y manejo de estado
- **Context**: Provider de React para acceso global

## Modelos

### Report
```typescript
{
  id: string;
  userId: string;          // Usuario evaluado
  evaluationId: string;    // ID de la evaluación
  groupId: string;         // Grupo al que pertenece
  categoryId: string;      // Categoría del curso
  punctuality: number;     // Calificación de puntualidad (1-5)
  contributions: number;   // Calificación de contribuciones (1-5)
  commitment: number;      // Calificación de compromiso (1-5)
  attitude: number;        // Calificación de actitud (1-5)
}
```

## Uso

### Context Provider

El provider ya está configurado en `app/_layout.tsx`.

### Hook

```typescript
import { useReports } from '@/reports/context/report_context';

const MyComponent = () => {
  const {
    fetchAllReports,
    fetchReportsByUserId,
    fetchReportsByGroupId,
    fetchReportsByEvaluationId,
    fetchReportsByCategoryId,
    deleteReport
  } = useReports();

  // Obtener todos los reportes de un curso
  const reports = await fetchAllReports(courseId);

  // Obtener reportes de un usuario específico
  const userReports = await fetchReportsByUserId(userId);

  // Obtener reportes de un grupo
  const groupReports = await fetchReportsByGroupId(groupId);

  // Obtener reportes de una evaluación
  const evalReports = await fetchReportsByEvaluationId(evaluationId);

  // Obtener reportes de una categoría
  const categoryReports = await fetchReportsByCategoryId(categoryId);

  // Eliminar un reporte (solo profesores)
  await deleteReport(reportId, courseId);
};
```

## Permisos

- **Estudiantes**: Pueden evaluar a sus compañeros (creando reportes mediante el módulo de evaluations)
- **Profesores**: Pueden ver todos los reportes de sus cursos y eliminarlos si es necesario

## Integración con otros módulos

- **Evaluations**: Los reportes se crean cuando un estudiante completa una evaluación mediante `submitScore`
- **Courses**: Los reportes se filtran por courseId para mostrar solo los del curso actual
- **Groups**: Los reportes están asociados a grupos específicos
- **Categories**: Los reportes están vinculados a categorías de curso

## API Endpoints

Todos los endpoints usan la base: `https://roble-api.openlab.uninorte.edu.co/database/flourse_460df99409`

- GET `/reports?courseId={id}` - Obtener todos los reportes de un curso
- GET `/reports?userId={id}` - Obtener reportes de un usuario
- GET `/reports?groupId={id}` - Obtener reportes de un grupo
- GET `/reports?evaluationId={id}` - Obtener reportes de una evaluación
- GET `/reports?categoryId={id}` - Obtener reportes de una categoría
- DELETE `/reports/{id}` - Eliminar un reporte

## Notas

- Los reportes son de solo lectura para profesores (visualización)
- La creación de reportes se hace a través del módulo de evaluations con `submitScore`
- Los reportes contienen las calificaciones numéricas de las 4 dimensiones evaluadas
