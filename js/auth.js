/**
 * PK Junior NACC - OBEC (ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว)
 * File: js/auth.js
 * Description: Authentication module for administrator login and access control
 * Uses custom 'admin' table in Supabase (id, username, password, name, role)
 */

window.PKApp = window.PKApp || {};
PKApp.auth = PKApp.auth || {};

/**
 * Check if logged in by restoring user session from sessionStorage
 * @returns {boolean} true if user is logged in
 */
PKApp.auth.checkSession = function() {
    try {
        var stored = sessionStorage.getItem('pkapp_user');
        if (stored) {
            PKApp.currentUser = JSON.parse(stored);
            return true;
        }
        // Fallback check to localStorage if previously stored there
        var localStored = localStorage.getItem('pk_current_user');
        if (localStored) {
            PKApp.currentUser = JSON.parse(localStored);
            sessionStorage.setItem('pkapp_user', localStored);
            return true;
        }
    } catch (e) {
        console.error('Error reading session data:', e);
    }
    PKApp.currentUser = null;
    return false;
};

/**
 * Check if current user is logged in
 * @returns {boolean}
 */
PKApp.auth.isLoggedIn = function() {
    return !!(PKApp.currentUser || PKApp.auth.checkSession());
};

/**
 * Check if current user has admin role
 * @returns {boolean}
 */
PKApp.auth.isAdmin = function() {
    return !!(PKApp.currentUser && PKApp.currentUser.role === 'admin');
};

/**
 * Check if current user has NACC staff or admin role
 * @returns {boolean}
 */
PKApp.auth.isNacc = function() {
    return !!(PKApp.currentUser && (PKApp.currentUser.role === 'nacc' || PKApp.currentUser.role === 'admin'));
};

/**
 * Route guard for protected admin pages
 * @returns {boolean}
 */
PKApp.auth.requireAuth = function() {
    if (!PKApp.currentUser && !PKApp.auth.checkSession()) {
        if (typeof PKApp.showToast === 'function') {
            PKApp.showToast('กรุณาเข้าสู่ระบบก่อน', 'error');
        }
        window.location.hash = '#/login';
        return false;
    }
    return true;
};

/**
 * Authenticate user with username and password against the 'admin' table
 * @param {string} username
 * @param {string} password
 * @returns {Promise<boolean>}
 */
PKApp.auth.login = async function(username, password) {
    var errorEl = document.getElementById('login-error-msg') || document.getElementById('login-error');
    if (errorEl) {
        errorEl.classList.add('hidden');
        errorEl.style.display = 'none';
        errorEl.textContent = '';
    }

    var cleanUser = (username || '').trim();
    var cleanPass = (password || '').trim();

    if (!cleanUser || !cleanPass) {
        var emptyMsg = 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน';
        PKApp.auth.displayError(emptyMsg);
        if (typeof PKApp.showToast === 'function') {
            PKApp.showToast(emptyMsg, 'warning');
        }
        return false;
    }

    try {
        if (typeof PKApp.showLoading === 'function') {
            PKApp.showLoading('กำลังตรวจสอบข้อมูลเข้าสู่ระบบ...');
        }

        // Ensure Supabase client is available
        if (!PKApp.supabase) {
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                PKApp.supabase = supabase.createClient(PKApp.SUPABASE_URL, PKApp.SUPABASE_KEY);
            } else {
                throw new Error('ไม่สามารถเชื่อมต่อฐานข้อมูล Supabase ได้');
            }
        }

        // Query custom 'admin' table
        var result = await PKApp.supabase
            .from('admin')
            .select('id, username, password, name, role')
            .eq('username', cleanUser)
            .eq('password', cleanPass)
            .limit(1);

        if (result.error) {
            console.error('Supabase query error:', result.error);
            throw result.error;
        }

        var records = result.data;

        if (records && records.length > 0) {
            var user = records[0];
            PKApp.currentUser = {
                id: user.id,
                username: user.username,
                name: user.name || user.username,
                role: user.role || 'admin'
            };

            // Save session to sessionStorage as requested
            sessionStorage.setItem('pkapp_user', JSON.stringify(PKApp.currentUser));
            
            // Also synchronize with config.js helper if present
            if (typeof PKApp.setCurrentUser === 'function') {
                PKApp.setCurrentUser(PKApp.currentUser);
            }

            if (typeof PKApp.hideLoading === 'function') {
                PKApp.hideLoading();
            }

            if (typeof PKApp.showToast === 'function') {
                PKApp.showToast('เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ' + PKApp.currentUser.name, 'success');
            }

            // Close modal if open
            var modal = document.getElementById('login-modal');
            if (modal) {
                modal.classList.add('hidden');
                modal.setAttribute('aria-hidden', 'true');
            }

            // Navigate to admin panel
            var redirectTarget = PKApp.redirectAfterLogin || '#/admin';
            PKApp.redirectAfterLogin = null;
            if (!redirectTarget.startsWith('#')) {
                redirectTarget = '#' + redirectTarget;
            }
            window.location.hash = redirectTarget;
            return true;
        } else {
            if (typeof PKApp.hideLoading === 'function') {
                PKApp.hideLoading();
            }
            var failMsg = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
            PKApp.auth.displayError(failMsg);
            if (typeof PKApp.showToast === 'function') {
                PKApp.showToast(failMsg, 'error');
            }
            return false;
        }
    } catch (err) {
        if (typeof PKApp.hideLoading === 'function') {
            PKApp.hideLoading();
        }
        console.error('Login error:', err);
        var errMsg = err.message || 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
        PKApp.auth.displayError(errMsg);
        if (typeof PKApp.showToast === 'function') {
            PKApp.showToast(errMsg, 'error');
        }
        return false;
    }
};

/**
 * Log out the current user and redirect to home
 */
PKApp.auth.logout = function() {
    PKApp.currentUser = null;
    try {
        sessionStorage.removeItem('pkapp_user');
        localStorage.removeItem('pk_current_user');
    } catch (e) {
        console.error('Error clearing storage:', e);
    }

    if (typeof PKApp.setCurrentUser === 'function') {
        PKApp.setCurrentUser(null);
    }

    if (typeof PKApp.showToast === 'function') {
        PKApp.showToast('ออกจากระบบแล้ว', 'info');
    }

    window.location.hash = '#/';
};

/**
 * Display an error message in the active login form
 * @param {string} message
 */
PKApp.auth.displayError = function(message) {
    var errorEl = document.getElementById('login-error-msg');
    if (!errorEl) {
        errorEl = document.getElementById('login-error');
    }
    if (errorEl) {
        errorEl.textContent = message;
        errorEl.classList.remove('hidden');
        errorEl.style.display = 'flex';
    }
};

/**
 * Render the dedicated login page into #app-content
 */
PKApp.auth.showLogin = function() {
    var contentEl = document.getElementById('app-content') ||
                    document.getElementById('app') ||
                    document.getElementById('main-content') ||
                    document.querySelector('main');

    if (!contentEl) {
        console.error('Main content container (#app-content) not found.');
        return;
    }

    // If user is already authenticated, redirect straight to admin
    if (PKApp.auth.isLoggedIn()) {
        window.location.hash = '#/admin';
        return;
    }

    var logoUrl = PKApp.LOGO_URL || 'https://lh3.googleusercontent.com/d/1E3Sfzalpk46I9uOFhsnfWrBURGb8LsED';

    contentEl.innerHTML = [
        '<div class="login-container" style="min-height: 80vh; display: flex; align-items: center; justify-content: center; padding: 2rem 1rem; background: radial-gradient(circle at top, #F5E6B8 0%, #FAF5FF 40%, #F3F4F6 100%);">',
        '  <div class="login-card" style="width: 100%; max-width: 440px; background: #FFFFFF; border-radius: 24px; box-shadow: 0 20px 40px -15px rgba(107, 33, 168, 0.25), 0 0 0 1px rgba(107, 33, 168, 0.08); overflow: hidden; transition: transform 0.2s ease;">',
        '    ',
        '    <!-- Card Header with Purple Theme and Logo -->',
        '    <div class="login-header" style="background: linear-gradient(135deg, #6B21A8 0%, #4C1D95 100%); padding: 2.5rem 2rem 2rem; text-align: center; color: #FFFFFF; position: relative; border-bottom: 3px solid #D4A843;">',
        '      <div style="width: 84px; height: 84px; margin: 0 auto 1rem; padding: 6px; background: #FFFFFF; border-radius: 50%; box-shadow: 0 8px 20px rgba(0,0,0,0.25); display: flex; align-items: center; justify-content: center;">',
        '        <img src="' + logoUrl + '" alt="ตราสัญลักษณ์ ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว" style="width: 100%; height: 100%; object-fit: contain; border-radius: 50%;">',
        '      </div>',
        '      <h2 style="font-size: 1.35rem; font-weight: 700; color: #FFFFFF; margin: 0 0 0.35rem; font-family: \'Prompt\', sans-serif; letter-spacing: -0.01em;">เข้าสู่ระบบผู้ดูแลระบบ</h2>',
        '      <p style="font-size: 0.875rem; color: #F5E6B8; margin: 0; font-weight: 400; font-family: \'Prompt\', sans-serif;">ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว</p>',
        '    </div>',
        '    ',
        '    <!-- Form Area -->',
        '    <div style="padding: 2rem 2rem 2.25rem;">',
        '      <form id="pk-page-login-form" class="login-form" novalidate onsubmit="return false;" style="display: flex; flex-direction: column; gap: 1.25rem;">',
        '        ',
        '        <!-- Error Alert Area -->',
        '        <div id="login-error-msg" class="login-error hidden" role="alert" style="display: none; align-items: center; gap: 0.75rem; background-color: #FEF2F2; border: 1px solid #FCA5A5; color: #991B1B; padding: 0.85rem 1rem; border-radius: 12px; font-size: 0.875rem; font-family: \'Prompt\', sans-serif;">',
        '        </div>',
        '        ',
        '        <!-- Username Field -->',
        '        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">',
        '          <label for="auth-username" style="font-size: 0.875rem; font-weight: 600; color: #374151; font-family: \'Prompt\', sans-serif;">',
        '            ชื่อผู้ใช้งาน (Username)',
        '          </label>',
        '          <div style="position: relative; display: flex; align-items: center;">',
        '            <span style="position: absolute; left: 1rem; color: #9CA3AF; display: flex; pointer-events: none;">',
        '              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>',
        '            </span>',
        '            <input type="text" id="auth-username" name="username" required autocomplete="username" placeholder="กรอกชื่อผู้ใช้งาน"',
        '              style="width: 100%; padding: 0.75rem 1rem 0.75rem 2.85rem; border: 1.5px solid #E5E7EB; border-radius: 12px; font-size: 0.95rem; font-family: \'Prompt\', sans-serif; color: #1F2937; outline: none; transition: border-color 0.2s, box-shadow 0.2s; background: #F9FAFB;"',
        '              onfocus="this.style.borderColor=\'#6B21A8\'; this.style.boxShadow=\'0 0 0 3px rgba(107,33,168,0.15)\'; this.style.background=\'#FFFFFF\';"',
        '              onblur="this.style.borderColor=\'#E5E7EB\'; this.style.boxShadow=\'none\'; if(!this.value) this.style.background=\'#F9FAFB\';">',
        '          </div>',
        '        </div>',
        '        ',
        '        <!-- Password Field -->',
        '        <div class="form-group" style="display: flex; flex-direction: column; gap: 0.4rem;">',
        '          <div style="display: flex; justify-content: space-between; align-items: center;">',
        '            <label for="auth-password" style="font-size: 0.875rem; font-weight: 600; color: #374151; font-family: \'Prompt\', sans-serif;">',
        '              รหัสผ่าน (Password)',
        '            </label>',
        '          </div>',
        '          <div style="position: relative; display: flex; align-items: center;">',
        '            <span style="position: absolute; left: 1rem; color: #9CA3AF; display: flex; pointer-events: none;">',
        '              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>',
        '            </span>',
        '            <input type="password" id="auth-password" name="password" required autocomplete="current-password" placeholder="กรอกรหัสผ่าน"',
        '              style="width: 100%; padding: 0.75rem 2.85rem 0.75rem 2.85rem; border: 1.5px solid #E5E7EB; border-radius: 12px; font-size: 0.95rem; font-family: \'Prompt\', sans-serif; color: #1F2937; outline: none; transition: border-color 0.2s, box-shadow 0.2s; background: #F9FAFB;"',
        '              onfocus="this.style.borderColor=\'#6B21A8\'; this.style.boxShadow=\'0 0 0 3px rgba(107,33,168,0.15)\'; this.style.background=\'#FFFFFF\';"',
        '              onblur="this.style.borderColor=\'#E5E7EB\'; this.style.boxShadow=\'none\'; if(!this.value) this.style.background=\'#F9FAFB\';">',
        '            <button type="button" id="toggle-password-btn" aria-label="แสดง/ซ่อนรหัสผ่าน"',
        '              style="position: absolute; right: 0.85rem; background: none; border: none; cursor: pointer; color: #9CA3AF; display: flex; align-items: center; justify-content: center; padding: 0.25rem;">',
        '              <svg id="eye-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
        '            </button>',
        '          </div>',
        '        </div>',
        '        ',
        '        <!-- Submit Button -->',
        '        <div style="margin-top: 0.5rem;">',
        '          <button type="submit" id="auth-submit-btn"',
        '            style="width: 100%; padding: 0.85rem 1.5rem; background: linear-gradient(135deg, #6B21A8 0%, #581C87 100%); color: #FFFFFF; border: none; border-radius: 12px; font-size: 1rem; font-weight: 600; font-family: \'Prompt\', sans-serif; cursor: pointer; box-shadow: 0 4px 14px rgba(107, 33, 168, 0.35); transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 0.5rem;"',
        '            onmouseover="this.style.transform=\'translateY(-1px)\'; this.style.boxShadow=\'0 6px 20px rgba(107, 33, 168, 0.45)\';"',
        '            onmouseout="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 4px 14px rgba(107, 33, 168, 0.35)\';">',
        '            <span>เข้าสู่ระบบ</span>',
        '            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>',
        '          </button>',
        '        </div>',
        '        ',
        '        <!-- Back Link -->',
        '        <div style="text-align: center; margin-top: 0.5rem;">',
        '          <a href="#/" style="font-size: 0.875rem; color: #6B21A8; text-decoration: none; font-weight: 500; font-family: \'Prompt\', sans-serif; display: inline-flex; align-items: center; gap: 0.35rem;"',
        '            onmouseover="this.style.textDecoration=\'underline\';"',
        '            onmouseout="this.style.textDecoration=\'none\';">',
        '            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>',
        '            <span>กลับสู่หน้าหลัก</span>',
        '          </a>',
        '        </div>',
        '      </form>',
        '    </div>',
        '  </div>',
        '</div>'
    ].join('\n');

    // Attach Event Listeners
    var form = document.getElementById('pk-page-login-form');
    var userInput = document.getElementById('auth-username');
    var passInput = document.getElementById('auth-password');
    var toggleBtn = document.getElementById('toggle-password-btn');

    if (userInput) {
        setTimeout(function() {
            userInput.focus();
        }, 150);
    }

    if (toggleBtn && passInput) {
        toggleBtn.addEventListener('click', function() {
            if (passInput.type === 'password') {
                passInput.type = 'text';
                toggleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>';
            } else {
                passInput.type = 'password';
                toggleBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var u = userInput ? userInput.value : '';
            var p = passInput ? passInput.value : '';
            PKApp.auth.login(u, p);
        });
    }
};

/**
 * Initialize modal listeners for index.html login dialog
 */
PKApp.auth.initModal = function() {
    var adminBtn = document.getElementById('admin-login-btn');
    var modal = document.getElementById('login-modal');
    var closeBtn = document.getElementById('login-close-btn');
    var cancelBtn = document.getElementById('login-cancel-btn');
    var modalForm = document.getElementById('login-form');

    function openModal() {
        if (PKApp.auth.isLoggedIn()) {
            window.location.hash = '#/admin';
            return;
        }
        if (modal) {
            modal.classList.remove('hidden');
            modal.setAttribute('aria-hidden', 'false');
            var emailInput = document.getElementById('login-email');
            if (emailInput) {
                setTimeout(function() { emailInput.focus(); }, 150);
            }
        } else {
            window.location.hash = '#/login';
        }
    }

    function closeModal() {
        if (modal) {
            modal.classList.add('hidden');
            modal.setAttribute('aria-hidden', 'true');
            var errorEl = document.getElementById('login-error');
            if (errorEl) {
                errorEl.classList.add('hidden');
                errorEl.textContent = '';
            }
        }
    }

    if (adminBtn) {
        adminBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openModal();
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeModal();
        });
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeModal();
            }
        });
    }

    if (modalForm) {
        modalForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var emailInput = document.getElementById('login-email');
            var passInput = document.getElementById('login-password');
            var username = emailInput ? emailInput.value : '';
            var password = passInput ? passInput.value : '';
            PKApp.auth.login(username, password);
        });
    }
};

// Check session immediately upon loading script
PKApp.auth.checkSession();

// Bind modal elements when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', PKApp.auth.initModal);
} else {
    PKApp.auth.initModal();
}
