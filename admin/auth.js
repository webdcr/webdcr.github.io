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
    <div style="background: #f8f8f8; color: #333; padding: 10px 20px; font-size: 13px; display: flex; justify-content: space-between; align-items: center; font-family: Arial, sans-serif; border-bottom: 2px solid #ccc; margin-bottom: 20px;">
      <div>
        <a href="/admin/index.html" style="color: #000; text-decoration: none; font-weight: bold; font-size: 16px;">WebDCR Admin Dashboard</a>
        <span id="auth-status" style="margin-left: 15px; font-size: 11px;">Checking connection...</span>
      </div>
      <div style="display: flex; align-items: center; gap: 10px;">
        <label style="font-weight: bold; font-size: 11px;">GitHub Token:</label>
        <input id="auth-token-input" type="password" placeholder="ghp_..." style="font-size: 12px; padding: 4px 8px; width: 200px; border: 1px solid #999;">
        <button id="auth-save-btn" style="font-size: 11px; padding: 4px 12px; cursor: pointer; background: #eee; border: 1px solid #999; font-weight: bold;">Update Token</button>
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
