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
