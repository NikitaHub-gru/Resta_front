'use client'

import { User } from '@supabase/supabase-js'

interface UserListProps {
  users: User[] | null
}

export function UsersList({ users }: UserListProps) {
  if (!users) {
    return <div className="p-4">Загрузка данных пользователей...</div>
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Список пользователей</h2>
      {users.map((user) => (
        <div key={user.id} className="rounded-md border p-4">
          <div className="space-y-2">
            <p><strong>ID:</strong> {user.id}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Роль:</strong> {user.user_metadata?.role || 'Не указана'}</p>
            <p><strong>Корпорация:</strong> {user.user_metadata?.corporation || 'Не указана'}</p>
            <p><strong>Создан:</strong> {new Date(user.created_at).toLocaleString()}</p>
            <p><strong>Последний вход:</strong> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Нет данных'}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
