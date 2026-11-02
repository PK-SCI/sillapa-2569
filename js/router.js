/**
 * PK Junior NACC - OBEC (ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว)
 * File: js/router.js
 * Description: SPA hash-based router with route guards, dynamic parameters, and active state tracking
 */

// Global namespace
window.PKApp = window.PKApp || {};
PKApp.pages = PKApp.pages || {};
PKApp.home = PKApp.home || {};
PKApp.admin = PKApp.admin || {};
PKApp.auth = PKApp.auth || {};

// Router Module
PKApp.router = {
    // Current route and params state
    currentRoute: '',
    params: {},
    _initialized: false,

    // Static and parameterized routes mapping
    routes: {
        '': function() {
            if (PKApp.home && typeof PKApp.home.render === 'function') {
                PKApp.home.render();
            } else {
                PKApp.router.renderPlaceholder('หน้าหลัก (Home)', 'PKApp.home.render');
            }
        },
        '/': function() {
            if (PKApp.home && typeof PKApp.home.render === 'function') {
                PKApp.home.render();
            } else {
                PKApp.router.renderPlaceholder('หน้าหลัก (Home)', 'PKApp.home.render');
            }
        },
        'home': function() {
            if (PKApp.home && typeof PKApp.home.render === 'function') {
                PKApp.home.render();
            } else {
                PKApp.router.renderPlaceholder('หน้าหลัก (Home)', 'PKApp.home.render');
            }
        },
        'significance': function() {
            if (PKApp.pages && typeof PKApp.pages.significance === 'function') {
                PKApp.pages.significance();
            } else {
                PKApp.router.renderPlaceholder('ที่มาและความสำคัญ', 'PKApp.pages.significance');
            }
        },
        'hoop': function() {
            if (PKApp.pages && typeof PKApp.pages.hoop === 'function') {
                PKApp.pages.hoop();
            } else {
                PKApp.router.renderPlaceholder('เจตจำนง', 'PKApp.pages.hoop');
            }
        },
        'anthority': function() {
            if (PKApp.pages && typeof PKApp.pages.anthority === 'function') {
                PKApp.pages.anthority();
            } else {
                PKApp.router.renderPlaceholder('อำนาจหน้าที่', 'PKApp.pages.anthority');
            }
        },
        'membernacc': function() {
            if (PKApp.pages && typeof PKApp.pages.membernacc === 'function') {
                PKApp.pages.membernacc();
            } else {
                PKApp.router.renderPlaceholder('สมาชิก ป.ป.ช.สพฐ.น้อย', 'PKApp.pages.membernacc');
            }
        },
        'anacc': function() {
            if (PKApp.pages && typeof PKApp.pages.anacc === 'function') {
                PKApp.pages.anacc();
            } else {
                PKApp.router.renderPlaceholder('แกนนำ ป.ป.ช.สพฐ.น้อย', 'PKApp.pages.anacc');
            }
        },
        'announce': function() {
            if (PKApp.pages && typeof PKApp.pages.newsPage === 'function') {
                PKApp.pages.newsPage('ประกาศ');
            } else {
                PKApp.router.renderPlaceholder('ข่าวประกาศ', 'PKApp.pages.newsPage');
            }
        },
        'information': function() {
            if (PKApp.pages && typeof PKApp.pages.newsPage === 'function') {
                PKApp.pages.newsPage('ประชาสัมพันธ์');
            } else {
                PKApp.router.renderPlaceholder('ข่าวประชาสัมพันธ์', 'PKApp.pages.newsPage');
            }
        },
        'make': function() {
            if (PKApp.pages && typeof PKApp.pages.newsPage === 'function') {
                PKApp.pages.newsPage('คำสั่ง');
            } else {
                PKApp.router.renderPlaceholder('คำสั่ง', 'PKApp.pages.newsPage');
            }
        },
        'newsletter': function() {
            if (PKApp.pages && typeof PKApp.pages.newsPage === 'function') {
                PKApp.pages.newsPage('จดหมายข่าว');
            } else {
                PKApp.router.renderPlaceholder('จดหมายข่าว', 'PKApp.pages.newsPage');
            }
        },
        'certificate': function() {
            if (PKApp.pages && typeof PKApp.pages.certificate === 'function') {
                PKApp.pages.certificate();
            } else {
                PKApp.router.renderPlaceholder('เกียรติบัตร', 'PKApp.pages.certificate');
            }
        },
        'award': function() {
            if (PKApp.pages && typeof PKApp.pages.award === 'function') {
                PKApp.pages.award();
            } else {
                PKApp.router.renderPlaceholder('ผลงานและรางวัล', 'PKApp.pages.award');
            }
        },
        'plan': function() {
            if (PKApp.pages && typeof PKApp.pages.plan === 'function') {
                PKApp.pages.plan();
            } else {
                PKApp.router.renderPlaceholder('แผนงานและโครงการ', 'PKApp.pages.plan');
            }
        },
        'mony': function() {
            if (PKApp.pages && typeof PKApp.pages.mony === 'function') {
                PKApp.pages.mony();
            } else {
                PKApp.router.renderPlaceholder('งบประมาณและการเงิน', 'PKApp.pages.mony');
            }
        },
        'culecculum': function() {
            if (PKApp.pages && typeof PKApp.pages.simpleFilePage === 'function') {
                PKApp.pages.simpleFilePage('culecculum', 'หลักสูตร');
            } else {
                PKApp.router.renderPlaceholder('หลักสูตร', 'PKApp.pages.simpleFilePage');
            }
        },
        'tammanun': function() {
            if (PKApp.pages && typeof PKApp.pages.simpleFilePage === 'function') {
                PKApp.pages.simpleFilePage('tammanun', 'ธรรมนูญ (ภายใน)');
            } else {
                PKApp.router.renderPlaceholder('ธรรมนูญ (ภายใน)', 'PKApp.pages.simpleFilePage');
            }
        },
        'law': function() {
            if (PKApp.pages && typeof PKApp.pages.simpleFilePage === 'function') {
                PKApp.pages.simpleFilePage('law', 'กฎหมาย (คณะกรรมาธิการ)');
            } else {
                PKApp.router.renderPlaceholder('กฎหมาย (คณะกรรมาธิการ)', 'PKApp.pages.simpleFilePage');
            }
        },
        'login': function() {
            if (PKApp.auth && typeof PKApp.auth.showLogin === 'function') {
                PKApp.auth.showLogin();
            } else {
                PKApp.router.renderPlaceholder('เข้าสู่ระบบผู้ดูแลระบบ', 'PKApp.auth.showLogin');
            }
        },
        'admin': function() {
            if (PKApp.admin && typeof PKApp.admin.dashboard === 'function') {
                PKApp.admin.dashboard();
            } else {
                PKApp.router.renderPlaceholder('ระบบบริหารจัดการ (Admin Dashboard)', 'PKApp.admin.dashboard');
            }
        },
        'admin/significance': function() {
            if (PKApp.admin && typeof PKApp.admin.editRichContent === 'function') {
                PKApp.admin.editRichContent('significance', 'ที่มา และความสำคัญ');
            } else {
                PKApp.router.renderPlaceholder('จัดการเนื้อหา: ที่มา และความสำคัญ', 'PKApp.admin.editRichContent');
            }
        },
        'admin/hoop': function() {
            if (PKApp.admin && typeof PKApp.admin.editRichContent === 'function') {
                PKApp.admin.editRichContent('hoop', 'เจตจำนง');
            } else {
                PKApp.router.renderPlaceholder('จัดการเนื้อหา: เจตจำนง', 'PKApp.admin.editRichContent');
            }
        },
        'admin/anthority': function() {
            if (PKApp.admin && typeof PKApp.admin.editRichContent === 'function') {
                PKApp.admin.editRichContent('anthority', 'อำนาจหน้าที่');
            } else {
                PKApp.router.renderPlaceholder('จัดการเนื้อหา: อำนาจหน้าที่', 'PKApp.admin.editRichContent');
            }
        },
        'admin/membernacc': function() {
            if (PKApp.admin && typeof PKApp.admin.editMemberNACC === 'function') {
                PKApp.admin.editMemberNACC();
            } else {
                PKApp.router.renderPlaceholder('จัดการข้อมูล: สมาชิก ป.ป.ช.สพฐ.น้อย', 'PKApp.admin.editMemberNACC');
            }
        },
        'admin/anacc': function() {
            if (PKApp.admin && typeof PKApp.admin.editANACC === 'function') {
                PKApp.admin.editANACC();
            } else {
                PKApp.router.renderPlaceholder('จัดการข้อมูล: แกนนำ ป.ป.ช.สพฐ.น้อย', 'PKApp.admin.editANACC');
            }
        },
        'admin/announce': function() {
            if (PKApp.admin && typeof PKApp.admin.editNews === 'function') {
                PKApp.admin.editNews('ประกาศ');
            } else {
                PKApp.router.renderPlaceholder('จัดการข่าว: ประกาศ', 'PKApp.admin.editNews');
            }
        },
        'admin/information': function() {
            if (PKApp.admin && typeof PKApp.admin.editNews === 'function') {
                PKApp.admin.editNews('ประชาสัมพันธ์');
            } else {
                PKApp.router.renderPlaceholder('จัดการข่าว: ประชาสัมพันธ์', 'PKApp.admin.editNews');
            }
        },
        'admin/make': function() {
            if (PKApp.admin && typeof PKApp.admin.editNews === 'function') {
                PKApp.admin.editNews('คำสั่ง');
            } else {
                PKApp.router.renderPlaceholder('จัดการข่าว: คำสั่ง', 'PKApp.admin.editNews');
            }
        },
        'admin/newsletter': function() {
            if (PKApp.admin && typeof PKApp.admin.editNews === 'function') {
                PKApp.admin.editNews('จดหมายข่าว');
            } else {
                PKApp.router.renderPlaceholder('จัดการข่าว: จดหมายข่าว', 'PKApp.admin.editNews');
            }
        },
        'admin/certificate': function() {
            if (PKApp.admin && typeof PKApp.admin.editCertificate === 'function') {
                PKApp.admin.editCertificate();
            } else {
                PKApp.router.renderPlaceholder('จัดการข้อมูล: เกียรติบัตร', 'PKApp.admin.editCertificate');
            }
        },
        'admin/award': function() {
            if (PKApp.admin && typeof PKApp.admin.editAward === 'function') {
                PKApp.admin.editAward();
            } else {
                PKApp.router.renderPlaceholder('จัดการข้อมูล: ผลงานและรางวัล', 'PKApp.admin.editAward');
            }
        },
        'admin/plan': function() {
            if (PKApp.admin && typeof PKApp.admin.editPlan === 'function') {
                PKApp.admin.editPlan();
            } else {
                PKApp.router.renderPlaceholder('จัดการข้อมูล: แผนงานและโครงการ', 'PKApp.admin.editPlan');
            }
        },
        'admin/culecculum': function() {
            if (PKApp.admin && typeof PKApp.admin.editSimpleFile === 'function') {
                PKApp.admin.editSimpleFile('culecculum', 'หลักสูตร');
            } else {
                PKApp.router.renderPlaceholder('จัดการไฟล์: หลักสูตร', 'PKApp.admin.editSimpleFile');
            }
        },
        'admin/tammanun': function() {
            if (PKApp.admin && typeof PKApp.admin.editSimpleFile === 'function') {
                PKApp.admin.editSimpleFile('tammanun', 'ธรรมนูญ (ภายใน)');
            } else {
                PKApp.router.renderPlaceholder('จัดการไฟล์: ธรรมนูญ (ภายใน)', 'PKApp.admin.editSimpleFile');
            }
        },
        'admin/law': function() {
            if (PKApp.admin && typeof PKApp.admin.editSimpleFile === 'function') {
                PKApp.admin.editSimpleFile('law', 'กฎหมาย (คณะกรรมาธิการ)');
            } else {
                PKApp.router.renderPlaceholder('จัดการไฟล์: กฎหมาย (คณะกรรมาธิการ)', 'PKApp.admin.editSimpleFile');
            }
        },
        'admin/users': function() {
            if (PKApp.admin && typeof PKApp.admin.editUsers === 'function') {
                PKApp.admin.editUsers();
            } else {
                PKApp.router.renderPlaceholder('จัดการผู้ใช้งานระบบ', 'PKApp.admin.editUsers');
            }
        }
    },

    // Dynamic parameterized route patterns
    dynamicRoutes: [
        {
            pattern: /^news-detail\/([^/?#]+)$/,
            handler: function(matches) {
                var id = decodeURIComponent(matches[1]);
                if (PKApp.pages && typeof PKApp.pages.newsDetail === 'function') {
                    PKApp.pages.newsDetail(id);
                } else {
                    PKApp.router.renderPlaceholder('รายละเอียดข่าวรหัส ' + id, 'PKApp.pages.newsDetail');
                }
            }
        }
    ],

    // Check if user is authenticated
    isAuthenticated: function() {
        if (PKApp.currentUser) return true;
        if (PKApp.auth && typeof PKApp.auth.isLoggedIn === 'function') {
            return PKApp.auth.isLoggedIn();
        }
        try {
            var saved = localStorage.getItem('pk_current_user');
            if (saved) {
                PKApp.currentUser = JSON.parse(saved);
                return !!PKApp.currentUser;
            }
        } catch (e) {}
        return false;
    },

    // Check if the given route path is an admin route
    isAdminRoute: function(routePath) {
        return routePath === 'admin' || routePath.indexOf('admin/') === 0;
    },

    // Main route resolution and execution
    handleRoute: function() {
        var rawHash = window.location.hash || '';
        // Remove leading # and optional leading slash
        var cleanPath = rawHash.replace(/^#\/?/, '').split('?')[0].trim();
        // Remove trailing slashes
        cleanPath = cleanPath.replace(/\/+$/, '');

        // Default to empty string for root/home
        if (cleanPath === '/' || cleanPath === 'home') {
            cleanPath = '';
        }

        // Admin authentication guard
        if (PKApp.router.isAdminRoute(cleanPath)) {
            if (!PKApp.router.isAuthenticated()) {
                if (typeof PKApp.showToast === 'function') {
                    PKApp.showToast('กรุณาเข้าสู่ระบบก่อนเข้าใช้งานส่วนผู้ดูแลระบบ', 'warning');
                }
                PKApp.redirectAfterLogin = cleanPath;
                window.location.hash = '#login';
                return;
            }
        }

        // Store state
        PKApp.router.currentRoute = cleanPath;
        PKApp.router.params = {};

        // 1. Close mobile sidebar
        PKApp.router.closeMobileSidebar();

        // 2. Scroll to top on page change
        window.scrollTo(0, 0);

        // 3. Update active nav items
        PKApp.router.updateActiveNav(cleanPath);

        // 4. Try exact match from static routes
        if (Object.prototype.hasOwnProperty.call(PKApp.router.routes, cleanPath)) {
            try {
                PKApp.router.routes[cleanPath]();
            } catch (err) {
                console.error('Error executing route "' + cleanPath + '":', err);
                PKApp.router.renderError('เกิดข้อผิดพลาดในการโหลดหน้าเว็บ: ' + err.message);
            }
            return;
        }

        // 5. Try dynamic routes
        for (var i = 0; i < PKApp.router.dynamicRoutes.length; i++) {
            var item = PKApp.router.dynamicRoutes[i];
            var match = cleanPath.match(item.pattern);
            if (match) {
                try {
                    item.handler(match);
                } catch (err) {
                    console.error('Error executing dynamic route "' + cleanPath + '":', err);
                    PKApp.router.renderError('เกิดข้อผิดพลาดในการโหลดเนื้อหา: ' + err.message);
                }
                return;
            }
        }

        // 6. Route not found (404)
        PKApp.router.renderNotFound(cleanPath);
    },

    // Programmatic navigation helper
    navigate: function(path) {
        if (!path) path = '';
        path = String(path).replace(/^#\/?/, '');
        window.location.hash = '#' + path;
    },

    // Update active class on navigation links
    updateActiveNav: function(currentPath) {
        var links = document.querySelectorAll('a[href^="#"]');
        var normalizedCurrent = currentPath === '' || currentPath === 'home' ? '' : currentPath;

        links.forEach(function(link) {
            var href = link.getAttribute('href') || '';
            var linkPath = href.replace(/^#\/?/, '').split('?')[0].trim().replace(/\/+$/, '');
            if (linkPath === 'home') linkPath = '';

            var isActive = false;
            if (normalizedCurrent === '' && linkPath === '') {
                isActive = true;
            } else if (normalizedCurrent !== '' && linkPath !== '') {
                if (normalizedCurrent === linkPath) {
                    isActive = true;
                } else if (normalizedCurrent.indexOf(linkPath + '/') === 0) {
                    isActive = true;
                }
            }

            if (isActive) {
                link.classList.add('active');
                link.setAttribute('aria-current', 'page');
            } else {
                link.classList.remove('active');
                link.removeAttribute('aria-current');
            }
        });
    },

    // Close mobile sidebar and menu overlays
    closeMobileSidebar: function() {
        if (typeof PKApp.closeMobileMenu === 'function') {
            try { PKApp.closeMobileMenu(); } catch (e) { console.error(e); }
        }

        var mobileMenuSelectors = [
            '#mobile-menu',
            '#mobile-sidebar',
            '#sidebar-mobile',
            '[data-mobile-menu]',
            '.mobile-nav-panel'
        ];
        mobileMenuSelectors.forEach(function(selector) {
            var menuEl = document.querySelector(selector);
            if (menuEl) {
                menuEl.classList.add('hidden');
                menuEl.classList.remove('open', 'show', 'translate-x-0');
                menuEl.setAttribute('aria-expanded', 'false');
            }
        });

        var overlaySelectors = [
            '#mobile-menu-backdrop',
            '#sidebar-backdrop',
            '.mobile-backdrop'
        ];
        overlaySelectors.forEach(function(selector) {
            var overlayEl = document.querySelector(selector);
            if (overlayEl) {
                overlayEl.classList.add('hidden');
            }
        });
    },

    // Get main content container
    getContentContainer: function() {
        return document.getElementById('app') ||
               document.getElementById('main-content') ||
               document.getElementById('content') ||
               document.querySelector('main') ||
               document.body;
    },

    // Render 404 page
    renderNotFound: function(path) {
        var container = PKApp.router.getContentContainer();
        if (!container) return;

        var safePath = PKApp.escapeHtml ? PKApp.escapeHtml(path) : path;
        container.innerHTML = [
            '<div class="min-h-[60vh] flex items-center justify-center px-4 py-12">',
            '  <div class="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-lg border border-purple-100">',
            '    <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-50 text-purple-700 text-3xl font-extrabold mb-4 shadow-inner">',
            '      404',
            '    </div>',
            '    <h2 class="text-2xl font-bold text-gray-800 mb-2">ไม่พบหน้าที่ค้นหา</h2>',
            '    <p class="text-gray-500 text-sm mb-6">ขออภัย ไม่พบหน้าที่คุณร้องขอ (<code>#' + safePath + '</code>) หรือหน้านี้อาจยังไม่เปิดให้บริการ</p>',
            '    <a href="#/" class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-medium shadow-md shadow-purple-900/20 transition-all duration-200">',
            '      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>',
            '      <span>กลับสู่หน้าหลัก</span>',
            '    </a>',
            '  </div>',
            '</div>'
        ].join('\n');
    },

    // Render error view
    renderError: function(message) {
        var container = PKApp.router.getContentContainer();
        if (!container) return;

        var safeMsg = PKApp.escapeHtml ? PKApp.escapeHtml(message) : message;
        container.innerHTML = [
            '<div class="min-h-[50vh] flex items-center justify-center px-4 py-12">',
            '  <div class="max-w-md w-full bg-white rounded-2xl p-6 text-center shadow-md border border-rose-100">',
            '    <div class="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-3">',
            '      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>',
            '    </div>',
            '    <h3 class="text-lg font-bold text-gray-800 mb-2">เกิดข้อผิดพลาด</h3>',
            '    <p class="text-sm text-gray-600 mb-4">' + safeMsg + '</p>',
            '    <button onclick="window.location.reload()" class="px-4 py-2 bg-purple-700 text-white rounded-xl text-sm font-medium hover:bg-purple-800 transition">',
            '      ลองใหม่อีกครั้ง',
            '    </button>',
            '  </div>',
            '</div>'
        ].join('\n');
    },

    // Render developmental placeholder view if a target module is being loaded
    renderPlaceholder: function(title, fnName) {
        var container = PKApp.router.getContentContainer();
        if (!container) return;

        container.innerHTML = [
            '<div class="max-w-3xl mx-auto px-4 py-12">',
            '  <div class="bg-gradient-to-br from-purple-50 to-amber-50 rounded-3xl p-8 border border-purple-100 text-center shadow-sm">',
            '    <div class="w-16 h-16 bg-white rounded-2xl shadow-sm text-purple-700 flex items-center justify-center mx-auto mb-4 border border-purple-100">',
            '      <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>',
            '    </div>',
            '    <h2 class="text-2xl font-bold text-purple-950 mb-2">' + title + '</h2>',
            '    <p class="text-gray-600 text-sm max-w-md mx-auto mb-6">ฟังก์ชันการทำงาน <code>' + fnName + '()</code> กำลังเตรียมพร้อมระบบสำหรับการแสดงผล</p>',
            '    <div class="flex items-center justify-center gap-3">',
            '      <a href="#/" class="px-5 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-sm font-medium shadow transition">กลับหน้าหลัก</a>',
            '    </div>',
            '  </div>',
            '</div>'
        ].join('\n');
    },

    // Initialize router and listeners
    init: function() {
        if (PKApp.router._initialized) return;
        PKApp.router._initialized = true;

        // Hash change event listener
        window.addEventListener('hashchange', function() {
            PKApp.router.handleRoute();
        });

        // Trigger initial route
        PKApp.router.handleRoute();
    }
};

// Initialize router when document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        PKApp.router.init();
    });
} else {
    PKApp.router.init();
}
