'use client';
import { useState, useEffect } from 'react';
import Lottie from 'lottie-react';
import testAnimation from '@/animations/durov.json';
import frogAnimation from '@/animations/truck.json';
import pepeAnimation from '@/animations/Gamepad.json';
import burgAnimation from '@/animations/ear.json';
import { motion, AnimatePresence } from 'framer-motion';

// Интерфейсы для TypeScript
interface Gift {
  name: string;
  animation: any;
  price: number;
  availability: [number, number];
  id: string;
  remaining_quantity?: number;
  total_quantity?: number;
}

interface Purchase {
  id: number;
  username: string;
  gift_name: string;
  gift_id: string;
  purchased_at: string;
}

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Локальные подарки с анимациями
const localGifts: Gift[] = [
  { name: 'Durov Stand', animation: testAnimation, price: 1, availability: [120, 500], id: 'durov_stand_001' },
  { name: 'Telegatruck', animation: frogAnimation, price: 500, availability: [80, 300], id: 'telegatruck_002' },
  { name: 'Joy Stick', animation: pepeAnimation, price: 1200, availability: [50, 200], id: 'joy_stick_003' },
  { name: 'Gram Pods', animation: burgAnimation, price: 900, availability: [75, 400], id: 'gram_pods_004' },
];

// Анимации для быстрого доступа по ID
const giftAnimations: Record<string, any> = {
  'durov_stand_001': testAnimation,
  'telegatruck_002': frogAnimation,
  'joy_stick_003': pepeAnimation,
  'gram_pods_004': burgAnimation
};

const formatPrice = (price: number) => price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// Интерфейс для объекта Telegram WebApp
declare global {
  interface Window {
    Telegram: {
      WebApp: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
          };
          query_id?: string;
        };
        openInvoice: (url: string, callback: (status: string) => void) => void;
        close: () => void;
        ready: () => void;
        expand: () => void;
      };
    };
  }
}

// Skeleton компонент
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`bg-gray-700/40 rounded-lg animate-pulse ${className}`} />
);

// Компонент уведомления на всю ширину экрана
const NotificationItem = ({ message, type, onClose }: { message: string; type: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className={`fixed top-4 left-0 w-full z-[9999] flex justify-center pointer-events-auto`}
  >
    <div
      className={`max-w-3xl w-full mx-4 bg-black/70 text-white px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm flex justify-between items-center ${
        type === 'success' ? 'border-l-4 border-green-400' : type === 'error' ? 'border-l-4 border-red-500' : 'border-l-4 border-blue-400'
      }`}
    >
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 text-white/70 hover:text-white font-bold">
        ×
      </button>
    </div>
  </motion.div>
);

const formatTimeAgo = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }
};

const FriendsTab = () => {
  const [selectedGift, setSelectedGift] = useState<Gift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [telegramUserId, setTelegramUserId] = useState<number | null>(null);
  const [giftsList, setGiftsList] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([]);

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();

      const user = window.Telegram.WebApp.initDataUnsafe.user;
      if (user?.id) setTelegramUserId(user.id);
    }

    fetchGifts();
    fetchRecentPurchases();
  }, []);

  const fetchGifts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/gifts');
      if (response.ok) {
        const giftsData = await response.json();
        setGiftsList(
          giftsData.map((gift: any) => ({
            ...gift,
            availability: gift.availability,
            animation: localGifts.find((g) => g.id === gift.id)?.animation || testAnimation,
          }))
        );
      } else setGiftsList(localGifts);
    } catch (error) {
      console.error('Error fetching gifts:', error);
      setGiftsList(localGifts);
    } finally {
      setTimeout(() => setLoading(false), 400);
    }
  };

  const fetchRecentPurchases = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/recent-purchases');
      if (response.ok) {
        const purchases = await response.json();
        setRecentPurchases(purchases);
      } else {
        setRecentPurchases([
          { id: 1, username: 'telegram_user', gift_name: 'Durov Stand', gift_id: 'durov_stand_001', purchased_at: new Date().toISOString() },
          { id: 2, username: 'test_user', gift_name: 'Telegatruck', gift_id: 'telegatruck_002', purchased_at: new Date().toISOString() },
        ]);
      }
    } catch (error) {
      console.error('Error fetching recent purchases:', error);
      setRecentPurchases([
        { id: 1, username: 'telegram_user', gift_name: 'Durov Stand', gift_id: 'durov_stand_001', purchased_at: new Date().toISOString() },
      ]);
    }
  };

  const openModal = (gift: Gift) => {
    setSelectedGift(gift);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedGift(null);
    setIsModalOpen(false);
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const findGiftById = (giftId: string) => giftsList.find(gift => gift.id === giftId);

  const handleBuy = async () => {
    if (!selectedGift || !telegramUserId || selectedGift.availability[0] === 0) return;

    setIsProcessing(true);

    try {
      const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const response = await fetch('/api/create-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedGift.name,
          description: `Purchase of ${selectedGift.name}`,
          payload: JSON.stringify({ itemId: selectedGift.id, userId: telegramUserId, transactionId }),
          currency: 'XTR',
          prices: [{ label: selectedGift.name, amount: selectedGift.price }],
          start_parameter: 'start_parameter',
        }),
      });

      if (!response.ok) throw new Error('Failed to create invoice');
      const { invoiceLink } = await response.json();

      if (window.Telegram?.WebApp?.openInvoice) {
        window.Telegram.WebApp.openInvoice(invoiceLink, async (status: string) => {
          if (status === 'paid') {
            const purchaseResponse = await fetch('http://localhost:5000/api/purchase', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                telegram_id: telegramUserId,
                gift_id: selectedGift.id,
                transaction_id: transactionId,
                first_name: window.Telegram.WebApp.initDataUnsafe.user?.first_name,
                last_name: window.Telegram.WebApp.initDataUnsafe.user?.last_name,
                username: window.Telegram.WebApp.initDataUnsafe.user?.username,
              }),
            });

            const purchaseData = await purchaseResponse.json();
            if (purchaseData.success) {
              addNotification('Payment successful and gift added!', 'success');
              fetchGifts();
              fetchRecentPurchases();
            } else addNotification(`Payment successful but failed to save gift: ${purchaseData.error}`, 'error');
            closeModal();
          } else {
            addNotification('Payment failed or cancelled', 'error');
            setIsProcessing(false);
          }
        });
      } else {
        addNotification(`In development: Would process payment for ${selectedGift.name}`, 'info');
        setIsProcessing(false);
        closeModal();
      }
    } catch (error) {
      console.error(error);
      addNotification('Error processing payment', 'error');
      setIsProcessing(false);
    }
  };

  const getGiftAnimation = (giftId: string) => giftAnimations[giftId] || testAnimation;

  if (loading) return (
    <div className="w-full min-h-screen px-4 flex flex-col gap-6">
      <Skeleton className="w-full h-12 rounded-xl" />
      <Skeleton className="w-40 h-8 rounded-full mt-2" />
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="w-full aspect-[3/3.4]" />)}
      </div>
    </div>
  );

  return (
    <div className="w-full min-h-screen px-4 flex flex-col gap-6 relative">
      <AnimatePresence>
        {notifications.map((n) => (
          <NotificationItem key={n.id} message={n.message} type={n.type} onClose={() => setNotifications(prev => prev.filter(item => item.id !== n.id))} />
        ))}
      </AnimatePresence>

<AnimatePresence mode="wait">
  {recentPurchases.length > 0 && (
    <motion.div
      key={recentPurchases[0]?.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-2 bg-[#282829] rounded-xl px-4 py-3 -mt-6 cursor-pointer"
      onClick={() => { const gift = findGiftById(recentPurchases[0]?.gift_id); if (gift) openModal(gift); }}
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9">
          <Lottie animationData={getGiftAnimation(recentPurchases[0]?.gift_id)} loop autoplay />
        </div>
        <div className="flex-1">
          <p className="text-white text-base font-medium">
            @{recentPurchases[0]?.username} purchased{' '}
            <span className="text-blue-400 hover:text-blue-300 transition-colors">
              {recentPurchases[0]?.gift_name}
            </span>
          </p>
          <p className="text-gray-400 text-sm">
            {formatTimeAgo(recentPurchases[0]?.purchased_at)}
          </p>
        </div>
      </div>
    </motion.div>
  )}
</AnimatePresence>

      <h2 className="text-white text-3xl font-bold text-left mt-4">Buy a Gifts</h2>

      <div className="grid grid-cols-2 gap-4">
        {giftsList.map((gift, index) => {
          const isAvailable = gift.availability[0] > 0;

          return (
            <motion.div
              key={gift.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => openModal(gift)}
              className={`cursor-pointer bg-[#282829] rounded-xl aspect-[3/3.4] flex flex-col justify-between p-4 relative overflow-hidden ${!isAvailable ? 'opacity-60' : ''}`}
            >
              <svg viewBox="0 0 80 80" className="absolute top-0 right-0 w-28 h-28" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id={`cornerGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={isAvailable ? '#324d58' : '#583232'} />
                    <stop offset="100%" stopColor={isAvailable ? '#163144' : '#441616'} />
                  </linearGradient>
                </defs>
                <path
                  d="M79.6431 51.04C79.6579 53.4812 79.6653 54.7019 79.1871 55.2665C78.7723 55.7564 78.1476 56.0174 77.5075 55.9682C76.7698 55.9115 75.9067 55.0484 74.1804 53.3221L26.5103 5.65204C24.7841 3.92577 23.9209 3.06264 23.8642 2.32491C23.815 1.68488 24.076 1.06012 24.5659 0.645305C25.1306 0.167166 26.3512 0.174564 28.7925 0.18936L41.5725 0.266814C44.4831 0.284455 45.9385 0.293275 47.3074 0.628064C48.521 0.924899 49.6809 1.40947 50.7451 2.06425C51.9453 2.80275 52.9744 3.83184 55.0326 5.89001L73.9424 24.7999C76.0006 26.858 77.0297 27.8871 77.7682 29.0873C78.423 30.1515 78.9075 31.3114 79.2044 32.5251C79.5392 33.894 79.548 35.3493 79.5656 38.2599L79.6431 51.04Z"
                  fill={`url(#cornerGradient-${index})`}
                />
                <g transform="translate(55, 21) rotate(47)">
                  <text fill="white" fontSize="10" textAnchor="middle" dominantBaseline="middle">
                    {isAvailable ? 'limited' : 'sold out'}
                  </text>
                </g>
              </svg>

              <div className="flex-1 flex items-center justify-center">
                <div className="w-24 h-24">
                  <Lottie animationData={gift.animation} loop={!isModalOpen} autoplay={!isModalOpen} />
                </div>
              </div>

              <div className="bg-[#443926] rounded-3xl px-2 py-1 flex items-center justify-center gap-1 w-max mx-auto">
                <img src="/icons/star.svg" alt="star" className="w-4 h-4" />
                <span className="font-medium text-sm bg-gradient-to-r from-yellow-400 via-yellow-300 to-orange-500 bg-clip-text text-transparent">
                  {formatPrice(gift.price)}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

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
              className="relative w-full max-w-md min-h-[85%] max-h-[95%] bg-[#1f1f1f] rounded-t-3xl md:rounded-3xl p-6 flex flex-col items-center z-10 overflow-y-auto"
            >
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-14 h-1.5 rounded-full bg-white/30" />
              <div className="w-[95%] h-28 rounded-2xl bg-gradient-to-br from-gray-400/30 via-gray-200/10 to-transparent flex items-center justify-center mb-6 mt-6">
                <div className="w-20 h-20">
                  <Lottie animationData={selectedGift.animation} loop autoplay />
                </div>
              </div>

              <h3 className="text-white text-2xl font-bold mb-2">{selectedGift.name}</h3>
              <p className="text-gray-400 text-sm text-center mb-4 px-4">
                This gift will soon be available for upgrade, sale and mint as NFT
              </p>

              <div className="w-full border border-gray-700 rounded-xl overflow-hidden mb-6">
                {[
                  ['Availability', selectedGift.availability[0] > 0 ? `${selectedGift.availability[0]} of ${selectedGift.availability[1]} left` : <span className="text-red-500 font-bold">Sold Out</span>],
                  ['Value', <div className="flex items-center gap-1"><span>{formatPrice(selectedGift.price)}</span><img src="/icons/star.svg" alt="star" className="w-4 h-4 relative -top-[0.7px]" /></div>],
                  ['Collection', <div className="flex items-center gap-2 relative"><span>Classic</span><img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/Twitter_Verified_Badge.svg" alt="Verified" className="w-4 h-4 relative -top-[-0.2px] -left-[5px]" /></div>]
                ].map((row, i) => (
                  <div key={i} className="relative flex border-b border-gray-700 last:border-b-0">
                    <div className="absolute top-0 bottom-0 left-1/3 w-[1px] bg-gray-700"></div>
                    <div className="w-1/3 bg-gray-700/40 text-gray-300 px-3 py-2">{row[0]}</div>
                    <div className="flex-1 text-white px-3 py-2">{row[1]}</div>
                  </div>
                ))}
              </div>

              <button
                onClick={handleBuy}
                disabled={isProcessing || selectedGift.availability[0] === 0}
                className="bg-blue-500 text-white px-6 py-2 rounded-xl w-full font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing...' : 'Buy'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendsTab;