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
  // Inject global reset to ensure header touches edges
  const style = document.createElement('style');
  style.innerHTML = `
    body { margin: 0 !important; padding: 0 !important; }
    .admin-content-wrapper { padding: 20px; }
  `;
  document.head.appendChild(style);

  const header = document.createElement('div');
  header.id = 'admin-auth-header';
  header.innerHTML = `
    <div style="background: #f0f0f0; color: #333; padding: 6px 20px; font-size: 12px; display: flex; justify-content: space-between; align-items: center; font-family: Arial, sans-serif; border-bottom: 1px solid #ccc;">
      <div style="display: flex; align-items: center; gap: 15px;">
        <a href="/admin/index.html" style="color: #000; text-decoration: none; font-weight: bold; font-size: 14px;">WebDCR Admin</a>
        <span id="auth-status" style="font-size: 11px; color: #666;">Checking...</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <label style="font-weight: bold; font-size: 11px;">Token:</label>
        <input id="auth-token-input" type="password" placeholder="ghp_..." style="font-size: 11px; padding: 2px 6px; width: 140px; border: 1px solid #ccc;">
        <button id="auth-save-btn" style="font-size: 11px; padding: 2px 10px; cursor: pointer; background: #eee; border: 1px solid #999; font-weight: bold;">Save</button>
        <button id="auth-logout-btn" style="font-size: 11px; padding: 2px 10px; cursor: pointer; background: #fff; border: 1px solid #f5c6cb; color: #721c24; font-weight: bold; margin-left: 5px;">Log Out</button>
      </div>
    </div>
  `;
  document.body.prepend(header);

  const input = document.getElementById('auth-token-input');
  const saveBtn = document.getElementById('auth-save-btn');
  const logoutBtn = document.getElementById('auth-logout-btn');
  const status = document.getElementById('auth-status');

  input.value = window.AdminAuth.getToken();

  async function updateStatus() {
    const check = await window.AdminAuth.validateToken();
    if (check.valid) {
      status.innerHTML = `<span style="color: #2e7d32;">● Connected (${check.user})</span>`;
    } else {
      status.innerHTML = `<span style="color: #d32f2f;">● Disconnected</span>`;
    }
  }

  saveBtn.onclick = () => {
    window.AdminAuth.setToken(input.value);
    updateStatus();
    location.reload();
  };

  logoutBtn.onclick = () => {
    if (confirm('Log out and clear token?')) {
      window.AdminAuth.setToken('');
      location.reload();
    }
  };

  updateStatus();
});

