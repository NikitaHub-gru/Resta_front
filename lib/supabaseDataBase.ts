import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto';

export interface User {
  id: string
  name: string
  email: string
  corporation: string
  role: string
  first_name?: string
  created_at?: string
  password?: string
}

// Тип для создания нового пользователя
export interface CreateUserData {
  name: string
  email: string
  corporation: string
  role: string
  first_name?: string
  password?: string
}

// Функция для хеширования пароля
function hashPassword(password: string): string {
  return crypto.createHash('sha1').update(password).digest('hex');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Получение всех пользователей
export async function getAllUsers() {
  try {
    const { data, error } = await supabase
      .from('Users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching users:', error)
    return { data: null, error }
  }
}

// Добавление нового пользователя
export async function addUser(userData: CreateUserData) {
  try {
    // Проверяем сессию
    const { data: sessionData } = await supabase.auth.getSession();
    console.log('Current session:', sessionData);

    // Проверяем обязательные поля
    if (!userData.name || !userData.email || !userData.corporation || !userData.role || !userData.password) {
      throw new Error('Missing required fields');
    }

    console.log('Attempting to insert user:', { ...userData, password: '***' });

    // Хешируем пароль перед сохранением
    const hashedPassword = hashPassword(userData.password);

    const { data, error } = await supabase
      .from('Users')
      .insert([{
        name: userData.name,
        email: userData.email,
        corporation: userData.corporation,
        role: userData.role,
        first_name: userData.first_name || null,
        password: hashedPassword // Сохраняем хешированный пароль
      }])
      .select()
      .single();

    if (error) {
      console.error('Supabase error details:', error);
      throw new Error(error.message);
    }
    
    console.log('Successfully inserted user:', { ...data, password: '***' });
    return { data, error: null };
  } catch (error) {
    console.error('Error adding user:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('An unexpected error occurred') 
    };
  }
}

// Обновление пользователя
export async function updateUser(id: string, userData: Partial<User | CreateUserData>) {
  try {
    console.log('UpdateUser called with:', { id, userData });
    
    // Создаем объект только с разрешенными полями
    const allowedFields = {
      name: userData.name,
      email: userData.email,
      corporation: userData.corporation, // Убедитесь, что используется corporation, а не company
      role: userData.role,
      first_name: userData.first_name,
      ...(userData.password ? { password: hashPassword(userData.password) } : {})
    };

    // Удаляем undefined поля
    const updateData = Object.fromEntries(
      Object.entries(allowedFields).filter(([_, v]) => v !== undefined)
    );

    console.log('Sending update data:', updateData);

    const { data, error } = await supabase
      .from('Users')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error(error.message);
    }

    console.log('Update successful, returned data:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Error updating user:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error : new Error('An unexpected error occurred') 
    };
  }
}

// Удаление пользователя
export async function deleteUser(id: string) {
  try {
    const { error } = await supabase
      .from('Users')
      .delete()
      .eq('id', id)

    if (error) throw error
    return { error: null }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { error }
  }
}
