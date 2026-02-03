# Guide d'Optimisation des Performances

## 🎯 Objectifs de Performance

- **First Contentful Paint (FCP)**: < 1.8s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Time to Interactive (TTI)**: < 3.8s
- **Total Blocking Time (TBT)**: < 300ms
- **Cumulative Layout Shift (CLS)**: < 0.1

---

## 🛠️ Outils Disponibles

### 1. Performance Utilities

Fichier: `frontend/src/utils/performance.ts`

#### Debounce

Limite la fréquence d'exécution d'une fonction:

```typescript
import { debounce } from "@/utils/performance";

const handleSearch = debounce((query: string) => {
  // Search logic
}, 300);
```

#### Throttle

Limite l'exécution à une fois par intervalle:

```typescript
import { throttle } from "@/utils/performance";

const handleScroll = throttle(() => {
  // Scroll logic
}, 100);
```

#### Memoization

Cache les résultats de calculs coûteux:

```typescript
import { memoize } from "@/utils/performance";

const expensiveCalculation = memoize((x: number, y: number) => {
  // Complex calculation
  return result;
});
```

#### Deep Equality

Compare des objets/tableaux en profondeur:

```typescript
import { deepEqual } from "@/utils/performance";

if (deepEqual(oldState, newState)) {
  // States are equal
}
```

#### Lazy Image Loading

Charge les images quand elles sont visibles:

```typescript
import { useLazyImage } from "@/utils/performance";

function ImageComponent() {
  const { ref, isVisible } = useLazyImage();

  return (
    <img
      ref={ref}
      src={isVisible ? actualSrc : placeholderSrc}
      alt="Description"
    />
  );
}
```

#### Virtual Scrolling

Pour les longues listes (1000+ items):

```typescript
import { useVirtualScroll } from "@/utils/performance";

function LargeList({ items }: { items: Task[] }) {
  const { visibleItems, totalHeight, offsetY, handleScroll } = useVirtualScroll(
    items,
    50, // item height
    600  // container height
  );

  return (
    <div style={{ height: 600, overflow: "auto" }} onScroll={handleScroll}>
      <div style={{ height: totalHeight, position: "relative" }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map(item => (
            <TaskItem key={item.id} task={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### 2. React Query

Fichier: `frontend/src/lib/queryClient.ts`

#### Configuration Optimale

```typescript
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app */}
    </QueryClientProvider>
  );
}
```

#### Query Keys Standardisés

```typescript
import { queryKeys } from "@/lib/queryClient";

// Tasks
queryKeys.tasks.all; // ['tasks']
queryKeys.tasks.list({ status: "pending" }); // ['tasks', 'list', { status: 'pending' }]
queryKeys.tasks.detail("task-id"); // ['tasks', 'detail', 'task-id']

// Staff
queryKeys.staff.all; // ['staff']
queryKeys.staff.list({}); // ['staff', 'list', {}]
```

#### Utilisation avec useQuery

```typescript
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

function useTasks(filters: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks.list(filters),
    queryFn: () => fetchTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

#### Mutations avec Optimistic Updates

```typescript
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryClient";

function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (task: Task) => updateTask(task),
    onMutate: async updatedTask => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(queryKeys.tasks.all);

      // Optimistically update
      queryClient.setQueryData(queryKeys.tasks.detail(updatedTask.id), updatedTask);

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      queryClient.setQueryData(queryKeys.tasks.all, context?.previousTasks);
    },
    onSettled: () => {
      // Refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
}
```

---

### 3. Debounce Hook

Fichier: `frontend/src/hooks/useDebounce.ts`

```typescript
import { useDebounce } from "@/hooks/useDebounce";

function SearchComponent() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 300);

  // This effect only runs when debouncedQuery changes
  useEffect(() => {
    if (debouncedQuery) {
      performSearch(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

---

## 🚀 Optimisations React

### 1. React.memo

Évite les re-renders inutiles:

```typescript
import { memo } from "react";

const TaskItem = memo(function TaskItem({ task }: { task: Task }) {
  return <div>{task.title}</div>;
});
```

### 2. useMemo

Cache les calculs coûteux:

```typescript
import { useMemo } from "react";

function TaskList({ tasks }: { tasks: Task[] }) {
  const sortedTasks = useMemo(() => {
    return tasks.sort((a, b) => a.priority - b.priority);
  }, [tasks]);

  return <>{sortedTasks.map(task => <TaskItem key={task.id} task={task} />)}</>;
}
```

### 3. useCallback

Stabilise les références de fonctions:

```typescript
import { useCallback } from "react";

function TaskList({ onTaskClick }: { onTaskClick: (id: string) => void }) {
  const handleClick = useCallback(
    (id: string) => {
      onTaskClick(id);
    },
    [onTaskClick]
  );

  return <>{/* Use handleClick */}</>;
}
```

### 4. Code Splitting avec React.lazy

```typescript
import { lazy, Suspense } from "react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const HeavyComponent = lazy(() => import("./HeavyComponent"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

## 📦 Optimisation du Bundle

### Analyser le Bundle

```bash
npm run build:analyze
```

Cela génère un fichier `dist/stats.html` avec la visualisation du bundle.

### Configuration Vite Optimale

Fichier: `frontend/vite.config.ts`

- **Manual Chunks**: Sépare vendors et utilities
- **Terser**: Minification avec suppression des console.logs
- **Source Maps**: Activés pour debug production
- **Tree Shaking**: Automatique avec ESM

### Optimisation des Imports

❌ **Mauvais**:

```typescript
import _ from "lodash";
```

✅ **Bon**:

```typescript
import debounce from "lodash/debounce";
```

---

## 🎭 Lazy Loading

### Images

```typescript
<img
  loading="lazy"
  src={imageSrc}
  alt="Description"
/>
```

### Routes (avec React Router)

```typescript
import { lazy } from "react";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));

// Use in routes...
```

### Composants

```typescript
const Map = lazy(() => import("./components/Map"));

// Only load map when needed
{showMap && (
  <Suspense fallback={<LoadingSpinner />}>
    <Map />
  </Suspense>
)}
```

---

## 📊 Monitoring des Performances

### Web Vitals

Utiliser `web-vitals` pour mesurer:

```typescript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from "web-vitals";

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Performance API

```typescript
// Measure component render time
const startTime = performance.now();
// Component render
const endTime = performance.now();
console.log(`Render time: ${endTime - startTime}ms`);

// Mark important moments
performance.mark("data-fetch-start");
// Fetch data
performance.mark("data-fetch-end");
performance.measure("data-fetch", "data-fetch-start", "data-fetch-end");
```

### React DevTools Profiler

1. Installer React DevTools extension
2. Onglet "Profiler"
3. Enregistrer une session
4. Analyser les renders coûteux

---

## ✅ Checklist d'Optimisation

### Frontend

- [ ] Utiliser React.memo pour composants purs
- [ ] Implémenter useMemo pour calculs coûteux
- [ ] useCallback pour fonctions passées en props
- [ ] Lazy loading pour routes et composants lourds
- [ ] Debounce pour inputs et recherche
- [ ] Virtual scrolling pour listes > 100 items
- [ ] React Query pour gestion du cache
- [ ] Code splitting avec chunks manuels
- [ ] Images lazy loaded
- [ ] Supprimer console.logs en production

### Backend

- [ ] Pagination pour listes
- [ ] Cache avec Redis (optionnel)
- [ ] Compression Gzip/Brotli
- [ ] CDN pour assets statiques
- [ ] Connection pooling pour DB
- [ ] Index sur colonnes fréquemment requêtées
- [ ] Rate limiting (déjà fait ✅)
- [ ] Logging structuré (déjà fait ✅)

### Build

- [ ] Tree shaking activé
- [ ] Minification terser
- [ ] Source maps pour production
- [ ] Analyse du bundle régulière
- [ ] CSS purgé (Tailwind)
- [ ] Compression assets

---

## 🎯 Résultats Attendus

Après optimisations:

- **Bundle size**: < 300kb (gzipped)
- **Initial load**: < 2s (3G)
- **Time to Interactive**: < 3s
- **Render time**: < 16ms par frame (60fps)
- **API responses**: < 200ms (P95)

---

## 📚 Ressources

- [Web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)
- [Vite Performance](https://vitejs.dev/guide/performance.html)
- [React Query Docs](https://tanstack.com/query/latest)
