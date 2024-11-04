-- Создаем таблицу для связей пользователей с корпорациями
create table if not exists public.user_corporations (
  user_id uuid references auth.users(id) on delete cascade,
  corporation_id text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, corporation_id)
);

-- Добавляем политики безопасности RLS
alter table public.user_corporations enable row level security;

-- Политика для чтения (только аутентифицированные пользователи могут видеть записи)
create policy "Users can view user_corporations"
  on public.user_corporations for select
  using (auth.role() = 'authenticated');

-- Политика для вставки (только администраторы могут добавлять записи)
create policy "Admins can insert user_corporations"
  on public.user_corporations for insert
  using (auth.role() = 'authenticated' and auth.jwt()->>'role' = 'admin');

-- Политика для обновления (только администраторы могут обновлять записи)
create policy "Admins can update user_corporations"
  on public.user_corporations for update
  using (auth.role() = 'authenticated' and auth.jwt()->>'role' = 'admin');

-- Политика для удаления (только администраторы могут удалять записи)
create policy "Admins can delete user_corporations"
  on public.user_corporations for delete
  using (auth.role() = 'authenticated' and auth.jwt()->>'role' = 'admin');

-- Добавляем индексы для оптимизации запросов
create index if not exists user_corporations_user_id_idx on public.user_corporations(user_id);
create index if not exists user_corporations_corporation_id_idx on public.user_corporations(corporation_id); 