'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

interface LoginForm { email: string; password: string; }
interface RegisterForm extends LoginForm { username: string; }

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register, user } = useAuth();
  const { register: regLogin, handleSubmit: handleLoginSubmit } = useForm<LoginForm>();
  const { register: regSignup, handleSubmit: handleSignupSubmit } = useForm<RegisterForm>();

  const onLogin = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success('Logging in...');
      // Force a hard reload to sync cookies with Middleware
      window.location.href = '/dashboard';
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const onRegister = async (data: RegisterForm) => {
    try {
      await register(data.email, data.password, data.username);
      toast.success('Account created! Please sign in.');
      setIsLogin(true);
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <Toaster position="top-right" />
      <div className="bg-gray-800 border border-gray-700 p-8 rounded-2xl w-full max-w-md shadow-2xl">
        <h1 className="text-4xl font-extrabold text-purple-400 mb-6 text-center">SyncCycle</h1>
        
        {isLogin ? (
          <form onSubmit={handleLoginSubmit(onLogin)} className="space-y-5">
            <input {...regLogin('email')} type="email" placeholder="Email" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" required />
            <input {...regLogin('password')} type="password" placeholder="Password" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" required />
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg">Sign In</button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit(onRegister)} className="space-y-5">
            <input {...regSignup('username')} type="text" placeholder="Username" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" required />
            <input {...regSignup('email')} type="email" placeholder="Email" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" required />
            <input {...regSignup('password')} type="password" placeholder="Password" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white" required />
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg">Create Account</button>
          </form>
        )}
        <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-purple-400 text-sm">
          {isLogin ? "Need an account? Sign up" : "Have an account? Sign in"}
        </button>
      </div>
    </div>
  );
}