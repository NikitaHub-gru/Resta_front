"use client"

import { useEffect, useState } from 'react'

export default function Component() {
  const [grainOpacity, setGrainOpacity] = useState(0.03)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setGrainOpacity(Math.random() * 0.05 + 0.01)
    }, 50)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-black overflow-hidden">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity: grainOpacity,
        }}
      />
      <div className="w-40 h-40 relative z-10 animate-spin">
        <div className="w-full h-full rounded-full border-t-8 border-l-8 border-white opacity-80"></div>
      </div>
    </div>
  )
}