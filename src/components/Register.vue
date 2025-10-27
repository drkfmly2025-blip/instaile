<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <div class="mx-auto h-12 w-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">i</span>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          instaile'a kayıt ol
        </h2>
      </div>
      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="username" class="sr-only">Kullanıcı Adı</label>
            <input 
              id="username" 
              v-model="username"
              name="username" 
              type="text" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm" 
              placeholder="Kullanıcı adı"
            >
          </div>
          <div>
            <label for="email" class="sr-only">Email</label>
            <input 
              id="email" 
              v-model="email"
              name="email" 
              type="email" 
              autocomplete="email" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm" 
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
              autocomplete="new-password" 
              required 
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-pink-500 focus:border-pink-500 focus:z-10 sm:text-sm" 
              placeholder="Şifreniz (min. 6 karakter)"
            >
          </div>
        </div>

        <!-- Hata mesajı -->
        <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-md p-3">
          <p class="text-red-700 text-sm">{{ errorMessage }}</p>
        </div>

        <div>
          <button 
            type="submit" 
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
          >
            <span v-if="loading">Kayıt yapılıyor...</span>
            <span v-else>Kayıt Ol</span>
          </button>
        </div>

        <div class="text-center">
          <button 
            type="button" 
            @click="$emit('switch-to-login')"
            class="text-sm text-pink-600 hover:text-pink-500"
          >
            Zaten hesabın var mı? Giriş yap
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase.js'

const emit = defineEmits(['switch-to-login', 'register-success'])

const username = ref('')
const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')

const handleRegister = async () => {
  try {
    loading.value = true
    errorMessage.value = ''
    
    // Validasyon
    if (username.value.length < 3) {
      throw new Error('Kullanıcı adı en az 3 karakter olmalı')
    }
    if (password.value.length < 6) {
      throw new Error('Şifre en az 6 karakter olmalı')
    }

    console.log('Kayıt denemesi:', { email: email.value, username: username.value })

    // Supabase'e kayıt
    const { data, error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          username: username.value,
          avatar_url: ''
        }
      }
    })
    
    console.log('Supabase cevabı:', data, error)
    
    if (error) {
      // Detaylı hata mesajı
      if (error.message.includes('already registered')) {
        throw new Error('Bu email adresi zaten kayıtlı')
      } else if (error.message.includes('password')) {
        throw new Error('Şifre çok zayıf')
      } else if (error.message.includes('email')) {
        throw new Error('Geçersiz email adresi')
      } else {
        throw new Error('Kayıt hatası: ' + error.message)
      }
    }
    
    if (data.user) {
      alert('Kayıt başarılı! Giriş yapabilirsiniz.')
      emit('switch-to-login')
    } else {
      throw new Error('Bilinmeyen kayıt hatası')
    }
    
  } catch (error) {
    console.error('Kayıt hatası:', error)
    errorMessage.value = error.message
  } finally {
    loading.value = false
  }
}
</script>