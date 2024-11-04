import { useEffect, useState } from 'react';
import UserSelect from './UserSelect'; // Импортируйте компонент UserSelect

const AddReportDialog = ({ onAddReport }: { onAddReport: (report: any) => void }) => {
  const [reportData, setReportData] = useState({ title: '', content: '' });
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUser) {
      onAddReport({ ...reportData, userId: selectedUser.id }); // Добавляем ID выбранного пользователя
    } else {
      console.error('Пользователь не выбран');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Название отчета:</label>
        <input
          type="text"
          value={reportData.title}
          onChange={(e) => setReportData({ ...reportData, title: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Содержимое отчета:</label>
        <textarea
          value={reportData.content}
          onChange={(e) => setReportData({ ...reportData, content: e.target.value })}
          required
        />
      </div>
      <div>
        <label>Выберите пользователя:</label>
        <UserSelect onChange={setSelectedUser} /> {/* Компонент выбора пользователя */}
      </div>
      <button type="submit">Создать отчет</button>
    </form>
  );
};

export default AddReportDialog; 