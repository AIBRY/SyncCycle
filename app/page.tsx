'use client'; 

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; 
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth(); 
  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  // ... handleLogin and handleRegister remain same ...

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Toaster position="top-right" />
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-purple-400 mb-2 tracking-tight">SyncCycle</h1>
          <p className="text-gray-400">Couple productivity with BPD support</p>
        </div>

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Email Address</label>
              <input
                type="email"
                autoComplete="email" // Added for browser optimization
                {...loginForm.register('email', { required: 'Email is required' })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all"
                placeholder="demo1@syncycle.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Password</label>
              <input
                type="password"
                autoComplete="current-password" // Resolves [DOM] warning
                {...loginForm.register('password', { required: 'Password is required' })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all"
                placeholder="••••••••"
              />
            </div>

            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors">
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Username</label>
              <input
                type="text"
                autoComplete="username"
                {...registerForm.register('username', { required: 'Username is required' })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Email Address</label>
              <input
                type="email"
                autoComplete="email"
                {...registerForm.register('email', { required: 'Email is required' })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Password</label>
              <input
                type="password"
                autoComplete="new-password" // Resolves [DOM] warning
                {...registerForm.register('password', { required: 'Password is required' })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all"
                placeholder="Create a password"
              />
            </div>

            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg shadow-lg transition-colors">
              Create Account
            </button>
          </form>
        )}
        {/* ... Toggle button and demo text ... */}
      </div>
    </div>
  );
}