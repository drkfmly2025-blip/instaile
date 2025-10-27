<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">i</span>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          instaile'a giriş yap
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email</label>
            <input 
              id="email" 
              v-model="email"
              name="email" 
              type="email" 
              autocomplete="email" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm" 
              placeholder="Email adresiniz"
            >
          </div>
          <div>
            <label for="password" class="sr-only">Şifre</label>
            <input 
              id="password" 
              v-model="password"
              name="password" 
              type="password" 
              autocomplete="current-password" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm" 
              placeholder="Şifreniz"
            >
          </div>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
          >
            <span v-if="loading">Giriş yapılıyor...</span>
            <span v-else>Giriş Yap</span>
          </button>
        </div>

        <div class="text-center">
          <button 
            type="button" 
            @click="$emit('switch-to-register')"
            class="text-sm text-pink-600 hover:text-pink-500"
          >
            Hesabın yok mu? Kayıt ol
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase.js'

const emit = defineEmits(['switch-to-register', 'login-success'])

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })
    
    if (error) throw error
    emit('login-success', data.user)
  } catch (error) {
    alert('Giriş hatası: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
