"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, Lock, LogIn, Eye, EyeOff, MessageCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import ShinyButton from "@/components/ui/shiny-button"
import ForgotPasswordPopup from "@/components/ui/forgot-password-popup"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { BorderBeam } from "@/components/ui/border-beam";
import { header_font, main_text_font } from "@/src/app/fonts/font";
import { BackgroundBeams } from "@/components/ui/background-beams";




export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isPopupOpen, setIsPopupOpen] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/')
      }
    }
    checkSession()
  }, [router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      
      // Сохраняем сессию в локальном хранилище
      if (data.session) {
        localStorage.setItem('supabase_session', JSON.stringify(data.session))
      }
      
      router.push("/")
    } catch (error) {
      setError((error as Error).message)
    }
  }

  const handleContactDeveloper = () => {
    window.location.href = "https://t.me/ne_pridymalnik"
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[rgb(15,15,15)] text-white overflow-hidden relative">
      <BackgroundBeams />

      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md p-8 rounded-2xl bg-[#111] shadow-2xl relative z-10 overflow-hidden `}
      >
        <BorderBeam size={250} duration={12} delay={9} />
        <div className="relative z-20">
          {/* Название сайта */}
          <h1 className="text-center">
            <span className={`text-white text-[2.5rem] ${header_font.className}`}>Resta</span>
            <span className={`text-white text-[2.3rem] ${main_text_font.className}`}>.labs</span>
          </h1>
          
          {/* Welcome Back текст */}
          <h2 className={`text-xl font-semibold mb-8 text-center text-[#999999] ${main_text_font.className}`}>Authorization</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="relative">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-[#222] border-[#333] text-white placeholder-gray-500 pl-12 pr-4 py-3 rounded-lg w-full focus:ring-2 focus:ring-white focus:border-transparent text-sm transition duration-300 ease-in-out"
              />
              <User size={20} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-[#222] border-[#333] text-white placeholder-gray-500 pl-12 pr-12 py-3 rounded-lg w-full focus:ring-2 focus:ring-white focus:border-transparent text-sm transition duration-300 ease-in-out"
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
          
            <ShinyButton className="w-full">
              <div className={`flex items-center justify-center text-gray-400 font-bold ${header_font.className}`}>
                Login
              </div>
            </ShinyButton>
            {error && <p className="text-red-500 text-sm w-full text-center">{error}</p>}
          </form>
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsPopupOpen(true)}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Forgot your password?
            </button>
          </div>
          <div className="mt-2 text-center">
            <button
              onClick={handleContactDeveloper}
              className="text-sm text-gray-400 hover:text-white transition-colors flex items-center justify-center mx-auto"
            >
              <MessageCircle size={16} className="mr-2" />
              Contact the developer
            </button>
          </div>

          {/* Добавляем линию и секцию с иконками */}
          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 opacity-20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#111] text-gray-500">Developed with</span>
            </div>
          </div>

          <div className="mt-4 flex justify-center items-center space-x-3">
            {/* Next.js Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0,0,256,256"
              className="h-6 w-15"
            >
              <g fill="#9ca3af" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: "normal"}}>
                <g transform="scale(5.33333,5.33333)">
                  <path d="M18.974,31.5c0,0.828 -0.671,1.5 -1.5,1.5c-0.829,0 -1.5,-0.672 -1.5,-1.5v-14c0,-0.653 0.423,-1.231 1.045,-1.43c0.625,-0.198 1.302,0.03 1.679,0.563l16.777,23.704c5.142,-3.628 8.525,-9.602 8.525,-16.337c0,-11 -9,-20 -20,-20c-11,0 -20,9 -20,20c0,11 9,20 20,20c3.192,0 6.206,-0.777 8.89,-2.122l-13.916,-19.662zM28.974,16.5c0,-0.828 0.671,-1.5 1.5,-1.5c0.829,0 1.5,0.672 1.5,1.5v13.84l-3,-4.227z"></path>
                </g>
              </g>
            </svg>
            
            {/* Vercel Icon */}
            <svg
              fill="#9ca3af"
              viewBox="0 0 40 20"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="h-8 w-14"
            >
              <path d="M23.3919 0H32.9188C36.7819 0 39.9136 3.13165 39.9136 6.99475V16.0805H36.0006V6.99475C36.0006 6.90167 35.9969 6.80925 35.9898 6.71766L26.4628 16.079C26.4949 16.08 26.5272 16.0805 26.5595 16.0805H36.0006V19.7762H26.5595C22.6964 19.7762 19.4788 16.6139 19.4788 12.7508V3.68923H23.3919V12.7508C23.3919 12.9253 23.4054 13.0977 23.4316 13.2668L33.1682 3.6995C33.0861 3.6927 33.003 3.68923 32.9188 3.68923H23.3919V0Z"></path>
              <path d="M13.7688 19.0956L0 3.68759H5.53933L13.6231 12.7337V3.68759H17.7535V17.5746C17.7535 19.6705 15.1654 20.6584 13.7688 19.0956Z"></path>
            </svg>
            
            {/* GitHub Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0,0,256,256"
              className="h-6 w-15"
            >
              <g fill="#9ca3af" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{mixBlendMode: "normal"}}>
                <g transform="scale(5.12,5.12)">
                  <path d="M17.791,46.836c0.711,-0.306 1.209,-1.013 1.209,-1.836v-5.4c0,-0.197 0.016,-0.402 0.041,-0.61c-0.014,0.004 -0.027,0.007 -0.041,0.01c0,0 -3,0 -3.6,0c-1.5,0 -2.8,-0.6 -3.4,-1.8c-0.7,-1.3 -1,-3.5 -2.8,-4.7c-0.3,-0.2 -0.1,-0.5 0.5,-0.5c0.6,0.1 1.9,0.9 2.7,2c0.9,1.1 1.8,2 3.4,2c2.487,0 3.82,-0.125 4.622,-0.555c0.934,-1.389 2.227,-2.445 3.578,-2.445v-0.025c-5.668,-0.182 -9.289,-2.066 -10.975,-4.975c-3.665,0.042 -6.856,0.405 -8.677,0.707c-0.058,-0.327 -0.108,-0.656 -0.151,-0.987c1.797,-0.296 4.843,-0.647 8.345,-0.714c-0.112,-0.276 -0.209,-0.559 -0.291,-0.849c-3.511,-0.178 -6.541,-0.039 -8.187,0.097c-0.02,-0.332 -0.047,-0.663 -0.051,-0.999c1.649,-0.135 4.597,-0.27 8.018,-0.111c-0.079,-0.5 -0.13,-1.011 -0.13,-1.543c0,-1.7 0.6,-3.5 1.7,-5c-0.5,-1.7 -1.2,-5.3 0.2,-6.6c2.7,0 4.6,1.3 5.5,2.1c1.699,-0.701 3.599,-1.101 5.699,-1.101c2.1,0 4,0.4 5.6,1.1c0.9,-0.8 2.8,-2.1 5.5,-2.1c1.5,1.4 0.7,5 0.2,6.6c1.1,1.5 1.7,3.2 1.6,5c0,0.484 -0.045,0.951 -0.11,1.409c3.499,-0.172 6.527,-0.034 8.204,0.102c-0.002,0.337 -0.033,0.666 -0.051,0.999c-1.671,-0.138 -4.775,-0.28 -8.359,-0.089c-0.089,0.336 -0.197,0.663 -0.325,0.98c3.546,0.046 6.665,0.389 8.548,0.689c-0.043,0.332 -0.093,0.661 -0.151,0.987c-1.912,-0.306 -5.171,-0.664 -8.879,-0.682c-1.665,2.878 -5.22,4.755 -10.777,4.974v0.031c2.6,0 5,3.9 5,6.6v5.4c0,0.823 0.498,1.53 1.209,1.836c9.161,-3.032 15.791,-11.672 15.791,-21.836c0,-12.682 -10.317,-23 -23,-23c-12.683,0 -23,10.318 -23,23c0,10.164 6.63,18.804 15.791,21.836z"></path>
                </g>
              </g>
            </svg>
          </div>
        </div>
      </motion.div>

      <ForgotPasswordPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  )
}
