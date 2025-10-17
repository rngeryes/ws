'use client'

import { useEffect, useRef } from 'react'
import { useTab } from '@/contexts/TabContext'
import HomeTab from './HomeTab'
import LeaderboardTab from './LeaderboardTab'
import FriendsTab from './FriendsTab'
import TasksTab from './TasksTab'
import { motion, AnimatePresence } from 'framer-motion'

const variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
}

const TabContainer = () => {
  const { activeTab } = useTab()
  const containerRef = useRef<HTMLDivElement>(null)

  // Скролл наверх при смене вкладки
  useEffect(() => {
    containerRef.current?.scrollTo({ top: 0, behavior: 'auto' })
  }, [activeTab])

  // Управление overflow
  useEffect(() => {
    if (!containerRef.current) return

    const isLocked = activeTab === 'friends' 
    containerRef.current.style.overflowY = isLocked ? 'hidden' : 'auto'

    // Блокировка прокрутки через колесо мыши / трекпад
    const handleWheel = (e: WheelEvent) => {
      if (isLocked) e.preventDefault()
    }

    containerRef.current.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      containerRef.current?.removeEventListener('wheel', handleWheel)
    }
  }, [activeTab])

  return (
    <div
      ref={containerRef}
      className="max-w-md mx-auto pt-[44px] pb-[72px] relative max-h-screen"
    >
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <motion.div
            key="home"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <HomeTab />
          </motion.div>
        )}
        {activeTab === 'leaderboard' && (
          <motion.div
            key="leaderboard"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <LeaderboardTab />
          </motion.div>
        )}
        {activeTab === 'friends' && (
          <motion.div
            key="friends"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FriendsTab />
          </motion.div>
        )}
        {activeTab === 'tasks' && (
          <motion.div
            key="tasks"
            variants={variants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <TasksTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default TabContainer
