# Wishlist de Casal - Plano de Implementacao

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar a lista de desejos atual (HTML puro + localStorage) em um app Next.js com Supabase, onde um casal troca wishlists com login Google, categorias, favoritos e status de compra.

**Architecture:** Next.js 14 App Router com Server Components e Server Actions para mutacoes. Supabase como BaaS (auth + PostgreSQL com RLS). CSS Modules para estilizacao mobile-first com tema romantico pastel.

**Tech Stack:** Next.js 14, TypeScript, Supabase (Auth + PostgreSQL), CSS Modules, Vercel

---

## Estrutura de Arquivos

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonte Nunito, metadata, Supabase provider)
│   ├── page.tsx                # Redirect: logado -> /lista, nao logado -> /login
│   ├── globals.css             # Design tokens, reset, tema pastel
│   ├── login/
│   │   └── page.tsx            # Tela de login com Google
│   ├── lista/
│   │   ├── layout.tsx          # Layout com abas (Minha Lista / Lista do parceiro)
│   │   ├── page.tsx            # Redirect para /lista/minha
│   │   ├── minha/
│   │   │   └── page.tsx        # Lista editavel do usuario logado
│   │   └── parceiro/
│   │       └── page.tsx        # Lista somente leitura do parceiro
│   └── auth/
│       └── callback/
│           └── route.ts        # Callback do OAuth Google
├── components/
│   ├── ItemCard.tsx             # Card de item (nome, link, categoria, favorito, comprado)
│   ├── ItemCard.module.css
│   ├── ItemForm.tsx             # Modal/form para adicionar/editar item
│   ├── ItemForm.module.css
│   ├── ItemList.tsx             # Lista de items com separacao comprados/nao comprados
│   ├── ItemList.module.css
│   ├── CategoryFilter.tsx       # Chips de categoria para filtrar
│   ├── CategoryFilter.module.css
│   ├── CategoryManager.tsx      # Modal para criar/editar/deletar categorias
│   ├── CategoryManager.module.css
│   ├── TabNav.tsx               # Abas "Minha Lista" / "Lista dele(a)"
│   ├── TabNav.module.css
│   ├── Fab.tsx                  # Botao flutuante "+"
│   ├── Fab.module.css
│   ├── LoginButton.tsx          # Botao "Entrar com Google"
│   └── LoginButton.module.css
├── lib/
│   ├── supabase-server.ts       # Client Supabase para Server Components
│   ├── supabase-browser.ts      # Client Supabase para Client Components
│   ├── auth.ts                  # Helpers de autenticacao (getUser, isAuthorized)
│   └── actions.ts               # Server Actions (CRUD de items e categorias)
└── types/
    └── index.ts                 # Tipos TypeScript (Item, Category, User)

supabase/
└── migrations/
    └── 001_initial_schema.sql   # Tabelas + RLS policies
```

---

### Task 1: Scaffold Next.js + Supabase

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.env.local.example`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `src/types/index.ts`
- Create: `src/lib/supabase-server.ts`, `src/lib/supabase-browser.ts`
- Delete: `index.html`, `todo.js`, `todo.css`

- [ ] **Step 1: Inicializar projeto Next.js**

```bash
cd C:/Users/breno/projetos/listadepresentess
npx create-next-app@14 . --typescript --app --src-dir --no-tailwind --no-eslint --import-alias "@/*" --use-npm
```

Se perguntar sobre sobrescrever arquivos, aceitar. Os arquivos antigos (index.html, todo.js, todo.css) serao removidos manualmente.

- [ ] **Step 2: Instalar dependencias**

```bash
npm install @supabase/supabase-js @supabase/ssr
```

- [ ] **Step 3: Remover arquivos antigos**

```bash
rm -f index.html todo.js todo.css
```

- [ ] **Step 4: Criar .env.local.example**

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
AUTHORIZED_EMAILS=email1@gmail.com,email2@gmail.com
```

- [ ] **Step 5: Criar tipos TypeScript**

```typescript
// src/types/index.ts

export interface Profile {
  id: string
  email: string
  name: string
  avatar_url: string
  created_at: string
}

export interface Category {
  id: string
  user_id: string
  name: string
  created_at: string
}

export interface Item {
  id: string
  user_id: string
  category_id: string | null
  name: string
  url: string | null
  is_favorite: boolean
  is_purchased: boolean
  created_at: string
  category?: Category
}
```

- [ ] **Step 6: Criar Supabase clients**

```typescript
// src/lib/supabase-server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )
}
```

```typescript
// src/lib/supabase-browser.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 7: Criar design tokens e CSS global**

```css
/* src/app/globals.css */
@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700&display=swap');

:root {
  --color-bg: #FFF5F7;
  --color-primary: #F472B6;
  --color-secondary: #E9D5FF;
  --color-text: #374151;
  --color-text-light: #9CA3AF;
  --color-accent: #EC4899;
  --color-white: #FFFFFF;
  --color-card-shadow: rgba(244, 114, 182, 0.1);
  --color-purchased-opacity: 0.5;
  --radius-card: 12px;
  --radius-chip: 20px;
  --radius-button: 8px;
  --touch-target: 44px;
  --max-width: 480px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Nunito', sans-serif;
  background-color: var(--color-bg);
  color: var(--color-text);
  min-height: 100dvh;
}

a {
  color: var(--color-primary);
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}

button {
  font-family: inherit;
  cursor: pointer;
}

input, select, textarea {
  font-family: inherit;
  font-size: 1rem;
}
```

- [ ] **Step 8: Criar root layout**

```tsx
// src/app/layout.tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Lista de Presentes',
  description: 'Wishlist de casal',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 9: Criar page raiz com redirect**

```tsx
// src/app/page.tsx
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase-server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/lista')
  } else {
    redirect('/login')
  }
}
```

- [ ] **Step 10: Verificar que o app inicia**

```bash
npm run dev
```

Esperado: app abre em localhost:3000, redireciona para /login (404 por enquanto, ok).

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "inicio do projeto com next.js e supabase"
```

---

### Task 2: Banco de Dados (Supabase Migration)

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Criar migration SQL**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Tabela de perfis (sincronizada com Supabase Auth)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null unique,
  name text not null default '',
  avatar_url text not null default '',
  created_at timestamptz not null default now()
);

-- Tabela de categorias
create table public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  created_at timestamptz not null default now(),
  unique(user_id, name)
);

-- Tabela de itens
create table public.items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  url text,
  is_favorite boolean not null default false,
  is_purchased boolean not null default false,
  created_at timestamptz not null default now()
);

-- Indices
create index idx_items_user_id on public.items(user_id);
create index idx_categories_user_id on public.categories(user_id);

-- RLS: Profiles
alter table public.profiles enable row level security;

create policy "Usuarios autorizados podem ver todos os perfis"
  on public.profiles for select
  using (auth.uid() is not null);

create policy "Usuario pode editar seu proprio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS: Categories
alter table public.categories enable row level security;

create policy "Usuarios autorizados podem ver todas as categorias"
  on public.categories for select
  using (auth.uid() is not null);

create policy "Usuario pode criar suas categorias"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Usuario pode editar suas categorias"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Usuario pode deletar suas categorias"
  on public.categories for delete
  using (auth.uid() = user_id);

-- RLS: Items
alter table public.items enable row level security;

create policy "Usuarios autorizados podem ver todos os itens"
  on public.items for select
  using (auth.uid() is not null);

create policy "Usuario pode criar seus itens"
  on public.items for insert
  with check (auth.uid() = user_id);

create policy "Usuario pode editar seus itens"
  on public.items for update
  using (auth.uid() = user_id);

create policy "Usuario pode deletar seus itens"
  on public.items for delete
  using (auth.uid() = user_id);

-- Trigger: criar perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

- [ ] **Step 2: Aplicar migration no Supabase**

Ir no Supabase Dashboard > SQL Editor > colar e executar o SQL acima.

- [ ] **Step 3: Configurar Google OAuth no Supabase**

1. Supabase Dashboard > Authentication > Providers > Google > Enable
2. Google Cloud Console > APIs & Services > Credentials > Create OAuth 2.0 Client ID
3. Redirect URI: `https://<seu-projeto>.supabase.co/auth/v1/callback`
4. Copiar Client ID e Client Secret para o Supabase

- [ ] **Step 4: Preencher .env.local**

Criar arquivo `.env.local` baseado no `.env.local.example` com os valores reais do Supabase.

- [ ] **Step 5: Commit**

```bash
git add supabase/
git commit -m "esquema do banco de dados com tabelas e seguranca"
```

---

### Task 3: Autenticacao (Login com Google)

**Files:**
- Create: `src/app/auth/callback/route.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/components/LoginButton.tsx`
- Create: `src/components/LoginButton.module.css`
- Create: `src/lib/auth.ts`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Criar helper de auth**

```typescript
// src/lib/auth.ts
import { createClient } from './supabase-server'
import { redirect } from 'next/navigation'

const AUTHORIZED_EMAILS = (process.env.AUTHORIZED_EMAILS ?? '').split(',').map(e => e.trim())

export async function getUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function requireAuth() {
  const user = await getUser()
  if (!user) redirect('/login')
  if (!AUTHORIZED_EMAILS.includes(user.email ?? '')) {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login?error=nao-autorizado')
  }
  return user
}

export async function getPartnerEmail(currentEmail: string) {
  const partner = AUTHORIZED_EMAILS.find(e => e !== currentEmail)
  return partner ?? null
}
```

- [ ] **Step 2: Criar callback route**

```typescript
// src/app/auth/callback/route.ts
import { createClient } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(`${origin}/lista`)
}
```

- [ ] **Step 3: Criar LoginButton**

```tsx
// src/components/LoginButton.tsx
'use client'

import { createClient } from '@/lib/supabase-browser'
import styles from './LoginButton.module.css'

export default function LoginButton() {
  const handleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <button onClick={handleLogin} className={styles.button}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Entrar com Google
    </button>
  )
}
```

- [ ] **Step 4: Estilizar LoginButton**

```css
/* src/components/LoginButton.module.css */
.button {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  background: var(--color-white);
  color: var(--color-text);
  border: 2px solid var(--color-primary);
  border-radius: var(--radius-card);
  font-size: 1rem;
  font-weight: 600;
  min-height: var(--touch-target);
  transition: background 0.2s, transform 0.1s;
}

.button:hover {
  background: var(--color-bg);
}

.button:active {
  transform: scale(0.98);
}
```

- [ ] **Step 5: Criar pagina de login**

```tsx
// src/app/login/page.tsx
import LoginButton from '@/components/LoginButton'

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  return (
    <main style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100dvh',
      padding: '20px',
      textAlign: 'center',
    }}>
      <h1 style={{
        fontSize: '2rem',
        color: 'var(--color-primary)',
        marginBottom: '8px',
      }}>
        Lista de Presentes
      </h1>
      <p style={{
        color: 'var(--color-text-light)',
        marginBottom: '32px',
        fontSize: '1.1rem',
      }}>
        Wishlist de casal
      </p>
      {searchParams.error === 'nao-autorizado' && (
        <p style={{
          color: '#EF4444',
          marginBottom: '16px',
          fontSize: '0.9rem',
        }}>
          Esse email nao tem acesso. Use o email autorizado.
        </p>
      )}
      <LoginButton />
    </main>
  )
}
```

- [ ] **Step 6: Testar login manualmente**

```bash
npm run dev
```

1. Abrir localhost:3000 -> redireciona para /login
2. Clicar "Entrar com Google" -> redireciona para Google
3. Logar com email autorizado -> redireciona para /lista (404 por enquanto, ok)
4. Logar com email nao autorizado -> redireciona para /login com erro

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "login com google e validacao de emails"
```

---

### Task 4: Server Actions (CRUD)

**Files:**
- Create: `src/lib/actions.ts`

- [ ] **Step 1: Criar server actions para items**

```typescript
// src/lib/actions.ts
'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from './supabase-server'
import { requireAuth } from './auth'

// --- ITEMS ---

export async function addItem(formData: FormData) {
  const user = await requireAuth()
  const supabase = await createClient()

  const name = formData.get('name') as string
  const url = (formData.get('url') as string) || null
  const categoryId = (formData.get('categoryId') as string) || null

  if (!name?.trim()) return { error: 'Nome e obrigatorio' }

  const { error } = await supabase.from('items').insert({
    user_id: user.id,
    name: name.trim(),
    url: url?.trim() || null,
    category_id: categoryId || null,
    is_favorite: false,
    is_purchased: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function updateItem(id: string, data: {
  name?: string
  url?: string | null
  category_id?: string | null
}) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase.from('items').update(data).eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function deleteItem(id: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase.from('items').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function toggleFavorite(id: string, isFavorite: boolean) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('items')
    .update({ is_favorite: isFavorite })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function togglePurchased(id: string, isPurchased: boolean) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase
    .from('items')
    .update({ is_purchased: isPurchased })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

// --- CATEGORIES ---

export async function addCategory(name: string) {
  const user = await requireAuth()
  const supabase = await createClient()

  if (!name?.trim()) return { error: 'Nome e obrigatorio' }

  const { error } = await supabase.from('categories').insert({
    user_id: user.id,
    name: name.trim(),
  })

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}

export async function deleteCategory(id: string) {
  await requireAuth()
  const supabase = await createClient()

  const { error } = await supabase.from('categories').delete().eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/lista')
  return { success: true }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/actions.ts
git commit -m "acoes do servidor para gerenciar itens e categorias"
```

---

### Task 5: Componentes de UI

**Files:**
- Create: `src/components/TabNav.tsx`, `src/components/TabNav.module.css`
- Create: `src/components/ItemCard.tsx`, `src/components/ItemCard.module.css`
- Create: `src/components/ItemList.tsx`, `src/components/ItemList.module.css`
- Create: `src/components/CategoryFilter.tsx`, `src/components/CategoryFilter.module.css`
- Create: `src/components/Fab.tsx`, `src/components/Fab.module.css`

- [ ] **Step 1: Criar TabNav**

```tsx
// src/components/TabNav.tsx
'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import styles from './TabNav.module.css'

interface TabNavProps {
  partnerName: string
}

export default function TabNav({ partnerName }: TabNavProps) {
  const pathname = usePathname()

  return (
    <nav className={styles.nav}>
      <Link
        href="/lista/minha"
        className={`${styles.tab} ${pathname === '/lista/minha' ? styles.active : ''}`}
      >
        Minha Lista
      </Link>
      <Link
        href="/lista/parceiro"
        className={`${styles.tab} ${pathname === '/lista/parceiro' ? styles.active : ''}`}
      >
        Lista de {partnerName}
      </Link>
    </nav>
  )
}
```

- [ ] **Step 2: Estilizar TabNav**

```css
/* src/components/TabNav.module.css */
.nav {
  display: flex;
  background: var(--color-white);
  border-radius: var(--radius-card);
  padding: 4px;
  gap: 4px;
  box-shadow: 0 2px 8px var(--color-card-shadow);
}

.tab {
  flex: 1;
  text-align: center;
  padding: 12px 16px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  color: var(--color-text-light);
  text-decoration: none;
  transition: all 0.2s;
  min-height: var(--touch-target);
  display: flex;
  align-items: center;
  justify-content: center;
}

.active {
  background: var(--color-primary);
  color: var(--color-white);
}
```

- [ ] **Step 3: Criar ItemCard**

```tsx
// src/components/ItemCard.tsx
'use client'

import { Item } from '@/types'
import { toggleFavorite, togglePurchased, deleteItem } from '@/lib/actions'
import styles from './ItemCard.module.css'

interface ItemCardProps {
  item: Item
  editable: boolean
}

export default function ItemCard({ item, editable }: ItemCardProps) {
  const cardClass = `${styles.card} ${item.is_favorite ? styles.favorite : ''} ${item.is_purchased ? styles.purchased : ''}`

  return (
    <div className={cardClass}>
      <div className={styles.content}>
        <div className={styles.header}>
          {item.url ? (
            <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.name}>
              {item.name}
            </a>
          ) : (
            <span className={styles.name}>{item.name}</span>
          )}
          {editable && (
            <button
              className={styles.favoriteBtn}
              onClick={() => toggleFavorite(item.id, !item.is_favorite)}
              aria-label={item.is_favorite ? 'Remover favorito' : 'Favoritar'}
            >
              {item.is_favorite ? '♥' : '♡'}
            </button>
          )}
          {!editable && item.is_favorite && (
            <span className={styles.favoriteIcon}>♥</span>
          )}
        </div>
        {item.category && (
          <span className={styles.categoryChip}>{item.category.name}</span>
        )}
      </div>
      {editable && (
        <div className={styles.actions}>
          <button
            className={styles.purchasedBtn}
            onClick={() => togglePurchased(item.id, !item.is_purchased)}
          >
            {item.is_purchased ? 'Desmarcar' : 'Comprado'}
          </button>
          <button
            className={styles.deleteBtn}
            onClick={() => deleteItem(item.id)}
            aria-label="Remover item"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Estilizar ItemCard**

```css
/* src/components/ItemCard.module.css */
.card {
  background: var(--color-white);
  border-radius: var(--radius-card);
  padding: 16px;
  box-shadow: 0 2px 8px var(--color-card-shadow);
  transition: transform 0.1s, opacity 0.2s;
}

.card:active {
  transform: scale(0.99);
}

.favorite {
  border: 2px solid var(--color-primary);
}

.purchased {
  opacity: var(--color-purchased-opacity);
}

.purchased .name {
  text-decoration: line-through;
}

.content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.name {
  font-weight: 600;
  font-size: 1rem;
  flex: 1;
  word-break: break-word;
}

a.name {
  color: var(--color-primary);
}

a.name:hover {
  text-decoration: underline;
}

.favoriteBtn,
.favoriteIcon {
  font-size: 1.4rem;
  color: var(--color-accent);
  background: none;
  border: none;
  min-width: var(--touch-target);
  min-height: var(--touch-target);
  display: flex;
  align-items: center;
  justify-content: center;
}

.categoryChip {
  display: inline-block;
  background: var(--color-secondary);
  color: var(--color-text);
  padding: 4px 12px;
  border-radius: var(--radius-chip);
  font-size: 0.8rem;
  font-weight: 600;
  width: fit-content;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #F3F4F6;
}

.purchasedBtn {
  padding: 8px 16px;
  background: var(--color-secondary);
  color: var(--color-text);
  border: none;
  border-radius: var(--radius-button);
  font-size: 0.85rem;
  font-weight: 600;
  min-height: var(--touch-target);
}

.deleteBtn {
  padding: 8px 12px;
  background: none;
  color: var(--color-text-light);
  border: 1px solid #E5E7EB;
  border-radius: var(--radius-button);
  font-size: 1rem;
  min-width: var(--touch-target);
  min-height: var(--touch-target);
}
```

- [ ] **Step 5: Criar ItemList**

```tsx
// src/components/ItemList.tsx
import { Item } from '@/types'
import ItemCard from './ItemCard'
import styles from './ItemList.module.css'

interface ItemListProps {
  items: Item[]
  editable: boolean
}

export default function ItemList({ items, editable }: ItemListProps) {
  const active = items.filter(i => !i.is_purchased)
  const purchased = items.filter(i => i.is_purchased)

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <p>{editable ? 'Sua lista esta vazia. Adicione um presente!' : 'Nenhum item na lista ainda.'}</p>
      </div>
    )
  }

  return (
    <div className={styles.list}>
      {active.map(item => (
        <ItemCard key={item.id} item={item} editable={editable} />
      ))}
      {purchased.length > 0 && (
        <>
          <p className={styles.sectionTitle}>Comprados</p>
          {purchased.map(item => (
            <ItemCard key={item.id} item={item} editable={editable} />
          ))}
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Estilizar ItemList**

```css
/* src/components/ItemList.module.css */
.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.empty {
  text-align: center;
  padding: 48px 20px;
  color: var(--color-text-light);
  font-size: 1rem;
}

.sectionTitle {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--color-text-light);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 8px;
}
```

- [ ] **Step 7: Criar CategoryFilter**

```tsx
// src/components/CategoryFilter.tsx
'use client'

import { Category } from '@/types'
import styles from './CategoryFilter.module.css'

interface CategoryFilterProps {
  categories: Category[]
  selected: string | null
  onChange: (categoryId: string | null) => void
}

export default function CategoryFilter({ categories, selected, onChange }: CategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <div className={styles.container}>
      <button
        className={`${styles.chip} ${selected === null ? styles.active : ''}`}
        onClick={() => onChange(null)}
      >
        Todos
      </button>
      {categories.map(cat => (
        <button
          key={cat.id}
          className={`${styles.chip} ${selected === cat.id ? styles.active : ''}`}
          onClick={() => onChange(cat.id)}
        >
          {cat.name}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 8: Estilizar CategoryFilter**

```css
/* src/components/CategoryFilter.module.css */
.container {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 4px 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}

.container::-webkit-scrollbar {
  display: none;
}

.chip {
  flex-shrink: 0;
  padding: 8px 16px;
  border-radius: var(--radius-chip);
  border: 2px solid var(--color-secondary);
  background: var(--color-white);
  color: var(--color-text);
  font-size: 0.85rem;
  font-weight: 600;
  min-height: var(--touch-target);
  transition: all 0.2s;
}

.active {
  background: var(--color-primary);
  border-color: var(--color-primary);
  color: var(--color-white);
}
```

- [ ] **Step 9: Criar FAB**

```tsx
// src/components/Fab.tsx
'use client'

import styles from './Fab.module.css'

interface FabProps {
  onClick: () => void
}

export default function Fab({ onClick }: FabProps) {
  return (
    <button className={styles.fab} onClick={onClick} aria-label="Adicionar item">
      +
    </button>
  )
}
```

- [ ] **Step 10: Estilizar FAB**

```css
/* src/components/Fab.module.css */
.fab {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  font-size: 1.8rem;
  font-weight: 300;
  box-shadow: 0 4px 16px rgba(236, 72, 153, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s, box-shadow 0.2s;
  z-index: 10;
}

.fab:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(236, 72, 153, 0.5);
}

.fab:active {
  transform: scale(0.95);
}
```

- [ ] **Step 11: Commit**

```bash
git add src/components/
git commit -m "componentes visuais: cards, abas, filtros e botao flutuante"
```

---

### Task 6: Form de Adicionar/Editar Item + Gerenciar Categorias

**Files:**
- Create: `src/components/ItemForm.tsx`, `src/components/ItemForm.module.css`
- Create: `src/components/CategoryManager.tsx`, `src/components/CategoryManager.module.css`

- [ ] **Step 1: Criar ItemForm**

```tsx
// src/components/ItemForm.tsx
'use client'

import { useState } from 'react'
import { Category } from '@/types'
import { addItem } from '@/lib/actions'
import styles from './ItemForm.module.css'

interface ItemFormProps {
  categories: Category[]
  onClose: () => void
  onManageCategories: () => void
}

export default function ItemForm({ categories, onClose, onManageCategories }: ItemFormProps) {
  const [pending, setPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setPending(true)
    const formData = new FormData(e.currentTarget)
    await addItem(formData)
    setPending(false)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <form
        className={styles.form}
        onClick={e => e.stopPropagation()}
        onSubmit={handleSubmit}
      >
        <h2 className={styles.title}>Novo item</h2>

        <label className={styles.label}>
          Nome do produto *
          <input
            name="name"
            type="text"
            required
            placeholder="Ex: Fone Bluetooth"
            className={styles.input}
            autoFocus
          />
        </label>

        <label className={styles.label}>
          Link (opcional)
          <input
            name="url"
            type="url"
            placeholder="https://..."
            className={styles.input}
          />
        </label>

        <label className={styles.label}>
          Categoria (opcional)
          <div className={styles.categoryRow}>
            <select name="categoryId" className={styles.select}>
              <option value="">Sem categoria</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <button type="button" className={styles.manageBtn} onClick={onManageCategories}>
              Editar
            </button>
          </div>
        </label>

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" className={styles.submitBtn} disabled={pending}>
            {pending ? 'Salvando...' : 'Adicionar'}
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Estilizar ItemForm**

```css
/* src/components/ItemForm.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 20;
  padding: 16px;
}

.form {
  background: var(--color-white);
  border-radius: 16px 16px 0 0;
  padding: 24px;
  width: 100%;
  max-width: var(--max-width);
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (min-width: 640px) {
  .overlay {
    align-items: center;
  }
  .form {
    border-radius: 16px;
  }
}

.title {
  font-size: 1.2rem;
  color: var(--color-primary);
}

.label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.input,
.select {
  padding: 12px;
  border: 2px solid #E5E7EB;
  border-radius: var(--radius-button);
  font-size: 1rem;
  min-height: var(--touch-target);
  transition: border-color 0.2s;
}

.input:focus,
.select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.categoryRow {
  display: flex;
  gap: 8px;
}

.categoryRow .select {
  flex: 1;
}

.manageBtn {
  padding: 8px 16px;
  background: var(--color-secondary);
  border: none;
  border-radius: var(--radius-button);
  font-weight: 600;
  font-size: 0.85rem;
  color: var(--color-text);
  min-height: var(--touch-target);
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.cancelBtn {
  flex: 1;
  padding: 14px;
  background: none;
  border: 2px solid #E5E7EB;
  border-radius: var(--radius-button);
  font-weight: 600;
  min-height: var(--touch-target);
  color: var(--color-text-light);
}

.submitBtn {
  flex: 1;
  padding: 14px;
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  font-weight: 600;
  min-height: var(--touch-target);
}

.submitBtn:disabled {
  opacity: 0.6;
}
```

- [ ] **Step 3: Criar CategoryManager**

```tsx
// src/components/CategoryManager.tsx
'use client'

import { useState } from 'react'
import { Category } from '@/types'
import { addCategory, deleteCategory } from '@/lib/actions'
import styles from './CategoryManager.module.css'

interface CategoryManagerProps {
  categories: Category[]
  onClose: () => void
}

export default function CategoryManager({ categories, onClose }: CategoryManagerProps) {
  const [name, setName] = useState('')
  const [pending, setPending] = useState(false)

  async function handleAdd() {
    if (!name.trim()) return
    setPending(true)
    await addCategory(name.trim())
    setName('')
    setPending(false)
  }

  async function handleDelete(id: string) {
    await deleteCategory(id)
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <h2 className={styles.title}>Categorias</h2>

        <div className={styles.addRow}>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nova categoria..."
            className={styles.input}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
          />
          <button onClick={handleAdd} disabled={pending} className={styles.addBtn}>
            +
          </button>
        </div>

        <ul className={styles.list}>
          {categories.map(cat => (
            <li key={cat.id} className={styles.item}>
              <span>{cat.name}</span>
              <button
                onClick={() => handleDelete(cat.id)}
                className={styles.deleteBtn}
                aria-label={`Remover ${cat.name}`}
              >
                ✕
              </button>
            </li>
          ))}
          {categories.length === 0 && (
            <li className={styles.empty}>Nenhuma categoria ainda</li>
          )}
        </ul>

        <button onClick={onClose} className={styles.closeBtn}>
          Fechar
        </button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Estilizar CategoryManager**

```css
/* src/components/CategoryManager.module.css */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
  padding: 16px;
}

.modal {
  background: var(--color-white);
  border-radius: 16px;
  padding: 24px;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.title {
  font-size: 1.1rem;
  color: var(--color-primary);
}

.addRow {
  display: flex;
  gap: 8px;
}

.input {
  flex: 1;
  padding: 12px;
  border: 2px solid #E5E7EB;
  border-radius: var(--radius-button);
  font-size: 1rem;
  min-height: var(--touch-target);
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.addBtn {
  width: var(--touch-target);
  height: var(--touch-target);
  background: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-button);
  font-size: 1.4rem;
}

.addBtn:disabled {
  opacity: 0.6;
}

.list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: var(--color-bg);
  border-radius: var(--radius-button);
  font-weight: 600;
}

.deleteBtn {
  background: none;
  border: none;
  color: var(--color-text-light);
  font-size: 1rem;
  min-width: var(--touch-target);
  min-height: var(--touch-target);
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty {
  text-align: center;
  color: var(--color-text-light);
  padding: 12px;
  font-size: 0.9rem;
}

.closeBtn {
  padding: 14px;
  background: none;
  border: 2px solid #E5E7EB;
  border-radius: var(--radius-button);
  font-weight: 600;
  color: var(--color-text);
  min-height: var(--touch-target);
}
```

- [ ] **Step 5: Commit**

```bash
git add src/components/ItemForm* src/components/CategoryManager*
git commit -m "formulario de adicionar item e gerenciador de categorias"
```

---

### Task 7: Paginas da Lista (Minha Lista + Lista do Parceiro)

**Files:**
- Create: `src/app/lista/layout.tsx`
- Create: `src/app/lista/page.tsx`
- Create: `src/app/lista/minha/page.tsx`
- Create: `src/app/lista/parceiro/page.tsx`

- [ ] **Step 1: Criar layout da lista com abas**

```tsx
// src/app/lista/layout.tsx
import { requireAuth, getPartnerEmail } from '@/lib/auth'
import { createClient } from '@/lib/supabase-server'
import TabNav from '@/components/TabNav'

export default async function ListaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireAuth()
  const supabase = await createClient()
  const partnerEmail = await getPartnerEmail(user.email!)

  let partnerName = 'Parceiro(a)'
  if (partnerEmail) {
    const { data: partner } = await supabase
      .from('profiles')
      .select('name')
      .eq('email', partnerEmail)
      .single()
    if (partner?.name) {
      partnerName = partner.name.split(' ')[0]
    }
  }

  return (
    <main style={{
      maxWidth: 'var(--max-width)',
      margin: '0 auto',
      padding: '16px',
      paddingBottom: '96px',
    }}>
      <TabNav partnerName={partnerName} />
      <div style={{ marginTop: '16px' }}>
        {children}
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Criar redirect /lista -> /lista/minha**

```tsx
// src/app/lista/page.tsx
import { redirect } from 'next/navigation'

export default function ListaPage() {
  redirect('/lista/minha')
}
```

- [ ] **Step 3: Criar pagina Minha Lista**

```tsx
// src/app/lista/minha/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Item, Category } from '@/types'
import ItemList from '@/components/ItemList'
import CategoryFilter from '@/components/CategoryFilter'
import Fab from '@/components/Fab'
import ItemForm from '@/components/ItemForm'
import CategoryManager from '@/components/CategoryManager'

export default function MinhaListaPage() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showCategories, setShowCategories] = useState(false)

  const supabase = createClient()

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const [itemsRes, catsRes] = await Promise.all([
      supabase
        .from('items')
        .select('*, category:categories(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', user.id)
        .order('name'),
    ])

    if (itemsRes.data) setItems(itemsRes.data)
    if (catsRes.data) setCategories(catsRes.data)
  }

  useEffect(() => {
    loadData()
  }, [showForm, showCategories])

  const filtered = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory)
    : items

  return (
    <>
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <div style={{ marginTop: '12px' }}>
        <ItemList items={filtered} editable={true} />
      </div>
      <Fab onClick={() => setShowForm(true)} />
      {showForm && (
        <ItemForm
          categories={categories}
          onClose={() => setShowForm(false)}
          onManageCategories={() => {
            setShowForm(false)
            setShowCategories(true)
          }}
        />
      )}
      {showCategories && (
        <CategoryManager
          categories={categories}
          onClose={() => setShowCategories(false)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 4: Criar pagina Lista do Parceiro**

```tsx
// src/app/lista/parceiro/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { Item, Category } from '@/types'
import ItemList from '@/components/ItemList'
import CategoryFilter from '@/components/CategoryFilter'

export default function ParceiroListaPage() {
  const [items, setItems] = useState<Item[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const supabase = createClient()

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Buscar todos os perfis, filtrar o parceiro
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .neq('id', user.id)
      .limit(1)

    const partnerId = profiles?.[0]?.id
    if (!partnerId) return

    const [itemsRes, catsRes] = await Promise.all([
      supabase
        .from('items')
        .select('*, category:categories(*)')
        .eq('user_id', partnerId)
        .order('created_at', { ascending: false }),
      supabase
        .from('categories')
        .select('*')
        .eq('user_id', partnerId)
        .order('name'),
    ])

    if (itemsRes.data) setItems(itemsRes.data)
    if (catsRes.data) setCategories(catsRes.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const filtered = selectedCategory
    ? items.filter(i => i.category_id === selectedCategory)
    : items

  return (
    <>
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onChange={setSelectedCategory}
      />
      <div style={{ marginTop: '12px' }}>
        <ItemList items={filtered} editable={false} />
      </div>
    </>
  )
}
```

- [ ] **Step 5: Testar manualmente**

```bash
npm run dev
```

1. Logar com Google
2. Adicionar categoria "Roupas"
3. Adicionar item "Tenis Nike" com link e categoria "Roupas"
4. Marcar como favorito (coracao deve preencher)
5. Marcar como comprado (deve ir pro final, riscado)
6. Ir na aba do parceiro (vazia se o parceiro nao adicionou nada)

- [ ] **Step 6: Commit**

```bash
git add src/app/lista/
git commit -m "paginas minha lista e lista do parceiro com abas"
```

---

### Task 8: Middleware de Autenticacao

**Files:**
- Create: `src/middleware.ts`

- [ ] **Step 1: Criar middleware**

```typescript
// src/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Se nao logado e tentando acessar /lista, redireciona pra login
  if (!user && request.nextUrl.pathname.startsWith('/lista')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se logado e tentando acessar /login, redireciona pra lista
  if (user && request.nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/lista', request.url))
  }

  return response
}

export const config = {
  matcher: ['/lista/:path*', '/login'],
}
```

- [ ] **Step 2: Testar middleware**

1. Abrir `/lista` sem estar logado -> deve redirecionar para `/login`
2. Abrir `/login` estando logado -> deve redirecionar para `/lista`

- [ ] **Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "middleware para proteger rotas e redirecionar"
```

---

### Task 9: Deploy na Vercel

**Files:**
- No new files

- [ ] **Step 1: Criar repositorio no GitHub (se necessario)**

O repositorio ja existe em `breno-camargo/listadepresentess`.

- [ ] **Step 2: Push do codigo**

```bash
git push origin main
```

- [ ] **Step 3: Conectar Vercel ao repositorio**

1. Ir em vercel.com > New Project > Import `listadepresentess`
2. Framework Preset: Next.js (detectado automaticamente)
3. Adicionar variaveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `AUTHORIZED_EMAILS`

- [ ] **Step 4: Configurar redirect URL do OAuth**

No Supabase Dashboard > Authentication > URL Configuration:
- Site URL: `https://listadepresentess.vercel.app`
- Redirect URLs: `https://listadepresentess.vercel.app/auth/callback`

No Google Cloud Console, adicionar a URL de producao como redirect URI.

- [ ] **Step 5: Testar em producao**

1. Abrir a URL da Vercel no celular
2. Logar com Google
3. Adicionar item, marcar favorito, marcar comprado
4. Logar com o outro email e verificar que ve a lista do parceiro

- [ ] **Step 6: Commit (se houver ajustes)**

```bash
git add -A
git commit -m "ajustes para deploy em producao"
```
