"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import ShinyButton from "@/components/ui/shiny-button";
import { DotPattern } from "@/components/ui/dot-pattern";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { BorderBeam } from "@/components/ui/border-beam";
import { header_font } from "@/app/fonts/font";
export default function ResetPasswordPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;

      setStatus('success');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      setStatus('error');
      setError((error as Error).message);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[rgb(15,15,15)] text-white overflow-hidden relative">
      <DotPattern className="opacity-50" dotColor="rgb(52,52,52)" />
      
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white rounded-full opacity-[0.07] blur-[100px]" />
      </div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 rounded-2xl bg-[#111] shadow-2xl relative z-10 overflow-hidden"
      >
        <BorderBeam size={250} duration={12} delay={9} />
        <div className="relative z-20">
          <h1 className={`text-2xl font-bold mb-6 text-center ${header_font.className}`}>
            Создание нового пароля
          </h1>

          {status === 'success' ? (
            <p className="text-green-400 text-center mb-4">
              Пароль успешно обновлен! Перенаправление на страницу входа...
            </p>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Новый пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[#222] border-[#333] text-white placeholder-gray-500 pl-12 pr-12 py-3 rounded-lg w-full focus:ring-2 focus:ring-white focus:border-transparent"
                  disabled={status === 'loading'}
                />
                <Lock size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {error && (
                <p className="text-red-500 text-sm text-center">{error}</p>
              )}

              <ShinyButton 
                className="w-full" 
                disabled={status === 'loading'}
              >
                <div className="text-gray-400">
                  {status === 'loading' ? 'Обновление...' : 'Обновить пароль'}
                </div>
              </ShinyButton>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
