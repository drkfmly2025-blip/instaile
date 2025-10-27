import { ref } from 'vue'
import { supabase } from '../supabase.js'

// Beğeni store'u
export const useLikesStore = () => {
  const loading = ref(false)

  // Beğeni ekle/çıkar
  const toggleLike = async (postId) => {
    try {
      loading.value = true
      const user = (await supabase.auth.getUser()).data.user
      
      if (!user) throw new Error('Beğeni için giriş yapmalısınız')

      // Önce beğeni var mı kontrol et
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .single()

      if (existingLike) {
        // Beğeniyi kaldır
        await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id)

        // Post'un beğeni sayısını güncelle
        await supabase.rpc('decrement_likes', { post_id: postId })
        
        return { action: 'unlike', success: true }
      } else {
        // Beğeni ekle
        await supabase
          .from('likes')
          .insert([
            {
              post_id: postId,
              user_id: user.id
            }
          ])

        // Post'un beğeni sayısını güncelle
        await supabase.rpc('increment_likes', { post_id: postId })
        
        return { action: 'like', success: true }
      }

    } catch (error) {
      console.error('Beğeni hatası:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  // Kullanıcının beğendiği post'ları getir
  const getUserLikes = async () => {
    try {
      const user = (await supabase.auth.getUser()).data.user
      if (!user) return []

      const { data, error } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)

      if (error) throw error
      return data.map(like => like.post_id)
    } catch (error) {
      console.error('Beğenileri getirme hatası:', error)
      return []
    }
  }

  return {
    loading,
    toggleLike,
    getUserLikes
  }
}