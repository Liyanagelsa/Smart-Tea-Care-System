import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../AuthContext'
import { supabase } from '../../utils/supabase'

// Mock Supabase
vi.mock('../../utils/supabase', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } }))
    },
    from: vi.fn()
  }
}))

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('User Signup', () => {
    it('AC1: Should create user account with valid data', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'farmer@test.com'
      }

      const mockProfile = {
        id: 'user-123',
        email: 'farmer@test.com',
        full_name: 'John Farmer',
        role: 'user',
        language: 'en'
      }

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      let signupResult
      await act(async () => {
        signupResult = await result.current.signUp(
          'farmer@test.com',
          'Test@12345',
          'John Farmer'
        )
      })

      expect(signupResult.error).toBeNull()
      expect(signupResult.data.user.email).toBe('farmer@test.com')
    })

    it('AC2: Should reject duplicate email', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'User already registered' }
      })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      let signupResult
      await act(async () => {
        signupResult = await result.current.signUp(
          'existing@test.com',
          'Test@12345',
          'John Farmer'
        )
      })

      expect(signupResult.error).toBeDefined()
      expect(signupResult.error.message).toContain('already registered')
    })

    it('AC3: Should reject weak password', async () => {
      supabase.auth.signUp.mockResolvedValue({
        data: null,
        error: { message: 'Password should be at least 6 characters' }
      })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      let signupResult
      await act(async () => {
        signupResult = await result.current.signUp(
          'farmer@test.com',
          '123',
          'John Farmer'
        )
      })

      expect(signupResult.error).toBeDefined()
    })
  })

  describe('User Login', () => {
    it('AC4: Should login with correct credentials', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'farmer@test.com'
      }

      const mockProfile = {
        id: 'user-123',
        email: 'farmer@test.com',
        full_name: 'John Farmer',
        role: 'user',
        language: 'en'
      }

      supabase.auth.signInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: {} },
        error: null
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult
      await act(async () => {
        loginResult = await result.current.signIn(
          'farmer@test.com',
          'Test@12345'
        )
      })

      expect(loginResult.error).toBeNull()
      expect(loginResult.data.user.email).toBe('farmer@test.com')
    })

    it('AC5: Should reject wrong password', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult
      await act(async () => {
        loginResult = await result.current.signIn(
          'farmer@test.com',
          'WrongPassword'
        )
      })

      expect(loginResult.error).toBeDefined()
      expect(loginResult.error.message).toContain('Invalid')
    })

    it('AC6: Should reject non-existent user', async () => {
      supabase.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: { message: 'Invalid login credentials' }
      })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      let loginResult
      await act(async () => {
        loginResult = await result.current.signIn(
          'nonexistent@test.com',
          'Test@12345'
        )
      })

      expect(loginResult.error).toBeDefined()
    })
  })

  describe('Profile Management', () => {
    it('AC7: Should auto-create profile on signup', async () => {
      const mockUser = { id: 'user-123', email: 'farmer@test.com' }
      const mockProfile = {
        id: 'user-123',
        email: 'farmer@test.com',
        full_name: 'John Farmer',
        role: 'user',
        language: 'en'
      }

      supabase.auth.signUp.mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.signUp('farmer@test.com', 'Test@12345', 'John Farmer')
      })

      expect(result.current.profile).toBeDefined()
      expect(result.current.profile.full_name).toBe('John Farmer')
    })

    it('AC8: Should persist language preference', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'farmer@test.com',
        full_name: 'John Farmer',
        role: 'user',
        language: 'si'
      }

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        }),
        update: vi.fn().mockReturnThis()
      })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        result.current.updateLanguage('si')
      })

      expect(result.current.language).toBe('si')
    })
  })

  describe('Admin Role', () => {
    it('AC9: Should identify admin users', async () => {
      const mockProfile = {
        id: 'user-123',
        email: 'admin@test.com',
        full_name: 'Admin Manager',
        role: 'admin',
        language: 'en'
      }

      supabase.auth.getSession.mockResolvedValue({
        data: {
          session: {
            user: { id: 'user-123', email: 'admin@test.com' }
          }
        }
      })

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue({
          data: mockProfile,
          error: null
        })
      })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true)
      })
    })
  })

  describe('Logout', () => {
    it('AC10: Should clear session on logout', async () => {
      supabase.auth.signOut.mockResolvedValue({ error: null })

      const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>
      const { result } = renderHook(() => useAuth(), { wrapper })

      await act(async () => {
        await result.current.signOut()
      })

      expect(result.current.user).toBeNull()
      expect(result.current.profile).toBeNull()
    })
  })
})
