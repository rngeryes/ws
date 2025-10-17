'use client'

import { useState, useEffect } from 'react'
import Lottie from 'lottie-react'
import { motion, AnimatePresence } from 'framer-motion'
import duckAnimation from '@/animations/duck2.json'
import testAnimation from '@/animations/durov.json'
import frogAnimation from '@/animations/truck.json'
import pepeAnimation from '@/animations/Gamepad.json'
import burgAnimation from '@/animations/ear.json'
import { useTab } from '@/contexts/TabContext'
import Home from '@/icons/Home'

// Интерфейсы
interface UserGift {
  id: string
  name: string
  price: number
  purchased_at: string
  remaining_quantity?: number
  total_quantity?: number
}

interface Gift extends UserGift {
  animation: any
}

// Анимации подарков
const giftAnimations: Record<string, any> = {
  'durov_stand_001': testAnimation,
  'telegatruck_002': frogAnimation,
  'joy_stick_003': pepeAnimation,
  'gram_pods_004': burgAnimation
}

const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })

// Skeleton компонент
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-700/40 rounded-lg animate-pulse ${className}`} />
)

const ProfileTab = () => {
  const [user, setUser] = useState<any>(null)
  const [userGifts, setUserGifts] = useState<Gift[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { setActiveTab } = useTab()

  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp
    if (tg) {
      tg.ready()
      const userData = tg.initDataUnsafe?.user
      if (userData) {
        setUser(userData)
        fetchUserGifts(userData.id)
      }
    }
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const fetchUserGifts = async (telegramId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`http://77.110.112.93:5000/api/user/${telegramId}/gifts`)
      if (response.ok) {
        const gifts: UserGift[] = await response.json()
        setUserGifts(gifts.map(gift => ({
          ...gift,
          animation: giftAnimations[gift.id] || testAnimation,
          remaining_quantity: gift.remaining_quantity ?? 1,
          total_quantity: gift.total_quantity ?? 10
        })))
      }
    } catch (error) {
      console.error('Error fetching user gifts:', error)
    } finally {
      setTimeout(() => setLoading(false), 400)
    }
  }

  const fetchGiftStatus = async (giftId: string) => {
    try {
      const res = await fetch(`http://77.110.112.93:5000/api/gift/${giftId}/status`)
      if (!res.ok) throw new Error('Failed to fetch gift status')
      return await res.json()
    } catch (err) {
      console.error(err)
      return null
    }
  }

  const openModal = async (gift: Gift) => {
    const status = await fetchGiftStatus(gift.id)
    if (status) {
      setSelectedGift({
        ...gift,
        remaining_quantity: status.remaining_quantity,
        total_quantity: status.total_quantity
      })
    } else {
      setSelectedGift(gift)
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setSelectedGift(null)
    setIsModalOpen(false)
  }

  if (loading) return (
    <div className="w-full h-screen flex flex-col items-center justify-start pt-6 pb-5 gap-4 px-4">
      <Skeleton className="w-20 h-20 rounded-2xl" />
      <Skeleton className="w-32 h-6 rounded-full" />
      <div className="flex gap-8">
        <Skeleton className="w-16 h-12 rounded-xl" />
        <Skeleton className="w-16 h-12 rounded-xl" />
      </div>
      <div className="grid grid-cols-2 gap-4 w-full mt-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="aspect-[3/3.4] w-full" />
        ))}
      </div>
    </div>
  )

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start pt-[-20px] pb-2">
      {/* Аватар */}
      {user?.photo_url ? (
        <img src={user.photo_url} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover mt-2"/>
      ) : <div className="w-20 h-20 rounded-2xl bg-gray-600 mt-6"/>}

      <h1 className="mt-2 text-white text-2xl font-semibold text-center">
        {user?.first_name || 'Unknown'} {user?.last_name || ''}
      </h1>

      {/* Статистика bought / sold */}
      <div className="mt-4 flex items-center justify-center text-white">
        <div className="flex flex-col items-center px-6">
          <div className="flex items-center gap-1 text-lg font-semibold">
            <span>{userGifts.length}</span>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-sm text-[#98989e] font-semibold">bought</span>
        </div>
        <div className="w-px h-10 bg-gray-700" />
        <div className="flex flex-col items-center px-6">
          <div className="flex items-center gap-1 text-lg font-semibold">
            <span>0</span>
            <Home className="w-5 h-5" />
          </div>
          <span className="text-sm text-[#98989e] font-semibold">sold</span>
        </div>
      </div>

      {/* Заголовок Collections */}
      {userGifts.length > 0 && (
        <div className="w-full px-4 mt-6">
          <h2 className="text-white text-3xl font-bold mb-4 text-left">Collections</h2>
          <div className="grid grid-cols-2 gap-4">
            {userGifts.map((gift, index) => (
              <motion.div
                key={gift.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-[#282829] rounded-xl aspect-[3/3.4] flex flex-col justify-between p-4 relative overflow-hidden cursor-pointer"
                onClick={() => openModal(gift)}
              >
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-24 h-24">
                    <Lottie 
                      animationData={gift.animation} 
                      loop={!isModalOpen} 
                      autoplay={!isModalOpen} 
                    />
                  </div>
                </div>
                <div className="text-center mt-2">
                  <p className="text-white text-l font-medium truncate">{gift.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{formatDate(gift.purchased_at)}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Сообщение при отсутствии подарков */}
      {userGifts.length === 0 && (
        <div className="mt-5 w-[123px] h-[123px] flex flex-col items-center">
          <Lottie animationData={duckAnimation} loop />
          <p className="mt-1 text-[#98989e] text-center text-base font-medium">You have no Limited Gifts yet</p>
          <div
            onClick={() => setActiveTab('home')}
            className="mt-4 flex items-center gap-2 text-blue-500 font-semibold cursor-pointer"
          >
            <span>Buy</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      )}

      {/* Модальное окно */}
      <AnimatePresence>
        {selectedGift && (
          <motion.div
            className="fixed inset-0 z-50 flex items-end md:items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              className="relative w-full max-w-md min-h-[60%] max-h-[90%] bg-[#1f1f1f] rounded-t-3xl md:rounded-3xl p-6 flex flex-col items-center z-10 overflow-y-auto"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-white/30" />
              <div className="w-[95%] h-48 rounded-2xl bg-gradient-to-br from-gray-400/30 via-gray-200/10 to-transparent flex items-center justify-center mb-6 mt-6">
                <div className="w-32 h-32">
                  <Lottie animationData={selectedGift.animation} loop autoplay />
                </div>
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">{selectedGift.name}</h3>
              <p className="text-gray-400 text-sm text-center mb-4 px-4">Purchased on {formatDate(selectedGift.purchased_at)}</p>

              <div className="w-full border border-gray-700 rounded-xl overflow-hidden mb-6">
                {[
                  ['Availability', selectedGift.remaining_quantity !== undefined && selectedGift.total_quantity !== undefined
                    ? `${selectedGift.remaining_quantity} of ${selectedGift.total_quantity} left`
                    : <Skeleton className="h-4 w-20" />],
                  ['Value', (
                    <div className="flex items-center gap-1">
                      <span>{formatPrice(selectedGift.price)}</span>
                      <img src="/icons/star.svg" alt="star" className="w-4 h-4 relative -top-[0.7px]" />
                    </div>
                  )],
                  ['Collection', (
                    <div className="flex items-center gap-2 relative">
                      <span>Major Community</span>
                      <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg" alt="Verified" className="w-4 h-4 relative -top-[-0.2px] -left-[5px]" />
                    </div>
                  )]
                ].map((row, i) => (
                  <div key={i} className="relative flex border-b border-gray-700 last:border-b-0">
                    <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-gray-700"></div>
                    <div className="w-1/3 bg-gray-700/40 text-gray-300 px-3 py-2">{row[0]}</div>
                    <div className="flex-1 text-white px-3 py-2">{row[1]}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default ProfileTab
