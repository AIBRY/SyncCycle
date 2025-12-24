'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/auth'; //
import { useState } from 'react';
import { 
  Home, 
  ListChecks, 
  DollarSign, 
  Target, 
  HeartPulse, 
  FileText, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react'; //

export default function Sidebar() {
  const { user, logout } = useAuthStore(); //
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false); //

  // If there is no user (e.g., on the login page), don't show the sidebar
  if (!user) return null;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Lists', href: '/lists', icon: ListChecks },
    { name: 'Finance', href: '/finance', icon: DollarSign },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'BPD Tracker', href: '/bpd-tracker', icon: HeartPulse },
    { name: 'Weekly Retro', href: '/retro', icon: FileText },
  ]; //

  const isActive = (href: string) => pathname === href;

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <h1 className="text-xl font-bold text-purple-400">SyncCycle</h1>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden">
            <X className="w-6 h-6 text-gray-400" />
          </button>
        </div>

        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.href)
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile / Logout */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-sm font-medium text-white">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="text-sm text-gray-300 truncate max-w-[100px]">
                {user?.username}
              </span>
            </div>
            <button 
              onClick={logout} 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 flex items-center justify-between h-16 px-4 bg-gray-800 border-b border-gray-700 z-30">
        <button onClick={() => setSidebarOpen(true)}>
          <Menu className="w-6 h-6 text-gray-400" />
        </button>
        <h1 className="text-lg font-semibold text-white">SyncCycle</h1>
        <div className="w-6" />
      </div>
    </>
  );
}