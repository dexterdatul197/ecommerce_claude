'use client'
import { SessionProvider, useSession } from 'next-auth/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { setAuthToken } from '@/lib/api'

function SessionSync() {
  const { data: session } = useSession()
  useEffect(() => {
    setAuthToken((session as { accessToken?: string } | null)?.accessToken ?? null)
  }, [(session as { accessToken?: string } | null)?.accessToken])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000, retry: 1 },
        },
      })
  )

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <SessionSync />
        {children}
        <Toaster />
      </QueryClientProvider>
    </SessionProvider>
  )
}
