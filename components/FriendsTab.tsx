'use client'

import Lottie from 'lottie-react'
import mrktAnimation from '@/animations/mrkt.json'

const FriendsTab = () => {
  return (
    <div className="w-full h-screen flex flex-col justify-center items-center -translate-y-24">
      {/* Lottie Animation centered */}
      <div className="w-40 h-40">
        <Lottie animationData={mrktAnimation} loop />
      </div>

      {/* Title below animation */}
      <h1 className="mt-1 text-white text-3xl text-center font-medium">Market</h1>

      {/* Subtitle below title */}
      <p className="mt-2 text-[#98989e] text-center text-lg leading-tight max-w-xs font-medium">
        The marketplace is preparing for launch<br />
        Stay tuned!
      </p>
    </div>
  )
}

export default FriendsTab
