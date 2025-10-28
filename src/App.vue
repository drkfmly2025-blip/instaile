<template>
  <div class="min-h-screen bg-black">
    <!-- Auth durumuna göre içerik -->
    <div v-if="auth.isLoading" class="min-h-screen flex items-center justify-center bg-black">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-300">Yükleniyor...</p>
      </div>
    </div>

    <!-- Giriş yapılmamışsa auth göster -->
    <div v-else-if="!auth.user" class="bg-black min-h-screen">
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
    <div v-else class="bg-black">
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
      <nav class="bg-black border-b border-gray-800 sticky top-0 z-50">
        <div class="max-w-lg mx-auto px-4">
          <div class="flex items-center justify-between h-14">
            <!-- Logo -->
            <div class="flex items-center space-x-2">
              <div class="w-7 h-7 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-xs">i</span>
              </div>
              <h1 class="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">instaile</h1>
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
              <button 
                @click="handleSignOut"
                class="bg-gray-800 text-gray-300 px-3 py-1 rounded-lg text-sm font-medium hover:bg-gray-700 transition-all"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Ana içerik - Instagram tarzı tek sütun -->
      <main class="max-w-lg mx-auto pb-20">
        <!-- Stories Section -->
        <div class="flex space-x-4 px-4 py-3 mb-2 overflow-x-auto bg-black border-b border-gray-800">
          <div v-for="i in 8" :key="i" class="flex flex-col items-center space-y-1 flex-shrink-0">
            <div class="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-0.5">
              <div class="w-full h-full bg-black rounded-full flex items-center justify-center">
                <span class="text-xs font-semibold text-white">K{{ i }}</span>
              </div>
            </div>
            <span class="text-xs text-gray-400 truncate max-w-[60px]">kullanici{{ i }}</span>
          </div>
        </div>

        <!-- Posts - Instagram tarzı tek tek -->
        <div v-if="posts.length > 0" class="flex flex-col gap-6">
          <div v-for="post in posts" :key="post.id" class="bg-black border-b border-gray-800">
            <!-- Post Header -->
            <div class="flex items-center justify-between p-4">
              <div class="flex items-center space-x-3">
                <div class="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-0.5">
                  <div class="w-full h-full bg-black rounded-full flex items-center justify-center">
                    <span class="text-xs font-semibold text-white">{{ post.username?.charAt(0) || 'U' }}</span>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold text-white text-sm">{{ post.username || 'Kullanıcı' }}</h3>
                  <p class="text-xs text-gray-400">{{ post.location || 'Konum belirtilmemiş' }}</p>
                </div>
              </div>
              <button class="text-gray-400 hover:text-white">
                •••
              </button>
            </div>

            <!-- Post Image - Full width -->
            <div class="w-full aspect-square bg-black flex items-center justify-center">
              <img 
                v-if="post.image_url" 
                :src="post.image_url" 
                :alt="post.content" 
                class="w-full h-full object-contain"
              >
              <div v-else class="text-gray-500 text-lg flex flex-col items-center">
                <span class="text-4xl mb-2">📸</span>
                <span class="text-white">{{ post.content }}</span>
              </div>
            </div>

            <!-- Post Actions -->
            <div class="p-4 space-y-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                  <button 
                    @click="toggleLike(post.id)"
                    class="transition-all duration-300 transform hover:scale-110 text-2xl"
                    :class="userLikes.includes(post.id) ? 'text-red-500' : 'text-white hover:text-red-400'"
                  >
                    {{ userLikes.includes(post.id) ? '❤️' : '🤍' }}
                  </button>
                  <button 
                    @click="showComments(post.id)"
                    class="text-white hover:text-blue-400 transition-colors text-2xl transform hover:scale-110"
                  >
                    💬
                  </button>
                  <button class="text-white hover:text-green-400 transition-colors text-2xl transform hover:scale-110">
                    📤
                  </button>
                </div>
                <button class="text-white hover:text-yellow-400 transition-colors text-2xl transform hover:scale-110">
                  🔖
                </button>
              </div>

              <div class="text-sm font-semibold text-white">
                {{ post.likes_count || 0 }} beğenme
              </div>

              <div class="text-sm">
                <span class="font-semibold text-white mr-2">{{ post.username || 'Kullanıcı' }}</span>
                <span class="text-gray-200">{{ post.content }}</span>
              </div>

              <div 
                @click="showComments(post.id)"
                class="text-sm text-gray-400 cursor-pointer hover:text-gray-300"
              >
                {{ post.comments_count || 0 }} yorumun tümünü gör
              </div>

              <div class="text-xs text-gray-500">
                {{ formatTime(post.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Boş state -->
        <div v-else class="text-center py-12">
          <div class="text-gray-600 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-white mb-2">Henüz gönderi yok</h3>
          <p class="text-gray-400 mb-4">İlk gönderiyi paylaşmak için "Yeni Gönderi" butonuna tıkla!</p>
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
