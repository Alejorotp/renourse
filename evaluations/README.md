# Evaluations Module

Módulo de evaluaciones para el sistema de gestión de cursos. Permite a los usuarios crear, ver y completar evaluaciones de sus compañeros de grupo.

## Estructura

```
evaluations/
├── context/
│   └── evaluation_context.tsx          # Context Provider de React
├── controller/
│   └── evaluation_controller.ts        # Lógica de control
├── data/
│   ├── datasources/
│   │   ├── i_evaluation_source.ts      # Interface del data source
│   │   └── remote/
│   │       └── evaluation_source_service.ts  # Implementación con API
│   └── repositories/
│       └── evaluation_repository.ts    # Repositorio
└── domain/
    ├── models/
    │   ├── evaluation.ts               # Modelo de Evaluación
    │   └── score.ts                    # Modelo de Puntuación
    ├── repositories/
    │   └── i_evaluation_repository.ts  # Interface del repositorio
    └── use_case/
        └── evaluation_usecase.ts       # Casos de uso

app/evaluations/
├── index.tsx                           # Lista de evaluaciones del usuario
├── [id].tsx                            # Detalle de evaluación (compañeros)
├── create.tsx                          # Crear nueva evaluación
└── evaluate.tsx                        # Evaluar a un compañero
```

## Características

### Para Profesores
- **Crear evaluaciones**: Los profesores pueden crear evaluaciones para categorías específicas de sus cursos
- **Configurar visibilidad**: Elegir entre evaluaciones públicas o privadas
- **Gestionar evaluaciones**: Ver todas las evaluaciones creadas

### Para Estudiantes
- **Ver evaluaciones asignadas**: Lista de evaluaciones disponibles basadas en los grupos a los que pertenece
- **Evaluar compañeros**: Calificar a los compañeros de grupo en 4 dimensiones:
  - **Puntualidad**: Asistencia y puntualidad a sesiones
  - **Contribuciones**: Aportes al trabajo del equipo
  - **Compromiso**: Responsabilidad con tareas asignadas
  - **Actitud**: Disposición para colaborar

## Modelos

### Evaluation
```typescript
{
  name: string;              // Nombre de la evaluación
  categoryID: string;        // ID de la categoría
  evaluationID: string;      // ID único de la evaluación
  creationDate: string;      // Fecha de creación (ISO)
  visibility: string;        // "Publica" | "Privada"
}
```

### Score
```typescript
{
  punctuality: string;       // Calificación 1-5
  contributions: string;     // Calificación 1-5
  commitment: string;        // Calificación 1-5
  attitude: string;          // Calificación 1-5
}
```

## Navegación

### Rutas
- `/evaluations` - Lista de evaluaciones del usuario
- `/evaluations/[id]` - Detalle de evaluación con lista de compañeros
- `/evaluations/create?courseId=X` - Crear evaluación para un curso
- `/evaluations/evaluate` - Página de evaluación con sliders

### Parámetros
Los parámetros se pasan vía JSON serializado en los query params:
```typescript
router.push({
  pathname: '/evaluations/[id]' as any,
  params: {
    id: evaluation.evaluationID,
    evaluation: JSON.stringify(evaluation),
  },
});
```

## Uso

### Provider
El `EvaluationProvider` debe envolver la app en `_layout.tsx`:

```tsx
<EvaluationProvider>
  <App />
</EvaluationProvider>
```

### Hook
Usar el hook `useEvaluations()` para acceder al contexto:

```tsx
const {
  evaluations,
  getUserEvaluations,
  createEvaluation,
  submitScore,
} = useEvaluations();

// Cargar evaluaciones del usuario
await getUserEvaluations(userId);

// Crear evaluación
await createEvaluation({
  name: "Evaluación Final",
  categoryId: "cat_123",
  visibility: "Publica",
  creationDate: new Date().toISOString(),
});

// Enviar calificación
await submitScore({
  userId: "user_456",
  evaluationId: "eval_789",
  groupID: "group_012",
  categoryID: "cat_123",
  scores: {
    punctuality: "4.5",
    contributions: "4.0",
    commitment: "4.8",
    attitude: "5.0",
  },
});
```

## Integración con otros módulos

### Auth
- Usa `useAuthSession()` para obtener el usuario actual
- Requiere token de autenticación para todas las operaciones

### Categories
- Las evaluaciones se crean para categorías específicas
- Usa `useCategories()` para obtener categorías del curso

### Groups
- Obtiene los compañeros de grupo vía `useGroups().getAllGroups()`
- Filtra grupos por categoría para mostrar compañeros relevantes

### Core
- Usa `RefreshClient` para manejo automático de tokens
- Logs consistentes en todos los servicios

## API

### Endpoints usados
- `GET /read?tableName=Evaluations&categoryID=X` - Obtener evaluaciones por categoría
- `POST /insert` (Evaluations) - Crear evaluación
- `GET /read?tableName=EvaluationScore&...` - Obtener calificaciones
- `POST /insert` (EvaluationScore) - Enviar calificación
- `GET /read?tableName=GroupMember&userID=X` - Obtener grupos del usuario

### Database Tables
- **Evaluations**: name, categoryID, evaluationID, visibility, creationDate
- **EvaluationScore**: userID, evaluationID, groupID, categoryID, punctuality, contributions, commitment, attitude
- **GroupMember**: groupID, userID (para obtener grupos del usuario)
- **Group**: _id, categoryID (para obtener categoría del grupo)

## Logs

Todos los servicios incluyen logs detallados:
```
[EvaluationSourceService] getByCategoryID → cat_123
[EvaluationSourceService] getByCategoryID ← count 3
[EvaluationController] getUserEvaluations → user_456
[EvaluationController] getUserEvaluations ← count 5
```

## UI Components

### Sliders de Evaluación
Usa `@react-native-community/slider` para calificaciones de 1-5 con intervalos de 0.1:
- Muestra valor actual
- Rúbricas dinámicas que cambian según el valor
- Indicadores visuales con iconos

### Cards
- `EvaluationListCard`: Card compacto para listas y home
- Muestra nombre, ID y visibilidad
- Icono representativo con fondo de color

## Notas de Implementación

- **Duplicados**: `getUserEvaluations` elimina evaluaciones duplicadas por `evaluationID`
- **Validación**: Formularios validan campos requeridos antes de submit
- **Feedback**: Usa `Alert.alert()` para confirmaciones y errores
- **Navegación**: Usa `router.back()` después de operaciones exitosas
- **Estado de carga**: Estados `loading` y `submitting` para UX fluida

## Dependencias adicionales
```json
{
  "@react-native-community/slider": "^4.x",
  "@react-native-picker/picker": "^2.x"
}
```

Instaladas automáticamente durante la creación del módulo.
