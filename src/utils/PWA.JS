// PWA servis worker yönetimi
export const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      console.log('✅ PWA Service Worker registered:', registration)
      
      // Güncelleme kontrolü
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        console.log('🔄 New service worker installing...')
        
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('📦 New content available')
            showUpdateNotification()
          }
        })
      })
      
      return registration
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error)
    }
  }
}

// Güncelleme bildirimi
export const showUpdateNotification = () => {
  if (confirm('Yeni güncelleme mevcut! Uygulamayı yenilemek ister misiniz?')) {
    window.location.reload()
  }
}

// PWA yükleme istemi
export const installPWA = () => {
  let deferredPrompt
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferredPrompt = e
    console.log('📱 PWA install prompt available')
    
    // Kurulum butonu göster
    showInstallPrompt()
  })
  
  // Kurulum başarılı
  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully')
    deferredPrompt = null
  })
}

// Çevrimdışı destek kontrolü
export const checkOnlineStatus = () => {
  const updateOnlineStatus = () => {
    const status = navigator.onLine
    console.log(status ? '🟢 Online' : '🔴 Offline')
    
    // Özel bir online/offline bildirimi göstermek isterseniz burayı kullanabilirsiniz
    if (!status) {
      console.log('Çevrimdışı moddasınız. Bazı özellikler kısıtlı olabilir.')
    }
  }

  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
  
  // İlk durumu kontrol et
  updateOnlineStatus()
}

// PWA'nın kurulup kurulmadığını kontrol et
export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches || 
         window.navigator.standalone === true
}
