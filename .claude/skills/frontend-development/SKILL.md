---
name: frontend-development
description: |
  Frontend patterns: State, API, Types, Hooks, Forms, Routing.
---

# Frontend Development

Skill para implementação de Frontend seguindo padrões do projeto.

**Use para:** Pages, Hooks, State, Types, API integration, Forms, Routing
**Não use para:** UI/Design (ux-design), Backend (backend-development)

**Referência:** Sempre consultar `CLAUDE.md` para padrões gerais do projeto.

---

## Structure

```
apps/frontend/src/
├── pages/[page-name].tsx
├── components/
│   ├── features/[feature]/[Component].tsx
│   └── ui/[component].tsx
├── hooks/use-[feature].ts
├── stores/[feature]-store.ts
├── types/index.ts
├── lib/api.ts
└── routes.tsx
```

---

## Types (Mirror Backend DTOs)

{"location":"apps/frontend/src/types/index.ts"}

```typescript
// Backend DTO → Frontend Interface
// Date → string (JSON serialization)
// Enum → union type (no backend import)

export interface User {
  id: string;
  email: string;
  role: 'owner' | 'admin' | 'member';  // NOT enum import
  createdAt: string;  // NOT Date
}
```

{"rules":["interfaces not classes","Date→string","Enum→union type","no @fnd/domain imports","sync with backend DTOs"]}

---

## Hooks (Data Fetching)

{"location":"apps/frontend/src/hooks/use-[feature].ts"}

```typescript
// Query hook
export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => api.get<User[]>('/users').then(r => r.data),
  });
}

// Single resource
export function useUser(id: string) {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => api.get<User>(`/users/${id}`).then(r => r.data),
    enabled: !!id,
  });
}

// Mutation
export function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateUserRequest) =>
      api.post<User>('/users', data).then(r => r.data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}
```

{"patterns":["queryKey consistent","enabled for conditional","invalidate on mutation","return mutation not wrapped"]}

---

## State Management

{"location":"apps/frontend/src/stores/[feature]-store.ts"}

```typescript
interface UIState {
  sidebarOpen: boolean;
  selectedUserId: string | null;
  toggleSidebar: () => void;
  selectUser: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  selectedUserId: null,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  selectUser: (id) => set({ selectedUserId: id }),
}));
```

{"useLocalState":["UI state","modal/sidebar toggles","selections","filters"]}
{"useServerState":["server data","CRUD operations","cache management"]}

---

## API Integration

{"location":"apps/frontend/src/lib/api.ts"}

```typescript
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// Auth interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

{"rules":["use api instance","baseURL from env","interceptors for auth"]}

---

## Forms

```typescript
const schema = z.object({
  email: z.string().email('Email inválido'),
  name: z.string().min(2, 'Mínimo 2 caracteres'),
  role: z.enum(['owner', 'admin', 'member']).optional(),
});

type FormData = z.infer<typeof schema>;

export function UserForm({ onSubmit }: { onSubmit: (data: FormData) => void }) {
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', name: '' },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Input {...form.register('email')} />
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
    </form>
  );
}
```

{"patterns":["schema mirrors DTO","typed FormData","error messages in PT-BR"]}

---

## Pages

{"location":"apps/frontend/src/pages/[page-name].tsx"}

```typescript
export function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const deleteUser = useDeleteUser();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Usuários</h1>
      <DataTable
        columns={columns}
        data={users ?? []}
        onDelete={(id) => deleteUser.mutate(id)}
      />
    </div>
  );
}
```

{"patterns":["hooks at top","loading/error states","container layout","data ?? [] fallback"]}

---

## Routing

{"location":"apps/frontend/src/routes.tsx"}

```typescript
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'users',
        element: <ProtectedRoute><UsersPage /></ProtectedRoute>,
      },
      { path: 'users/:id', element: <UserDetailPage /> },
    ],
  },
]);
```

{"patterns":["nested routes","ProtectedRoute wrapper","dynamic :id params"]}

---

## Auth Store

{"location":"apps/frontend/src/stores/auth-store.ts"}

```typescript
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
      get isAuthenticated() { return !!get().token; },
    }),
    { name: 'auth-storage' }
  )
);
```

---

## Component Organization

```
components/
├── features/[feature]/
│   ├── [feature]-card.tsx
│   ├── [feature]-form.tsx
│   ├── [feature]-table.tsx
│   └── columns.tsx
├── ui/ (design system)
└── layout/ (header, sidebar, footer)
```

---

## Checklist

{"types":["interfaces in types/","Date→string","Enum→union","sync with backend"]}
{"hooks":["use-[feature].ts naming","queryKey consistent","invalidate on mutation"]}
{"state":["local state for UI","server state for data"]}
{"forms":["schema validation","typed FormData","PT-BR messages"]}
{"pages":["loading/error states","container layout","hooks at top"]}
{"routing":["ProtectedRoute","nested routes","dynamic params"]}
{"build":["npm run build -w @fnd/frontend"]}
