import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../supabase.js'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isLoading = ref(true)

  // Mevcut kullanıcıyı kontrol et
  const initializeAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      user.value = session?.user || null
    } catch (error) {
      console.error('Auth initialization error:', error)
    } finally {
      isLoading.value = false
    }

    // Auth state changes dinle
    supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user || null
    })
  }

  // Çıkış yap
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      user.value = null
    } catch (error) {
      console.error('Sign out error:', error)
      throw error
    }
  }

  return {
    user,
    isLoading,
    initializeAuth,
    signOut
  }
})