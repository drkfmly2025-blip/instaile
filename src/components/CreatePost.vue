<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between p-4 border-b">
        <h2 class="text-lg font-semibold">Yeni Gönderi</h2>
        <button @click="$emit('close')" class="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      <!-- Content -->
      <div class="p-4">
        <!-- Image Upload -->
        <div v-if="!imageUrl" class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
             @click="triggerFileInput">
          <input type="file" ref="fileInput" @change="handleImageUpload" accept="image/*" class="hidden">
          <div class="text-gray-400 mb-2">
            <svg class="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
          </div>
          <p class="text-gray-600">Fotoğraf yüklemek için tıkla</p>
          <p class="text-gray-400 text-sm mt-1">(Otomatik optimize edilecek)</p>
        </div>

        <!-- Image Preview -->
        <div v-else class="mb-4">
          <img :src="imageUrl" alt="Preview" class="w-full h-64 object-cover rounded-lg">
          <div class="mt-2 flex justify-between items-center text-sm">
            <button @click="imageUrl = null; originalFile = null" class="text-red-600 hover:text-red-700">
              Fotoğrafı Değiştir
            </button>
            <span v-if="fileInfo" class="text-gray-500">
              {{ fileInfo.originalSize }} → {{ fileInfo.compressedSize }} ({{ fileInfo.savings }})
            </span>
          </div>
        </div>

        <!-- Caption Input -->
        <div class="mb-4">
          <textarea v-model="content" placeholder="Açıklama yaz..."
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    rows="3"></textarea>
        </div>

        <!-- Location Input -->
        <div class="mb-4">
          <input v-model="location" type="text" placeholder="Konum ekle (opsiyonel)"
                 class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent">
        </div>

        <!-- Actions -->
        <div class="flex space-x-2">
          <button @click="$emit('close')" 
                  class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            İptal
          </button>
          <button @click="createPost" 
                  :disabled="!imageUrl || loading"
                  class="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 transition-colors">
            <span v-if="loading">Paylaşılıyor...</span>
            <span v-else>Paylaş</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { supabase } from '../supabase.js'
import { compressImage, formatFileSize } from '../utils/imageCompress.js'

const emit = defineEmits(['close', 'post-created'])

const fileInput = ref(null)
const imageUrl = ref(null)
const originalFile = ref(null)
const content = ref('')
const location = ref('')
const loading = ref(false)
const fileInfo = ref(null)

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleImageUpload = async (event) => {
  const file = event.target.files[0]
  if (file) {
    originalFile.value = file
    
    try {
      // Resmi optimize et
      const compressedFile = await compressImage(file)
      
      // Optimizasyon bilgilerini hesapla
      const originalSize = file.size
      const compressedSize = compressedFile.size
      const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1)
      
      fileInfo.value = {
        originalSize: formatFileSize(originalSize),
        compressedSize: formatFileSize(compressedSize),
        savings: `%${savings} tasarruf`
      }
      
      // Optimize edilmiş resmi preview için göster
      imageUrl.value = URL.createObjectURL(compressedFile)
      originalFile.value = compressedFile
      
    } catch (error) {
      console.error('Resim optimizasyon hatası:', error)
      // Optimizasyon başarısız olursa orijinal dosyayı kullan
      imageUrl.value = URL.createObjectURL(file)
    }
  }
}

const createPost = async () => {
  try {
    loading.value = true

    if (!originalFile.value) {
      throw new Error('Lütfen bir fotoğraf seçin')
    }

    // 1. Optimize edilmiş resmi Supabase Storage'a yükle
    const fileName = `${Date.now()}-${originalFile.value.name}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('posts')
      .upload(fileName, originalFile.value)

    if (uploadError) throw uploadError

    // 2. Public URL al
    const { data: { publicUrl } } = supabase.storage
      .from('posts')
      .getPublicUrl(fileName)

    // 3. Post'u veritabanına kaydet - TÜM KOLONLARLA
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .insert([
        {
          content: content.value,
          image_url: publicUrl,
          location: location.value,
          user_id: (await supabase.auth.getUser()).data.user.id,
          image_size: originalFile.value.size,
          optimized: true
        }
      ])
      .select()

    if (postError) throw postError

    // 4. Başarılı
    emit('post-created', postData[0])
    emit('close')

  } catch (error) {
    console.error('Post oluşturma hatası:', error)
    alert('Post paylaşılırken hata oluştu: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>