import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
}

interface UserSelectProps {
  onChange: (user: User | null) => void;
  value?: User;
}

const UserSelect: React.FC<UserSelectProps> = ({ onChange, value }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users'); // Запрос к вашему API
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
    <select onChange={(e) => onChange(users[e.target.selectedIndex])}>
      <option value="">Выберите пользователя</option>
      {users.map((user) => (
        <option key={user.id} value={user.id}>
          {user.email} {/* Предполагается, что у пользователя есть поле email */}
        </option>
      ))}
    </select>
  );
};

export default UserSelect; 