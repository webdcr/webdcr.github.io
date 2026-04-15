/**
 * Shared authentication logic for WebDCR Admin
 */
window.AdminAuth = {
  getToken() {
    return localStorage.getItem('gh_token') || '';
  },
  setToken(token) {
    localStorage.setItem('gh_token', token);
    window.dispatchEvent(new CustomEvent('admin-auth-changed'));
  },
  async validateToken() {
    const token = this.getToken();
    if (!token) return { valid: false, message: 'No token' };
    
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        return { valid: true, user: data.login };
      }
      return { valid: false, message: 'Invalid token' };
    } catch (e) {
      return { valid: false, message: 'Network error' };
    }
  }
};

// Simple UI Component for the Auth Bar
document.addEventListener('DOMContentLoaded', () => {
  const header = document.createElement('div');
  header.id = 'admin-auth-header';
  header.innerHTML = `
    <div style="background: #333; color: #fff; padding: 5px 20px; font-size: 12px; display: flex; justify-content: space-between; align-items: center; font-family: Arial, sans-serif;">
      <div>
        <strong>WebDCR Admin</strong> | 
        <span id="auth-status">Checking connection...</span>
      </div>
      <div>
        <input id="auth-token-input" type="password" placeholder="GitHub PAT" style="font-size: 10px; padding: 2px 5px; width: 150px; background: #444; color: #fff; border: 1px solid #555;">
        <button id="auth-save-btn" style="font-size: 10px; padding: 2px 8px; cursor: pointer; background: #555; color: #fff; border: 1px solid #666;">Save Token</button>
      </div>
    </div>
  `;
  document.body.prepend(header);

  const input = document.getElementById('auth-token-input');
  const btn = document.getElementById('auth-save-btn');
  const status = document.getElementById('auth-status');

  input.value = window.AdminAuth.getToken();

  async function updateStatus() {
    const check = await window.AdminAuth.validateToken();
    if (check.valid) {
      status.innerHTML = `<span style="color: #4caf50;">● Connected as ${check.user}</span>`;
      status.title = 'Token is valid and has repo access.';
    } else {
      status.innerHTML = `<span style="color: #f44336;">● Not Connected</span>`;
      status.title = check.message;
    }
  }

  btn.onclick = () => {
    window.AdminAuth.setToken(input.value);
    updateStatus();
    location.reload(); // Refresh to propagate token
  };

  updateStatus();
});
