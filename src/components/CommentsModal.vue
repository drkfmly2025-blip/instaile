<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold">Yorumlar</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <!-- Comments List -->
      <div class="flex-1 overflow-y-auto p-4 space-y-4">
        <!-- Yorum yoksa -->
        <div v-if="comments.length === 0" class="text-center py-8 text-gray-500">
          <p>Henüz yorum yok</p>
          <p class="text-sm">İlk yorumu sen yap!</p>
        </div>

        <!-- Yorumlar -->
        <div v-for="comment in comments" :key="comment.id" class="flex space-x-3">
          <!-- Avatar -->
          <div class="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full p-0.5 flex-shrink-0">
            <div class="w-full h-full bg-white rounded-full flex items-center justify-center">
              <span class="text-xs font-semibold">U</span>
            </div>
          </div>
          
          <!-- Content -->
          <div class="flex-1">
            <div class="bg-gray-100 rounded-lg p-3">
              <p class="font-semibold text-sm text-gray-900">Kullanıcı</p>
              <p class="text-gray-800 text-sm mt-1">{{ comment.content }}</p>
            </div>
            <p class="text-xs text-gray-500 mt-1">{{ formatTime(comment.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Add Comment -->
      <div class="p-4 border-t">
        <form @submit.prevent="addComment" class="flex space-x-2">
          <input 
            v-model="newComment"
            type="text" 
            placeholder="Yorumunuzu yazın..."
            class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          >
          <button 
            type="submit"
            :disabled="!newComment.trim()"
            class="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 transition-colors"
          >
            Gönder
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase.js'

const emit = defineEmits(['close', 'comment-added'])

const props = defineProps({
  postId: {
    type: String,
    required: true
  }
})

const comments = ref([])
const newComment = ref('')

// Zaman formatlama
const formatTime = (timestamp) => {
  if (!timestamp) return 'Şimdi'
  const now = new Date()
  const commentTime = new Date(timestamp)
  const diffMs = now - commentTime
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)

  if (diffMins < 1) return 'Şimdi'
  if (diffMins < 60) return `${diffMins} dakika önce`
  if (diffHours < 24) return `${diffHours} saat önce`
  return commentTime.toLocaleDateString('tr-TR')
}

// Yorumları getir - BASİT VERSİYON
const fetchComments = async () => {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', props.postId)
      .order('created_at', { ascending: true })

    if (error) throw error
    comments.value = data || []
    console.log('Yorumlar getirildi:', comments.value)
  } catch (error) {
    console.error('Yorumları getirme hatası:', error)
  }
}

// Yorum ekle - BASİT VERSİYON (foreign key olmadan)
const addComment = async () => {
  console.log('Yorum ekleniyor:', newComment.value)
  
  try {
    if (!newComment.value.trim()) {
      console.log('Boş yorum, iptal edildi')
      return
    }

    const user = (await supabase.auth.getUser()).data.user
    if (!user) throw new Error('Yorum için giriş yapmalısınız')

    // Basit yorum ekleme - foreign key olmadan
    const { data, error } = await supabase
      .from('comments')
      .insert([
        {
          post_id: props.postId,
          user_id: user.id,
          content: newComment.value.trim()
        }
      ])
      .select()

    if (error) throw error

    const comment = data[0]
    console.log('Yorum eklendi:', comment)
    
    // Yorumu listeye ekle
    comments.value.push(comment)
    
    // Input'u temizle
    newComment.value = ''
    
    // Post'un yorum sayısını güncelle
    await supabase.rpc('increment_comments', { post_id: props.postId })
    
    // Parent component'e bildir
    emit('comment-added', comment)
    
  } catch (error) {
    console.error('Yorum ekleme hatası:', error)
    alert('Yorum eklenirken hata oluştu: ' + error.message)
  }
}

// Modal açıldığında yorumları getir
onMounted(() => {
  fetchComments()
})
</script>