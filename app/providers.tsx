'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  // Create the QueryClient inside the component to ensure it's unique per user session
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Global toast notifications for your Login and Register forms */}
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937', // gray-800
            color: '#fff',
            border: '1px solid #374151', // gray-700
          },
        }} 
      />
    </QueryClientProvider>
  );
}