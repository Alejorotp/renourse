# Groups Module

Módulo completo que replica la funcionalidad de grupos de Flutter en React Native, permitiendo la gestión de grupos dentro de categorías de cursos.

## Estructura

```
groups/
├── domain/
│   ├── models/
│   │   └── group.ts                    # Modelo de grupo
│   ├── repositories/
│   │   └── i_group_repository.ts       # Interfaz del repositorio
│   └── use_case/
│       └── group_usecase.ts            # Casos de uso de negocio
├── data/
│   ├── datasources/
│   │   ├── i_group_source.ts           # Interfaz del data source
│   │   └── remote/
│   │       └── group_source_service.ts # Servicio HTTP con RefreshClient
│   └── repositories/
│       └── group_repository.ts         # Implementación del repositorio
├── context/
│   └── group_context.tsx               # React Context Provider
└── controller/
    └── group_controller.ts             # Controlador de estado
```

## Características

### 1. Modelo de Grupo (Group)
```typescript
interface Group {
  id: string;
  memberIDs: string[];
  groupNumber: number;
  categoryID: string;
}
```

### 2. Funcionalidades

- **getAllGroups**: Obtener todos los grupos de una categoría
- **createGroup**: Crear un nuevo grupo
- **joinGroup**: Unirse a un grupo existente
- **removeMemberFromGroup**: Remover un miembro del grupo (solo profesores)
- **deleteGroup**: Eliminar un grupo
- **getUserGroups**: Obtener grupos de un usuario específico

### 3. Integración con Core

El módulo usa **RefreshClient** automáticamente para:
- Auto-refresh de tokens en peticiones 401
- Gestión centralizada de autenticación
- Manejo consistente de errores

```typescript
// En group_source_service.ts
private async get(url: string): Promise<Response> {
  const refreshClient = getRefreshClient();
  if (refreshClient) {
    return refreshClient.get(url); // ✅ Con auto-refresh
  }
  // Fallback a fetch directo
}
```

## Páginas

### 1. Lista de Grupos (`/app/groups/index.tsx`)

**Características:**
- ✅ SafeTop para evitar superposición con barra del sistema
- ✅ Lista de grupos filtrados por categoría
- ✅ Botón "Crear Grupo" (solo profesores con `canEdit=true`)
- ✅ Botón "Unirse" en cada grupo (solo estudiantes que no estén en un grupo)
- ✅ Indicador visual ✓ para el grupo actual del usuario
- ✅ Contador de miembros (X / maxMembers)
- ✅ Pull to refresh para actualizar lista

**Navegación:**
```typescript
// Desde categorías o curso detail
router.push({
  pathname: '/groups/index',
  params: {
    category: JSON.stringify(category),
    canEdit: String(canEdit),
    groupNumber: String(groupNumber),
  },
});
```

**UI:**
```
┌──────────────────────────────┐
│ Grupos de [Nombre Categoría] │
├──────────────────────────────┤
│ Lista de Grupos              │
│                              │
│ [Crear Grupo] (si profesor)  │
│                              │
│ ┌──────────────────────────┐ │
│ │ Grupo 1                  │ │
│ │ 3 / 5 miembros      [✓]  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ Grupo 2                  │ │
│ │ 2 / 5 miembros  [Unirse] │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

### 2. Detalle de Grupo (`/app/groups/[id].tsx`)

**Características:**
- ✅ SafeTop para evitar superposición con barra del sistema
- ✅ Lista de miembros con nombres reales (usando `getUserNameById`)
- ✅ Avatar placeholder para cada miembro
- ✅ Botón "Remover" por miembro (solo profesores)
- ✅ Confirmación antes de remover miembro
- ✅ Contador de miembros en header
- ✅ Auto-refresh después de remover miembro

**Navegación:**
```typescript
// Desde lista de grupos
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
```

**UI:**
```
┌──────────────────────────────┐
│ Grupo 1                      │
├──────────────────────────────┤
│ Miembros del Grupo           │
│ 3 / 5 miembros               │
│                              │
│ ┌──────────────────────────┐ │
│ │ 👤 Juan Pérez       [×]  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 👤 María García     [×]  │ │
│ └──────────────────────────┘ │
│ ┌──────────────────────────┐ │
│ │ 👤 Carlos López     [×]  │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

## Context API

### GroupProvider

Envuelve la aplicación y proporciona acceso global al estado de grupos:

```typescript
// app/_layout.tsx
<AuthProvider>
  <CourseProvider>
    <GroupProvider>
      <App />
    </GroupProvider>
  </CourseProvider>
</AuthProvider>
```

### useGroups Hook

```typescript
import { useGroups } from '@/groups/context/group_context';

function MyComponent() {
  const {
    groups,           // Lista de grupos actual
    userGroups,       // Grupos del usuario actual
    getAllGroups,     // Cargar grupos de una categoría
    createGroup,      // Crear nuevo grupo
    joinGroup,        // Unirse a grupo
    removeMemberFromGroup, // Remover miembro
    deleteGroup,      // Eliminar grupo
    getGroupById,     // Obtener grupo por ID
    loadUserGroups,   // Cargar grupos del usuario
  } = useGroups();

  // Uso
  useEffect(() => {
    getAllGroups(categoryId);
  }, [categoryId]);
}
```

## Utilidades Compartidas

### getUserNameById (shared/utils/user_utils.ts)

Función helper para obtener nombres de usuario desde la API:

```typescript
import { getUserNameById } from '@/shared/utils/user_utils';

const memberName = await getUserNameById(userId);
// "Juan Pérez" o "Usuario Desconocido"
```

**Características:**
- ✅ Usa RefreshClient para auto-refresh
- ✅ Manejo de errores con fallback
- ✅ Cache en componente para evitar múltiples requests

## Flujos de Usuario

### Estudiante

1. **Ver grupos disponibles**
   - Navega a categoría → Ver grupos
   - Ve lista de grupos con contador de miembros

2. **Unirse a un grupo**
   - Click en botón "Unirse" de un grupo no lleno
   - API valida capacidad del grupo
   - Se añade a la lista de miembros
   - Lista se actualiza mostrando ✓

3. **Ver miembros de su grupo**
   - Click en card del grupo
   - Ve lista de compañeros con nombres

### Profesor

1. **Crear grupos**
   - Navega a categoría → Ver grupos
   - Click en "Crear Grupo"
   - Se genera grupo con número automático

2. **Gestionar miembros**
   - Entra al detalle de cualquier grupo
   - Ve botón [×] en cada miembro
   - Click en [×] → Confirmación → Remoción

3. **Ver distribución**
   - Ve lista completa de grupos
   - Contador de miembros por grupo
   - Puede entrar a cualquier grupo

## Endpoints API

Todos usan la base: `https://roble-api.openlab.uninorte.edu.co/database/flourse_460df99409`

| Operación | Tabla | Endpoint |
|-----------|-------|----------|
| Listar grupos | Group | `GET /read?tableName=Group&categoryID={id}` |
| Crear grupo | Group | `POST /insert` |
| Miembros del grupo | GroupMember | `GET /read?tableName=GroupMember&groupID={id}` |
| Unirse a grupo | GroupMember | `POST /insert` |
| Remover miembro | GroupMember | `DELETE /delete` |
| Grupos del usuario | GroupMember | `GET /read?tableName=GroupMember&userID={id}` |

## Estilos y Tema

### Colores
- **Botón crear**: `#B794F6` (lilac)
- **Botón unirse**: `#4ECDC4` (turquoise)
- **Indicador miembro**: `#4CAF50` (green)
- **Botón remover**: `#f44336` (red)

### Componentes
- Cards con borde sutil (`#e0e0e0`)
- Fondo de cards: `#f9f9f9`
- Typography: SF Pro / System Font
- Icons: Ionicons

## Testing

Para probar el módulo:

1. Crear categoría en un curso
2. Como profesor:
   - Crear varios grupos
   - Ver lista de grupos vacíos
   - Remover miembros después de que se unan

3. Como estudiante:
   - Ver grupos disponibles
   - Unirse a un grupo
   - Verificar que no pueda unirse a otro
   - Ver miembros de su grupo

## Notas de Implementación

- **groupNumber**: Actualmente se pasa como parámetro pero podría calcularse automáticamente
- **maxMembers**: Se obtiene de la categoría asociada
- **Validación de capacidad**: Se hace en el cliente mostrando/ocultando botón "Unirse"
- **Concurrencia**: No hay validación server-side de capacidad máxima
- **Cache**: No hay cache persistente, se recarga en cada navegación

## Diferencias con Flutter

✅ **Paridad completa** en funcionalidad
✅ **Mismo flujo** de usuario
✅ **Mismos endpoints** de API
✅ **SafeTop** añadido para mejor UX en React Native
✅ **RefreshClient** integrado (mejora vs Flutter)

## Mejoras Futuras

- [ ] Cache local de grupos con AsyncStorage
- [ ] Validación server-side de capacidad máxima
- [ ] Notificaciones push cuando alguien se une/sale
- [ ] Algoritmo de auto-asignación de grupos
- [ ] Export/import de grupos
