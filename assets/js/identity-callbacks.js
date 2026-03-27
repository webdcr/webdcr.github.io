import {
  handleAuthCallback,
  updateUser
} from 'https://esm.sh/@netlify/identity@1?bundle&target=es2019'

const RECOVERY_REDIRECT = '/admin/'

;(async () => {
  try {
    const result = await handleAuthCallback()
    if (result?.type === 'recovery') {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => showRecoveryModal(result.user))
      } else {
        showRecoveryModal(result.user)
      }
    }
  } catch (err) {
    console.warn('Netlify Identity recovery handling failed', err)
  }
})()

function showRecoveryModal(user) {
  ensureStyles()

  const overlay = document.createElement('div')
  overlay.className = 'identity-recovery-overlay'
  overlay.innerHTML = `
    <div class="identity-recovery-dialog" role="dialog" aria-modal="true">
      <button type="button" class="identity-recovery-close" aria-label="Close reset dialog">×</button>
      <h2>Set your new password</h2>
      <p class="identity-recovery-helper">
        ${user?.email ? `Finishing recovery for <strong>${user.email}</strong>.` : 'Finishing your password recovery.'}
        Enter a new password below.
      </p>
      <form class="identity-recovery-form">
        <label>
          New password
          <input type="password" name="password" required minlength="8" autocomplete="new-password" />
        </label>
        <label>
          Confirm password
          <input type="password" name="confirm" required minlength="8" autocomplete="new-password" />
        </label>
        <div class="identity-recovery-message" aria-live="polite"></div>
        <button type="submit">Save password</button>
      </form>
    </div>
  `

  document.body.appendChild(overlay)

  const closeBtn = overlay.querySelector('.identity-recovery-close')
  closeBtn.addEventListener('click', () => overlay.remove())

  const form = overlay.querySelector('.identity-recovery-form')
  const passwordInput = form.querySelector('input[name="password"]')
  const confirmInput = form.querySelector('input[name="confirm"]')
  const messageEl = form.querySelector('.identity-recovery-message')
  const submitBtn = form.querySelector('button[type="submit"]')

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    messageEl.textContent = ''
    messageEl.classList.remove('error', 'success')

    const password = passwordInput.value.trim()
    const confirm = confirmInput.value.trim()

    if (password.length < 8) {
      setMessage('Password must be at least 8 characters long.', true)
      return
    }

    if (password !== confirm) {
      setMessage('Passwords do not match.', true)
      return
    }

    submitBtn.disabled = true
    submitBtn.textContent = 'Saving...'

    try {
      await updateUser({ password })
      setMessage('Password updated. Redirecting to the CMS…', false)
      setTimeout(() => {
        window.location.href = RECOVERY_REDIRECT
      }, 1200)
    } catch (err) {
      console.error('Failed to update Netlify Identity user', err)
      setMessage('Could not update your password. Please try again or request another recovery link.', true)
      submitBtn.disabled = false
      submitBtn.textContent = 'Save password'
    }
  })

  function setMessage(text, isError) {
    messageEl.textContent = text
    if (isError) {
      messageEl.classList.add('error')
      messageEl.classList.remove('success')
    } else {
      messageEl.classList.add('success')
      messageEl.classList.remove('error')
    }
  }
}

function ensureStyles() {
  if (document.getElementById('identity-recovery-style')) return
  const style = document.createElement('style')
  style.id = 'identity-recovery-style'
  style.textContent = `
    .identity-recovery-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1rem;
    }
    .identity-recovery-dialog {
      background: #fff;
      color: #111;
      border-radius: 8px;
      max-width: 420px;
      width: 100%;
      padding: 1.5rem;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
      position: relative;
      font-family: inherit;
    }
    .identity-recovery-dialog h2 {
      margin-top: 0;
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }
    .identity-recovery-helper {
      margin-top: 0;
      margin-bottom: 1rem;
      font-size: 0.95rem;
      color: #333;
    }
    .identity-recovery-form label {
      display: block;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      font-weight: 600;
      color: #333;
    }
    .identity-recovery-form input {
      width: 100%;
      padding: 0.5rem 0.6rem;
      font-size: 1rem;
      border: 1px solid #cfd5e0;
      border-radius: 4px;
      margin-top: 0.35rem;
      box-sizing: border-box;
    }
    .identity-recovery-form button[type="submit"] {
      width: 100%;
      margin-top: 0.75rem;
      padding: 0.75rem;
      font-size: 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #111;
      color: #fff;
    }
    .identity-recovery-form button[disabled] {
      opacity: 0.7;
      cursor: not-allowed;
    }
    .identity-recovery-message {
      min-height: 1.25rem;
      font-size: 0.9rem;
      margin-top: 0.25rem;
    }
    .identity-recovery-message.error {
      color: #d02b2b;
    }
    .identity-recovery-message.success {
      color: #117a37;
    }
    .identity-recovery-close {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      border: none;
      background: transparent;
      font-size: 1.25rem;
      cursor: pointer;
      line-height: 1;
    }
  `
  document.head.appendChild(style)
}
