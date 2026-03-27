window.netlifyIdentityInitQueue = window.netlifyIdentityInitQueue || []
window.netlifyIdentityInitQueue.push((netlifyIdentity) => {
  netlifyIdentity.on('init', (user) => {
    if (!user) {
      netlifyIdentity.on('login', () => {
        document.location.href = '/admin/'
      })
    }
  })
  netlifyIdentity.init()
})

if (window.netlifyIdentity) {
  window.netlifyIdentityInitQueue.forEach((fn) => {
    try {
      fn(window.netlifyIdentity)
    } catch (err) {
      console.warn('Netlify Identity init handler failed', err)
    }
  })
  window.netlifyIdentityInitQueue = []
}
