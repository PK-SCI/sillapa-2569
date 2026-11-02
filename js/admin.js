/**
 * PK Junior NACC - OBEC (ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว)
 * File: js/admin.js
 * Description: Admin management panel with CRUD forms for all website sections
 */

window.PKApp = window.PKApp || {};
PKApp.admin = PKApp.admin || {};

// Auth guard helper
PKApp.admin.checkAuth = function() {
    if (PKApp.auth && typeof PKApp.auth.requireAuth === 'function') {
        return PKApp.auth.requireAuth();
    }
    if (!PKApp.currentUser) {
        try {
            var saved = localStorage.getItem('pk_current_user');
            if (saved) PKApp.currentUser = JSON.parse(saved);
        } catch (e) {}
    }
    if (!PKApp.currentUser) {
        if (typeof PKApp.showToast === 'function') {
            PKApp.showToast('กรุณาเข้าสู่ระบบก่อนเข้าใช้งานส่วนผู้ดูแลระบบ', 'warning');
        }
        window.location.hash = '#/login';
        return false;
    }
    return true;
};

// Common admin layout wrapper
PKApp.admin.renderLayout = function(activeKey, title, contentHtml) {
    var container = document.getElementById('app-content') ||
                    document.getElementById('app') ||
                    document.getElementById('main-content') ||
                    document.querySelector('main');
    if (!container) return;

    var currentUser = PKApp.currentUser || { name: 'ผู้ดูแลระบบ', role: 'admin' };
    var isAdminRole = (currentUser.role === 'admin');

    var menuGroups = [
        {
            groupName: 'ประวัติ',
            items: [
                { key: 'significance', label: 'ที่มา และความสำคัญ', hash: '#/admin/significance', icon: '📝' },
                { key: 'hoop', label: 'เจตจำนง', hash: '#/admin/hoop', icon: '🎯' },
                { key: 'anthority', label: 'อำนาจหน้าที่', hash: '#/admin/anthority', icon: '⚖️' },
                { key: 'membernacc', label: 'บุคคลกร (คณะกรรมการ)', hash: '#/admin/membernacc', icon: '👥' },
                { key: 'anacc', label: 'ตัวแทนห้อง (อนุกรรมการ)', hash: '#/admin/anacc', icon: '🎒' }
            ]
        },
        {
            groupName: 'ข่าวสาร',
            items: [
                { key: 'announce', label: 'ประกาศ', hash: '#/admin/announce', icon: '📢' },
                { key: 'information', label: 'ประชาสัมพันธ์', hash: '#/admin/information', icon: '📰' },
                { key: 'make', label: 'คำสั่ง', hash: '#/admin/make', icon: '📜' },
                { key: 'newsletter', label: 'จดหมายข่าว', hash: '#/admin/newsletter', icon: '✉️' },
                { key: 'certificate', label: 'ทะเบียนเกียรติบัตร', hash: '#/admin/certificate', icon: '🎖️' },
                { key: 'award', label: 'ผลงานและรางวัล', hash: '#/admin/award', icon: '🏆' }
            ]
        },
        {
            groupName: 'กลุ่มงาน',
            items: [
                { key: 'plan', label: 'นโยบายและแผน', hash: '#/admin/plan', icon: '📊' },
                { key: 'culecculum', label: 'หลักสูตร', hash: '#/admin/culecculum', icon: '📚' }
            ]
        },
        {
            groupName: 'สารสนเทศ',
            items: [
                { key: 'tammanun', label: 'ธรรมนูญ (ภายใน)', hash: '#/admin/tammanun', icon: '🏛️' },
                { key: 'law', label: 'กฎหมาย (คณะกรรมาธิการ)', hash: '#/admin/law', icon: '⚖️' }
            ]
        }
    ];

    if (isAdminRole) {
        menuGroups.push({
            groupName: 'จัดการระบบ',
            items: [
                { key: 'users', label: 'จัดการผู้ใช้งานระบบ', hash: '#/admin/users', icon: '🔐' }
            ]
        });
    }

    var sidebarHtml = '';
    menuGroups.forEach(function(grp) {
        sidebarHtml += '<div class="admin-menu-group" style="margin-bottom: 16px;">' +
            '<div style="font-size: 0.78rem; font-weight: 700; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 12px; margin-bottom: 4px;">' +
            grp.groupName +
            '</div>';
        grp.items.forEach(function(item) {
            var isActive = (item.key === activeKey);
            var activeStyle = isActive
                ? 'background: linear-gradient(135deg, #6B21A8, #581C87); color: #FFFFFF; font-weight: 600; box-shadow: 0 4px 12px rgba(107,33,168,0.25);'
                : 'color: #374151;';
            sidebarHtml += '<a href="' + item.hash + '" class="admin-nav-item" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px; text-decoration: none; margin-bottom: 3px; font-size: 0.92rem; transition: all 0.2s; ' + activeStyle + '">' +
                '<span style="font-size: 1.1rem;">' + item.icon + '</span>' +
                '<span>' + item.label + '</span>' +
                '</a>';
        });
        sidebarHtml += '</div>';
    });

    var layout = [
        '<div class="admin-panel" style="max-width: 1300px; margin: 30px auto; padding: 0 20px;">',
        '  <div style="background: #FFFFFF; border-radius: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #E5E7EB; overflow: hidden; margin-bottom: 24px;">',
        '    <div style="background: linear-gradient(135deg, #6B21A8 0%, #4A154B 100%); padding: 20px 28px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 16px; color: #FFFFFF;">',
        '      <div style="display: flex; align-items: center; gap: 16px;">',
        '        <div style="width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border: 1px solid rgba(255,255,255,0.2);">⚙️</div>',
        '        <div>',
        '          <h1 style="font-size: 1.35rem; font-weight: 700; margin: 0; color: #FFFFFF; line-height: 1.2;">ระบบบริหารจัดการเนื้อหา</h1>',
        '          <p style="font-size: 0.85rem; color: #DDD6FE; margin: 4px 0 0 0;">ยินดีต้อนรับ: <strong>' + (PKApp.escapeHtml(currentUser.name || currentUser.username || 'เจ้าหน้าที่')) + '</strong> (สิทธิ์: ' + (currentUser.role === 'admin' ? 'ผู้ดูแลระดับสูง' : 'เจ้าหน้าที่') + ')</p>',
        '        </div>',
        '      </div>',
        '      <div style="display: flex; align-items: center; gap: 10px;">',
        '        <a href="#/" style="padding: 8px 16px; background: rgba(255,255,255,0.12); color: #FFFFFF; border-radius: 8px; font-size: 0.88rem; text-decoration: none; border: 1px solid rgba(255,255,255,0.25); display: inline-flex; align-items: center; gap: 6px; transition: background 0.2s;">',
        '          <span>🌐 ดูหน้าเว็บ</span>',
        '        </a>',
        '        <button type="button" id="admin-logout-btn" style="padding: 8px 16px; background: #EF4444; color: #FFFFFF; border-radius: 8px; font-size: 0.88rem; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-weight: 500; box-shadow: 0 2px 6px rgba(239,68,68,0.3);">',
        '          <span>🚪 ออกจากระบบ</span>',
        '        </button>',
        '      </div>',
        '    </div>',
        '  </div>',
        '  <div class="admin-layout" style="display: grid; grid-template-columns: 280px 1fr; gap: 24px; align-items: start;">',
        '    <aside class="admin-sidebar" style="background: #FFFFFF; border-radius: 16px; padding: 20px 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #E5E7EB; position: sticky; top: 90px; max-height: calc(100vh - 120px); overflow-y: auto;">',
        sidebarHtml,
        '    </aside>',
        '    <section class="admin-content" style="background: #FFFFFF; border-radius: 16px; padding: 28px; box-shadow: 0 4px 16px rgba(0,0,0,0.05); border: 1px solid #E5E7EB; min-height: 600px;">',
        '      <div class="admin-header" style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #F3F4F6; padding-bottom: 16px; margin-bottom: 24px;">',
        '        <div>',
        '          <h2 class="admin-title" style="color: #6B21A8; font-size: 1.45rem; font-weight: 700; margin: 0;">' + title + '</h2>',
        '          <p style="color: #6B7280; font-size: 0.85rem; margin: 4px 0 0 0;">จัดการข้อมูลและแก้ไขรายละเอียดในส่วนนี้</p>',
        '        </div>',
        '        <div id="admin-header-actions"></div>',
        '      </div>',
        '      <div id="admin-main-body">' + contentHtml + '</div>',
        '    </section>',
        '  </div>',
        '</div>'
    ].join('\n');

    container.innerHTML = layout;

    // Attach logout button
    var logoutBtn = document.getElementById('admin-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('คุณต้องการออกจากระบบผู้ดูแลใช่หรือไม่?')) {
                if (PKApp.auth && typeof PKApp.auth.logout === 'function') {
                    PKApp.auth.logout();
                } else {
                    PKApp.setCurrentUser(null);
                    if (typeof PKApp.updateAuthUI === 'function') PKApp.updateAuthUI();
                    PKApp.showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
                    window.location.hash = '#/';
                }
            }
        });
    }
};

/**
 * Reusable Rich Text Editor Helper
 */
PKApp.admin.createRichEditor = function(containerId) {
    var host = document.getElementById(containerId);
    if (!host) return { getHTML: function() { return ''; }, setHTML: function() {} };

    host.innerHTML = [
        '<div class="rich-editor" style="border: 1.5px solid #D1D5DB; border-radius: 10px; overflow: hidden; background: #FFFFFF;">',
        '  <div class="editor-toolbar" style="display: flex; flex-wrap: wrap; gap: 6px; padding: 10px; background: #F8FAFC; border-bottom: 1px solid #E2E8F0; align-items: center;">',
        '    <button type="button" class="editor-btn" data-cmd="bold" title="ตัวหนา (Ctrl+B)" style="padding: 5px 10px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFFFFF; font-weight: bold; cursor: pointer;">B</button>',
        '    <button type="button" class="editor-btn" data-cmd="italic" title="ตัวเอียง (Ctrl+I)" style="padding: 5px 10px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFFFFF; font-style: italic; cursor: pointer;">I</button>',
        '    <button type="button" class="editor-btn" data-cmd="underline" title="ขีดเส้นใต้ (Ctrl+U)" style="padding: 5px 10px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFFFFF; text-decoration: underline; cursor: pointer;">U</button>',
        '    <span style="color: #CBD5E1; margin: 0 4px;">|</span>',
        '    <button type="button" class="editor-btn" data-cmd="justifyLeft" title="ชิดซ้าย" style="padding: 5px 10px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFFFFF; cursor: pointer;">⫷ ซ้าย</button>',
        '    <button type="button" class="editor-btn" data-cmd="justifyCenter" title="กึ่งกลาง" style="padding: 5px 10px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFFFFF; cursor: pointer;">≡ กลาง</button>',
        '    <button type="button" class="editor-btn" data-cmd="justifyRight" title="ชิดขวา" style="padding: 5px 10px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFFFFF; cursor: pointer;">⫸ ขวา</button>',
        '    <span style="color: #CBD5E1; margin: 0 4px;">|</span>',
        '    <label style="display: inline-flex; align-items: center; gap: 4px; font-size: 0.85rem; color: #4B5563; cursor: pointer;">',
        '      สีข้อความ: <input type="color" id="' + containerId + '-color" value="#000000" style="width: 28px; height: 28px; border: none; cursor: pointer; border-radius: 4px;">',
        '    </label>',
        '    <select id="' + containerId + '-size" style="padding: 4px 8px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFFFFF; font-size: 0.85rem; cursor: pointer;">',
        '      <option value="3">ขนาดปกติ (16px)</option>',
        '      <option value="1">เล็กมาก (12px)</option>',
        '      <option value="2">เล็ก (14px)</option>',
        '      <option value="4">ปานกลาง (18px)</option>',
        '      <option value="5">ใหญ่ (24px)</option>',
        '      <option value="6">ใหญ่มาก (32px)</option>',
        '    </select>',
        '    <button type="button" class="editor-btn" data-cmd="insertUnorderedList" title="รายการสัญลักษณ์" style="padding: 5px 10px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFFFFF; cursor: pointer;">• รายการ</button>',
        '    <button type="button" class="editor-btn" data-cmd="removeFormat" title="ล้างรูปแบบ" style="padding: 5px 10px; border: 1px solid #CBD5E1; border-radius: 6px; background: #FFFFFF; cursor: pointer; color: #EF4444;">ล้างรูปแบบ</button>',
        '  </div>',
        '  <div id="' + containerId + '-editable" class="editor-content" contenteditable="true" style="min-height: 240px; max-height: 500px; padding: 16px; overflow-y: auto; outline: none; line-height: 1.8; font-size: 1rem; color: #1F2937;"></div>',
        '</div>'
    ].join('\n');

    var editable = document.getElementById(containerId + '-editable');
    var toolbar = host.querySelector('.editor-toolbar');

    if (toolbar && editable) {
        toolbar.querySelectorAll('.editor-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                editable.focus();
                var cmd = btn.getAttribute('data-cmd');
                if (cmd) {
                    document.execCommand(cmd, false, null);
                }
            });
        });

        var colorInput = document.getElementById(containerId + '-color');
        if (colorInput) {
            colorInput.addEventListener('change', function() {
                editable.focus();
                document.execCommand('foreColor', false, colorInput.value);
            });
        }

        var sizeSelect = document.getElementById(containerId + '-size');
        if (sizeSelect) {
            sizeSelect.addEventListener('change', function() {
                editable.focus();
                document.execCommand('fontSize', false, sizeSelect.value);
            });
        }
    }

    return {
        getHTML: function() {
            return editable ? editable.innerHTML : '';
        },
        setHTML: function(html) {
            if (editable) editable.innerHTML = html || '';
        }
    };
};

/**
 * 1. PKApp.admin.dashboard()
 */
PKApp.admin.dashboard = async function() {
    if (!PKApp.admin.checkAuth()) return;

    var welcomeName = (PKApp.currentUser && PKApp.currentUser.name) || 'ผู้ดูแลระบบ';

    var html = [
        '<div style="margin-bottom: 24px;">',
        '  <div style="background: linear-gradient(135deg, #F3E8FF 0%, #FEF3C7 100%); border-radius: 14px; padding: 24px; border: 1px solid #E9D5FF;">',
        '    <h3 style="color: #6B21A8; font-size: 1.3rem; font-weight: 700; margin: 0 0 8px 0;">ยินดีต้อนรับสู่แดชบอร์ด, ' + PKApp.escapeHtml(welcomeName) + '! 👋</h3>',
        '    <p style="color: #4B5563; font-size: 0.95rem; margin: 0;">ท่านสามารถจัดการและอัปเดตข้อมูลทั้งหมดของเว็บไซต์ ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว ได้จากเมนูด้านซ้ายหรือการ์ดทางลัดด้านล่างนี้</p>',
        '  </div>',
        '</div>',
        '<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px;" id="dashboard-stats-grid">',
        '  <div class="stat-card" style="padding: 20px; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 16px;">',
        '    <div style="width: 52px; height: 52px; border-radius: 12px; background: #F3E8FF; color: #6B21A8; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">📝</div>',
        '    <div>',
        '      <div style="font-size: 0.85rem; color: #6B7280; font-weight: 500;">ข้อมูลประวัติและเจตจำนง</div>',
        '      <div style="font-size: 1.25rem; font-weight: 700; color: #1F2937;">พร้อมจัดการ</div>',
        '      <a href="#/admin/significance" style="font-size: 0.8rem; color: #6B21A8; text-decoration: underline;">แก้ไขข้อมูล &rarr;</a>',
        '    </div>',
        '  </div>',
        '  <div class="stat-card" style="padding: 20px; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 16px;">',
        '    <div style="width: 52px; height: 52px; border-radius: 12px; background: #FEF3C7; color: #B45309; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">📢</div>',
        '    <div>',
        '      <div style="font-size: 0.85rem; color: #6B7280; font-weight: 500;">ข่าวสารและประชาสัมพันธ์</div>',
        '      <div style="font-size: 1.25rem; font-weight: 700; color: #1F2937;">4 หมวดหมู่</div>',
        '      <a href="#/admin/announce" style="font-size: 0.8rem; color: #B45309; text-decoration: underline;">จัดการข่าวสาร &rarr;</a>',
        '    </div>',
        '  </div>',
        '  <div class="stat-card" style="padding: 20px; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 16px;">',
        '    <div style="width: 52px; height: 52px; border-radius: 12px; background: #DCFCE7; color: #15803D; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">👥</div>',
        '    <div>',
        '      <div style="font-size: 0.85rem; color: #6B7280; font-weight: 500;">คณะกรรมการ & ตัวแทนห้อง</div>',
        '      <div style="font-size: 1.25rem; font-weight: 700; color: #1F2937;">รายปีการศึกษา</div>',
        '      <a href="#/admin/membernacc" style="font-size: 0.8rem; color: #15803D; text-decoration: underline;">จัดการรายชื่อ &rarr;</a>',
        '    </div>',
        '  </div>',
        '  <div class="stat-card" style="padding: 20px; background: #FFFFFF; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 2px 8px rgba(0,0,0,0.04); display: flex; align-items: center; gap: 16px;">',
        '    <div style="width: 52px; height: 52px; border-radius: 12px; background: #E0E7FF; color: #4338CA; display: flex; align-items: center; justify-content: center; font-size: 1.6rem;">🏆</div>',
        '    <div>',
        '      <div style="font-size: 0.85rem; color: #6B7280; font-weight: 500;">เกียรติบัตรและผลงาน</div>',
        '      <div style="font-size: 1.25rem; font-weight: 700; color: #1F2937;">รางวัลแห่งความภูมิใจ</div>',
        '      <a href="#/admin/certificate" style="font-size: 0.8rem; color: #4338CA; text-decoration: underline;">บันทึกผลงาน &rarr;</a>',
        '    </div>',
        '  </div>',
        '</div>'
    ].join('\n');

    PKApp.admin.renderLayout('dashboard', 'แดชบอร์ดผู้ดูแลระบบ', html);
};

/**
 * 2. PKApp.admin.editRichContent(tableName, title)
 * For: significance, hoop, anthority
 */
PKApp.admin.editRichContent = async function(tableName, title) {
    if (!PKApp.admin.checkAuth()) return;

    var bodyHtml = [
        '<div id="rich-form-container" style="background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 24px; margin-bottom: 30px;">',
        '  <h3 id="form-heading" style="color: #6B21A8; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 16px;">➕ เพิ่มข้อมูลใหม่</h3>',
        '  <form id="rich-content-form" class="admin-form">',
        '    <input type="hidden" id="edit-entry-id" value="">',
        '    <div class="form-group">',
        '      <label for="rich-title" class="form-label">หัวข้อ / ชื่อเรื่อง <span style="color:#EF4444;">*</span></label>',
        '      <input type="text" id="rich-title" class="form-control" required placeholder="ระบุหัวข้อเนื้อหา">',
        '    </div>',
        '    <div class="form-group">',
        '      <label class="form-label">เนื้อหาความสำคัญ (Rich Text)</label>',
        '      <div id="rich-editor-host"></div>',
        '    </div>',
        '    <div class="form-group">',
        '      <label for="rich-file" class="form-label">รูปภาพหรือไฟล์แนบ (ถ้ามี)</label>',
        '      <input type="file" id="rich-file" class="form-control" accept="image/*,application/pdf">',
        '      <div id="current-file-preview" style="margin-top: 6px; font-size: 0.85rem; color: #6B7280;"></div>',
        '    </div>',
        '    <div class="admin-actions">',
        '      <button type="button" id="rich-reset-btn" class="btn btn-cancel">ล้างข้อมูล</button>',
        '      <button type="submit" id="rich-submit-btn" class="btn btn-save">💾 บันทึกข้อมูล</button>',
        '    </div>',
        '  </form>',
        '</div>',
        '<div>',
        '  <h3 style="color: #374151; font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">📋 รายการข้อมูลในระบบ</h3>',
        '  <div id="rich-items-list" style="min-height: 120px;">กำลังโหลดข้อมูล...</div>',
        '</div>'
    ].join('\n');

    PKApp.admin.renderLayout(tableName, 'จัดการ: ' + title, bodyHtml);

    var editor = PKApp.admin.createRichEditor('rich-editor-host');
    var form = document.getElementById('rich-content-form');
    var idInput = document.getElementById('edit-entry-id');
    var titleInput = document.getElementById('rich-title');
    var fileInput = document.getElementById('rich-file');
    var filePreview = document.getElementById('current-file-preview');
    var formHeading = document.getElementById('form-heading');
    var resetBtn = document.getElementById('rich-reset-btn');
    var existingFileUrl = '';

    var resetForm = function() {
        idInput.value = '';
        titleInput.value = '';
        editor.setHTML('');
        fileInput.value = '';
        existingFileUrl = '';
        filePreview.innerHTML = '';
        formHeading.textContent = '➕ เพิ่มข้อมูลใหม่';
    };

    resetBtn.addEventListener('click', resetForm);

    // Fetch and display entries
    var loadEntries = async function() {
        var listContainer = document.getElementById('rich-items-list');
        if (!listContainer) return;
        listContainer.innerHTML = '<div style="text-align: center; padding: 20px; color: #6B7280;">กำลังโหลดข้อมูล...</div>';

        try {
            var { data, error } = await PKApp.supabase
                .from(tableName)
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                listContainer.innerHTML = '<div style="padding: 24px; text-align: center; background: #F9FAFB; border-radius: 10px; color: #9CA3AF;">ยังไม่มีข้อมูลในส่วนนี้</div>';
                return;
            }

            var html = '<div style="display: flex; flex-direction: column; gap: 14px;">';
            data.forEach(function(item) {
                var titleText = item.title || item.name || 'ไม่มีชื่อหัวข้อ';
                var dateText = item.timestamp || (item.created_at ? PKApp.formatThaiDate(item.created_at) : '-');
                var authorText = item.regisname || '-';
                var fileLink = (item.file || item.image)
                    ? '<a href="' + (item.file || item.image) + '" target="_blank" style="color: #6B21A8; text-decoration: underline; font-size: 0.85rem;">📎 ดูไฟล์แนบ</a>'
                    : '';

                html += '<div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; background: #FFFFFF; display: flex; justify-content: space-between; align-items: start; gap: 16px; flex-wrap: wrap;">' +
                    '<div style="flex: 1; min-width: 240px;">' +
                    '  <h4 style="margin: 0 0 6px 0; font-size: 1.05rem; color: #1F2937; font-weight: 700;">' + PKApp.escapeHtml(titleText) + '</h4>' +
                    '  <div style="font-size: 0.82rem; color: #6B7280; display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 8px;">' +
                    '    <span>ผู้บันทึก: <strong>' + PKApp.escapeHtml(authorText) + '</strong></span>' +
                    '    <span>วันที่: ' + dateText + '</span>' +
                    '  </div>' +
                    fileLink +
                    '</div>' +
                    '<div style="display: flex; gap: 8px;">' +
                    '  <button type="button" class="btn edit-item-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #F3E8FF; color: #6B21A8; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">✏️ แก้ไข</button>' +
                    '  <button type="button" class="btn delete-item-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #FEE2E2; color: #DC2626; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">🗑️ ลบ</button>' +
                    '</div>' +
                    '</div>';
            });
            html += '</div>';
            listContainer.innerHTML = html;

            // Bind edit/delete buttons
            listContainer.querySelectorAll('.edit-item-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var id = btn.getAttribute('data-id');
                    var target = data.find(function(d) { return String(d.id) === String(id); });
                    if (target) {
                        idInput.value = target.id;
                        titleInput.value = target.title || target.name || '';
                        editor.setHTML(target.content || '');
                        existingFileUrl = target.file || target.image || '';
                        filePreview.innerHTML = existingFileUrl
                            ? 'ไฟล์ปัจจุบัน: <a href="' + existingFileUrl + '" target="_blank" style="color:#6B21A8; text-decoration:underline;">เปิดไฟล์</a>'
                            : '';
                        formHeading.textContent = '✏️ แก้ไขข้อมูล (รหัส: ' + target.id + ')';
                        window.scrollTo({ top: 120, behavior: 'smooth' });
                    }
                });
            });

            listContainer.querySelectorAll('.delete-item-btn').forEach(function(btn) {
                btn.addEventListener('click', async function() {
                    var id = btn.getAttribute('data-id');
                    if (confirm('คุณแน่ใจว่าต้องการลบรายการนี้หรือไม่? การลบไม่สามารถเรียกคืนได้')) {
                        try {
                            PKApp.showLoading('กำลังลบข้อมูล...');
                            var { error: delErr } = await PKApp.supabase
                                .from(tableName)
                                .delete()
                                .eq('id', id);
                            PKApp.hideLoading();
                            if (delErr) throw delErr;
                            PKApp.showToast('ลบข้อมูลเรียบร้อยแล้ว', 'success');
                            loadEntries();
                        } catch (err) {
                            PKApp.hideLoading();
                            PKApp.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
                        }
                    }
                });
            });

        } catch (err) {
            listContainer.innerHTML = '<div style="color: #EF4444; padding: 20px;">ไม่สามารถโหลดข้อมูลได้: ' + PKApp.escapeHtml(err.message) + '</div>';
        }
    };

    // Handle form submit
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var titleVal = titleInput.value.trim();
        var contentVal = editor.getHTML();
        var regisnameVal = (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่';
        var currentId = idInput.value;

        if (!titleVal) {
            PKApp.showToast('กรุณากรอกหัวข้อเนื้อหา', 'warning');
            return;
        }

        try {
            PKApp.showLoading('กำลังบันทึกข้อมูล...');
            var uploadedUrl = existingFileUrl;

            if (fileInput.files && fileInput.files.length > 0) {
                uploadedUrl = await PKApp.uploadFile(fileInput.files[0], 'uploads');
            }

            var payload = {
                title: titleVal,
                content: contentVal,
                regisname: regisnameVal,
                timestamp: PKApp.formatThaiDate(new Date())
            };
            if (uploadedUrl) {
                payload.file = uploadedUrl;
                payload.image = uploadedUrl;
            }

            var opError = null;
            if (currentId) {
                var { error } = await PKApp.supabase
                    .from(tableName)
                    .update(payload)
                    .eq('id', currentId);
                opError = error;
            } else {
                var { error } = await PKApp.supabase
                    .from(tableName)
                    .insert([payload]);
                opError = error;
            }

            PKApp.hideLoading();
            if (opError) throw opError;

            PKApp.showToast('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
            resetForm();
            loadEntries();
        } catch (err) {
            PKApp.hideLoading();
            PKApp.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });

    loadEntries();
};

/**
 * 3. PKApp.admin.editMemberNACC()
 * For 'mamberNACC' table
 */
PKApp.admin.editMemberNACC = async function() {
    if (!PKApp.admin.checkAuth()) return;

    var positions = [
        '1.ผู้อำนวยการ',
        '2.รองผู้อำนวยการกลุ่มบริหารวิชาการ',
        '3.หัวหน้างานวิชาการ',
        '4.ครูที่ปรึกษา',
        '5.ประธาน ฯ',
        '6.รองประธาน ฯ',
        '7.เลขานุการ ฯ',
        '8.ผู้ช่วยเลขานุการ ฯ',
        '9.กรรมการ',
        '10.นักเรียนที่ปรึกษา ฯ'
    ];

    var posOptions = positions.map(function(pos) {
        return '<option value="' + pos + '">' + pos + '</option>';
    }).join('');

    var currentThaiYear = (new Date()).getFullYear() + 543;

    var bodyHtml = [
        '<div style="background: #F3F4F6; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">',
        '  <div style="display: flex; align-items: center; gap: 12px;">',
        '    <label for="member-year-select" style="font-weight: 700; color: #4B5563;">📅 เลือกปีการศึกษา:</label>',
        '    <select id="member-year-select" class="form-control" style="width: 140px; font-weight: 600;"></select>',
        '  </div>',
        '  <div style="display: flex; align-items: center; gap: 8px;">',
        '    <input type="number" id="new-year-input" class="form-control" placeholder="ปี พ.ศ. เช่น ' + currentThaiYear + '" style="width: 160px;">',
        '    <button type="button" id="add-year-btn" class="btn btn-purple" style="padding: 9px 16px; font-size: 0.9rem;">+ เพิ่มปีการศึกษา</button>',
        '  </div>',
        '</div>',
        '<div id="member-form-card" style="background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 24px; margin-bottom: 30px;">',
        '  <h3 id="member-form-title" style="color: #6B21A8; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 16px;">➕ เพิ่มบุคลากร / คณะกรรมการ</h3>',
        '  <form id="member-form" class="admin-form">',
        '    <input type="hidden" id="member-id" value="">',
        '    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">',
        '      <div class="form-group">',
        '        <label for="member-photo" class="form-label">รูปถ่ายบุคลากร</label>',
        '        <input type="file" id="member-photo" class="form-control" accept="image/*">',
        '        <div id="member-photo-preview" style="margin-top: 8px;"></div>',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="member-name" class="form-label">ชื่อ - สกุล <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="member-name" class="form-control" required placeholder="นาย / นางสาว / เด็กชาย...">',
        '      </div>',
        '      <div class="form-group">',
        '        <label class="form-label">ระดับชั้น</label>',
        '        <div style="display: flex; align-items: center; gap: 6px;">',
        '          <span style="font-size: 0.9rem; color: #4B5563; white-space: nowrap;">มัธยมศึกษาปีที่</span>',
        '          <input type="number" id="member-class-level" class="form-control" min="1" max="6" placeholder="เช่น 4" style="width: 80px;">',
        '          <span style="font-size: 1.1rem; color: #4B5563;">/</span>',
        '          <input type="number" id="member-class-room" class="form-control" min="1" max="20" placeholder="ห้อง เช่น 1" style="width: 80px;">',
        '        </div>',
        '        <div class="form-help">กรณีครู/ผู้บริหาร เว้นว่างระดับชั้นได้</div>',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="member-position" class="form-label">ตำแหน่ง <span style="color:#EF4444;">*</span></label>',
        '        <select id="member-position" class="form-control" required>' + posOptions + '</select>',
        '      </div>',
        '    </div>',
        '    <div class="admin-actions">',
        '      <button type="button" id="member-reset-btn" class="btn btn-cancel">ล้างข้อมูล</button>',
        '      <button type="submit" id="member-submit-btn" class="btn btn-save">💾 บันทึกรายชื่อ</button>',
        '    </div>',
        '  </form>',
        '</div>',
        '<div>',
        '  <h3 style="color: #374151; font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">👥 รายชื่อคณะกรรมการประจำปีการศึกษา <span id="current-year-display"></span></h3>',
        '  <div id="members-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 20px;"></div>',
        '</div>'
    ].join('\n');

    PKApp.admin.renderLayout('membernacc', 'จัดการ: บุคลากร (คณะกรรมการ ป.ป.ช.สพฐ.น้อย)', bodyHtml);

    var yearSelect = document.getElementById('member-year-select');
    var newYearInput = document.getElementById('new-year-input');
    var addYearBtn = document.getElementById('add-year-btn');
    var yearDisplay = document.getElementById('current-year-display');
    var memberForm = document.getElementById('member-form');
    var memberIdInput = document.getElementById('member-id');
    var memberNameInput = document.getElementById('member-name');
    var memberLevelInput = document.getElementById('member-class-level');
    var memberRoomInput = document.getElementById('member-class-room');
    var memberPosSelect = document.getElementById('member-position');
    var memberPhotoInput = document.getElementById('member-photo');
    var memberPhotoPreview = document.getElementById('member-photo-preview');
    var memberFormTitle = document.getElementById('member-form-title');
    var memberResetBtn = document.getElementById('member-reset-btn');
    var existingPhotoUrl = '';

    var resetMemberForm = function() {
        memberIdInput.value = '';
        memberNameInput.value = '';
        memberLevelInput.value = '';
        memberRoomInput.value = '';
        memberPosSelect.selectedIndex = 0;
        memberPhotoInput.value = '';
        existingPhotoUrl = '';
        memberPhotoPreview.innerHTML = '';
        memberFormTitle.textContent = '➕ เพิ่มบุคลากร / คณะกรรมการ';
    };

    memberResetBtn.addEventListener('click', resetMemberForm);

    // Load available years
    var loadYears = async function() {
        try {
            var { data, error } = await PKApp.supabase
                .from('mamberNACC')
                .select('year');

            var yearSet = new Set();
            yearSet.add(String(currentThaiYear));

            if (data && data.length > 0) {
                data.forEach(function(r) {
                    if (r.year) yearSet.add(String(r.year));
                });
            }

            var yearsArr = Array.from(yearSet).sort(function(a, b) { return Number(b) - Number(a); });
            yearSelect.innerHTML = yearsArr.map(function(y) {
                return '<option value="' + y + '">' + y + '</option>';
            }).join('');

            yearDisplay.textContent = yearSelect.value;
            loadMembers();
        } catch (e) {
            yearSelect.innerHTML = '<option value="' + currentThaiYear + '">' + currentThaiYear + '</option>';
            yearDisplay.textContent = currentThaiYear;
            loadMembers();
        }
    };

    addYearBtn.addEventListener('click', function() {
        var yVal = newYearInput.value.trim();
        if (!yVal || isNaN(yVal)) {
            PKApp.showToast('กรุณากรอกปีการศึกษาเป็นตัวเลข พ.ศ.', 'warning');
            return;
        }
        var exists = Array.from(yearSelect.options).some(function(o) { return o.value === yVal; });
        if (!exists) {
            var opt = document.createElement('option');
            opt.value = yVal;
            opt.textContent = yVal;
            yearSelect.insertBefore(opt, yearSelect.firstChild);
        }
        yearSelect.value = yVal;
        yearDisplay.textContent = yVal;
        newYearInput.value = '';
        loadMembers();
    });

    yearSelect.addEventListener('change', function() {
        yearDisplay.textContent = yearSelect.value;
        loadMembers();
    });

    // Load members for selected year
    var loadMembers = async function() {
        var grid = document.getElementById('members-grid');
        if (!grid) return;
        var selectedYear = yearSelect.value;
        grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #6B7280;">กำลังโหลดรายชื่อ...</div>';

        try {
            var { data, error } = await PKApp.supabase
                .from('mamberNACC')
                .select('*')
                .eq('year', selectedYear);

            if (error) throw error;

            if (!data || data.length === 0) {
                grid.innerHTML = '<div style="grid-column: 1/-1; padding: 30px; text-align: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF;">ยังไม่มีรายชื่อในประจำปีการศึกษานี้</div>';
                return;
            }

            var html = '';
            data.forEach(function(m) {
                var photoSrc = m.photo || m.image || 'https://lh3.googleusercontent.com/d/1E3Sfzalpk46I9uOFhsnfWrBURGb8LsED';
                html += '<div class="org-card" style="background: #FFFFFF; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 18px; text-align: center; box-shadow: 0 4px 12px rgba(0,0,0,0.04); display: flex; flex-direction: column; align-items: center; justify-content: space-between;">' +
                    '  <div>' +
                    '    <img src="' + photoSrc + '" alt="' + PKApp.escapeHtml(m.name || '') + '" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; margin-bottom: 12px; border: 3px solid #D4A843; background: #F3E8FF;">' +
                    '    <h4 style="font-size: 0.95rem; font-weight: 700; color: #1F2937; margin: 0 0 4px 0;">' + PKApp.escapeHtml(m.name || '') + '</h4>' +
                    '    <div style="font-size: 0.82rem; color: #6B21A8; font-weight: 600; margin-bottom: 4px;">' + PKApp.escapeHtml(m.position || '') + '</div>' +
                    '    <div style="font-size: 0.78rem; color: #6B7280; margin-bottom: 12px;">' + PKApp.escapeHtml(m.class || '') + '</div>' +
                    '  </div>' +
                    '  <div style="display: flex; gap: 8px; width: 100%; justify-content: center; border-top: 1px solid #F3F4F6; padding-top: 10px; margin-top: 6px;">' +
                    '    <button type="button" class="btn edit-m-btn" data-id="' + m.id + '" style="padding: 4px 10px; font-size: 0.8rem; background: #F3E8FF; color: #6B21A8; border-radius: 6px;">✏️ แก้ไข</button>' +
                    '    <button type="button" class="btn del-m-btn" data-id="' + m.id + '" style="padding: 4px 10px; font-size: 0.8rem; background: #FEE2E2; color: #DC2626; border-radius: 6px;">🗑️ ลบ</button>' +
                    '  </div>' +
                    '</div>';
            });
            grid.innerHTML = html;

            grid.querySelectorAll('.edit-m-btn').forEach(function(b) {
                b.addEventListener('click', function() {
                    var mId = b.getAttribute('data-id');
                    var target = data.find(function(it) { return String(it.id) === String(mId); });
                    if (target) {
                        memberIdInput.value = target.id;
                        memberNameInput.value = target.name || '';
                        memberPosSelect.value = target.position || positions[0];

                        // Parse class: e.g. "มัธยมศึกษาปีที่ 4/2"
                        if (target.class) {
                            var match = target.class.match(/(\d+)\s*\/\s*(\d+)/);
                            if (match) {
                                memberLevelInput.value = match[1];
                                memberRoomInput.value = match[2];
                            }
                        }

                        existingPhotoUrl = target.photo || target.image || '';
                        memberPhotoPreview.innerHTML = existingPhotoUrl
                            ? '<img src="' + existingPhotoUrl + '" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover;">'
                            : '';
                        memberFormTitle.textContent = '✏️ แก้ไขข้อมูลบุคลากร (รหัส: ' + target.id + ')';
                        window.scrollTo({ top: 200, behavior: 'smooth' });
                    }
                });
            });

            grid.querySelectorAll('.del-m-btn').forEach(function(b) {
                b.addEventListener('click', async function() {
                    var mId = b.getAttribute('data-id');
                    if (confirm('คุณแน่ใจว่าต้องการลบรายชื่อบุคลากรท่านนี้หรือไม่?')) {
                        try {
                            PKApp.showLoading('กำลังลบข้อมูล...');
                            var { error: dErr } = await PKApp.supabase
                                .from('mamberNACC')
                                .delete()
                                .eq('id', mId);
                            PKApp.hideLoading();
                            if (dErr) throw dErr;
                            PKApp.showToast('ลบข้อมูลเรียบร้อยแล้ว', 'success');
                            loadMembers();
                        } catch (err) {
                            PKApp.hideLoading();
                            PKApp.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
                        }
                    }
                });
            });

        } catch (err) {
            grid.innerHTML = '<div style="color: #EF4444; grid-column: 1/-1;">เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + PKApp.escapeHtml(err.message) + '</div>';
        }
    };

    memberForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        var nameVal = memberNameInput.value.trim();
        var levelVal = memberLevelInput.value.trim();
        var roomVal = memberRoomInput.value.trim();
        var posVal = memberPosSelect.value;
        var mId = memberIdInput.value;
        var yearVal = yearSelect.value;

        if (!nameVal) {
            PKApp.showToast('กรุณาระบุชื่อ - สกุล', 'warning');
            return;
        }

        var classStr = '';
        if (levelVal && roomVal) {
            classStr = 'มัธยมศึกษาปีที่ ' + levelVal + '/' + roomVal;
        }

        try {
            PKApp.showLoading('กำลังบันทึกข้อมูล...');
            var photoUrl = existingPhotoUrl;
            if (memberPhotoInput.files && memberPhotoInput.files.length > 0) {
                photoUrl = await PKApp.uploadFile(memberPhotoInput.files[0], 'uploads');
            }

            var payload = {
                year: yearVal,
                name: nameVal,
                position: posVal,
                class: classStr,
                regisname: (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่'
            };
            if (photoUrl) {
                payload.photo = photoUrl;
                payload.image = photoUrl;
            }

            var resError = null;
            if (mId) {
                var { error } = await PKApp.supabase
                    .from('mamberNACC')
                    .update(payload)
                    .eq('id', mId);
                resError = error;
            } else {
                var { error } = await PKApp.supabase
                    .from('mamberNACC')
                    .insert([payload]);
                resError = error;
            }

            PKApp.hideLoading();
            if (resError) throw resError;

            PKApp.showToast('บันทึกข้อมูลบุคลากรเรียบร้อยแล้ว', 'success');
            resetMemberForm();
            loadMembers();
        } catch (err) {
            PKApp.hideLoading();
            PKApp.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });

    loadYears();
};

/**
 * 4. PKApp.admin.editANACC()
 * For 'ANACC' table
 */
PKApp.admin.editANACC = async function() {
    if (!PKApp.admin.checkAuth()) return;

    var currentThaiYear = (new Date()).getFullYear() + 543;

    var bodyHtml = [
        '<div style="background: #F3F4F6; padding: 16px 20px; border-radius: 12px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">',
        '  <div style="display: flex; align-items: center; gap: 12px;">',
        '    <label for="anacc-year-select" style="font-weight: 700; color: #4B5563;">📅 เลือกปีการศึกษา:</label>',
        '    <select id="anacc-year-select" class="form-control" style="width: 140px; font-weight: 600;"></select>',
        '  </div>',
        '  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">',
        '    <input type="number" id="anacc-new-year" class="form-control" placeholder="ปี พ.ศ." style="width: 130px;">',
        '    <button type="button" id="anacc-add-year-btn" class="btn btn-purple" style="padding: 8px 14px; font-size: 0.88rem;">+ เพิ่มปี</button>',
        '    <label for="anacc-csv-file" class="btn btn-gold" style="padding: 8px 16px; font-size: 0.88rem; cursor: pointer;">',
        '      📥 นำเข้าไฟล์ CSV',
        '      <input type="file" id="anacc-csv-file" accept=".csv" style="display: none;">',
        '    </label>',
        '  </div>',
        '</div>',
        '<div id="anacc-form-card" style="background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 24px; margin-bottom: 30px;">',
        '  <h3 id="anacc-form-title" style="color: #6B21A8; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 16px;">➕ เพิ่มตัวแทนห้อง (อนุกรรมการ ป.ป.ช.สพฐ.น้อย)</h3>',
        '  <form id="anacc-form" class="admin-form">',
        '    <input type="hidden" id="anacc-id" value="">',
        '    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">',
        '      <div class="form-group">',
        '        <label for="anacc-no" class="form-label">ลำดับที่ (No.)</label>',
        '        <input type="number" id="anacc-no" class="form-control" readonly placeholder="สร้างอัตโนมัติ" style="background:#E5E7EB;">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="anacc-roll" class="form-label">เลขประจำตัวนักเรียน (5 หลัก) <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="anacc-roll" class="form-control" maxlength="5" pattern="[0-9]{5}" required placeholder="เช่น 12345">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="anacc-name" class="form-label">ชื่อ - สกุล <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="anacc-name" class="form-control" required placeholder="ชื่อ - สกุลนักเรียน">',
        '      </div>',
        '      <div class="form-group">',
        '        <label class="form-label">ระดับชั้น <span style="color:#EF4444;">*</span></label>',
        '        <div style="display: flex; align-items: center; gap: 6px;">',
        '          <span style="font-size: 0.85rem; color: #4B5563; white-space: nowrap;">ชั้นมัธยมศึกษาปีที่</span>',
        '          <input type="number" id="anacc-level" class="form-control" min="1" max="6" required placeholder="ม." style="width: 70px;">',
        '          <span style="font-size: 1.1rem; color: #4B5563;">/</span>',
        '          <input type="number" id="anacc-room" class="form-control" min="1" max="20" required placeholder="ห้อง" style="width: 70px;">',
        '        </div>',
        '      </div>',
        '    </div>',
        '    <div class="admin-actions">',
        '      <button type="button" id="anacc-reset-btn" class="btn btn-cancel">ล้างข้อมูล</button>',
        '      <button type="submit" id="anacc-submit-btn" class="btn btn-save">💾 บันทึกข้อมูล</button>',
        '    </div>',
        '  </form>',
        '</div>',
        '<div>',
        '  <h3 style="color: #374151; font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">🎒 รายชื่อตัวแทนห้องประจำปีการศึกษา <span id="anacc-year-display"></span></h3>',
        '  <div class="table-responsive" style="border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.04); border: 1px solid #E5E7EB;">',
        '    <table class="data-table" style="width: 100%; border-collapse: collapse;">',
        '      <thead>',
        '        <tr style="background: #6B21A8; color: #FFFFFF; text-align: left;">',
        '          <th style="padding: 12px 16px; width: 80px;">ลำดับ</th>',
        '          <th style="padding: 12px 16px; width: 140px;">เลขประจำตัว</th>',
        '          <th style="padding: 12px 16px;">ชื่อ - สกุล</th>',
        '          <th style="padding: 12px 16px; width: 160px;">ชั้น/ห้อง</th>',
        '          <th style="padding: 12px 16px; width: 140px; text-align: center;">การจัดการ</th>',
        '        </tr>',
        '      </thead>',
        '      <tbody id="anacc-table-body">',
        '        <tr><td colspan="5" style="text-align: center; padding: 24px; color: #6B7280;">กำลังโหลดข้อมูล...</td></tr>',
        '      </tbody>',
        '    </table>',
        '  </div>',
        '</div>'
    ].join('\n');

    PKApp.admin.renderLayout('anacc', 'จัดการ: ตัวแทนห้อง (อนุกรรมการ ป.ป.ช.สพฐ.น้อย)', bodyHtml);

    var yearSelect = document.getElementById('anacc-year-select');
    var yearDisplay = document.getElementById('anacc-year-display');
    var newYearInput = document.getElementById('anacc-new-year');
    var addYearBtn = document.getElementById('anacc-add-year-btn');
    var csvFileInput = document.getElementById('anacc-csv-file');
    var form = document.getElementById('anacc-form');
    var idInput = document.getElementById('anacc-id');
    var noInput = document.getElementById('anacc-no');
    var rollInput = document.getElementById('anacc-roll');
    var nameInput = document.getElementById('anacc-name');
    var levelInput = document.getElementById('anacc-level');
    var roomInput = document.getElementById('anacc-room');
    var resetBtn = document.getElementById('anacc-reset-btn');
    var formTitle = document.getElementById('anacc-form-title');
    var tableBody = document.getElementById('anacc-table-body');

    var getNextNo = async function(year) {
        try {
            var { data } = await PKApp.supabase
                .from('ANACC')
                .select('no')
                .eq('year', year)
                .order('no', { ascending: false })
                .limit(1);
            if (data && data.length > 0 && data[0].no) {
                return Number(data[0].no) + 1;
            }
        } catch (e) {}
        return 1;
    };

    var resetAnaccForm = async function() {
        idInput.value = '';
        rollInput.value = '';
        nameInput.value = '';
        levelInput.value = '';
        roomInput.value = '';
        formTitle.textContent = '➕ เพิ่มตัวแทนห้อง (อนุกรรมการ ป.ป.ช.สพฐ.น้อย)';
        noInput.value = await getNextNo(yearSelect.value);
    };

    resetBtn.addEventListener('click', resetAnaccForm);

    var loadYears = async function() {
        try {
            var { data } = await PKApp.supabase.from('ANACC').select('year');
            var set = new Set();
            set.add(String(currentThaiYear));
            if (data) {
                data.forEach(function(d) { if (d.year) set.add(String(d.year)); });
            }
            var arr = Array.from(set).sort(function(a, b) { return Number(b) - Number(a); });
            yearSelect.innerHTML = arr.map(function(y) {
                return '<option value="' + y + '">' + y + '</option>';
            }).join('');
            yearDisplay.textContent = yearSelect.value;
            noInput.value = await getNextNo(yearSelect.value);
            loadTable();
        } catch (e) {
            yearSelect.innerHTML = '<option value="' + currentThaiYear + '">' + currentThaiYear + '</option>';
            yearDisplay.textContent = currentThaiYear;
            noInput.value = 1;
            loadTable();
        }
    };

    addYearBtn.addEventListener('click', async function() {
        var y = newYearInput.value.trim();
        if (!y || isNaN(y)) {
            PKApp.showToast('กรุณากรอกปี พ.ศ. เป็นตัวเลข', 'warning');
            return;
        }
        var exists = Array.from(yearSelect.options).some(function(o) { return o.value === y; });
        if (!exists) {
            var opt = document.createElement('option');
            opt.value = y;
            opt.textContent = y;
            yearSelect.insertBefore(opt, yearSelect.firstChild);
        }
        yearSelect.value = y;
        yearDisplay.textContent = y;
        newYearInput.value = '';
        noInput.value = await getNextNo(y);
        loadTable();
    });

    yearSelect.addEventListener('change', async function() {
        yearDisplay.textContent = yearSelect.value;
        noInput.value = await getNextNo(yearSelect.value);
        loadTable();
    });

    var loadTable = async function() {
        var curYear = yearSelect.value;
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: #6B7280;">กำลังโหลดข้อมูล...</td></tr>';

        try {
            var { data, error } = await PKApp.supabase
                .from('ANACC')
                .select('*')
                .eq('year', curYear)
                .order('no', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 24px; color: #9CA3AF;">ยังไม่มีข้อมูลตัวแทนห้องในปีการศึกษานี้</td></tr>';
                return;
            }

            var html = '';
            data.forEach(function(row) {
                html += '<tr style="border-bottom: 1px solid #E5E7EB;">' +
                    '<td style="padding: 12px 16px; font-weight: 600; color: #6B21A8;">' + (row.no || '-') + '</td>' +
                    '<td style="padding: 12px 16px; font-family: monospace; font-size: 0.95rem;">' + PKApp.escapeHtml(row.roll || '-') + '</td>' +
                    '<td style="padding: 12px 16px; font-weight: 500;">' + PKApp.escapeHtml(row.name || '-') + '</td>' +
                    '<td style="padding: 12px 16px;">' + PKApp.escapeHtml(row.class || '-') + '</td>' +
                    '<td style="padding: 12px 16px; text-align: center;">' +
                    '  <button type="button" class="btn edit-anacc-btn" data-id="' + row.id + '" style="padding: 4px 8px; font-size: 0.8rem; background: #F3E8FF; color: #6B21A8; border-radius: 6px; margin-right: 4px;">✏️</button>' +
                    '  <button type="button" class="btn del-anacc-btn" data-id="' + row.id + '" style="padding: 4px 8px; font-size: 0.8rem; background: #FEE2E2; color: #DC2626; border-radius: 6px;">🗑️</button>' +
                    '</td>' +
                    '</tr>';
            });
            tableBody.innerHTML = html;

            tableBody.querySelectorAll('.edit-anacc-btn').forEach(function(b) {
                b.addEventListener('click', function() {
                    var anId = b.getAttribute('data-id');
                    var target = data.find(function(it) { return String(it.id) === String(anId); });
                    if (target) {
                        idInput.value = target.id;
                        noInput.value = target.no || '';
                        rollInput.value = target.roll || '';
                        nameInput.value = target.name || '';
                        if (target.class) {
                            var m = target.class.match(/(\d+)\s*\/\s*(\d+)/);
                            if (m) {
                                levelInput.value = m[1];
                                roomInput.value = m[2];
                            }
                        }
                        formTitle.textContent = '✏️ แก้ไขข้อมูลตัวแทนห้อง (ลำดับที่ ' + target.no + ')';
                        window.scrollTo({ top: 180, behavior: 'smooth' });
                    }
                });
            });

            tableBody.querySelectorAll('.del-anacc-btn').forEach(function(b) {
                b.addEventListener('click', async function() {
                    var anId = b.getAttribute('data-id');
                    if (confirm('คุณแน่ใจว่าต้องการลบรายการนี้?')) {
                        try {
                            PKApp.showLoading('กำลังลบข้อมูล...');
                            var { error: delE } = await PKApp.supabase
                                .from('ANACC')
                                .delete()
                                .eq('id', anId);
                            PKApp.hideLoading();
                            if (delE) throw delE;
                            PKApp.showToast('ลบข้อมูลเรียบร้อยแล้ว', 'success');
                            loadTable();
                        } catch (err) {
                            PKApp.hideLoading();
                            PKApp.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
                        }
                    }
                });
            });

        } catch (err) {
            tableBody.innerHTML = '<tr><td colspan="5" style="color: #EF4444; padding: 20px; text-align: center;">เกิดข้อผิดพลาด: ' + PKApp.escapeHtml(err.message) + '</td></tr>';
        }
    };

    // CSV Import Handler
    csvFileInput.addEventListener('change', function(e) {
        var file = e.target.files[0];
        if (!file) return;

        var reader = new FileReader();
        reader.onload = async function(evt) {
            try {
                var text = evt.target.result;
                var lines = text.split(/\r\n|\n/).filter(function(l) { return l.trim().length > 0; });
                if (lines.length <= 1) {
                    PKApp.showToast('ไฟล์ CSV ไม่มีข้อมูล', 'warning');
                    return;
                }

                PKApp.showLoading('กำลังนำเข้าข้อมูลจาก CSV...');
                var records = [];
                var startIndex = 0;
                // Check if line 0 is header
                var line0 = lines[0].toLowerCase();
                if (line0.includes('roll') || line0.includes('name') || line0.includes('ชื่อ') || line0.includes('no')) {
                    startIndex = 1;
                }

                var yearVal = yearSelect.value;
                for (var i = startIndex; i < lines.length; i++) {
                    var cols = lines[i].split(',').map(function(c) { return c.replace(/^["']|["']$/g, '').trim(); });
                    if (cols.length >= 3) {
                        // formats can be: [no, roll, name, class] or [roll, name, class]
                        var rNo = cols.length >= 4 ? cols[0] : (i - startIndex + 1);
                        var rRoll = cols.length >= 4 ? cols[1] : cols[0];
                        var rName = cols.length >= 4 ? cols[2] : cols[1];
                        var rClass = cols.length >= 4 ? cols[3] : cols[2];

                        records.push({
                            no: Number(rNo) || (i + 1),
                            roll: String(rRoll).padStart(5, '0'),
                            name: rName,
                            class: rClass.startsWith('ชั้น') ? rClass : 'ชั้นมัธยมศึกษาปีที่ ' + rClass,
                            year: yearVal,
                            regisname: (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่'
                        });
                    }
                }

                if (records.length > 0) {
                    var { error: batchErr } = await PKApp.supabase
                        .from('ANACC')
                        .insert(records);
                    PKApp.hideLoading();
                    if (batchErr) throw batchErr;
                    PKApp.showToast('นำเข้าข้อมูลสำเร็จจำนวน ' + records.length + ' รายการ', 'success');
                    csvFileInput.value = '';
                    loadTable();
                } else {
                    PKApp.hideLoading();
                    PKApp.showToast('ไม่พบแถวข้อมูลที่ถูกต้องตามรูปแบบ', 'warning');
                }
            } catch (err) {
                PKApp.hideLoading();
                PKApp.showToast('เกิดข้อผิดพลาดในการนำเข้า CSV: ' + err.message, 'error');
            }
        };
        reader.readAsText(file, 'UTF-8');
    });

    // Form submission
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var rollVal = rollInput.value.trim();
        var nameVal = nameInput.value.trim();
        var lvl = levelInput.value.trim();
        var rm = roomInput.value.trim();
        var aId = idInput.value;
        var yVal = yearSelect.value;

        if (rollVal.length !== 5 || isNaN(rollVal)) {
            PKApp.showToast('เลขประจำตัวนักเรียนต้องเป็นตัวเลข 5 หลัก', 'warning');
            rollInput.focus();
            return;
        }

        var classVal = 'ชั้นมัธยมศึกษาปีที่ ' + lvl + '/' + rm;
        var noVal = Number(noInput.value) || 1;

        try {
            PKApp.showLoading('กำลังบันทึกข้อมูล...');
            var payload = {
                no: noVal,
                roll: rollVal,
                name: nameVal,
                class: classVal,
                year: yVal,
                regisname: (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่'
            };

            var resError = null;
            if (aId) {
                var { error } = await PKApp.supabase
                    .from('ANACC')
                    .update(payload)
                    .eq('id', aId);
                resError = error;
            } else {
                var { error } = await PKApp.supabase
                    .from('ANACC')
                    .insert([payload]);
                resError = error;
            }

            PKApp.hideLoading();
            if (resError) throw resError;

            PKApp.showToast('บันทึกข้อมูลเรียบร้อยแล้ว', 'success');
            await resetAnaccForm();
            loadTable();
        } catch (err) {
            PKApp.hideLoading();
            PKApp.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });

    loadYears();
};

/**
 * 5. PKApp.admin.editNews(type)
 * For 'new' table filtered by type: 'ประกาศ', 'ประชาสัมพันธ์', 'คำสั่ง', 'จดหมายข่าว'
 */
PKApp.admin.editNews = async function(type) {
    if (!PKApp.admin.checkAuth()) return;

    var titleLabel = 'ชื่อเรื่อง';
    if (type === 'คำสั่ง') {
        titleLabel = 'เลขที่คำสั่ง / ชื่อเรื่อง';
    } else if (type === 'จดหมายข่าว') {
        titleLabel = 'เลขที่จดหมายข่าว / ชื่อเรื่อง';
    }

    var authorName = (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่';
    var currentThaiTime = PKApp.formatThaiDate(new Date());

    var bodyHtml = [
        '<div id="news-form-card" style="background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 24px; margin-bottom: 30px;">',
        '  <h3 id="news-form-title" style="color: #6B21A8; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 16px;">➕ เพิ่ม' + type + 'ใหม่</h3>',
        '  <form id="news-form" class="admin-form">',
        '    <input type="hidden" id="news-id" value="">',
        '    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">',
        '      <div class="form-group">',
        '        <label for="news-no" class="form-label">ลำดับที่ (No.)</label>',
        '        <input type="number" id="news-no" class="form-control" readonly style="background:#E5E7EB;">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="news-type" class="form-label">หมวดหมู่ข่าว</label>',
        '        <input type="text" id="news-type" class="form-control" value="' + type + '" readonly style="background:#E5E7EB; font-weight:600;">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="news-author" class="form-label">ผู้บันทึก (Author)</label>',
        '        <input type="text" id="news-author" class="form-control" value="' + PKApp.escapeHtml(authorName) + '" readonly style="background:#E5E7EB;">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="news-timestamp" class="form-label">วันเวลาที่ลงข้อมูล</label>',
        '        <input type="text" id="news-timestamp" class="form-control" value="' + currentThaiTime + '" readonly style="background:#E5E7EB;">',
        '      </div>',
        '    </div>',
        '    <div class="form-group">',
        '      <label for="news-name" class="form-label">' + titleLabel + ' <span style="color:#EF4444;">*</span></label>',
        '      <input type="text" id="news-name" class="form-control" required placeholder="กรอก' + titleLabel + '">',
        '    </div>',
        '    <div class="form-group">',
        '      <label for="news-files" class="form-label">ไฟล์แนบ / ภาพข่าว (สามารถเลือกได้หลายไฟล์ 1 - 100 ไฟล์: PDF, รูปภาพ)</label>',
        '      <input type="file" id="news-files" class="form-control" multiple accept="application/pdf,image/*">',
        '      <div id="news-files-preview" style="margin-top: 8px; font-size: 0.85rem; color: #4B5563;"></div>',
        '    </div>',
        '    <div class="admin-actions">',
        '      <button type="button" id="news-reset-btn" class="btn btn-cancel">ล้างข้อมูล</button>',
        '      <button type="submit" id="news-submit-btn" class="btn btn-save">💾 บันทึก' + type + '</button>',
        '    </div>',
        '  </form>',
        '</div>',
        '<div>',
        '  <h3 style="color: #374151; font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">📰 รายการ' + type + 'ทั้งหมดในระบบ</h3>',
        '  <div id="news-list-container">กำลังโหลดข้อมูล...</div>',
        '</div>'
    ].join('\n');

    var routeKey = 'announce';
    if (type === 'ประชาสัมพันธ์') routeKey = 'information';
    else if (type === 'คำสั่ง') routeKey = 'make';
    else if (type === 'จดหมายข่าว') routeKey = 'newsletter';

    PKApp.admin.renderLayout(routeKey, 'จัดการ: ' + type, bodyHtml);

    var form = document.getElementById('news-form');
    var idInput = document.getElementById('news-id');
    var noInput = document.getElementById('news-no');
    var nameInput = document.getElementById('news-name');
    var filesInput = document.getElementById('news-files');
    var filesPreview = document.getElementById('news-files-preview');
    var formTitle = document.getElementById('news-form-title');
    var resetBtn = document.getElementById('news-reset-btn');
    var existingFilesStr = '';

    var getNextNewsNo = async function() {
        try {
            var { data } = await PKApp.supabase
                .from('new')
                .select('no')
                .eq('type', type)
                .order('no', { ascending: false })
                .limit(1);
            if (data && data.length > 0 && data[0].no) {
                return Number(data[0].no) + 1;
            }
        } catch (e) {}
        return 1;
    };

    var resetNewsForm = async function() {
        idInput.value = '';
        nameInput.value = '';
        filesInput.value = '';
        existingFilesStr = '';
        filesPreview.innerHTML = '';
        formTitle.textContent = '➕ เพิ่ม' + type + 'ใหม่';
        noInput.value = await getNextNewsNo();
        document.getElementById('news-timestamp').value = PKApp.formatThaiDate(new Date());
    };

    resetBtn.addEventListener('click', resetNewsForm);
    noInput.value = await getNextNewsNo();

    // Load existing news items
    var loadNews = async function() {
        var container = document.getElementById('news-list-container');
        if (!container) return;
        container.innerHTML = '<div style="text-align: center; padding: 24px; color: #6B7280;">กำลังโหลดข้อมูล...</div>';

        try {
            var { data, error } = await PKApp.supabase
                .from('new')
                .select('*')
                .eq('type', type)
                .order('no', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                container.innerHTML = '<div style="padding: 24px; text-align: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF;">ยังไม่มีรายการ' + type + 'ในระบบ</div>';
                return;
            }

            var html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
            data.forEach(function(item) {
                var fileCount = item.file ? item.file.split(',').filter(Boolean).length : 0;
                var fileBadges = '';
                if (fileCount > 0) {
                    fileBadges = '<span style="font-size: 0.8rem; background: #DDD6FE; color: #6B21A8; padding: 2px 8px; border-radius: 6px; font-weight: 600;">📎 ' + fileCount + ' ไฟล์</span>';
                }

                html += '<div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; background: #FFFFFF; display: flex; justify-content: space-between; align-items: start; gap: 16px; flex-wrap: wrap;">' +
                    '<div style="flex: 1; min-width: 240px;">' +
                    '  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">' +
                    '    <span style="font-size: 0.82rem; font-weight: 700; background: #F3F4F6; color: #374151; padding: 2px 8px; border-radius: 6px;">ลำดับที่ ' + (item.no || '-') + '</span>' +
                    fileBadges +
                    '  </div>' +
                    '  <h4 style="margin: 0 0 6px 0; font-size: 1.05rem; color: #1F2937; font-weight: 700;">' + PKApp.escapeHtml(item.name || 'ไม่มีชื่อเรื่อง') + '</h4>' +
                    '  <div style="font-size: 0.82rem; color: #6B7280; display: flex; gap: 14px; flex-wrap: wrap;">' +
                    '    <span>ผู้บันทึก: <strong>' + PKApp.escapeHtml(item.regisname || '-') + '</strong></span>' +
                    '    <span>วันที่: ' + (item.timestamp || (item.created_at ? PKApp.formatThaiDate(item.created_at) : '-')) + '</span>' +
                    '  </div>' +
                    '</div>' +
                    '<div style="display: flex; gap: 8px;">' +
                    '  <button type="button" class="btn edit-n-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #F3E8FF; color: #6B21A8; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">✏️ แก้ไข</button>' +
                    '  <button type="button" class="btn del-n-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #FEE2E2; color: #DC2626; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">🗑️ ลบ</button>' +
                    '</div>' +
                    '</div>';
            });
            html += '</div>';
            container.innerHTML = html;

            container.querySelectorAll('.edit-n-btn').forEach(function(b) {
                b.addEventListener('click', function() {
                    var nId = b.getAttribute('data-id');
                    var target = data.find(function(it) { return String(it.id) === String(nId); });
                    if (target) {
                        idInput.value = target.id;
                        noInput.value = target.no || '';
                        nameInput.value = target.name || '';
                        existingFilesStr = target.file || '';
                        var fCount = existingFilesStr ? existingFilesStr.split(',').filter(Boolean).length : 0;
                        filesPreview.innerHTML = fCount > 0 ? 'ไฟล์ปัจจุบัน: ' + fCount + ' ไฟล์' : '';
                        formTitle.textContent = '✏️ แก้ไข' + type + ' (ลำดับที่ ' + target.no + ')';
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                    }
                });
            });

            container.querySelectorAll('.del-n-btn').forEach(function(b) {
                b.addEventListener('click', async function() {
                    var nId = b.getAttribute('data-id');
                    if (confirm('คุณแน่ใจว่าต้องการลบรายการนี้หรือไม่?')) {
                        try {
                            PKApp.showLoading('กำลังลบข้อมูล...');
                            var { error: delErr } = await PKApp.supabase
                                .from('new')
                                .delete()
                                .eq('id', nId);
                            PKApp.hideLoading();
                            if (delErr) throw delErr;
                            PKApp.showToast('ลบข้อมูลเรียบร้อยแล้ว', 'success');
                            loadNews();
                        } catch (err) {
                            PKApp.hideLoading();
                            PKApp.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
                        }
                    }
                });
            });

        } catch (err) {
            container.innerHTML = '<div style="color: #EF4444; padding: 20px;">เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + PKApp.escapeHtml(err.message) + '</div>';
        }
    };

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var nameVal = nameInput.value.trim();
        var nId = idInput.value;
        var noVal = Number(noInput.value) || 1;

        if (!nameVal) {
            PKApp.showToast('กรุณากรอก' + titleLabel, 'warning');
            return;
        }

        try {
            PKApp.showLoading('กำลังอัปโหลดไฟล์และบันทึกข้อมูล...');
            var uploadedUrls = existingFilesStr ? existingFilesStr.split(',').filter(Boolean) : [];

            if (filesInput.files && filesInput.files.length > 0) {
                for (var i = 0; i < filesInput.files.length; i++) {
                    var url = await PKApp.uploadFile(filesInput.files[i], 'uploads');
                    uploadedUrls.push(url);
                }
            }

            var fileStr = uploadedUrls.join(',');
            var payload = {
                no: noVal,
                name: nameVal,
                type: type,
                file: fileStr,
                regisname: (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่',
                timestamp: PKApp.formatThaiDate(new Date())
            };

            var resError = null;
            if (nId) {
                var { error } = await PKApp.supabase
                    .from('new')
                    .update(payload)
                    .eq('id', nId);
                resError = error;
            } else {
                var { error } = await PKApp.supabase
                    .from('new')
                    .insert([payload]);
                resError = error;
            }

            PKApp.hideLoading();
            if (resError) throw resError;

            PKApp.showToast('บันทึกข้อมูล' + type + 'เรียบร้อยแล้ว', 'success');
            await resetNewsForm();
            loadNews();
        } catch (err) {
            PKApp.hideLoading();
            PKApp.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });

    loadNews();
};

/**
 * 6. PKApp.admin.editCertificate()
 * For 'Certificate' table
 */
PKApp.admin.editCertificate = async function() {
    if (!PKApp.admin.checkAuth()) return;

    var awardLevels = [
        'ชนะเลิศ',
        'รองชนะเลิศอันดับ 1',
        'รองชนะเลิศอันดับ 2',
        'รองชนะเลิศอันดับ 3',
        'ชมเชย',
        'เข้าร่วม',
        'เหรียญทอง',
        'เหรียญเงิน',
        'เหรียญทองแดง'
    ];

    var levelOptions = awardLevels.map(function(lvl) {
        return '<option value="' + lvl + '">' + lvl + '</option>';
    }).join('');

    var bodyHtml = [
        '<div id="cert-form-card" style="background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 24px; margin-bottom: 30px;">',
        '  <h3 id="cert-form-title" style="color: #6B21A8; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 16px;">➕ เพิ่มทะเบียนเกียรติบัตร</h3>',
        '  <form id="cert-form" class="admin-form">',
        '    <input type="hidden" id="cert-id" value="">',
        '    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">',
        '      <div class="form-group">',
        '        <label for="cert-date" class="form-label">วันที่ได้รับ <span style="color:#EF4444;">*</span></label>',
        '        <input type="date" id="cert-date" class="form-control" required>',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="cert-name" class="form-label">ชื่อเกียรติบัตร <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="cert-name" class="form-control" required placeholder="ระบุชื่อเกียรติบัตร">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="cert-from" class="form-label">หน่วยงานที่มอบให้ (จาก) <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="cert-from" class="form-control" required placeholder="เช่น สพฐ., สำนักงาน ป.ป.ช.">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="cert-level" class="form-label">ระดับรางวัล <span style="color:#EF4444;">*</span></label>',
        '        <select id="cert-level" class="form-control" required>' + levelOptions + '</select>',
        '      </div>',
        '    </div>',
        '    <div class="form-group">',
        '      <label for="cert-files" class="form-label">ไฟล์แนบเกียรติบัตร (PDF 1 - 5 ไฟล์)</label>',
        '      <input type="file" id="cert-files" class="form-control" multiple accept="application/pdf">',
        '      <div id="cert-files-preview" style="margin-top: 6px; font-size: 0.85rem; color: #4B5563;"></div>',
        '    </div>',
        '    <div class="admin-actions">',
        '      <button type="button" id="cert-reset-btn" class="btn btn-cancel">ล้างข้อมูล</button>',
        '      <button type="submit" id="cert-submit-btn" class="btn btn-save">💾 บันทึกเกียรติบัตร</button>',
        '    </div>',
        '  </form>',
        '</div>',
        '<div>',
        '  <h3 style="color: #374151; font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">🎖️ ทะเบียนเกียรติบัตรในระบบ</h3>',
        '  <div id="cert-list-container">กำลังโหลดข้อมูล...</div>',
        '</div>'
    ].join('\n');

    PKApp.admin.renderLayout('certificate', 'จัดการ: ทะเบียนเกียรติบัตร', bodyHtml);

    var form = document.getElementById('cert-form');
    var idInput = document.getElementById('cert-id');
    var dateInput = document.getElementById('cert-date');
    var nameInput = document.getElementById('cert-name');
    var fromInput = document.getElementById('cert-from');
    var levelSelect = document.getElementById('cert-level');
    var filesInput = document.getElementById('cert-files');
    var filesPreview = document.getElementById('cert-files-preview');
    var formTitle = document.getElementById('cert-form-title');
    var resetBtn = document.getElementById('cert-reset-btn');
    var existingFilesStr = '';

    var resetCertForm = function() {
        idInput.value = '';
        dateInput.value = '';
        nameInput.value = '';
        fromInput.value = '';
        levelSelect.selectedIndex = 0;
        filesInput.value = '';
        existingFilesStr = '';
        filesPreview.innerHTML = '';
        formTitle.textContent = '➕ เพิ่มทะเบียนเกียรติบัตร';
    };

    resetBtn.addEventListener('click', resetCertForm);

    var loadCertificates = async function() {
        var container = document.getElementById('cert-list-container');
        if (!container) return;
        container.innerHTML = '<div style="text-align: center; padding: 24px; color: #6B7280;">กำลังโหลดข้อมูล...</div>';

        try {
            var { data, error } = await PKApp.supabase
                .from('Certificate')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                container.innerHTML = '<div style="padding: 24px; text-align: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF;">ยังไม่มีข้อมูลเกียรติบัตรในระบบ</div>';
                return;
            }

            var html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
            data.forEach(function(item) {
                var fileCount = item.file ? item.file.split(',').filter(Boolean).length : 0;
                html += '<div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; background: #FFFFFF; display: flex; justify-content: space-between; align-items: start; gap: 16px; flex-wrap: wrap;">' +
                    '<div style="flex: 1; min-width: 240px;">' +
                    '  <div style="display: flex; gap: 8px; margin-bottom: 6px; align-items: center;">' +
                    '    <span style="font-size: 0.8rem; font-weight: 700; background: #FEF3C7; color: #B45309; padding: 2px 8px; border-radius: 6px;">' + PKApp.escapeHtml(item.level || 'เกียรติบัตร') + '</span>' +
                    '    <span style="font-size: 0.8rem; color: #6B7280;">วันที่: ' + (item.date ? PKApp.formatThaiDateOnly(item.date) : '-') + '</span>' +
                    (fileCount > 0 ? '<span style="font-size: 0.8rem; background: #EDE9FE; color: #6B21A8; padding: 2px 8px; border-radius: 6px;">' + fileCount + ' ไฟล์</span>' : '') +
                    '  </div>' +
                    '  <h4 style="margin: 0 0 4px 0; font-size: 1.05rem; color: #1F2937; font-weight: 700;">' + PKApp.escapeHtml(item.name || '-') + '</h4>' +
                    '  <div style="font-size: 0.85rem; color: #4B5563;">มอบโดย: <strong>' + PKApp.escapeHtml(item.from || '-') + '</strong></div>' +
                    '</div>' +
                    '<div style="display: flex; gap: 8px;">' +
                    '  <button type="button" class="btn edit-c-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #F3E8FF; color: #6B21A8; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">✏️ แก้ไข</button>' +
                    '  <button type="button" class="btn del-c-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #FEE2E2; color: #DC2626; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">🗑️ ลบ</button>' +
                    '</div>' +
                    '</div>';
            });
            html += '</div>';
            container.innerHTML = html;

            container.querySelectorAll('.edit-c-btn').forEach(function(b) {
                b.addEventListener('click', function() {
                    var cId = b.getAttribute('data-id');
                    var target = data.find(function(it) { return String(it.id) === String(cId); });
                    if (target) {
                        idInput.value = target.id;
                        dateInput.value = target.date || '';
                        nameInput.value = target.name || '';
                        fromInput.value = target.from || '';
                        levelSelect.value = target.level || awardLevels[0];
                        existingFilesStr = target.file || '';
                        var fCount = existingFilesStr ? existingFilesStr.split(',').filter(Boolean).length : 0;
                        filesPreview.innerHTML = fCount > 0 ? 'ไฟล์ปัจจุบัน: ' + fCount + ' ไฟล์' : '';
                        formTitle.textContent = '✏️ แก้ไขเกียรติบัตร (รหัส: ' + target.id + ')';
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                    }
                });
            });

            container.querySelectorAll('.del-c-btn').forEach(function(b) {
                b.addEventListener('click', async function() {
                    var cId = b.getAttribute('data-id');
                    if (confirm('คุณแน่ใจว่าต้องการลบเกียรติบัตรนี้?')) {
                        try {
                            PKApp.showLoading('กำลังลบข้อมูล...');
                            var { error: dErr } = await PKApp.supabase
                                .from('Certificate')
                                .delete()
                                .eq('id', cId);
                            PKApp.hideLoading();
                            if (dErr) throw dErr;
                            PKApp.showToast('ลบข้อมูลเรียบร้อยแล้ว', 'success');
                            loadCertificates();
                        } catch (err) {
                            PKApp.hideLoading();
                            PKApp.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
                        }
                    }
                });
            });

        } catch (err) {
            container.innerHTML = '<div style="color: #EF4444; padding: 20px;">เกิดข้อผิดพลาด: ' + PKApp.escapeHtml(err.message) + '</div>';
        }
    };

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var dateVal = dateInput.value;
        var nameVal = nameInput.value.trim();
        var fromVal = fromInput.value.trim();
        var levelVal = levelSelect.value;
        var cId = idInput.value;

        try {
            PKApp.showLoading('กำลังอัปโหลดไฟล์และบันทึกข้อมูล...');
            var uploadedUrls = existingFilesStr ? existingFilesStr.split(',').filter(Boolean) : [];

            if (filesInput.files && filesInput.files.length > 0) {
                for (var i = 0; i < filesInput.files.length; i++) {
                    var url = await PKApp.uploadFile(filesInput.files[i], 'uploads');
                    uploadedUrls.push(url);
                }
            }

            var payload = {
                date: dateVal,
                name: nameVal,
                from: fromVal,
                level: levelVal,
                file: uploadedUrls.join(','),
                regisname: (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่'
            };

            var resError = null;
            if (cId) {
                var { error } = await PKApp.supabase
                    .from('Certificate')
                    .update(payload)
                    .eq('id', cId);
                resError = error;
            } else {
                var { error } = await PKApp.supabase
                    .from('Certificate')
                    .insert([payload]);
                resError = error;
            }

            PKApp.hideLoading();
            if (resError) throw resError;

            PKApp.showToast('บันทึกเกียรติบัตรเรียบร้อยแล้ว', 'success');
            resetCertForm();
            loadCertificates();
        } catch (err) {
            PKApp.hideLoading();
            PKApp.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });

    loadCertificates();
};

/**
 * 7. PKApp.admin.editAward()
 * For 'Certificate' table (award-specific columns)
 */
PKApp.admin.editAward = async function() {
    if (!PKApp.admin.checkAuth()) return;

    var awardScopes = ['นานาชาติ', 'ประเทศ', 'ภาค', 'จังหวัด', 'อำเภอ', 'เขต', 'โรงเรียน'];
    var medalTypes = ['ชนะเลิศ', 'รองชนะเลิศอันดับ 1', 'รองชนะเลิศอันดับ 2', 'รองชนะเลิศอันดับ 3', 'ชมเชย', 'เข้าร่วม', 'เหรียญทอง', 'เหรียญเงิน', 'เหรียญทองแดง'];

    var scopeOptions = awardScopes.map(function(s) { return '<option value="' + s + '">' + s + '</option>'; }).join('');
    var medalOptions = medalTypes.map(function(m) { return '<option value="' + m + '">' + m + '</option>'; }).join('');

    var bodyHtml = [
        '<div id="award-form-card" style="background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 24px; margin-bottom: 30px;">',
        '  <h3 id="award-form-title" style="color: #6B21A8; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 16px;">➕ เพิ่มผลงานและรางวัล</h3>',
        '  <form id="award-form" class="admin-form">',
        '    <input type="hidden" id="award-id" value="">',
        '    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">',
        '      <div class="form-group">',
        '        <label for="award-scope" class="form-label">ระดับการแข่งขัน <span style="color:#EF4444;">*</span></label>',
        '        <select id="award-scope" class="form-control" required>' + scopeOptions + '</select>',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="award-medal" class="form-label">ประเภทเหรียญ / รางวัล <span style="color:#EF4444;">*</span></label>',
        '        <select id="award-medal" class="form-control" required>' + medalOptions + '</select>',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="award-category" class="form-label">ประเภทรายการ / หมวดหมู่ <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="award-category" class="form-control" required placeholder="เช่น โครงงานคุณธรรม, การขับร้องเพลง">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="award-name" class="form-label">ชื่อผลงาน <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="award-name" class="form-control" required placeholder="ระบุชื่อผลงาน">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="award-responsible" class="form-label">หน่วยงานที่รับผิดชอบ / จัดการแข่งขัน <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="award-responsible" class="form-control" required placeholder="เช่น สพฐ., สพม.ชัยภูมิ">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="award-date" class="form-label">วันที่ได้รับ <span style="color:#EF4444;">*</span></label>',
        '        <input type="date" id="award-date" class="form-control" required>',
        '      </div>',
        '    </div>',
        '    <div class="form-group">',
        '      <label for="award-photos" class="form-label">รูปภาพกิจกรรม (1 - 5 รูป)</label>',
        '      <input type="file" id="award-photos" class="form-control" multiple accept="image/*">',
        '      <div id="award-photos-preview" style="margin-top: 6px; font-size: 0.85rem; color: #4B5563;"></div>',
        '    </div>',
        '    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-top: 10px;">',
        '      <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 10px; padding: 16px;">',
        '        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">',
        '          <label class="form-label" style="margin: 0;">ผู้ได้รับรางวัล</label>',
        '          <button type="button" id="add-recipient-btn" class="btn" style="padding: 4px 10px; background: #F3E8FF; color: #6B21A8; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">+ เพิ่มรายชื่อ</button>',
        '        </div>',
        '        <div id="recipients-list" style="display: flex; flex-direction: column; gap: 8px;"></div>',
        '      </div>',
        '      <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 10px; padding: 16px;">',
        '        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">',
        '          <label class="form-label" style="margin: 0;">ครูที่ปรึกษา / ผู้ฝึกสอน</label>',
        '          <button type="button" id="add-advisor-btn" class="btn" style="padding: 4px 10px; background: #FEF3C7; color: #B45309; border-radius: 6px; font-size: 0.8rem; font-weight: 600;">+ เพิ่มรายชื่อ</button>',
        '        </div>',
        '        <div id="advisors-list" style="display: flex; flex-direction: column; gap: 8px;"></div>',
        '      </div>',
        '    </div>',
        '    <div class="admin-actions">',
        '      <button type="button" id="award-reset-btn" class="btn btn-cancel">ล้างข้อมูล</button>',
        '      <button type="submit" id="award-submit-btn" class="btn btn-save">💾 บันทึกผลงาน</button>',
        '    </div>',
        '  </form>',
        '</div>',
        '<div>',
        '  <h3 style="color: #374151; font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">🏆 รายการผลงานและรางวัล</h3>',
        '  <div id="award-list-container">กำลังโหลดข้อมูล...</div>',
        '</div>'
    ].join('\n');

    PKApp.admin.renderLayout('award', 'จัดการ: ผลงานและรางวัล', bodyHtml);

    var form = document.getElementById('award-form');
    var idInput = document.getElementById('award-id');
    var scopeSelect = document.getElementById('award-scope');
    var medalSelect = document.getElementById('award-medal');
    var categoryInput = document.getElementById('award-category');
    var nameInput = document.getElementById('award-name');
    var responsibleInput = document.getElementById('award-responsible');
    var dateInput = document.getElementById('award-date');
    var photosInput = document.getElementById('award-photos');
    var photosPreview = document.getElementById('award-photos-preview');
    var recipientsList = document.getElementById('recipients-list');
    var advisorsList = document.getElementById('advisors-list');
    var addRecipientBtn = document.getElementById('add-recipient-btn');
    var addAdvisorBtn = document.getElementById('add-advisor-btn');
    var formTitle = document.getElementById('award-form-title');
    var resetBtn = document.getElementById('award-reset-btn');
    var existingPhotosStr = '';

    var addDynamicInput = function(container, value) {
        var row = document.createElement('div');
        row.style.cssText = 'display: flex; gap: 6px; align-items: center;';
        row.innerHTML = '<input type="text" class="form-control dynamic-name-input" value="' + PKApp.escapeHtml(value || '') + '" placeholder="ระบุชื่อ - สกุล" style="flex:1; padding: 7px 12px; font-size: 0.88rem;">' +
            '<button type="button" class="btn" style="padding: 4px 8px; color: #EF4444; border: 1px solid #FECACA; border-radius: 6px; font-size: 0.85rem;">✕</button>';
        row.querySelector('button').addEventListener('click', function() {
            container.removeChild(row);
        });
        container.appendChild(row);
    };

    addRecipientBtn.addEventListener('click', function() { addDynamicInput(recipientsList, ''); });
    addAdvisorBtn.addEventListener('click', function() { addDynamicInput(advisorsList, ''); });

    var resetAwardForm = function() {
        idInput.value = '';
        scopeSelect.selectedIndex = 0;
        medalSelect.selectedIndex = 0;
        categoryInput.value = '';
        nameInput.value = '';
        responsibleInput.value = '';
        dateInput.value = '';
        photosInput.value = '';
        existingPhotosStr = '';
        photosPreview.innerHTML = '';
        recipientsList.innerHTML = '';
        advisorsList.innerHTML = '';
        addDynamicInput(recipientsList, '');
        addDynamicInput(advisorsList, '');
        formTitle.textContent = '➕ เพิ่มผลงานและรางวัล';
    };

    resetBtn.addEventListener('click', resetAwardForm);
    resetAwardForm();

    var loadAwards = async function() {
        var container = document.getElementById('award-list-container');
        if (!container) return;
        container.innerHTML = '<div style="text-align: center; padding: 24px; color: #6B7280;">กำลังโหลดข้อมูล...</div>';

        try {
            var { data, error } = await PKApp.supabase
                .from('Certificate')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            var awardItems = (data || []).filter(function(it) {
                return it.scope || it.medal || it.category || (it.level && awardScopes.includes(it.level));
            });

            if (awardItems.length === 0) {
                container.innerHTML = '<div style="padding: 24px; text-align: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF;">ยังไม่มีข้อมูลผลงานรางวัลในระบบ</div>';
                return;
            }

            var html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
            awardItems.forEach(function(item) {
                html += '<div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; background: #FFFFFF; display: flex; justify-content: space-between; align-items: start; gap: 16px; flex-wrap: wrap;">' +
                    '<div style="flex: 1; min-width: 240px;">' +
                    '  <div style="display: flex; gap: 8px; margin-bottom: 6px; align-items: center; flex-wrap: wrap;">' +
                    '    <span style="font-size: 0.8rem; font-weight: 700; background: #DDD6FE; color: #6B21A8; padding: 2px 8px; border-radius: 6px;">ระดับ' + PKApp.escapeHtml(item.scope || item.level || '-') + '</span>' +
                    '    <span style="font-size: 0.8rem; font-weight: 700; background: #FEF3C7; color: #B45309; padding: 2px 8px; border-radius: 6px;">' + PKApp.escapeHtml(item.medal || '-') + '</span>' +
                    '    <span style="font-size: 0.8rem; color: #6B7280;">วันที่: ' + (item.date ? PKApp.formatThaiDateOnly(item.date) : '-') + '</span>' +
                    '  </div>' +
                    '  <h4 style="margin: 0 0 4px 0; font-size: 1.05rem; color: #1F2937; font-weight: 700;">' + PKApp.escapeHtml(item.name || '-') + '</h4>' +
                    '  <div style="font-size: 0.85rem; color: #4B5563; margin-bottom: 4px;">ประเภท: ' + PKApp.escapeHtml(item.category || '-') + ' | หน่วยงาน: ' + PKApp.escapeHtml(item.responsible || item.from || '-') + '</div>' +
                    (item.recipients ? '<div style="font-size: 0.8rem; color: #6B7280;">ผู้ได้รับรางวัล: ' + PKApp.escapeHtml(item.recipients) + '</div>' : '') +
                    '</div>' +
                    '<div style="display: flex; gap: 8px;">' +
                    '  <button type="button" class="btn edit-aw-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #F3E8FF; color: #6B21A8; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">✏️ แก้ไข</button>' +
                    '  <button type="button" class="btn del-aw-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #FEE2E2; color: #DC2626; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">🗑️ ลบ</button>' +
                    '</div>' +
                    '</div>';
            });
            html += '</div>';
            container.innerHTML = html;

            container.querySelectorAll('.edit-aw-btn').forEach(function(b) {
                b.addEventListener('click', function() {
                    var awId = b.getAttribute('data-id');
                    var target = awardItems.find(function(it) { return String(it.id) === String(awId); });
                    if (target) {
                        idInput.value = target.id;
                        scopeSelect.value = target.scope || target.level || awardScopes[0];
                        medalSelect.value = target.medal || medalTypes[0];
                        categoryInput.value = target.category || '';
                        nameInput.value = target.name || '';
                        responsibleInput.value = target.responsible || target.from || '';
                        dateInput.value = target.date || '';
                        existingPhotosStr = target.file || target.image || '';
                        var count = existingPhotosStr ? existingPhotosStr.split(',').filter(Boolean).length : 0;
                        photosPreview.innerHTML = count > 0 ? 'รูปภาพปัจจุบัน: ' + count + ' ภาพ' : '';

                        recipientsList.innerHTML = '';
                        if (target.recipients) {
                            target.recipients.split(',').forEach(function(r) { addDynamicInput(recipientsList, r.trim()); });
                        } else {
                            addDynamicInput(recipientsList, '');
                        }

                        advisorsList.innerHTML = '';
                        if (target.advisors) {
                            target.advisors.split(',').forEach(function(a) { addDynamicInput(advisorsList, a.trim()); });
                        } else {
                            addDynamicInput(advisorsList, '');
                        }

                        formTitle.textContent = '✏️ แก้ไขผลงานรางวัล (รหัส: ' + target.id + ')';
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                    }
                });
            });

            container.querySelectorAll('.del-aw-btn').forEach(function(b) {
                b.addEventListener('click', async function() {
                    var awId = b.getAttribute('data-id');
                    if (confirm('คุณแน่ใจว่าต้องการลบผลงานนี้?')) {
                        try {
                            PKApp.showLoading('กำลังลบข้อมูล...');
                            var { error: delE } = await PKApp.supabase
                                .from('Certificate')
                                .delete()
                                .eq('id', awId);
                            PKApp.hideLoading();
                            if (delE) throw delE;
                            PKApp.showToast('ลบผลงานเรียบร้อยแล้ว', 'success');
                            loadAwards();
                        } catch (err) {
                            PKApp.hideLoading();
                            PKApp.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
                        }
                    }
                });
            });

        } catch (err) {
            container.innerHTML = '<div style="color: #EF4444; padding: 20px;">เกิดข้อผิดพลาด: ' + PKApp.escapeHtml(err.message) + '</div>';
        }
    };

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var awId = idInput.value;
        var rList = Array.from(recipientsList.querySelectorAll('.dynamic-name-input'))
            .map(function(i) { return i.value.trim(); })
            .filter(Boolean);
        var aList = Array.from(advisorsList.querySelectorAll('.dynamic-name-input'))
            .map(function(i) { return i.value.trim(); })
            .filter(Boolean);

        try {
            PKApp.showLoading('กำลังอัปโหลดรูปภาพและบันทึกข้อมูล...');
            var uploadedUrls = existingPhotosStr ? existingPhotosStr.split(',').filter(Boolean) : [];

            if (photosInput.files && photosInput.files.length > 0) {
                for (var i = 0; i < photosInput.files.length; i++) {
                    var url = await PKApp.uploadFile(photosInput.files[i], 'uploads');
                    uploadedUrls.push(url);
                }
            }

            var payload = {
                name: nameInput.value.trim(),
                level: scopeSelect.value,
                scope: scopeSelect.value,
                medal: medalSelect.value,
                category: categoryInput.value.trim(),
                responsible: responsibleInput.value.trim(),
                from: responsibleInput.value.trim(),
                date: dateInput.value,
                recipients: rList.join(', '),
                advisors: aList.join(', '),
                file: uploadedUrls.join(','),
                regisname: (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่'
            };

            var resError = null;
            if (awId) {
                var { error } = await PKApp.supabase
                    .from('Certificate')
                    .update(payload)
                    .eq('id', awId);
                resError = error;
            } else {
                var { error } = await PKApp.supabase
                    .from('Certificate')
                    .insert([payload]);
                resError = error;
            }

            PKApp.hideLoading();
            if (resError) throw resError;

            PKApp.showToast('บันทึกผลงานรางวัลเรียบร้อยแล้ว', 'success');
            resetAwardForm();
            loadAwards();
        } catch (err) {
            PKApp.hideLoading();
            PKApp.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });

    loadAwards();
};

/**
 * 8. PKApp.admin.editPlan()
 * For 'plan' table
 */
PKApp.admin.editPlan = async function() {
    if (!PKApp.admin.checkAuth()) return;

    var authorName = (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่';

    var bodyHtml = [
        '<div id="plan-form-card" style="background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 24px; margin-bottom: 30px;">',
        '  <h3 id="plan-form-title" style="color: #6B21A8; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 16px;">➕ เพิ่มโครงการและแผนงาน</h3>',
        '  <form id="plan-form" class="admin-form">',
        '    <input type="hidden" id="plan-id" value="">',
        '    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">',
        '      <div class="form-group">',
        '        <label for="plan-name" class="form-label">ชื่อโครงการ / แผนงาน <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="plan-name" class="form-control" required placeholder="ระบุชื่อโครงการ">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="plan-responsible" class="form-label">ผู้รับผิดชอบโครงการ <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="plan-responsible" class="form-control" required placeholder="ชื่อ - สกุลผู้รับผิดชอบ">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="plan-author" class="form-label">ผู้บันทึก (Author)</label>',
        '        <input type="text" id="plan-author" class="form-control" value="' + PKApp.escapeHtml(authorName) + '" readonly style="background:#E5E7EB;">',
        '      </div>',
        '    </div>',
        '    <div class="form-group" style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 10px; padding: 18px; margin-top: 8px;">',
        '      <label class="form-label" style="margin-bottom: 12px; font-weight: 700; color: #6B21A8;">ไทม์ไลน์สถานะการดำเนินงาน (Timeline)</label>',
        '      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px;">',
        '        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem;">',
        '          <input type="checkbox" id="plan-draft" style="width: 18px; height: 18px;">',
        '          <span>1. ร่างโครงการ</span>',
        '        </label>',
        '        <div style="border-left: 1px solid #E5E7EB; padding-left: 14px;">',
        '          <div style="font-size: 0.85rem; font-weight: 600; color: #4B5563; margin-bottom: 4px;">2. เสนอโครงการ:</div>',
        '          <div style="display: flex; gap: 12px;">',
        '            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.9rem;">',
        '              <input type="radio" name="plan-proposal" value="ผ่าน" id="plan-prop-pass"> ผ่าน',
        '            </label>',
        '            <label style="display: flex; align-items: center; gap: 4px; cursor: pointer; font-size: 0.9rem;">',
        '              <input type="radio" name="plan-proposal" value="ไม่ผ่าน" id="plan-prop-fail" checked> ไม่ผ่าน',
        '            </label>',
        '          </div>',
        '        </div>',
        '        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem;">',
        '          <input type="checkbox" id="plan-action" disabled style="width: 18px; height: 18px;">',
        '          <span>3. ดำเนินการ</span>',
        '        </label>',
        '        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; font-size: 0.95rem;">',
        '          <input type="checkbox" id="plan-complete" disabled style="width: 18px; height: 18px;">',
        '          <span>4. แล้วเสร็จ</span>',
        '        </label>',
        '      </div>',
        '    </div>',
        '    <div class="form-group">',
        '      <label for="plan-file" class="form-label">เอกสารโครงการ (ไฟล์ PDF 1 ไฟล์)</label>',
        '      <input type="file" id="plan-file" class="form-control" accept="application/pdf">',
        '      <div id="plan-file-preview" style="margin-top: 6px; font-size: 0.85rem; color: #4B5563;"></div>',
        '    </div>',
        '    <div class="admin-actions">',
        '      <button type="button" id="plan-reset-btn" class="btn btn-cancel">ล้างข้อมูล</button>',
        '      <button type="submit" id="plan-submit-btn" class="btn btn-save">💾 บันทึกโครงการ</button>',
        '    </div>',
        '  </form>',
        '</div>',
        '<div>',
        '  <h3 style="color: #374151; font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">📊 รายการโครงการและแผนงานในระบบ</h3>',
        '  <div id="plan-list-container">กำลังโหลดข้อมูล...</div>',
        '</div>'
    ].join('\n');

    PKApp.admin.renderLayout('plan', 'จัดการ: นโยบายและแผนดำเนินโครงการ', bodyHtml);

    var form = document.getElementById('plan-form');
    var idInput = document.getElementById('plan-id');
    var nameInput = document.getElementById('plan-name');
    var responsibleInput = document.getElementById('plan-responsible');
    var draftCheck = document.getElementById('plan-draft');
    var passRadio = document.getElementById('plan-prop-pass');
    var failRadio = document.getElementById('plan-prop-fail');
    var actionCheck = document.getElementById('plan-action');
    var completeCheck = document.getElementById('plan-complete');
    var fileInput = document.getElementById('plan-file');
    var filePreview = document.getElementById('plan-file-preview');
    var formTitle = document.getElementById('plan-form-title');
    var resetBtn = document.getElementById('plan-reset-btn');
    var existingFileUrl = '';

    var syncTimelineState = function() {
        var isPassed = passRadio.checked;
        actionCheck.disabled = !isPassed;
        completeCheck.disabled = !isPassed;
        if (!isPassed) {
            actionCheck.checked = false;
            completeCheck.checked = false;
        }
    };

    passRadio.addEventListener('change', syncTimelineState);
    failRadio.addEventListener('change', syncTimelineState);

    var resetPlanForm = function() {
        idInput.value = '';
        nameInput.value = '';
        responsibleInput.value = '';
        draftCheck.checked = false;
        failRadio.checked = true;
        fileInput.value = '';
        existingFileUrl = '';
        filePreview.innerHTML = '';
        syncTimelineState();
        formTitle.textContent = '➕ เพิ่มโครงการและแผนงาน';
    };

    resetBtn.addEventListener('click', resetPlanForm);

    var loadPlans = async function() {
        var container = document.getElementById('plan-list-container');
        if (!container) return;
        container.innerHTML = '<div style="text-align: center; padding: 24px; color: #6B7280;">กำลังโหลดข้อมูล...</div>';

        try {
            var { data, error } = await PKApp.supabase
                .from('plan')
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                container.innerHTML = '<div style="padding: 24px; text-align: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF;">ยังไม่มีโครงการในระบบ</div>';
                return;
            }

            var html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
            data.forEach(function(item) {
                var statusBadges = [];
                if (item.draft) statusBadges.push('<span style="font-size: 0.75rem; background: #E5E7EB; padding: 2px 6px; border-radius: 4px;">ร่าง</span>');
                if (item.proposal === 'ผ่าน') statusBadges.push('<span style="font-size: 0.75rem; background: #DCFCE7; color: #166534; padding: 2px 6px; border-radius: 4px;">เสนอผ่าน</span>');
                else statusBadges.push('<span style="font-size: 0.75rem; background: #FEE2E2; color: #991B1B; padding: 2px 6px; border-radius: 4px;">เสนอไม่ผ่าน</span>');
                if (item.action) statusBadges.push('<span style="font-size: 0.75rem; background: #FEF3C7; color: #92400E; padding: 2px 6px; border-radius: 4px;">ดำเนินการ</span>');
                if (item.complete) statusBadges.push('<span style="font-size: 0.75rem; background: #DDD6FE; color: #5B21B6; padding: 2px 6px; border-radius: 4px;">แล้วเสร็จ</span>');

                var fileLink = item.file
                    ? '<a href="' + item.file + '" target="_blank" style="font-size: 0.85rem; color: #6B21A8; text-decoration: underline;">📄 ดาวน์โหลดเอกสารโครงการ</a>'
                    : '';

                html += '<div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; background: #FFFFFF; display: flex; justify-content: space-between; align-items: start; gap: 16px; flex-wrap: wrap;">' +
                    '<div style="flex: 1; min-width: 240px;">' +
                    '  <div style="display: flex; gap: 6px; margin-bottom: 6px; flex-wrap: wrap;">' + statusBadges.join('') + '</div>' +
                    '  <h4 style="margin: 0 0 4px 0; font-size: 1.05rem; color: #1F2937; font-weight: 700;">' + PKApp.escapeHtml(item.name || '-') + '</h4>' +
                    '  <div style="font-size: 0.85rem; color: #4B5563; margin-bottom: 6px;">ผู้รับผิดชอบ: <strong>' + PKApp.escapeHtml(item.responsible || '-') + '</strong> | ผู้บันทึก: ' + PKApp.escapeHtml(item.regisname || '-') + '</div>' +
                    fileLink +
                    '</div>' +
                    '<div style="display: flex; gap: 8px;">' +
                    '  <button type="button" class="btn edit-p-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #F3E8FF; color: #6B21A8; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">✏️ แก้ไข</button>' +
                    '  <button type="button" class="btn del-p-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #FEE2E2; color: #DC2626; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">🗑️ ลบ</button>' +
                    '</div>' +
                    '</div>';
            });
            html += '</div>';
            container.innerHTML = html;

            container.querySelectorAll('.edit-p-btn').forEach(function(b) {
                b.addEventListener('click', function() {
                    var pId = b.getAttribute('data-id');
                    var target = data.find(function(it) { return String(it.id) === String(pId); });
                    if (target) {
                        idInput.value = target.id;
                        nameInput.value = target.name || '';
                        responsibleInput.value = target.responsible || '';
                        draftCheck.checked = !!target.draft;
                        if (target.proposal === 'ผ่าน') {
                            passRadio.checked = true;
                        } else {
                            failRadio.checked = true;
                        }
                        syncTimelineState();
                        actionCheck.checked = !!target.action;
                        completeCheck.checked = !!target.complete;
                        existingFileUrl = target.file || '';
                        filePreview.innerHTML = existingFileUrl
                            ? 'ไฟล์ปัจจุบัน: <a href="' + existingFileUrl + '" target="_blank" style="color:#6B21A8; text-decoration:underline;">เปิดไฟล์</a>'
                            : '';
                        formTitle.textContent = '✏️ แก้ไขโครงการ (รหัส: ' + target.id + ')';
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                    }
                });
            });

            container.querySelectorAll('.del-p-btn').forEach(function(b) {
                b.addEventListener('click', async function() {
                    var pId = b.getAttribute('data-id');
                    if (confirm('คุณแน่ใจว่าต้องการลบโครงการนี้?')) {
                        try {
                            PKApp.showLoading('กำลังลบข้อมูล...');
                            var { error: dErr } = await PKApp.supabase
                                .from('plan')
                                .delete()
                                .eq('id', pId);
                            PKApp.hideLoading();
                            if (dErr) throw dErr;
                            PKApp.showToast('ลบโครงการเรียบร้อยแล้ว', 'success');
                            loadPlans();
                        } catch (err) {
                            PKApp.hideLoading();
                            PKApp.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
                        }
                    }
                });
            });

        } catch (err) {
            container.innerHTML = '<div style="color: #EF4444; padding: 20px;">เกิดข้อผิดพลาด: ' + PKApp.escapeHtml(err.message) + '</div>';
        }
    };

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var pId = idInput.value;
        var nameVal = nameInput.value.trim();
        var respVal = responsibleInput.value.trim();

        if (!nameVal) {
            PKApp.showToast('กรุณากรอกชื่อโครงการ', 'warning');
            return;
        }

        try {
            PKApp.showLoading('กำลังบันทึกโครงการ...');
            var uploadedUrl = existingFileUrl;
            if (fileInput.files && fileInput.files.length > 0) {
                uploadedUrl = await PKApp.uploadFile(fileInput.files[0], 'uploads');
            }

            var payload = {
                name: nameVal,
                responsible: respVal,
                draft: draftCheck.checked,
                proposal: passRadio.checked ? 'ผ่าน' : 'ไม่ผ่าน',
                action: passRadio.checked ? actionCheck.checked : false,
                complete: passRadio.checked ? completeCheck.checked : false,
                file: uploadedUrl,
                regisname: (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่',
                timestamp: PKApp.formatThaiDate(new Date())
            };

            var resError = null;
            if (pId) {
                var { error } = await PKApp.supabase
                    .from('plan')
                    .update(payload)
                    .eq('id', pId);
                resError = error;
            } else {
                var { error } = await PKApp.supabase
                    .from('plan')
                    .insert([payload]);
                resError = error;
            }

            PKApp.hideLoading();
            if (resError) throw resError;

            PKApp.showToast('บันทึกโครงการเรียบร้อยแล้ว', 'success');
            resetPlanForm();
            loadPlans();
        } catch (err) {
            PKApp.hideLoading();
            PKApp.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });

    loadPlans();
};

/**
 * 9. PKApp.admin.editSimpleFile(tableName, title)
 * For: culecculum, tammanun, law
 */
PKApp.admin.editSimpleFile = async function(tableName, title) {
    if (!PKApp.admin.checkAuth()) return;

    var authorName = (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่';

    var bodyHtml = [
        '<div id="simple-form-card" style="background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 24px; margin-bottom: 30px;">',
        '  <h3 id="simple-form-title" style="color: #6B21A8; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 16px;">➕ เพิ่มเอกสารใหม่: ' + title + '</h3>',
        '  <form id="simple-file-form" class="admin-form">',
        '    <input type="hidden" id="simple-id" value="">',
        '    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 16px;">',
        '      <div class="form-group">',
        '        <label for="simple-name" class="form-label">ชื่อเอกสาร / เรื่อง <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="simple-name" class="form-control" required placeholder="ระบุชื่อเอกสาร">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="simple-author" class="form-label">ผู้บันทึก (Author)</label>',
        '        <input type="text" id="simple-author" class="form-control" value="' + PKApp.escapeHtml(authorName) + '" readonly style="background:#E5E7EB;">',
        '      </div>',
        '    </div>',
        '    <div class="form-group">',
        '      <label for="simple-file" class="form-label">ไฟล์เอกสาร (PDF) <span style="color:#EF4444;">*</span></label>',
        '      <input type="file" id="simple-file" class="form-control" accept="application/pdf">',
        '      <div id="simple-file-preview" style="margin-top: 6px; font-size: 0.85rem; color: #4B5563;"></div>',
        '    </div>',
        '    <div class="admin-actions">',
        '      <button type="button" id="simple-reset-btn" class="btn btn-cancel">ล้างข้อมูล</button>',
        '      <button type="submit" id="simple-submit-btn" class="btn btn-save">💾 บันทึกเอกสาร</button>',
        '    </div>',
        '  </form>',
        '</div>',
        '<div>',
        '  <h3 style="color: #374151; font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">📚 รายการเอกสาร ' + title + ' ในระบบ</h3>',
        '  <div id="simple-list-container">กำลังโหลดข้อมูล...</div>',
        '</div>'
    ].join('\n');

    PKApp.admin.renderLayout(tableName, 'จัดการ: ' + title, bodyHtml);

    var form = document.getElementById('simple-file-form');
    var idInput = document.getElementById('simple-id');
    var nameInput = document.getElementById('simple-name');
    var fileInput = document.getElementById('simple-file');
    var filePreview = document.getElementById('simple-file-preview');
    var formTitle = document.getElementById('simple-form-title');
    var resetBtn = document.getElementById('simple-reset-btn');
    var existingFileUrl = '';

    var resetSimpleForm = function() {
        idInput.value = '';
        nameInput.value = '';
        fileInput.value = '';
        existingFileUrl = '';
        filePreview.innerHTML = '';
        formTitle.textContent = '➕ เพิ่มเอกสารใหม่: ' + title;
    };

    resetBtn.addEventListener('click', resetSimpleForm);

    var loadSimpleFiles = async function() {
        var container = document.getElementById('simple-list-container');
        if (!container) return;
        container.innerHTML = '<div style="text-align: center; padding: 24px; color: #6B7280;">กำลังโหลดข้อมูล...</div>';

        try {
            var { data, error } = await PKApp.supabase
                .from(tableName)
                .select('*')
                .order('id', { ascending: false });

            if (error) throw error;

            if (!data || data.length === 0) {
                container.innerHTML = '<div style="padding: 24px; text-align: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF;">ยังไม่มีเอกสารในส่วนนี้</div>';
                return;
            }

            var html = '<div style="display: flex; flex-direction: column; gap: 12px;">';
            data.forEach(function(item) {
                var fileLink = item.file
                    ? '<a href="' + item.file + '" target="_blank" style="font-size: 0.85rem; color: #6B21A8; text-decoration: underline;">📄 เปิดดูไฟล์ PDF</a>'
                    : '';

                html += '<div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 18px; background: #FFFFFF; display: flex; justify-content: space-between; align-items: start; gap: 16px; flex-wrap: wrap;">' +
                    '<div style="flex: 1; min-width: 240px;">' +
                    '  <h4 style="margin: 0 0 4px 0; font-size: 1.05rem; color: #1F2937; font-weight: 700;">' + PKApp.escapeHtml(item.name || '-') + '</h4>' +
                    '  <div style="font-size: 0.85rem; color: #4B5563; margin-bottom: 6px;">ผู้บันทึก: <strong>' + PKApp.escapeHtml(item.regisname || '-') + '</strong> | วันที่: ' + (item.timestamp || (item.created_at ? PKApp.formatThaiDate(item.created_at) : '-')) + '</div>' +
                    fileLink +
                    '</div>' +
                    '<div style="display: flex; gap: 8px;">' +
                    '  <button type="button" class="btn edit-s-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #F3E8FF; color: #6B21A8; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">✏️ แก้ไข</button>' +
                    '  <button type="button" class="btn del-s-btn" data-id="' + item.id + '" style="padding: 6px 12px; background: #FEE2E2; color: #DC2626; border-radius: 8px; font-size: 0.85rem; font-weight: 600;">🗑️ ลบ</button>' +
                    '</div>' +
                    '</div>';
            });
            html += '</div>';
            container.innerHTML = html;

            container.querySelectorAll('.edit-s-btn').forEach(function(b) {
                b.addEventListener('click', function() {
                    var sId = b.getAttribute('data-id');
                    var target = data.find(function(it) { return String(it.id) === String(sId); });
                    if (target) {
                        idInput.value = target.id;
                        nameInput.value = target.name || '';
                        existingFileUrl = target.file || '';
                        filePreview.innerHTML = existingFileUrl
                            ? 'ไฟล์ปัจจุบัน: <a href="' + existingFileUrl + '" target="_blank" style="color:#6B21A8; text-decoration:underline;">เปิดไฟล์</a>'
                            : '';
                        formTitle.textContent = '✏️ แก้ไขเอกสาร (รหัส: ' + target.id + ')';
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                    }
                });
            });

            container.querySelectorAll('.del-s-btn').forEach(function(b) {
                b.addEventListener('click', async function() {
                    var sId = b.getAttribute('data-id');
                    if (confirm('คุณแน่ใจว่าต้องการลบเอกสารนี้?')) {
                        try {
                            PKApp.showLoading('กำลังลบข้อมูล...');
                            var { error: delErr } = await PKApp.supabase
                                .from(tableName)
                                .delete()
                                .eq('id', sId);
                            PKApp.hideLoading();
                            if (delErr) throw delErr;
                            PKApp.showToast('ลบเอกสารเรียบร้อยแล้ว', 'success');
                            loadSimpleFiles();
                        } catch (err) {
                            PKApp.hideLoading();
                            PKApp.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
                        }
                    }
                });
            });

        } catch (err) {
            container.innerHTML = '<div style="color: #EF4444; padding: 20px;">เกิดข้อผิดพลาด: ' + PKApp.escapeHtml(err.message) + '</div>';
        }
    };

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var sId = idInput.value;
        var nameVal = nameInput.value.trim();

        if (!nameVal) {
            PKApp.showToast('กรุณากรอกชื่อเอกสาร', 'warning');
            return;
        }

        if (!sId && (!fileInput.files || fileInput.files.length === 0)) {
            PKApp.showToast('กรุณาเลือกไฟล์เอกสาร PDF', 'warning');
            return;
        }

        try {
            PKApp.showLoading('กำลังอัปโหลดไฟล์และบันทึกข้อมูล...');
            var uploadedUrl = existingFileUrl;
            if (fileInput.files && fileInput.files.length > 0) {
                uploadedUrl = await PKApp.uploadFile(fileInput.files[0], 'uploads');
            }

            var payload = {
                name: nameVal,
                file: uploadedUrl,
                regisname: (PKApp.currentUser && PKApp.currentUser.name) || 'เจ้าหน้าที่',
                timestamp: PKApp.formatThaiDate(new Date())
            };

            var resError = null;
            if (sId) {
                var { error } = await PKApp.supabase
                    .from(tableName)
                    .update(payload)
                    .eq('id', sId);
                resError = error;
            } else {
                var { error } = await PKApp.supabase
                    .from(tableName)
                    .insert([payload]);
                resError = error;
            }

            PKApp.hideLoading();
            if (resError) throw resError;

            PKApp.showToast('บันทึกเอกสารเรียบร้อยแล้ว', 'success');
            resetSimpleForm();
            loadSimpleFiles();
        } catch (err) {
            PKApp.hideLoading();
            PKApp.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });

    loadSimpleFiles();
};

/**
 * 10. PKApp.admin.editUsers()
 * ONLY for role='admin'
 */
PKApp.admin.editUsers = async function() {
    if (!PKApp.admin.checkAuth()) return;

    if (!PKApp.currentUser || PKApp.currentUser.role !== 'admin') {
        PKApp.showToast('หน้านี้สงวนสิทธิ์เฉพาะผู้ดูแลระบบระดับสูง (Admin) เท่านั้น', 'error');
        window.location.hash = '#/admin';
        return;
    }

    var bodyHtml = [
        '<div id="user-form-card" style="background: #F9FAFB; border: 1.5px solid #E5E7EB; border-radius: 14px; padding: 24px; margin-bottom: 30px;">',
        '  <h3 id="user-form-title" style="color: #6B21A8; font-size: 1.15rem; font-weight: 700; margin-top: 0; margin-bottom: 16px;">➕ เพิ่มผู้ใช้งานระบบใหม่</h3>',
        '  <form id="user-form" class="admin-form">',
        '    <input type="hidden" id="user-edit-id" value="">',
        '    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">',
        '      <div class="form-group">',
        '        <label for="user-username" class="form-label">ชื่อผู้ใช้ (Username) <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="user-username" class="form-control" required placeholder="เช่น admin_pk">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="user-password" class="form-label">รหัสผ่าน (Password) <span style="color:#EF4444;">*</span></label>',
        '        <input type="password" id="user-password" class="form-control" required placeholder="กำหนดรหัสผ่าน">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="user-fullname" class="form-label">ชื่อ - นามสกุลจริง <span style="color:#EF4444;">*</span></label>',
        '        <input type="text" id="user-fullname" class="form-control" required placeholder="เช่น นายสมชาย ชัยภูมิ">',
        '      </div>',
        '      <div class="form-group">',
        '        <label for="user-role" class="form-label">ระดับสิทธิ์ (Role) <span style="color:#EF4444;">*</span></label>',
        '        <select id="user-role" class="form-control" required>',
        '          <option value="admin">ผู้ดูแลระบบสูงสุด (admin)</option>',
        '          <option value="nacc">เจ้าหน้าที่ ป.ป.ช.สพฐ.น้อย (nacc)</option>',
        '        </select>',
        '      </div>',
        '    </div>',
        '    <div class="admin-actions">',
        '      <button type="button" id="user-reset-btn" class="btn btn-cancel">ล้างข้อมูล</button>',
        '      <button type="submit" id="user-submit-btn" class="btn btn-save">💾 บันทึกผู้ใช้</button>',
        '    </div>',
        '  </form>',
        '</div>',
        '<div>',
        '  <h3 style="color: #374151; font-size: 1.15rem; font-weight: 700; margin-bottom: 16px;">🔐 รายชื่อผู้ดูแลระบบทั้งหมด</h3>',
        '  <div id="users-table-container">กำลังโหลดข้อมูล...</div>',
        '</div>'
    ].join('\n');

    PKApp.admin.renderLayout('users', 'จัดการ: ผู้ใช้งานระบบ (Admin Users)', bodyHtml);

    var form = document.getElementById('user-form');
    var idInput = document.getElementById('user-edit-id');
    var usernameInput = document.getElementById('user-username');
    var passInput = document.getElementById('user-password');
    var nameInput = document.getElementById('user-fullname');
    var roleSelect = document.getElementById('user-role');
    var formTitle = document.getElementById('user-form-title');
    var resetBtn = document.getElementById('user-reset-btn');

    var resetUserForm = function() {
        idInput.value = '';
        usernameInput.value = '';
        passInput.value = '';
        nameInput.value = '';
        roleSelect.value = 'nacc';
        formTitle.textContent = '➕ เพิ่มผู้ใช้งานระบบใหม่';
    };

    resetBtn.addEventListener('click', resetUserForm);

    var loadUsers = async function() {
        var container = document.getElementById('users-table-container');
        if (!container) return;
        container.innerHTML = '<div style="text-align: center; padding: 24px; color: #6B7280;">กำลังโหลดรายชื่อผู้ใช้...</div>';

        try {
            var { data, error } = await PKApp.supabase
                .from('admin')
                .select('id, username, name, role, password')
                .order('id', { ascending: true });

            if (error) throw error;

            if (!data || data.length === 0) {
                container.innerHTML = '<div style="padding: 24px; text-align: center; background: #F9FAFB; border-radius: 12px; color: #9CA3AF;">ไม่พบข้อมูลผู้ใช้งาน</div>';
                return;
            }

            var html = [
                '<div class="table-responsive" style="border-radius: 12px; overflow: hidden; border: 1px solid #E5E7EB;">',
                '  <table class="data-table" style="width: 100%; border-collapse: collapse;">',
                '    <thead>',
                '      <tr style="background: #6B21A8; color: #FFFFFF; text-align: left;">',
                '        <th style="padding: 12px 16px;">ชื่อผู้ใช้ (Username)</th>',
                '        <th style="padding: 12px 16px;">ชื่อ - สกุล</th>',
                '        <th style="padding: 12px 16px;">ระดับสิทธิ์</th>',
                '        <th style="padding: 12px 16px; text-align: center;">จัดการ</th>',
                '      </tr>',
                '    </thead>',
                '    <tbody>'
            ];

            data.forEach(function(u) {
                var roleBadge = (u.role === 'admin')
                    ? '<span style="background: #DDD6FE; color: #5B21B6; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">admin</span>'
                    : '<span style="background: #FEF3C7; color: #92400E; padding: 2px 8px; border-radius: 6px; font-weight: 700; font-size: 0.8rem;">nacc</span>';

                html.push('<tr style="border-bottom: 1px solid #E5E7EB;">' +
                    '<td style="padding: 12px 16px; font-weight: 600; color: #1F2937;">' + PKApp.escapeHtml(u.username || '-') + '</td>' +
                    '<td style="padding: 12px 16px;">' + PKApp.escapeHtml(u.name || '-') + '</td>' +
                    '<td style="padding: 12px 16px;">' + roleBadge + '</td>' +
                    '<td style="padding: 12px 16px; text-align: center;">' +
                    '  <button type="button" class="btn edit-u-btn" data-id="' + u.id + '" style="padding: 4px 10px; font-size: 0.82rem; background: #F3E8FF; color: #6B21A8; border-radius: 6px; margin-right: 6px;">✏️ แก้ไข</button>' +
                    '  <button type="button" class="btn del-u-btn" data-id="' + u.id + '" style="padding: 4px 10px; font-size: 0.82rem; background: #FEE2E2; color: #DC2626; border-radius: 6px;">🗑️ ลบ</button>' +
                    '</td>' +
                    '</tr>');
            });

            html.push('</tbody></table></div>');
            container.innerHTML = html.join('\n');

            container.querySelectorAll('.edit-u-btn').forEach(function(b) {
                b.addEventListener('click', function() {
                    var uId = b.getAttribute('data-id');
                    var target = data.find(function(it) { return String(it.id) === String(uId); });
                    if (target) {
                        idInput.value = target.id;
                        usernameInput.value = target.username || '';
                        passInput.value = target.password || '';
                        nameInput.value = target.name || '';
                        roleSelect.value = target.role || 'nacc';
                        formTitle.textContent = '✏️ แก้ไขผู้ใช้งาน (' + target.username + ')';
                        window.scrollTo({ top: 150, behavior: 'smooth' });
                    }
                });
            });

            container.querySelectorAll('.del-u-btn').forEach(function(b) {
                b.addEventListener('click', async function() {
                    var uId = b.getAttribute('data-id');
                    var target = data.find(function(it) { return String(it.id) === String(uId); });
                    if (target && target.username === PKApp.currentUser.username) {
                        PKApp.showToast('ไม่สามารถลบบัญชีของตัวท่านเองที่กำลังใช้งานอยู่ได้', 'warning');
                        return;
                    }

                    if (confirm('คุณแน่ใจว่าต้องการลบผู้ใช้งานนี้หรือไม่?')) {
                        try {
                            PKApp.showLoading('กำลังลบผู้ใช้งาน...');
                            var { error: delE } = await PKApp.supabase
                                .from('admin')
                                .delete()
                                .eq('id', uId);
                            PKApp.hideLoading();
                            if (delE) throw delE;
                            PKApp.showToast('ลบผู้ใช้งานเรียบร้อยแล้ว', 'success');
                            loadUsers();
                        } catch (err) {
                            PKApp.hideLoading();
                            PKApp.showToast('เกิดข้อผิดพลาดในการลบ: ' + err.message, 'error');
                        }
                    }
                });
            });

        } catch (err) {
            container.innerHTML = '<div style="color: #EF4444; padding: 20px;">เกิดข้อผิดพลาด: ' + PKApp.escapeHtml(err.message) + '</div>';
        }
    };

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        var uId = idInput.value;
        var unVal = usernameInput.value.trim();
        var pwVal = passInput.value.trim();
        var nmVal = nameInput.value.trim();
        var rlVal = roleSelect.value;

        if (!unVal || !pwVal || !nmVal) {
            PKApp.showToast('กรุณากรอกข้อมูลผู้ใช้ให้ครบถ้วน', 'warning');
            return;
        }

        try {
            PKApp.showLoading('กำลังบันทึกข้อมูลผู้ใช้...');
            var payload = {
                username: unVal,
                password: pwVal,
                name: nmVal,
                role: rlVal
            };

            var resError = null;
            if (uId) {
                var { error } = await PKApp.supabase
                    .from('admin')
                    .update(payload)
                    .eq('id', uId);
                resError = error;
            } else {
                var { error } = await PKApp.supabase
                    .from('admin')
                    .insert([payload]);
                resError = error;
            }

            PKApp.hideLoading();
            if (resError) throw resError;

            PKApp.showToast('บันทึกข้อมูลผู้ใช้งานเรียบร้อยแล้ว', 'success');
            resetUserForm();
            loadUsers();
        } catch (err) {
            PKApp.hideLoading();
            PKApp.showToast('เกิดข้อผิดพลาด: ' + err.message, 'error');
        }
    });

    loadUsers();
};
