import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useAuthStore } from '@/stores/auth'
import { supabase } from '@/api/supabase'

// Mock supabase
vi.mock('@/api/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signInWithOAuth: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('initializes with default values', async () => {
    const authStore = useAuthStore()
    
    // Mock getSession
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null
    })

    await authStore.initialize()
    
    expect(authStore.user).toBeNull()
    expect(authStore.session).toBeNull()
    expect(authStore.loading).toBe(false)
  })

  it('calls signInWithGoogle', async () => {
    const authStore = useAuthStore()
    vi.mocked(supabase.auth.signInWithOAuth).mockResolvedValue({
      data: { provider: 'google', url: '' },
      error: null
    })

    await authStore.signInWithGoogle()
    
    expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: { redirectTo: expect.any(String) }
    })
  })
})
