'use client'

import { useTab } from '@/contexts/TabContext'
import Earn from '@/icons/Earn'
import Friends from '@/icons/Friends'
import Home from '@/icons/Home'
import Leaderboard from '@/icons/Leaderboard'
import { TabType } from '@/utils/types'

const NavigationBar = () => {
    const { activeTab, setActiveTab } = useTab()

    const tabs: { id: TabType; label: string; Icon: React.FC<{ className?: string }> }[] = [
        { id: 'home', label: 'Gifts', Icon: Home },
        { id: 'leaderboard', label: 'My collection', Icon: Leaderboard },
        { id: 'friends', label: 'Market', Icon: Friends },
    ]

    return (
        <div className="flex justify-center w-full">
            <div className="fixed bottom-0 w-full max-w-md bg-[#1c1c1e]/70 border-t border-[#3d3d3d] backdrop-blur-md">
                <div className="flex justify-around px-2 pt-2 h-24">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab.id
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex flex-col items-center justify-start transition-colors duration-300"
                            >
                                <tab.Icon
                                    className={`w-8 h-8 mb-0.1 transition-colors duration-500 ${isActive ? 'text-blue-500' : 'text-[#98989e]'}`}
                                />
                                <span
                                    className={`text-sm font-bold transition-colors duration-500 ${isActive ? 'text-blue-500' : 'text-[#98989e]'}`}
                                >
                                    {tab.label}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default NavigationBar