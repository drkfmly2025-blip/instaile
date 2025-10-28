<template>
  <div class="min-h-screen bg-black w-full overflow-x-hidden">
    <!-- Auth durumuna göre içerik -->
    <div v-if="auth.isLoading" class="min-h-screen flex items-center justify-center bg-black w-full">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-300">Yükleniyor...</p>
      </div>
    </div>

    <!-- Giriş yapılmamışsa auth göster -->
    <div v-else-if="!auth.user" class="bg-black min-h-screen w-full">
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
    <div v-else class="bg-black w-full">
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
      <nav class="bg-black border-b border-gray-800 sticky top-0 z-50 w-full safe-area-top">
        <div class="w-full px-4 safe-area-padding">
          <div class="flex items-center justify-between h-14 min-h-[44px]">
            <!-- Logo -->
            <div class="flex items-center space-x-2">
              <div class="w-8 h-8 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-lg flex items-center justify-center min-w-[32px] min-h-[32px]">
                <span class="text-white font-bold text-xs">i</span>
              </div>
              <h1 class="text-lg font-bold bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent">instaile</h1>
            </div>
            
            <!-- Create Post Butonu -->
            <button 
              @click="showCreatePost = true"
              class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-pink-600 hover:to-purple-700 transition-all flex items-center space-x-2 min-h-[44px]"
            >
              <span>+ Yeni Gönderi</span>
            </button>

            <!-- Kullanıcı bilgisi ve çıkış -->
            <div class="flex items-center space-x-3">
              <button 
                @click="handleSignOut"
                class="bg-gray-800 text-gray-300 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-all min-h-[44px]"
              >
                Çıkış
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Ana içerik - Optimized -->
      <main class="w-full max-w-full pb-20 safe-area-padding">
        <!-- Stories Section -->
        <div class="flex space-x-4 px-4 py-3 mb-2 overflow-x-auto bg-black border-b border-gray-800 w-full no-scrollbar">
          <div v-for="i in 8" :key="i" class="flex flex-col items-center space-y-1 flex-shrink-0">
            <div class="w-14 h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-0.5 min-w-[56px] min-h-[56px]">
              <div class="w-full h-full bg-black rounded-full flex items-center justify-center">
                <span class="text-xs font-semibold text-white">K{{ i }}</span>
              </div>
            </div>
            <span class="text-xs text-gray-400 truncate max-w-[60px]">kullanici{{ i }}</span>
          </div>
        </div>

        <!-- Posts - TEK SÜTUN -->
        <div v-if="posts.length > 0" style="display: flex; flex-direction: column; width: 100%;">
          <div v-for="post in posts" :key="post.id" style="width: 100%; margin-bottom: 24px;" class="bg-black border-b border-gray-800">
            <!-- Post Header -->
            <div class="flex items-center justify-between p-4 w-full">
              <div class="flex items-center space-x-3">
                <div class="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-0.5 min-w-[40px] min-h-[40px]">
                  <div class="w-full h-full bg-black rounded-full flex items-center justify-center">
                    <span class="text-sm font-semibold text-white">{{ post.display_name?.charAt(0)?.toUpperCase() || 'K' }}</span>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold text-white text-base">{{ post.display_name }}</h3>
                  <p class="text-xs text-gray-400">{{ post.location || 'Konum belirtilmemiş' }}</p>
                </div>
              </div>
              <button class="text-gray-400 hover:text-white text-xl min-w-[44px] min-h-[44px] flex items-center justify-center">
                •••
              </button>
            </div>

            <!-- Post Image - OPTIMIZED -->
            <div class="image-container">
              <img 
                v-if="post.image_url" 
                :src="post.image_url" 
                :alt="post.content" 
                class="responsive-image"
                loading="lazy"
                @load="handleImageLoad"
              >
              <div v-else class="no-image-placeholder">
                <span class="text-4xl mb-2">📸</span>
                <span class="text-white text-center px-4">{{ post.content }}</span>
              </div>
            </div>

            <!-- Post Actions -->
            <div class="p-4 space-y-3 w-full">
              <div class="flex items-center justify-between w-full">
                <div class="flex items-center space-x-4">
                  <button 
                    @click="toggleLike(post.id)"
                    class="transition-all duration-300 transform hover:scale-110 text-3xl min-w-[44px] min-h-[44px] flex items-center justify-center"
                    :class="userLikes.includes(post.id) ? 'text-red-500' : 'text-white hover:text-red-400'"
                  >
                    {{ userLikes.includes(post.id) ? '❤️' : '🤍' }}
                  </button>
                  <button 
                    @click="showComments(post.id)"
                    class="text-white hover:text-blue-400 transition-colors text-3xl transform hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center"
                  >
                    💬
                  </button>
                  <button class="text-white hover:text-green-400 transition-colors text-3xl transform hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center">
                    📤
                  </button>
                </div>
                <button class="text-white hover:text-yellow-400 transition-colors text-3xl transform hover:scale-110 min-w-[44px] min-h-[44px] flex items-center justify-center">
                  🔖
                </button>
              </div>

              <div class="text-base font-semibold text-white">
                {{ post.likes_count || 0 }} beğenme
              </div>

              <div class="text-base">
                <span class="font-semibold text-white mr-2">{{ post.display_name }}</span>
                <span class="text-gray-200">{{ post.content }}</span>
              </div>

              <div 
                @click="showComments(post.id)"
                class="text-base text-gray-400 cursor-pointer hover:text-gray-300 py-2"
              >
                {{ post.comments_count || 0 }} yorumun tümünü gör
              </div>

              <div class="text-sm text-gray-500 py-1">
                {{ formatTime(post.created_at) }}
              </div>
            </div>
          </div>
        </div>

        <!-- Boş state -->
        <div v-else class="text-center py-12 w-full px-4">
          <div class="text-gray-600 mb-4">
            <svg class="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-white mb-3">Henüz gönderi yok</h3>
          <p class="text-gray-400 mb-6 text-base">İlk gönderiyi paylaşmak için "Yeni Gönderi" butonuna tıkla!</p>
          <button 
            @click="showCreatePost = true"
            class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-lg font-medium hover:from-pink-600 hover:to-purple-700 transition-all text-base min-h-[52px]"
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

// Resim yükleme handler
const handleImageLoad = (event) => {
  console.log('Resim yüklendi:', event.target.src)
}

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

    await likes.toggleLike(postId)
  } catch (error) {
    console.error('BEĞENİ HATASI:', error)
    alert('Beğeni işlemi başarısız: ' + error.message)
  }
}

// Yorum modal'ını göster
const showComments = (postId) => {
  selectedPostId.value = postId
  showCommentsModal.value = true
}

// Yeni yorum eklendiğinde
const handleCommentAdded = (comment) => {
  const postIndex = posts.value.findIndex(p => p.id === comment.post_id)
  if (postIndex !== -1) {
    const post = posts.value[postIndex]
    post.comments_count = (post.comments_count || 0) + 1
  }
}

// Post'ları veritabanından çek - KULLANICI İSİMLERİYLE
const fetchPosts = async () => {
  try {
    console.log('Postlar çekiliyor...')
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    // Her post için kullanıcı bilgilerini auth.users'dan çek
    const postsWithUsers = await Promise.all(
      (data || []).map(async (post) => {
        try {
          // Kullanıcı bilgilerini auth.users'dan çek
          const { data: userData, error: userError } = await supabase
            .from('auth.users')
            .select('raw_user_meta_data, email')
            .eq('id', post.user_id)
            .single()

          if (userError) throw userError

          // username'i raw_user_meta_data'dan al
          const username = userData?.raw_user_meta_data?.username
          const email = userData?.email
          
          return {
            ...post,
            display_name: username || email?.split('@')[0] || `Kullanıcı_${post.user_id?.substring(0, 6)}`
          }
        } catch (userError) {
          console.log('Kullanıcı bilgisi alınamadı:', userError)
          return {
            ...post,
            display_name: `Kullanıcı_${post.user_id?.substring(0, 6)}`
          }
        }
      })
    )
    
    posts.value = postsWithUsers
    console.log('Postlar çekildi:', posts.value)

    // Kullanıcının beğendiklerini getir
    if (auth.user) {
      userLikes.value = await likes.getUserLikes()
      console.log('Kullanıcı beğenileri:', userLikes.value)
    }
  } catch (error) {
    console.error('Postları çekerken hata:', error)
  }
}

// Yeni post oluşturulduğunda - KULLANICI İSİMLERİYLE
const handlePostCreated = async (newPost) => {
  try {
    // Yeni post için kullanıcı bilgilerini auth.users'dan çek
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('raw_user_meta_data, email')
      .eq('id', newPost.user_id)
      .single()

    let displayName
    if (userError) {
      console.log('Kullanıcı bilgisi alınamadı:', userError)
      displayName = `Kullanıcı_${newPost.user_id?.substring(0, 6)}`
    } else {
      const username = userData?.raw_user_meta_data?.username
      const email = userData?.email
      displayName = username || email?.split('@')[0] || `Kullanıcı_${newPost.user_id?.substring(0, 6)}`
    }

    const postWithUser = {
      ...newPost,
      display_name: displayName
    }
    
    posts.value.unshift(postWithUser)
    console.log('Yeni post eklendi:', postWithUser)
  } catch (error) {
    console.error('Yeni post eklenirken hata:', error)
    // Hata durumunda fallback
    const postWithDefault = {
      ...newPost,
      display_name: `Kullanıcı_${newPost.user_id?.substring(0, 6)}`
    }
    posts.value.unshift(postWithDefault)
  }
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

<style scoped>
/* Safe area support for mobile devices */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-padding {
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
}

/* Ensure full width on all devices */
.w-full {
  width: 100% !important;
}

.max-w-full {
  max-width: 100% !important;
}

/* Hide scrollbar */
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* OPTIMIZED IMAGE STYLES */
.image-container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-height: 100vh;
  overflow: hidden;
  background-color: #000000;
  width: 100%;
}

.responsive-image {
  object-fit: contain;
  width: 100%;
  height: auto;
  max-height: 100vh;
  -webkit-user-select: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: #6b7280;
  font-size: 1.125rem;
  width: 100%;
  min-height: 200px;
}

/* Mobile optimizations */
@media (max-width: 640px) {
  .responsive-image {
    max-height: 70vh;
    object-fit: contain;
  }
  
  .image-container {
    max-height: 70vh;
  }
}

/* Desktop optimizations */
@media (min-width: 1024px) {
  .responsive-image {
    max-height: 80vh;
  }
  
  .image-container {
    max-height: 80vh;
  }
}

/* Default app styles */
#app {
  max-width: 100%;
  margin: 0 auto;
  text-align: center;
  width: 100%;
  padding: 0;
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  min-width: 320px;
  min-height: 100vh;
  background-color: #000000;
}
</style>