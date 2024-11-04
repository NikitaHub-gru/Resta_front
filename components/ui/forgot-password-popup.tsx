"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabaseClient";
import ShinyButton from "@/components/ui/shiny-button";
import { main_text_font, header_font } from "@/app/fonts/font";

interface ForgotPasswordPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordPopup: React.FC<ForgotPasswordPopupProps> = ({ isOpen, onClose }) => {
  const [isMounted, setIsMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setStatus('success');
    } catch (error) {
      setStatus('error');
      setErrorMessage((error as Error).message);
    }
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-md p-6 bg-[#111] rounded-lg shadow-xl border border-white/10"
          >
            <button
              onClick={onClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className={`text-2xl font-bold mb-4 text-white text-center ${main_text_font.className}`}>
              Сброс пароля
            </h2>
            
            {status === 'success' ? (
              <p className="text-green-400 text-center mb-4">
                Инструкции по сбросу пароля отправлены на вашу почту
              </p>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Введите email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-[#222] border-[#333] text-white placeholder-gray-500 pl-12 pr-4 py-3 rounded-lg w-full focus:ring-2 focus:ring-white focus:border-transparent"
                    disabled={status === 'loading'}
                  />
                  <Mail size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                </div>

                {errorMessage && (
                  <p className="text-red-500 text-sm text-center">{errorMessage}</p>
                )}

                <ShinyButton 
                  className="w-full" 
                  disabled={status === 'loading'}
                >
                  <div className={`text-gray-400 ${header_font.className}`}>
                    {status === 'loading' ? 'Отправка...' : 'Отправить инструкции'}
                  </div>
                </ShinyButton>
              </form>
            )}

            <p className="mt-4 text-gray-400 text-sm text-center">
              Мы отправим вам email с инструкциями по сбросу пароля
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordPopup;
