import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface UserSelectProps {
  onChange: (user: User | null) => void;
  value?: User | null;
}

const UserSelect: React.FC<UserSelectProps> = ({ onChange, value }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        const data = await response.json();

        if (response.ok) {
          setUsers(data.users);
        } else {
          console.error('Ошибка при получении пользователей:', data.error);
        }
      } catch (error) {
        console.error('Неожиданная ошибка при получении пользователей:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <div>Загрузка пользователей...</div>;
  }

  return (
    <select 
      value={value?.id || ''}
      onChange={(e) => {
        const selectedUser = users.find(user => user.id === e.target.value);
        onChange(selectedUser || null);
      }}
      className="w-full p-2 border rounded"
    >
      <option value="">Выберите пользователя</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.email} {user.name ? `(${user.name})` : ''}
        </option>
      ))}
    </select>
  );
};

export default UserSelect; 