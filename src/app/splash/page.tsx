"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export default function SplashPage() {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)
  
  const handleEnter = () => {
    router.push("/dashboard")
  }

  return (
    <div className="fixed inset-0 w-screen h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-600 to-green-800">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
          Inventario de Laboratorio
        </h1>
        <p className="text-xl md:text-2xl text-green-100 mb-8">
          Sistema de gestión para laboratorio médico
        </p>

        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button 
            size="lg" 
            className="bg-white text-green-800 hover:bg-green-100 text-lg px-8 py-6 rounded-full shadow-lg flex items-center gap-2 transition-all"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleEnter}
          >
            <span>Acceder</span>
            <motion.div
              animate={{ x: isHovered ? 5 : 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <ArrowRight className="h-5 w-5" />
            </motion.div>
          </Button>
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1, duration: 1 }}
        className="absolute bottom-5 text-center text-white/80 text-sm"
      >
        © 2025 Laboratorio Médico • Sistema de Inventario
      </motion.div>
    </div>
  )
}
