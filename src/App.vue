<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Auth durumuna göre içerik -->
    <div v-if="auth.isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Yükleniyor...</p>
      </div>
    </div>

    <!-- Giriş yapılmamışsa auth göster -->
    <div v-else-if="!auth.user">
      <Login 
        v-if="showLogin" 
        @switch-to-register="showLogin = false"
        @login-success="handleLoginSuccess"
      />
      <Register 
        v-else
        @switch-to-login="showLogin = true"
        @register-success="handleRegisterSuccess"
      />
    </div>

    <!-- Giriş yapılmışsa ana uygulama -->
    <div v-else>
      <!-- Create Post Modal -->
      <CreatePost 
        v-if="showCreatePost"
        @close="showCreatePost = false"
        @post-created="handlePostCreated"
      />

      <!-- Comments Modal -->
      <CommentsModal 
        v-if="showCommentsModal"
        :postId="selectedPostId"
        @close="showCommentsModal = false"
        @comment-added="handleCommentAdded"
      />

      <!-- Profesyonel Navbar -->
      <nav class="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div class="max-w-6xl mx-auto px-3 sm:px-4">
          <div class="flex items-center justify-between h-14 sm:h-16">
            <!-- Logo -->
            <div class="flex items-center space-x-2">
              <div class="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-xs sm:text-sm">i</span>
              </div>
              <h1 class="text-lg sm:text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">instaile</h1>
            </div>
            
            <!-- Create Post Butonu -->
            <button 
              @click="showCreatePost = true"
              class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all flex items-center space-x-2"
            >
              <span>+ Yeni Gönderi</span>
            </button>

            <!-- Kullanıcı bilgisi ve çıkış -->
            <div class="flex items-center space-x-3">
              <span class="text-sm text-gray-700 hidden sm:block">Hoş geldin, {{ auth.user.email }}</span>
              <button 
                @click="handleSignOut"
                class="bg-gray-100 text-gray-700 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Ana içerik -->
      <main class="max-w-6xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <!-- Stories Section -->
        <div class="flex space-x-4 sm:space-x-6 mb-6 sm:mb-8 overflow-x-auto pb-3 sm:pb-4">
          <div v-for="i in 8" :key="i" class="flex flex-col items-center space-y-1 sm:space-y-2 flex-shrink-0">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-0.5">
              <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
                <span class="text-xs font-semibold">K{{ i }}</span>
              </div>
            </div>
            <span class="text-xs text-gray-600 truncate max-w-[50px] sm:max-w-[70px]">kullanici{{ i }}</span>
          </div>
        </div>

        <!-- Posts Grid -->
        <div v-if="posts.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div v-for="post in posts" :key="post.id" class="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <!-- Post Header -->
            <div class="flex items-center justify-between p-3 sm:p-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-0.5">
                  <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
                    <span class="text-xs font-semibold">{{ post.username?.charAt(0) || 'U' }}</span>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900 text-sm sm:text-base">{{ post.username || 'Kullanıcı' }}</h3>
                  <p class="text-xs text-gray-500">{{ post.location || 'Konum belirtilmemiş' }}</p>
                </div>
              </div>
            </div>

            <!-- Post Image -->
            <div class="w-full h-64 sm:h-80 bg-gray-100 flex items-center justify-center">
              <img v-if="post.image_url" :src="post.image_url" :alt="post.content" class="w-full h-full object-cover">
              <span v-else class="text-gray-500 text-base sm:text-lg">📸 {{ post.content }}</span>
            </div>

            <!-- Post Actions -->
            <div class="p-3 sm:p-4 space-y-2 sm:space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3 sm:space-x-4">
                  <button 
                    @click="toggleLike(post.id)"
                    class="transition-all duration-300 transform hover:scale-110 text-2xl"
                    :class="userLikes.includes(post.id) ? 'text-red-500' : 'text-gray-700 hover:text-red-500'"
                  >
                    {{ userLikes.includes(post.id) ? '❤️' : '🤍' }}
                  </button>
                  <button 
                    @click="showComments(post.id)"
                    class="text-gray-700 hover:text-blue-500 transition-colors text-2xl"
                  >
                    💬
                  </button>
                </div>
              </div>

              <div class="text-sm font-semibold text-gray-900">
                {{ post.likes_count || 0 }} beğenme
              </div>

              <div class="text-sm">
                <span class="font-semibold text-gray-900">{{ post.username || 'Kullanıcı' }}</span>
                <span class="text-gray-800">{{ post.content }}</span>
              </div>

              <div 
                @click="showComments(post.id)"
                class="text-sm text-gray-500 cursor-pointer hover:text-gray-700"
              >
                {{ post.comments_count || 0 }} yorumun tümünü gör
              </div>

              <div class="text-xs text-gray-400">
                {{ formatTime(post.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Boş state -->
        <div v-else class="text-center py-12">
          <div class="text-gray-400 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 mb-2">Henüz gönderi yok</h3>
          <p class="text-gray-600 mb-4">İlk gönderiyi paylaşmak için "Yeni Gönderi" butonuna tıkla!</p>
          <button 
            @click="showCreatePost = true"
            class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all"
          >
            İlk Gönderiyi Paylaş
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from './stores/auth.js'
import { useLikesStore } from './stores/likes.js'
import { supabase } from './supabase.js'
import Login from './components/Login.vue'
import Register from './components/Register.vue'
import CreatePost from './components/CreatePost.vue'
import CommentsModal from './components/CommentsModal.vue'

const auth = useAuthStore()
const likes = useLikesStore()
const showLogin = ref(true)
const showCreatePost = ref(false)
const showCommentsModal = ref(false)
const selectedPostId = ref(null)
const posts = ref([])
const userLikes = ref([])

// Zaman formatlama
const formatTime = (timestamp) => {
  if (!timestamp) return 'Yakın zamanda'
  const now = new Date()
  const postTime = new Date(timestamp)
  const diffMs = now - postTime
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Şimdi'
  if (diffMins < 60) return `${diffMins} dakika önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  if (diffDays < 7) return `${diffDays} gün önce`
  return postTime.toLocaleDateString('tr-TR')
}

// Beğeni toggle
const toggleLike = async (postId) => {
  console.log('Beğeni tıklandı:', postId)
  
  try {
    // Önce UI'ı güncelle (anında feedback)
    const postIndex = posts.value.findIndex(p => p.id === postId)
    if (postIndex !== -1) {
      const post = posts.value[postIndex]
      
      if (userLikes.value.includes(postId)) {
        // Beğeniyi kaldır
        userLikes.value = userLikes.value.filter(id => id !== postId)
        post.likes_count = Math.max((post.likes_count || 1) - 1, 0)
        console.log('Beğeni kaldırıldı')
      } else {
        // Beğeni ekle
        userLikes.value.push(postId)
        post.likes_count = (post.likes_count || 0) + 1
        console.log('Beğeni eklendi')
      }
    }

    // Backend işlemi
    console.log('Backend beğeni işlemi başlıyor...')
    const result = await likes.toggleLike(postId)
    console.log('Backend cevabı:', result)

    console.log('Beğeni işlemi tamamlandı')
    
  } catch (error) {
    console.error('BEĞENİ HATASI:', error)
    
    // Hata durumunda UI'ı geri al
    const postIndex = posts.value.findIndex(p => p.id === postId)
    if (postIndex !== -1) {
      const post = posts.value[postIndex]
      
      if (userLikes.value.includes(postId)) {
        userLikes.value = userLikes.value.filter(id => id !== postId)
        post.likes_count = Math.max((post.likes_count || 1) - 1, 0)
      } else {
        userLikes.value.push(postId)
        post.likes_count = (post.likes_count || 0) + 1
      }
    }
    
    alert('Beğeni işlemi başarısız: ' + error.message)
  }
}

// Yorum modal'ını göster
const showComments = (postId) => {
  selectedPostId.value = postId
  showCommentsModal.value = true
  console.log('Yorumlar açılıyor, post:', postId)
}

// Yeni yorum eklendiğinde
const handleCommentAdded = (comment) => {
  console.log('Yeni yorum eklendi:', comment)
  
  // İlgili post'un yorum sayısını güncelle
  const postIndex = posts.value.findIndex(p => p.id === comment.post_id)
  if (postIndex !== -1) {
    const post = posts.value[postIndex]
    post.comments_count = (post.comments_count || 0) + 1
    console.log('Yorum sayısı güncellendi:', post.comments_count)
  }
}

// Post'ları veritabanından çek
const fetchPosts = async () => {
  try {
    console.log('Postlar çekiliyor...')
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    posts.value = data || []
    console.log('Postlar çekildi:', posts.value.length)

    // Kullanıcının beğendiklerini getir
    if (auth.user) {
      userLikes.value = await likes.getUserLikes()
      console.log('Kullanıcı beğenileri:', userLikes.value)
    }
  } catch (error) {
    console.error('Postları çekerken hata:', error)
  }
}

// Yeni post oluşturulduğunda
const handlePostCreated = (newPost) => {
  posts.value.unshift(newPost)
  console.log('Yeni post eklendi:', newPost)
}

const handleLoginSuccess = (user) => {
  console.log('Giriş başarılı:', user)
  fetchPosts()
}

const handleRegisterSuccess = () => {
  showLogin.value = true
}

const handleSignOut = async () => {
  try {
    await auth.signOut()
    posts.value = []
    userLikes.value = []
  } catch (error) {
    alert('Çıkış hatası: ' + error.message)
  }
}

// Uygulama başladığında
onMounted(() => {
  auth.initializeAuth().then(() => {
    if (auth.user) {
      fetchPosts()
    }
  })
})
</script>