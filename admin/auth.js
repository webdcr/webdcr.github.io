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
  // Inject global reset and standardized admin styles
  const style = document.createElement('style');
  style.innerHTML = `
    * { box-sizing: border-box; }
    body { 
      margin: 0 !important; 
      padding: 0 !important; 
      font-family: Arial, sans-serif !important;
      background: #f0f0f0 !important;
      color: #333 !important;
      line-height: 1.4 !important;
    }
    .admin-content-wrapper { padding: 20px; max-width: 1000px; margin: 0 auto; display: none; }
    body.logged-in .admin-content-wrapper { display: block; }
    
    #admin-login-prompt {
      display: none;
      text-align: center;
      padding: 40px;
      color: #666;
      font-size: 13px;
    }
    body.logged-out #admin-login-prompt { display: block; }

    /* Shared Classic Admin UI */
    .card { background: #fff; border: 1px solid #ccc; padding: 20px; margin-bottom: 20px; }
    h1 { font-size: 22px; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px; color: #000; }
    h2 { font-size: 18px; margin-top: 0; }
    
    .btn { 
      display: inline-block; padding: 6px 12px; background: #eee; border: 1px solid #999; 
      color: #333; cursor: pointer; font-size: 13px; font-weight: bold; text-decoration: none; 
      line-height: normal;
    }
    .btn:hover { background: #ddd; }
    .btn-primary { background: #0056b3; color: #fff; border-color: #004494; }
    .btn-primary:hover { background: #004494; }
    .btn-danger { background: #c00; color: #fff; border-color: #900; }
    .btn-danger:hover { background: #900; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }

    .field-group { margin-bottom: 15px; }
    label { display: block; font-size: 13px; font-weight: bold; margin-bottom: 5px; }
    input[type="text"], input[type="password"], input[type="file"] { 
      width: 100%; border: 1px solid #aaa; padding: 8px; box-sizing: border-box; font-size: 13px;
    }
    
    .status { padding: 10px; font-size: 14px; margin-top: 10px; border: 1px solid #ccc; }
    .status.info { background: #e7f3ff; color: #004085; border-color: #b8daff; }
    .status.error { background: #f8d7da; color: #721c24; border-color: #f5c6cb; }

    #admin-auth-header {
      background: #f0f0f0;
      border-bottom: 1px solid #ccc;
      width: 100%;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;
      font-family: Arial, sans-serif;
    }
    #admin-auth-header * { font-family: Arial, sans-serif; border: none; background: none; }
    #admin-auth-header .brand { color: #000; text-decoration: none; font-weight: bold; font-size: 13px; line-height: 1; }
    #admin-auth-header .status { font-size: 10px; color: #666; margin-left: 8px; border: none !important; background: none !important; line-height: 1; vertical-align: middle; }
    #admin-auth-header .controls-container { position: relative; display: flex; align-items: center; }
    #admin-auth-header .controls { display: flex; align-items: center; gap: 6px; }
    #admin-auth-header .controls-overlay { 
      position: absolute; top: 0; left: 0; right: 0; bottom: 0; 
      background: #f0f0f0; display: none; align-items: center; justify-content: center;
      color: #d32f2f; font-weight: bold; font-size: 11px; z-index: 10;
    }
    #admin-auth-header label { font-weight: bold; font-size: 10px; }
    #admin-auth-header input { font-size: 10px; padding: 2px 5px; width: 130px; border: 1px solid #ccc !important; background: #fff !important; }
    #admin-auth-header button { font-size: 10px; padding: 2px 8px; cursor: pointer; background: #eee !important; border: 1px solid #999 !important; font-weight: bold; color: #333 !important; }
    #admin-auth-header .btn-logout { background: #fff !important; border-color: #f5c6cb !important; color: #721c24 !important; }
  `;
  document.head.appendChild(style);

  const header = document.createElement('div');
  header.id = 'admin-auth-header';
  header.innerHTML = `
    <div style="display: flex; align-items: center;">
      <a href="/admin/index.html" class="brand">WebDCR Admin</a>
      <span id="auth-status" class="status">Checking...</span>
    </div>
    <div class="controls-container">
      <div id="auth-overlay" class="controls-overlay">Invalid Token!</div>
      <div class="controls">
        <label>Token:</label>
        <input id="auth-token-input" type="password" placeholder="ghp_...">
        <button id="auth-save-btn">Log In</button>
        <button id="auth-logout-btn" class="btn-logout">Log Out</button>
      </div>
    </div>
  `;
  document.body.prepend(header);

  const prompt = document.createElement('div');
  prompt.id = 'admin-login-prompt';
  prompt.innerText = 'Please log in with a token above to access admin tools.';
  document.body.appendChild(prompt);

  const input = document.getElementById('auth-token-input');
  const saveBtn = document.getElementById('auth-save-btn');
  const logoutBtn = document.getElementById('auth-logout-btn');
  const status = document.getElementById('auth-status');
  const overlay = document.getElementById('auth-overlay');

  input.value = window.AdminAuth.getToken();

  async function updateStatus(isManualLogin = false) {
    status.innerText = 'Checking...';
    const check = await window.AdminAuth.validateToken();
    if (check.valid) {
      status.innerHTML = `<span style="color: #2e7d32;">● Connected (${check.user})</span>`;
      document.body.classList.remove('logged-out');
      document.body.classList.add('logged-in');
    } else {
      status.innerHTML = `<span style="color: #d32f2f;">● Disconnected</span>`;
      document.body.classList.remove('logged-in');
      document.body.classList.add('logged-out');
      
      if (isManualLogin) {
        overlay.style.display = 'flex';
        setTimeout(() => { overlay.style.display = 'none'; }, 1750);
      }
    }
  }

  saveBtn.onclick = () => {
    window.AdminAuth.setToken(input.value);
    updateStatus(true);
  };

  logoutBtn.onclick = () => {
    if (confirm('Log out and clear token?')) {
      window.AdminAuth.setToken('');
      location.reload();
    }
  };

  updateStatus();
});


