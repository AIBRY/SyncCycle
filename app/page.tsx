'use client'; // Required for hooks and form interactivity in Next.js App Router

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth'; // Updated path alias
import { useForm } from 'react-hook-form';
import toast, { Toaster } from 'react-hot-toast';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  username: string;
}

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const { login, register } = useAuth(); //
  const loginForm = useForm<LoginForm>();
  const registerForm = useForm<RegisterForm>();

  const handleLogin = async (data: LoginForm) => {
    try {
      await login(data.email, data.password);
      toast.success('Welcome back!');
      // Next.js routing is usually handled automatically via auth state change
    } catch (error: any) {
      toast.error(error.message || 'Login failed');
    }
  };

  const handleRegister = async (data: RegisterForm) => {
    try {
      await register(data.email, data.password, data.username);
      toast.success('Account created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    }
  };

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
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...loginForm.register('email', { required: 'Email is required' })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all"
                placeholder="demo1@syncycle.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                Password
              </label>
              <input
                type="password"
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
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                Username
              </label>
              <input
                type="text"
                {...registerForm.register('username', { required: 'Username is required' })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all"
                placeholder="Choose a username"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                Email Address
              </label>
              <input
                type="email"
                {...registerForm.register('email', { required: 'Email is required' })}
                className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 text-white focus:border-purple-500 outline-none transition-all"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">
                Password
              </label>
              <input
                type="password"
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

        <div className="mt-8 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : 'Already have an account? Sign in'}
          </button>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700">
          <p className="text-[10px] text-gray-500 text-center leading-relaxed">
            DEMO ACCOUNTS:<br /> 
            demo1@syncycle.com / demo2@syncycle.com<br />
            PASSWORD: password123
          </p>
        </div>
      </div>
    </div>
  );
}