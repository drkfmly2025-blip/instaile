import { ref } from 'vue'
import { supabase } from '../supabase.js'

// Yorum store'u
export const useCommentsStore = () => {
  const loading = ref(false)

  // Yorumları getir
  const getComments = async (postId) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Yorumları getirme hatası:', error)
      return []
    }
  }

  // Yorum ekle
  const addComment = async (postId, content) => {
    try {
      loading.value = true
      const user = (await supabase.auth.getUser()).data.user
      
      if (!user) throw new Error('Yorum için giriş yapmalısınız')
      if (!content.trim()) throw new Error('Yorum boş olamaz')

      // Yorumu ekle
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: postId,
            user_id: user.id,
            content: content.trim()
          }
        ])
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)

      if (error) throw error

      // Post'un yorum sayısını güncelle
      await supabase.rpc('increment_comments', { post_id: postId })

      return data[0]
    } catch (error) {
      console.error('Yorum ekleme hatası:', error)
      throw error
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    getComments,
    addComment
  }
}
