/**
 * PK Junior NACC - OBEC (ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว)
 * File: js/home.js
 * Description: Home page module that renders the main landing page
 * Sections:
 *   1. Hero Banner Slider (Home table)
 *   2. Announcement Banner (newstat table)
 *   3. Gold Divider
 *   4. Quick Action Buttons (botton table)
 *   5. Gold Divider
 *   6. Latest News Cards (new table)
 *   7. Gold Divider
 *   8. Visit Statistics (statis, mamberNACC, ANACC tables)
 *   9. Record Visit (device detection & statis table insert)
 *  10. Gold Divider
 */

window.PKApp = window.PKApp || {};
PKApp.home = PKApp.home || {};

// Module state
PKApp.home._sliderInterval = null;
PKApp.home._currentSlideIndex = 0;
PKApp.home._totalSlides = 0;

/**
 * Generate elegant gold divider HTML
 * @returns {string}
 */
PKApp.home.renderGoldDivider = function() {
    return [
        '<div class="gold-divider-wrap" style="display: flex; align-items: center; justify-content: center; width: 100%; max-width: 1200px; margin: 2.75rem auto; padding: 0 1rem;">',
        '  <div style="flex: 1; height: 2px; background: linear-gradient(90deg, transparent 0%, rgba(212, 168, 67, 0.4) 40%, #D4A843 100%);"></div>',
        '  <div style="display: flex; align-items: center; gap: 8px; padding: 0 1.25rem;">',
        '    <span style="width: 7px; height: 7px; transform: rotate(45deg); background-color: #D4A843; display: inline-block; box-shadow: 0 0 6px rgba(212, 168, 67, 0.6);"></span>',
        '    <span style="width: 12px; height: 12px; transform: rotate(45deg); background-color: #6B21A8; border: 2px solid #D4A843; display: inline-block; box-shadow: 0 0 8px rgba(107, 33, 168, 0.4);"></span>',
        '    <span style="width: 7px; height: 7px; transform: rotate(45deg); background-color: #D4A843; display: inline-block; box-shadow: 0 0 6px rgba(212, 168, 67, 0.6);"></span>',
        '  </div>',
        '  <div style="flex: 1; height: 2px; background: linear-gradient(90deg, #D4A843 0%, rgba(212, 168, 67, 0.4) 60%, transparent 100%);"></div>',
        '</div>'
    ].join('\n');
};

/**
 * Parse and evaluate PostgreSQL tstzrange string to determine if current time falls within range
 * Supports formats like:
 *   '["2024-01-01 00:00:00+00","2024-12-31 23:59:59+00")'
 *   '[2024-01-01,2024-12-31)'
 *   '2024-01-01,2024-12-31'
 * @param {string} dateline
 * @returns {boolean}
 */
PKApp.home.isDateInDateline = function(dateline) {
    if (!dateline) return true;
    try {
        var now = Date.now();
        var raw = String(dateline).trim();
        var isLowerInclusive = raw.startsWith('[');
        var isUpperInclusive = raw.endsWith(']');

        // Remove opening/closing brackets
        var stripped = raw.replace(/^[\[\(]/, '').replace(/[\]\)]$/, '');
        var parts = stripped.split(',');

        if (parts.length >= 2) {
            var lowerStr = parts[0].trim().replace(/^["']/, '').replace(/["']$/, '');
            var upperStr = parts[1].trim().replace(/^["']/, '').replace(/["']$/, '');

            if (lowerStr && lowerStr !== 'empty' && lowerStr !== '-infinity') {
                var lowerDate = new Date(lowerStr);
                if (!isNaN(lowerDate.getTime())) {
                    if (isLowerInclusive ? (now < lowerDate.getTime()) : (now <= lowerDate.getTime())) {
                        return false;
                    }
                }
            }

            if (upperStr && upperStr !== 'empty' && upperStr !== 'infinity') {
                var upperDate = new Date(upperStr);
                if (!isNaN(upperDate.getTime())) {
                    if (isUpperInclusive ? (now > upperDate.getTime()) : (now >= upperDate.getTime())) {
                        return false;
                    }
                }
            }

            return true;
        } else if (parts.length === 1 && parts[0].trim()) {
            var singleDate = new Date(parts[0].trim().replace(/^["']/, '').replace(/["']$/, ''));
            if (!isNaN(singleDate.getTime())) {
                return now <= singleDate.getTime();
            }
        }
    } catch (e) {
        console.warn('Error parsing dateline:', dateline, e);
    }
    return true;
};

/**
 * Extract the first image URL from a potentially comma/newline-delimited string
 * @param {string} urlField
 * @returns {string}
 */
PKApp.home.getFirstImageUrl = function(urlField) {
    if (!urlField) return '';
    var str = String(urlField).trim();
    // Split by comma, pipe, or newline
    var items = str.split(/[,\n\r|]/);
    var first = (items[0] || '').trim();
    return PKApp.driveImage(first);
};

/**
 * Detect client device brand and model from navigator.userAgent
 * @returns {string}
 */
PKApp.home.getDeviceInfo = function() {
    var ua = (navigator.userAgent || '').trim();
    var brand = 'พีซี / คอมพิวเตอร์';

    if (/iPhone/i.test(ua)) {
        brand = 'Apple iPhone';
    } else if (/iPad/i.test(ua)) {
        brand = 'Apple iPad';
    } else if (/Macintosh|Mac OS X/i.test(ua)) {
        brand = 'Apple Mac';
    } else if (/Samsung|SM-[A-Z0-9]+/i.test(ua)) {
        brand = 'Samsung Galaxy';
    } else if (/Huawei|HONOR/i.test(ua)) {
        brand = 'Huawei';
    } else if (/Xiaomi|Redmi|POCO/i.test(ua)) {
        brand = 'Xiaomi';
    } else if (/OPPO/i.test(ua)) {
        brand = 'OPPO';
    } else if (/vivo/i.test(ua)) {
        brand = 'Vivo';
    } else if (/Realme/i.test(ua)) {
        brand = 'Realme';
    } else if (/OnePlus/i.test(ua)) {
        brand = 'OnePlus';
    } else if (/Pixel/i.test(ua)) {
        brand = 'Google Pixel';
    } else if (/Android/i.test(ua)) {
        brand = 'Android Device';
    } else if (/Windows NT 10.0/i.test(ua)) {
        brand = 'Windows 10/11';
    } else if (/Windows/i.test(ua)) {
        brand = 'Windows PC';
    } else if (/Linux/i.test(ua)) {
        brand = 'Linux PC';
    }

    var browser = '';
    if (/Edg\//i.test(ua)) {
        browser = 'Edge';
    } else if (/Chrome\//i.test(ua) && !/Edg\//i.test(ua)) {
        browser = 'Chrome';
    } else if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) {
        browser = 'Safari';
    } else if (/Firefox\//i.test(ua)) {
        browser = 'Firefox';
    }

    if (browser) {
        return brand + ' (' + browser + ')';
    }
    return brand;
};

/**
 * Record a visit into the 'statis' table (once per user session)
 */
PKApp.home.recordVisit = async function() {
    try {
        if (sessionStorage.getItem('pk_visit_recorded')) {
            return;
        }
        sessionStorage.setItem('pk_visit_recorded', 'true');

        if (!PKApp.supabase) {
            if (typeof supabase !== 'undefined' && supabase.createClient) {
                PKApp.supabase = supabase.createClient(PKApp.SUPABASE_URL, PKApp.SUPABASE_KEY);
            }
        }

        if (PKApp.supabase) {
            var deviceInfo = PKApp.home.getDeviceInfo();
            await PKApp.supabase.from('statis').insert([{ brand: deviceInfo }]);
        }
    } catch (e) {
        console.warn('Failed to record visitor analytics:', e);
    }
};

/**
 * Resolve Quick Action button URL or route destination
 * @param {string} meg
 * @param {string} url
 * @returns {{isExternal: boolean, path: string}}
 */
PKApp.home.resolveButtonRoute = function(meg, url) {
    var rawUrl = (url || '').trim();

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        return { isExternal: true, path: rawUrl };
    }

    if (rawUrl.startsWith('#')) {
        return { isExternal: false, path: rawUrl };
    }

    if (rawUrl.startsWith('/')) {
        return { isExternal: false, path: '#' + rawUrl };
    }

    // Mapping table for common menu names
    var routeMap = {
        'ประกาศ': '#/announce',
        'ประชาสัมพันธ์': '#/information',
        'คำสั่ง': '#/make',
        'จดหมายข่าว': '#/newsletter',
        'เกียรติบัตร': '#/certificate',
        'ทะเบียนเกียรติบัตร': '#/certificate',
        'ผลงาน': '#/award',
        'ที่มา': '#/significance',
        'ที่มา และความสำคัญ': '#/significance',
        'เจตจำนง': '#/hoop',
        'อำนาจหน้าที่': '#/anthority',
        'บุคคลกร': '#/membernacc',
        'คณะกรรมการ': '#/membernacc',
        'คณะกรรมการ ป.ป.ช.สพฐ.น้อย': '#/membernacc',
        'ตัวแทนห้อง': '#/anacc',
        'อนุกรรมการ': '#/anacc',
        'อนุกรรมการ ป.ป.ช.สพฐ.น้อย': '#/anacc',
        'นโยบาย และแผนดำเนินโครงการ': '#/plan',
        'แผนงาน': '#/plan',
        'งบประมาณ': '#/mony',
        'หลักสูตร': '#/culecculum',
        'ธรรมนูญ': '#/tammanun',
        'ธรรมนูญ (ภายใน)': '#/tammanun',
        'กฎหมาย': '#/law',
        'กฎหมาย (คณะกรรมาธิการ)': '#/law'
    };

    var trimmedLabel = (meg || '').trim();
    if (routeMap[trimmedLabel]) {
        return { isExternal: false, path: routeMap[trimmedLabel] };
    }

    // Substring matching
    for (var key in routeMap) {
        if (trimmedLabel.indexOf(key) !== -1 || key.indexOf(trimmedLabel) !== -1) {
            return { isExternal: false, path: routeMap[key] };
        }
    }

    if (rawUrl) {
        return { isExternal: false, path: '#/' + rawUrl.replace(/^#\/?/, '') };
    }

    return { isExternal: false, path: '#/' };
};

/**
 * Main Home Page Render Function
 */
PKApp.home.render = async function() {
    var container = document.getElementById('app-content') ||
                    document.getElementById('app') ||
                    document.getElementById('main-content') ||
                    document.querySelector('main');

    if (!container) {
        console.error('Home render error: Container not found');
        return;
    }

    // Clear any existing carousel timer
    if (PKApp.home._sliderInterval) {
        clearInterval(PKApp.home._sliderInterval);
        PKApp.home._sliderInterval = null;
    }

    // Display initial loading skeleton/state
    container.innerHTML = [
        '<div class="home-loading-state" style="max-width: 1200px; margin: 3rem auto; padding: 2rem 1rem; text-align: center; font-family: \'Prompt\', sans-serif;">',
        '  <div style="width: 54px; height: 54px; border: 4px solid #DDD6FE; border-top-color: #D4A843; border-radius: 50%; margin: 0 auto 1.25rem; animation: pkSpin 0.9s linear infinite;"></div>',
        '  <h3 style="color: #6B21A8; font-size: 1.15rem; font-weight: 600; margin: 0 0 0.5rem;">กำลังโหลดข้อมูล ป.ป.ช.สพฐ.น้อย...</h3>',
        '  <p style="color: #6B7280; font-size: 0.875rem; margin: 0;">กรุณารอสักครู่ ระบบกำลังดึงข้อมูลล่าสุดจากฐานข้อมูล</p>',
        '  <style>',
        '    @keyframes pkSpin { to { transform: rotate(360deg); } }',
        '  </style>',
        '</div>'
    ].join('\n');

    // Ensure Supabase client is ready
    if (!PKApp.supabase) {
        if (typeof supabase !== 'undefined' && supabase.createClient) {
            PKApp.supabase = supabase.createClient(PKApp.SUPABASE_URL, PKApp.SUPABASE_KEY);
        }
    }

    // Record visit asynchronously (Section 9)
    PKApp.home.recordVisit();

    // Data containers with safe defaults
    var heroSlides = [];
    var announcementBanners = [];
    var actionButtons = [];
    var latestNews = [];
    var statVisitors = 0;
    var statBoard = 0;
    var statSubBoard = 0;
    var boardMaxYear = '';
    var subBoardMaxYear = '';

    // ==========================================
    // Fetch Data from Supabase
    // ==========================================
    try {
        if (PKApp.supabase) {
            // 1. Fetch Hero Images from 'Home' table
            try {
                var homeRes = await PKApp.supabase
                    .from('Home')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (homeRes.data && homeRes.data.length > 0) {
                    heroSlides = homeRes.data;
                } else {
                    // Fallback attempt with lowercase table name
                    var fallbackHome = await PKApp.supabase.from('home').select('*');
                    if (fallbackHome.data && fallbackHome.data.length > 0) {
                        heroSlides = fallbackHome.data;
                    }
                }
            } catch (e) {
                console.warn('Error fetching hero slider slides:', e);
            }

            // 2. Fetch Announcements from 'newstat' table
            try {
                var newstatRes = await PKApp.supabase
                    .from('newstat')
                    .select('*');

                if (newstatRes.data && newstatRes.data.length > 0) {
                    // Filter based on dateline tstzrange
                    announcementBanners = newstatRes.data.filter(function(item) {
                        return PKApp.home.isDateInDateline(item.dateline);
                    });
                }
            } catch (e) {
                console.warn('Error fetching newstat banners:', e);
            }

            // 3. Fetch Quick Action Buttons from 'botton' table
            try {
                var bottonRes = await PKApp.supabase
                    .from('botton')
                    .select('*')
                    .order('sort_order', { ascending: true });

                if (bottonRes.data && bottonRes.data.length > 0) {
                    actionButtons = bottonRes.data;
                }
            } catch (e) {
                console.warn('Error fetching botton records:', e);
            }

            // 4. Fetch Latest 6 News from 'new' table
            try {
                var newsRes = await PKApp.supabase
                    .from('new')
                    .select('*')
                    .order('id', { ascending: false })
                    .limit(6);

                if (newsRes.data && newsRes.data.length > 0) {
                    latestNews = newsRes.data;
                }
            } catch (e) {
                console.warn('Error fetching latest news records:', e);
            }

            // 5. Fetch Statistics
            // a. Visitors count from 'statis'
            try {
                var statisCountRes = await PKApp.supabase
                    .from('statis')
                    .select('*', { count: 'exact', head: true });

                if (statisCountRes.count !== null && statisCountRes.count !== undefined) {
                    statVisitors = statisCountRes.count;
                }
            } catch (e) {
                console.warn('Error fetching statis count:', e);
            }

            // b. Board count from 'mamberNACC' where year = max year
            try {
                var yearRes1 = await PKApp.supabase
                    .from('mamberNACC')
                    .select('year')
                    .order('year', { ascending: false })
                    .limit(1);

                if (yearRes1.data && yearRes1.data.length > 0 && yearRes1.data[0].year) {
                    boardMaxYear = yearRes1.data[0].year;
                    var countRes1 = await PKApp.supabase
                        .from('mamberNACC')
                        .select('*', { count: 'exact', head: true })
                        .eq('year', boardMaxYear);

                    if (countRes1.count !== null && countRes1.count !== undefined) {
                        statBoard = countRes1.count;
                    }
                } else {
                    // Try lowercase fallback if needed
                    var fbYear1 = await PKApp.supabase
                        .from('membernacc')
                        .select('year')
                        .order('year', { ascending: false })
                        .limit(1);

                    if (fbYear1.data && fbYear1.data.length > 0 && fbYear1.data[0].year) {
                        boardMaxYear = fbYear1.data[0].year;
                        var fbCount1 = await PKApp.supabase
                            .from('membernacc')
                            .select('*', { count: 'exact', head: true })
                            .eq('year', boardMaxYear);
                        if (fbCount1.count !== null) statBoard = fbCount1.count;
                    }
                }
            } catch (e) {
                console.warn('Error fetching mamberNACC statistics:', e);
            }

            // c. Sub-board count from 'ANACC' where year = max year
            try {
                var yearRes2 = await PKApp.supabase
                    .from('ANACC')
                    .select('year')
                    .order('year', { ascending: false })
                    .limit(1);

                if (yearRes2.data && yearRes2.data.length > 0 && yearRes2.data[0].year) {
                    subBoardMaxYear = yearRes2.data[0].year;
                    var countRes2 = await PKApp.supabase
                        .from('ANACC')
                        .select('*', { count: 'exact', head: true })
                        .eq('year', subBoardMaxYear);

                    if (countRes2.count !== null && countRes2.count !== undefined) {
                        statSubBoard = countRes2.count;
                    }
                } else {
                    // Fallback to lowercase
                    var fbYear2 = await PKApp.supabase
                        .from('anacc')
                        .select('year')
                        .order('year', { ascending: false })
                        .limit(1);

                    if (fbYear2.data && fbYear2.data.length > 0 && fbYear2.data[0].year) {
                        subBoardMaxYear = fbYear2.data[0].year;
                        var fbCount2 = await PKApp.supabase
                            .from('anacc')
                            .select('*', { count: 'exact', head: true })
                            .eq('year', subBoardMaxYear);
                        if (fbCount2.count !== null) statSubBoard = fbCount2.count;
                    }
                }
            } catch (e) {
                console.warn('Error fetching ANACC statistics:', e);
            }
        }
    } catch (globalErr) {
        console.error('Database fetching exception in home.render:', globalErr);
    }

    // Default action buttons if table is empty
    if (!actionButtons || actionButtons.length === 0) {
        actionButtons = [
            { meg: 'ประกาศ', photo: '📢', url: '#/announce' },
            { meg: 'ประชาสัมพันธ์', photo: '📰', url: '#/information' },
            { meg: 'คำสั่ง', photo: '📜', url: '#/make' },
            { meg: 'จดหมายข่าว', photo: '✉️', url: '#/newsletter' },
            { meg: 'ทะเบียนเกียรติบัตร', photo: '🎖️', url: '#/certificate' },
            { meg: 'ผลงาน', photo: '🏆', url: '#/award' },
            { meg: 'คณะกรรมการ', photo: '👥', url: '#/membernacc' },
            { meg: 'นโยบายและแผน', photo: '📊', url: '#/plan' }
        ];
    }

    // Default fallback banner if hero slides is empty
    if (!heroSlides || heroSlides.length === 0) {
        heroSlides = [
            {
                photo: '1E3Sfzalpk46I9uOFhsnfWrBURGb8LsED',
                title: 'ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว'
            }
        ];
    }

    PKApp.home._totalSlides = heroSlides.length;
    PKApp.home._currentSlideIndex = 0;

    // ==========================================
    // Construct HTML Sections
    // ==========================================
    var htmlParts = [];

    // Outer styling & container
    htmlParts.push('<div class="home-view-container" style="max-width: 1280px; margin: 0 auto; padding: 1.5rem 1rem 3.5rem; font-family: \'Prompt\', sans-serif;">');

    // ------------------------------------------
    // Section 1: Hero Banner Slider
    // ------------------------------------------
    htmlParts.push('<section class="hero-slider-section" style="margin-bottom: 2rem;">');
    htmlParts.push('  <div class="hero-slider-container" style="position: relative; width: 100%; border-radius: 20px; overflow: hidden; border: 3px solid #DDD6FE; box-shadow: 0 14px 35px -5px rgba(107, 33, 168, 0.35), 0 0 25px rgba(221, 214, 254, 0.45); background: #1E1B4B;">');

    // Slider track
    htmlParts.push('    <div id="hero-slider-track" style="position: relative; width: 100%; height: 420px; max-height: 70vh; overflow: hidden;">');

    heroSlides.forEach(function(slide, idx) {
        var imageUrl = PKApp.driveImage(slide.photo);
        var activeStyle = (idx === 0) ? 'opacity: 1; pointer-events: auto; z-index: 2;' : 'opacity: 0; pointer-events: none; z-index: 1;';

        htmlParts.push('      <div class="hero-slide-item" data-slide-index="' + idx + '" style="position: absolute; inset: 0; transition: opacity 0.8s ease-in-out; ' + activeStyle + '">');
        htmlParts.push('        <img src="' + imageUrl + '" alt="ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว สไลด์ที่ ' + (idx + 1) + '" style="width: 100%; height: 100%; object-fit: cover; object-position: center;">');
        
        // Gradient overlay for text readability
        htmlParts.push('        <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(30, 27, 75, 0.2) 0%, rgba(107, 33, 168, 0.45) 55%, rgba(17, 24, 39, 0.88) 100%);"></div>');

        // Text Overlay Content
        htmlParts.push('        <div class="hero-overlay-content" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 2rem 2.5rem 3.5rem; text-align: center; color: #FFFFFF; z-index: 3;">');
        htmlParts.push('          <div style="max-width: 900px; margin: 0 auto;">');
        htmlParts.push('            <h1 style="font-size: clamp(1.6rem, 4vw, 2.75rem); font-weight: 800; color: #D4A843; margin: 0 0 0.5rem; text-shadow: 0 3px 12px rgba(0,0,0,0.85), 0 0 25px rgba(212,168,67,0.5); font-family: \'Prompt\', sans-serif; letter-spacing: -0.02em;">ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว</h1>');
        htmlParts.push('            <p style="font-size: clamp(1rem, 2.2vw, 1.35rem); font-weight: 600; color: #FFFFFF; margin: 0 0 0.5rem; text-shadow: 0 2px 8px rgba(0,0,0,0.8); font-family: \'Prompt\', sans-serif;">ส่งเสริม 5 คุณลักษณะโรงเรียนสุจริต ป้องกันและต่อต้านทุจริต</p>');
        htmlParts.push('            <p style="font-size: clamp(0.75rem, 1.4vw, 0.95rem); font-weight: 400; color: #F5E6B8; margin: 0; text-shadow: 0 1px 5px rgba(0,0,0,0.8); font-family: \'Prompt\', sans-serif;">คณะกรรมการป้องกัน และปราบปรามการทุจริต สำหรับนักเรียน โรงเรียนภูเขียว</p>');
        htmlParts.push('          </div>');
        htmlParts.push('        </div>');

        htmlParts.push('      </div>');
    });

    htmlParts.push('    </div>'); // End hero-slider-track

    // Prev / Next Navigation Arrows (show only if more than 1 slide)
    if (heroSlides.length > 1) {
        htmlParts.push('    <button type="button" id="hero-slider-prev" aria-label="สไลด์ก่อนหน้า" style="position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); z-index: 5; background: rgba(107, 33, 168, 0.75); color: #FFFFFF; border: 2px solid #D4A843; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" onmouseover="this.style.background=\'#6B21A8\'; this.style.transform=\'translateY(-50%) scale(1.1)\';" onmouseout="this.style.background=\'rgba(107, 33, 168, 0.75)\'; this.style.transform=\'translateY(-50%) scale(1)\';">');
        htmlParts.push('      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>');
        htmlParts.push('    </button>');

        htmlParts.push('    <button type="button" id="hero-slider-next" aria-label="สไลด์ถัดไป" style="position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); z-index: 5; background: rgba(107, 33, 168, 0.75); color: #FFFFFF; border: 2px solid #D4A843; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s ease; box-shadow: 0 4px 12px rgba(0,0,0,0.4);" onmouseover="this.style.background=\'#6B21A8\'; this.style.transform=\'translateY(-50%) scale(1.1)\';" onmouseout="this.style.background=\'rgba(107, 33, 168, 0.75)\'; this.style.transform=\'translateY(-50%) scale(1)\';">');
        htmlParts.push('      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>');
        htmlParts.push('    </button>');

        // Indicator Dots
        htmlParts.push('    <div id="hero-slider-dots" style="position: absolute; bottom: 1rem; left: 0; right: 0; display: flex; align-items: center; justify-content: center; gap: 8px; z-index: 5;">');
        heroSlides.forEach(function(_, idx) {
            var dotStyle = (idx === 0)
                ? 'width: 28px; background-color: #D4A843; border-radius: 6px;'
                : 'width: 10px; background-color: rgba(255, 255, 255, 0.6); border-radius: 50%;';
            htmlParts.push('      <button type="button" class="hero-slider-dot" data-dot-index="' + idx + '" aria-label="ไปที่สไลด์ที่ ' + (idx + 1) + '" style="height: 10px; border: none; cursor: pointer; transition: all 0.3s ease; padding: 0; ' + dotStyle + '"></button>');
        });
        htmlParts.push('    </div>');
    }

    htmlParts.push('  </div>');
    htmlParts.push('</section>');

    // ------------------------------------------
    // Section 2: Announcement Banner (newstat)
    // ------------------------------------------
    if (announcementBanners && announcementBanners.length > 0) {
        htmlParts.push('<section class="announcement-banner-section" style="margin-bottom: 2rem;">');
        htmlParts.push('  <div style="display: flex; flex-direction: column; gap: 1.25rem;">');

        announcementBanners.forEach(function(banner, bIdx) {
            var bannerImg = PKApp.driveImage(banner.photo || banner.url_image);
            var bannerLink = banner.url || '#/';
            var isExternal = bannerLink.startsWith('http://') || bannerLink.startsWith('https://');
            var targetAttr = isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';

            htmlParts.push('    <div class="announcement-banner-card" style="border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(107, 33, 168, 0.2); border: 2px solid #F5E6B8; transition: transform 0.2s ease, box-shadow 0.2s ease;" onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 14px 30px -5px rgba(107, 33, 168, 0.35)\';" onmouseout="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 10px 25px -5px rgba(107, 33, 168, 0.2)\';">');
            htmlParts.push('      <a href="' + bannerLink + '" ' + targetAttr + ' style="display: block; width: 100%; text-decoration: none;">');
            htmlParts.push('        <img src="' + bannerImg + '" alt="ป้ายประชาสัมพันธ์ด่วน" style="width: 100%; height: auto; max-height: 280px; object-fit: cover; display: block;">');
            htmlParts.push('      </a>');
            htmlParts.push('    </div>');
        });

        htmlParts.push('  </div>');
        htmlParts.push('</section>');
    }

    // ------------------------------------------
    // Section 3: Gold Divider
    // ------------------------------------------
    htmlParts.push(PKApp.home.renderGoldDivider());

    // ------------------------------------------
    // Section 4: Quick Action Buttons (botton)
    // ------------------------------------------
    htmlParts.push('<section class="quick-action-section" style="margin-bottom: 1.5rem;">');
    htmlParts.push('  <div style="text-align: center; margin-bottom: 2rem;">');
    htmlParts.push('    <h2 style="font-size: 1.65rem; font-weight: 700; color: #6B21A8; margin: 0 0 0.5rem; font-family: \'Prompt\', sans-serif;">เมนูลัด / การให้บริการ</h2>');
    htmlParts.push('    <p style="font-size: 0.95rem; color: #4B5563; margin: 0; font-family: \'Prompt\', sans-serif;">เข้าถึงข้อมูลและภารกิจของ ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว ได้อย่างสะดวกรวดเร็ว</p>');
    htmlParts.push('  </div>');

    htmlParts.push('  <div class="quick-action-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.25rem;">');

    actionButtons.forEach(function(btn) {
        var resolved = PKApp.home.resolveButtonRoute(btn.meg, btn.url);
        var targetAttr = resolved.isExternal ? 'target="_blank" rel="noopener noreferrer"' : '';
        var photoVal = (btn.photo || '').trim();
        var isImgPhoto = photoVal.startsWith('http://') || photoVal.startsWith('https://') || /^[a-zA-Z0-9_-]{25,}$/.test(photoVal) || /\.(png|jpg|jpeg|svg|webp)$/i.test(photoVal);

        htmlParts.push('    <a href="' + resolved.path + '" ' + targetAttr + ' class="quick-action-btn" style="text-decoration: none; background: #FFFFFF; border-radius: 18px; padding: 1.25rem 1rem; border: 1.5px solid #DDD6FE; box-shadow: 0 6px 16px rgba(107, 33, 168, 0.08); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.85rem; text-align: center; transition: all 0.25s ease;" onmouseover="this.style.transform=\'translateY(-4px)\'; this.style.borderColor=\'#D4A843\'; this.style.boxShadow=\'0 12px 24px rgba(107, 33, 168, 0.2)\'; this.style.background=\'#FAF5FF\';" onmouseout="this.style.transform=\'translateY(0)\'; this.style.borderColor=\'#DDD6FE\'; this.style.boxShadow=\'0 6px 16px rgba(107, 33, 168, 0.08)\'; this.style.background=\'#FFFFFF\';">');

        // Button Icon/Photo
        if (isImgPhoto) {
            var iconImg = PKApp.driveImage(photoVal);
            htmlParts.push('      <div style="width: 58px; height: 58px; border-radius: 14px; background: #FAF5FF; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 4px; box-shadow: 0 4px 10px rgba(107,33,168,0.1);">');
            htmlParts.push('        <img src="' + iconImg + '" alt="' + PKApp.escapeHtml(btn.meg) + '" style="width: 100%; height: 100%; object-fit: contain;">');
            htmlParts.push('      </div>');
        } else {
            // Emoji or text icon
            var emojiText = photoVal || '📌';
            htmlParts.push('      <div style="width: 58px; height: 58px; border-radius: 14px; background: linear-gradient(135deg, #FAF5FF 0%, #DDD6FE 100%); display: flex; align-items: center; justify-content: center; font-size: 1.85rem; box-shadow: 0 4px 10px rgba(107,33,168,0.1);">');
            htmlParts.push('        ' + emojiText);
            htmlParts.push('      </div>');
        }

        // Button Title
        htmlParts.push('      <span style="font-size: 1rem; font-weight: 600; color: #1F2937; font-family: \'Prompt\', sans-serif; line-height: 1.35;">' + PKApp.escapeHtml(btn.meg) + '</span>');
        htmlParts.push('    </a>');
    });

    htmlParts.push('  </div>');
    htmlParts.push('</section>');

    // ------------------------------------------
    // Section 5: Gold Divider
    // ------------------------------------------
    htmlParts.push(PKApp.home.renderGoldDivider());

    // ------------------------------------------
    // Section 6: Latest News Section (new)
    // ------------------------------------------
    htmlParts.push('<section class="latest-news-section" style="margin-bottom: 2rem;">');
    htmlParts.push('  <div style="text-align: center; margin-bottom: 2.25rem;">');
    htmlParts.push('    <div style="display: inline-flex; align-items: center; gap: 0.5rem; background: #FAF5FF; border: 1px solid #DDD6FE; padding: 0.35rem 1rem; border-radius: 9999px; font-size: 0.85rem; color: #6B21A8; font-weight: 600; margin-bottom: 0.75rem;">');
    htmlParts.push('      <span>อัปเดตความเคลื่อนไหว</span>');
    htmlParts.push('    </div>');
    htmlParts.push('    <h2 style="font-size: 1.85rem; font-weight: 700; color: #6B21A8; margin: 0 0 0.5rem; font-family: \'Prompt\', sans-serif;">ประกาศ/ข่าวสาร ล่าสุด</h2>');
    htmlParts.push('    <p style="font-size: 0.95rem; color: #4B5563; margin: 0; font-family: \'Prompt\', sans-serif;">ติดตามกิจกรรม ข่าวสาร และประกาศสำคัญของ ป.ป.ช.สพฐ.น้อย</p>');
    htmlParts.push('  </div>');

    if (latestNews && latestNews.length > 0) {
        htmlParts.push('  <div class="news-cards-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.75rem;">');

        latestNews.forEach(function(item) {
            var detailRoute = '#/news-detail/' + item.id;
            var imageUrl = PKApp.home.getFirstImageUrl(item.url);
            var safeTitle = PKApp.escapeHtml(item.name || 'ไม่มีหัวข้อข่าว');
            var typeBadge = item.type || 'ข่าวสารทั่วไป';
            var authorName = item.regisname || 'ป.ป.ช.สพฐ.น้อย';
            var dateStr = PKApp.formatThaiDate(item.timestamp, false);

            // Badge color scheme based on news type
            var badgeBg = '#FAF5FF';
            var badgeText = '#6B21A8';
            var badgeBorder = '#DDD6FE';

            if (typeBadge.indexOf('ประกาศ') !== -1) {
                badgeBg = '#FEF3C7';
                badgeText = '#92400E';
                badgeBorder = '#F5E6B8';
            } else if (typeBadge.indexOf('คำสั่ง') !== -1) {
                badgeBg = '#EFF6FF';
                badgeText = '#1E40AF';
                badgeBorder = '#BFDBFE';
            } else if (typeBadge.indexOf('จดหมายข่าว') !== -1) {
                badgeBg = '#ECFDF5';
                badgeText = '#065F46';
                badgeBorder = '#A7F3D0';
            }

            htmlParts.push('    <div class="news-card-item" style="background: #FFFFFF; border-radius: 20px; overflow: hidden; border: 1.5px solid #F3F4F6; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06); display: flex; flex-direction: column; transition: all 0.25s ease;" onmouseover="this.style.transform=\'translateY(-5px)\'; this.style.boxShadow=\'0 20px 35px -8px rgba(107, 33, 168, 0.18)\'; this.style.borderColor=\'#DDD6FE\';" onmouseout="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 10px 25px -5px rgba(0,0,0,0.06)\'; this.style.borderColor=\'#F3F4F6\';">');

            // News Card Image
            htmlParts.push('      <a href="' + detailRoute + '" style="display: block; position: relative; width: 100%; height: 210px; overflow: hidden; background: #F3F4F6; text-decoration: none;">');
            if (imageUrl) {
                htmlParts.push('        <img src="' + imageUrl + '" alt="' + safeTitle + '" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease;" onmouseover="this.style.transform=\'scale(1.06)\';" onmouseout="this.style.transform=\'scale(1)\);">');
            } else {
                htmlParts.push('        <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #FAF5FF 0%, #DDD6FE 100%); color: #6B21A8;">');
                htmlParts.push('          <img src="' + PKApp.LOGO_URL + '" alt="โลโก้" style="width: 52px; height: 52px; object-fit: contain; margin-bottom: 0.5rem; opacity: 0.85;">');
                htmlParts.push('          <span style="font-size: 0.85rem; font-weight: 500; font-family: \'Prompt\', sans-serif;">ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว</span>');
                htmlParts.push('        </div>');
            }

            // Type badge pinned to top-left of image
            htmlParts.push('        <span style="position: absolute; top: 0.85rem; left: 0.85rem; background: ' + badgeBg + '; color: ' + badgeText + '; border: 1px solid ' + badgeBorder + '; font-size: 0.75rem; font-weight: 600; padding: 0.25rem 0.75rem; border-radius: 9999px; box-shadow: 0 2px 6px rgba(0,0,0,0.1); font-family: \'Prompt\', sans-serif;">' + PKApp.escapeHtml(typeBadge) + '</span>');
            htmlParts.push('      </a>');

            // News Card Body
            htmlParts.push('      <div style="padding: 1.35rem 1.35rem 1.25rem; display: flex; flex-direction: column; flex: 1;">');
            htmlParts.push('        <h3 style="margin: 0 0 0.75rem; font-size: 1.05rem; font-weight: 600; line-height: 1.45; font-family: \'Prompt\', sans-serif; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 3rem;">');
            htmlParts.push('          <a href="' + detailRoute + '" style="color: #1F2937; text-decoration: none; transition: color 0.2s;" onmouseover="this.style.color=\'#6B21A8\';" onmouseout="this.style.color=\'#1F2937\';">' + safeTitle + '</a>');
            htmlParts.push('        </h3>');

            // Meta row: Author & Date
            htmlParts.push('        <div style="margin-top: auto; padding-top: 0.85rem; border-top: 1px solid #F3F4F6; display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: #6B7280; font-family: \'Prompt\', sans-serif;">');
            htmlParts.push('          <div style="display: flex; align-items: center; gap: 0.35rem; max-width: 55%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">');
            htmlParts.push('            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink: 0;"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>');
            htmlParts.push('            <span title="' + PKApp.escapeHtml(authorName) + '">' + PKApp.escapeHtml(authorName) + '</span>');
            htmlParts.push('          </div>');

            htmlParts.push('          <div style="display: flex; align-items: center; gap: 0.35rem; flex-shrink: 0;">');
            htmlParts.push('            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>');
            htmlParts.push('            <span>' + dateStr + '</span>');
            htmlParts.push('          </div>');
            htmlParts.push('        </div>');

            htmlParts.push('      </div>'); // End card body
            htmlParts.push('    </div>'); // End card
        });

        htmlParts.push('  </div>');

        // View All News Button
        htmlParts.push('  <div style="text-align: center; margin-top: 2.25rem;">');
        htmlParts.push('    <a href="#/announce" style="display: inline-flex; align-items: center; gap: 0.6rem; padding: 0.75rem 2rem; background: linear-gradient(135deg, #6B21A8 0%, #581C87 100%); color: #FFFFFF; font-weight: 600; font-size: 0.95rem; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(107, 33, 168, 0.3); transition: all 0.25s ease;" onmouseover="this.style.transform=\'translateY(-2px)\'; this.style.boxShadow=\'0 6px 20px rgba(107, 33, 168, 0.45)\';" onmouseout="this.style.transform=\'translateY(0)\'; this.style.boxShadow=\'0 4px 14px rgba(107, 33, 168, 0.3)\';">');
        htmlParts.push('      <span>ดูข่าวสารและประกาศทั้งหมด</span>');
        htmlParts.push('      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>');
        htmlParts.push('    </a>');
        htmlParts.push('  </div>');
    } else {
        htmlParts.push('  <div style="text-align: center; padding: 3rem 1rem; background: #FAF5FF; border-radius: 20px; border: 1.5px dashed #DDD6FE;">');
        htmlParts.push('    <p style="color: #6B21A8; font-size: 1rem; margin: 0 0 0.5rem; font-weight: 500;">ยังไม่มีรายการประกาศ/ข่าวสารในขณะนี้</p>');
        htmlParts.push('    <p style="color: #6B7280; font-size: 0.85rem; margin: 0;">ข่าวสารและกิจกรรมใหม่จะปรากฏที่นี่เมื่อมีการเผยแพร่</p>');
        htmlParts.push('  </div>');
    }

    htmlParts.push('</section>');

    // ------------------------------------------
    // Section 7: Gold Divider
    // ------------------------------------------
    htmlParts.push(PKApp.home.renderGoldDivider());

    // ------------------------------------------
    // Section 8: Visit Statistics Section
    // ------------------------------------------
    htmlParts.push('<section class="statistics-section" style="margin-bottom: 2rem;">');
    htmlParts.push('  <div style="text-align: center; margin-bottom: 2.25rem;">');
    htmlParts.push('    <h2 style="font-size: 1.75rem; font-weight: 700; color: #6B21A8; margin: 0 0 0.5rem; font-family: \'Prompt\', sans-serif;">สถิติการเข้าชม</h2>');
    htmlParts.push('    <p style="font-size: 0.95rem; color: #4B5563; margin: 0; font-family: \'Prompt\', sans-serif;">ข้อมูลสถิติผู้เข้าชมเว็บไซต์ และจำนวนคณะทำงาน ป.ป.ช.สพฐ.น้อย โรงเรียนภูเขียว</p>');
    htmlParts.push('  </div>');

    htmlParts.push('  <div class="statistics-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.75rem;">');

    // Stat Card A: Main Visitors (statis table count)
    htmlParts.push('    <div class="stat-card" style="background: linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%); border-radius: 22px; padding: 2rem 1.5rem; border: 2px solid #DDD6FE; box-shadow: 0 10px 25px -5px rgba(107, 33, 168, 0.12); display: flex; flex-direction: column; align-items: center; text-align: center; transition: all 0.25s ease;" onmouseover="this.style.transform=\'translateY(-4px)\'; this.style.borderColor=\'#D4A843\'; this.style.boxShadow=\'0 15px 30px -5px rgba(107, 33, 168, 0.25)\';" onmouseout="this.style.transform=\'translateY(0)\'; this.style.borderColor=\'#DDD6FE\'; this.style.boxShadow=\'0 10px 25px -5px rgba(107, 33, 168, 0.12)\';">');
    htmlParts.push('      <div style="width: 64px; height: 64px; border-radius: 50%; background: #FAF5FF; border: 2px solid #DDD6FE; color: #6B21A8; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(107, 33, 168, 0.15);">');
    htmlParts.push('        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>');
    htmlParts.push('      </div>');
    htmlParts.push('      <span style="font-size: 2.5rem; font-weight: 800; color: #6B21A8; line-height: 1.1; margin-bottom: 0.5rem; font-family: \'Prompt\', sans-serif;">' + Number(statVisitors).toLocaleString('th-TH') + '</span>');
    htmlParts.push('      <h3 style="font-size: 1.05rem; font-weight: 600; color: #374151; margin: 0 0 0.25rem; font-family: \'Prompt\', sans-serif;">ผู้เยี่ยมชมหน้าหลัก</h3>');
    htmlParts.push('      <span style="font-size: 0.8rem; color: #9CA3AF; font-family: \'Prompt\', sans-serif;">บันทึกการเข้าชมทั้งหมด</span>');
    htmlParts.push('    </div>');

    // Stat Card B: Board Members (mamberNACC table count for max year)
    var boardSubtitle = boardMaxYear ? ('ปีการศึกษา ' + boardMaxYear) : 'คณะกรรมการชุดปัจจุบัน';
    htmlParts.push('    <div class="stat-card" style="background: linear-gradient(135deg, #FFFFFF 0%, #FFFBEB 100%); border-radius: 22px; padding: 2rem 1.5rem; border: 2px solid #F5E6B8; box-shadow: 0 10px 25px -5px rgba(212, 168, 67, 0.15); display: flex; flex-direction: column; align-items: center; text-align: center; transition: all 0.25s ease;" onmouseover="this.style.transform=\'translateY(-4px)\'; this.style.borderColor=\'#D4A843\'; this.style.boxShadow=\'0 15px 30px -5px rgba(212, 168, 67, 0.3)\';" onmouseout="this.style.transform=\'translateY(0)\'; this.style.borderColor=\'#F5E6B8\'; this.style.boxShadow=\'0 10px 25px -5px rgba(212, 168, 67, 0.15)\';">');
    htmlParts.push('      <div style="width: 64px; height: 64px; border-radius: 50%; background: #FEF3C7; border: 2px solid #F5E6B8; color: #D4A843; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(212, 168, 67, 0.2);">');
    htmlParts.push('        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>');
    htmlParts.push('      </div>');
    htmlParts.push('      <span style="font-size: 2.5rem; font-weight: 800; color: #D4A843; line-height: 1.1; margin-bottom: 0.5rem; font-family: \'Prompt\', sans-serif;">' + Number(statBoard).toLocaleString('th-TH') + '</span>');
    htmlParts.push('      <h3 style="font-size: 1.05rem; font-weight: 600; color: #374151; margin: 0 0 0.25rem; font-family: \'Prompt\', sans-serif;">จำนวนคณะกรรมการ ป.ป.ช.สพฐ.น้อย</h3>');
    htmlParts.push('      <span style="font-size: 0.8rem; color: #9CA3AF; font-family: \'Prompt\', sans-serif;">' + boardSubtitle + '</span>');
    htmlParts.push('    </div>');

    // Stat Card C: Sub-board / Classroom Reps (ANACC table count for max year)
    var subBoardSubtitle = subBoardMaxYear ? ('ปีการศึกษา ' + subBoardMaxYear) : 'อนุกรรมการชุดปัจจุบัน';
    htmlParts.push('    <div class="stat-card" style="background: linear-gradient(135deg, #FFFFFF 0%, #FAF5FF 100%); border-radius: 22px; padding: 2rem 1.5rem; border: 2px solid #DDD6FE; box-shadow: 0 10px 25px -5px rgba(107, 33, 168, 0.12); display: flex; flex-direction: column; align-items: center; text-align: center; transition: all 0.25s ease;" onmouseover="this.style.transform=\'translateY(-4px)\'; this.style.borderColor=\'#D4A843\'; this.style.boxShadow=\'0 15px 30px -5px rgba(107, 33, 168, 0.25)\';" onmouseout="this.style.transform=\'translateY(0)\'; this.style.borderColor=\'#DDD6FE\'; this.style.boxShadow=\'0 10px 25px -5px rgba(107, 33, 168, 0.12)\';">');
    htmlParts.push('      <div style="width: 64px; height: 64px; border-radius: 50%; background: #FAF5FF; border: 2px solid #DDD6FE; color: #6B21A8; display: flex; align-items: center; justify-content: center; margin-bottom: 1rem; box-shadow: 0 4px 12px rgba(107, 33, 168, 0.15);">');
    htmlParts.push('        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"></path><path d="M2 17l10 5 10-5"></path><path d="M2 12l10 5 10-5"></path></svg>');
    htmlParts.push('      </div>');
    htmlParts.push('      <span style="font-size: 2.5rem; font-weight: 800; color: #6B21A8; line-height: 1.1; margin-bottom: 0.5rem; font-family: \'Prompt\', sans-serif;">' + Number(statSubBoard).toLocaleString('th-TH') + '</span>');
    htmlParts.push('      <h3 style="font-size: 1.05rem; font-weight: 600; color: #374151; margin: 0 0 0.25rem; font-family: \'Prompt\', sans-serif;">จำนวนอนุกรรมการ ป.ป.ช.สพฐ.น้อย</h3>');
    htmlParts.push('      <span style="font-size: 0.8rem; color: #9CA3AF; font-family: \'Prompt\', sans-serif;">' + subBoardSubtitle + '</span>');
    htmlParts.push('    </div>');

    htmlParts.push('  </div>');
    htmlParts.push('</section>');

    // ------------------------------------------
    // Section 10: Final Gold Divider
    // ------------------------------------------
    htmlParts.push(PKApp.home.renderGoldDivider());

    htmlParts.push('</div>'); // End home-view-container

    // Render into DOM
    container.innerHTML = htmlParts.join('\n');

    // ==========================================
    // Attach Slider Event Handlers & Auto-play
    // ==========================================
    if (heroSlides.length > 1) {
        var slideElements = container.querySelectorAll('.hero-slide-item');
        var dotElements = container.querySelectorAll('.hero-slider-dot');
        var prevBtn = document.getElementById('hero-slider-prev');
        var nextBtn = document.getElementById('hero-slider-next');
        var sliderTrack = document.getElementById('hero-slider-track');

        function goToSlide(targetIdx) {
            if (targetIdx < 0) {
                targetIdx = slideElements.length - 1;
            } else if (targetIdx >= slideElements.length) {
                targetIdx = 0;
            }

            PKApp.home._currentSlideIndex = targetIdx;

            // Update slide visibilities
            slideElements.forEach(function(el, i) {
                if (i === targetIdx) {
                    el.style.opacity = '1';
                    el.style.pointerEvents = 'auto';
                    el.style.zIndex = '2';
                } else {
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                    el.style.zIndex = '1';
                }
            });

            // Update dots
            dotElements.forEach(function(dot, i) {
                if (i === targetIdx) {
                    dot.style.width = '28px';
                    dot.style.backgroundColor = '#D4A843';
                    dot.style.borderRadius = '6px';
                } else {
                    dot.style.width = '10px';
                    dot.style.backgroundColor = 'rgba(255, 255, 255, 0.6)';
                    dot.style.borderRadius = '50%';
                }
            });
        }

        function startAutoSlide() {
            if (PKApp.home._sliderInterval) {
                clearInterval(PKApp.home._sliderInterval);
            }
            PKApp.home._sliderInterval = setInterval(function() {
                goToSlide(PKApp.home._currentSlideIndex + 1);
            }, 5000);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                goToSlide(PKApp.home._currentSlideIndex - 1);
                startAutoSlide(); // Reset auto timer
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                goToSlide(PKApp.home._currentSlideIndex + 1);
                startAutoSlide(); // Reset auto timer
            });
        }

        dotElements.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var idx = parseInt(dot.getAttribute('data-dot-index'), 10);
                if (!isNaN(idx)) {
                    goToSlide(idx);
                    startAutoSlide();
                }
            });
        });

        // Pause on hover
        if (sliderTrack) {
            sliderTrack.addEventListener('mouseenter', function() {
                if (PKApp.home._sliderInterval) {
                    clearInterval(PKApp.home._sliderInterval);
                    PKApp.home._sliderInterval = null;
                }
            });
            sliderTrack.addEventListener('mouseleave', function() {
                startAutoSlide();
            });

            // Touch swipe support for mobile devices
            var touchStartX = 0;
            var touchEndX = 0;
            sliderTrack.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            sliderTrack.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                if (touchStartX - touchEndX > 50) {
                    // Swiped Left -> Next
                    goToSlide(PKApp.home._currentSlideIndex + 1);
                    startAutoSlide();
                } else if (touchEndX - touchStartX > 50) {
                    // Swiped Right -> Prev
                    goToSlide(PKApp.home._currentSlideIndex - 1);
                    startAutoSlide();
                }
            }, { passive: true });
        }

        // Launch auto-slide (5s)
        startAutoSlide();
    }
};
