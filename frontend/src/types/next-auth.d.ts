import 'next-auth'

declare module 'next-auth' {
  interface Session {
    accessToken: string
    user: {
      id: string
      name: string
      email: string
      role: 'customer' | 'admin'
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    role: string
  }
}
