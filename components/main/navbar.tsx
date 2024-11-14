"use client"

import { ChartBar, Phone, Mail, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function Navbar() {
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const featuresSection = document.getElementById('features-section')
      if (featuresSection) {
        const rect = featuresSection.getBoundingClientRect()
        setShowButton(rect.top <= window.innerHeight)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="items-center flex justify-center"> 
    <nav className="fixed z-50 w-[80vw] items-center bg-[#171717]/95 backdrop-blur supports-[backdrop-filter]:bg-[#171717]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-4 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center shrink-0">
            <ChartBar className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">RestaLabs</span>
          </div>
          
          <div className="flex items-center gap-6 overflow-x-auto">
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Phone className="h-5 w-5" />
              <span className="whitespace-nowrap">+7 (XXX) XXX-XX-XX</span>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Mail className="h-5 w-5" />
              <span className="whitespace-nowrap">info@restalabs.ru</span>
            </div>
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Globe className="h-5 w-5" />
              <span className="whitespace-nowrap">restalabs.ru</span>
            </div>
            {showButton && (
              <Button className="shrink-0">Начать</Button>
            )}
          </div>
        </div>
      </div>
    </nav>
    </div>
  )
}