import { supabase } from "./supabaseClient";
import { CreateUserData } from "@/lib/supabaseDataBase";

export const createUser = async (userData: CreateUserData & { password: string }) => {
    // Регистрация пользователя в Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
                name: userData.name,
                first_name: userData.first_name,
                corporation: userData.corporation,
                role: userData.role
            },
        }
    });

    if (authError) {
        return { data: null, error: authError };
    }

    // Если регистрация успешна, сразу подтверждаем пользователя
    const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email: userData.email,
        password: userData.password,
    });

    if (sessionError) {
        return { data: null, error: sessionError };
    }

    return { data: authData, error: null };
};


  