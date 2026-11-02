/* ============================================================
   ระบบแต่งตั้งคณะกรรมการดำเนินงานศิลปหัตกรรมนักเรียน ปีการศึกษา 2569
   Front-end Application (เชื่อมต่อ Google Apps Script + Google Sheets)
   ============================================================ */

(function () {
  'use strict';

  var CONFIG = window.SILLAPA_CONFIG || {};
  var API_URL = (CONFIG.APPS_SCRIPT_URL || '').trim();
  var ALLOW_MULTI = !!CONFIG.ALLOW_MULTIPLE_EVENTS;
  var DEMO = !API_URL;

  var state = {
    user: null,        // { phone, name, school, subject, position, acadStd, email }
    meta: null,        // { titles, schools, positions, acadStds, subjects, competitions }
    currentEvent: null // ชื่อรายการที่เปิดดูอยู่
  };

  /* ================= Helper ทั่วไป ================= */

  function $(sel) { return document.querySelector(sel); }
  function $$(sel) { return Array.prototype.slice.call(document.querySelectorAll(sel)); }

  function digitsOnly(s) { return String(s || '').replace(/\D/g, ''); }

  function formatPhone(d) {
    d = digitsOnly(d);
    if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return d;
  }

  // ผูก input เบอร์โทรให้พิมพ์แล้วได้รูปแบบ ###-###-####
  function bindPhoneInput(input) {
    input.addEventListener('input', function () {
      var pos = input.selectionStart;
      var before = input.value;
      input.value = formatPhone(input.value);
      // ปรับตำแหน่ง cursor อย่างง่าย ๆ
      if (input.value.length > before.length && pos === before.length) pos = input.value.length;
      try { input.setSelectionRange(pos, pos); } catch (e) { /* noop */ }
    });
  }

  function toast(msg, type) {
    var el = $('#toast');
    el.textContent = msg;
    el.className = 'toast show' + (type ? ' ' + type : '');
    clearTimeout(el._t);
    el._t = setTimeout(function () { el.className = 'toast'; }, 4200);
  }

  // ซ่อน toast ค้างอยู่ทันที (เมื่อเปลี่ยนหน้า / เปิดโมดัล เพื่อไม่ให้บังเนื้อหา)
  function hideToast() {
    var el = $('#toast');
    clearTimeout(el._t);
    el.className = 'toast';
  }

  var AUTH_VIEWS = ['login', 'register', 'forgot'];

  function showView(id) {
    hideToast();
    $$('.view').forEach(function (v) { v.classList.add('hidden'); });
    var view = $('#view-' + id);
    if (view) view.classList.remove('hidden');
    // โหมดหน้ายืนยันตัว: ซ่อน header/nav/footer แสดง split-screen เต็มจอ
    document.body.classList.toggle('auth-mode', AUTH_VIEWS.indexOf(id) !== -1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function escapeHtml(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&').replace(/</g, '<').replace(/>/g, '>')
      .replace(/"/g, '"').replace(/'/g, '&#39;');
  }

  function isValidEmail(s) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || '').trim()); }

  // ตัวอักษรเท่านั้น (ไทย/อังกฤษ/เว้นวรรค) ห้ามมีตัวเลข
  function isLettersOnly(s) {
    return /^[A-Za-z\u0E00-\u0E7F\s.]+$/.test(String(s || '').trim()) && /[A-Za-z\u0E00-\u0E7F]/.test(s);
  }

  function checkPassword(pw) {
    if (!pw || pw.length < 8) return { ok: false, msg: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
    if (!/[0-9]/.test(pw)) return { ok: false, msg: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' };
    if (!/[A-Za-z\u0E00-\u0E7F]/.test(pw)) return { ok: false, msg: 'รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว' };
    if (!/[^0-9A-Za-z\u0E00-\u0E7F]/.test(pw)) return { ok: false, msg: 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว' };
    return { ok: true };
  }

  /* ================= ชั้นเรียก API ================= */

  function api(action, data) {
    if (DEMO) return Promise.resolve(mockApi(action, data));
    return fetch(API_URL, {
      method: 'POST',
      // ใช้ text/plain เพื่อเลี่ยง CORS preflight
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(Object.assign({ action: action }, data || {}))
    })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.text();
      })
      .then(function (txt) {
        try { return JSON.parse(txt); } catch (e) { throw new Error('รูปแบบข้อมูลไม่ถูกต้อง'); }
      })
      .then(function (res) {
        if (res && res.ok === false) throw new Error(res.error || 'เกิดข้อผิดพลาด');
        return res;
      });
  }

  /* ================= โหมดตัวอย่าง (Demo) ================= */

  var demoData = {
    titles: ['นาย', 'น.ส.', 'นาง', 'ดร.', 'ผศ.'],
    schools: ['โรงเรียนภูเขียว', 'โรงเรียนชัยภูมิภักดีชุมพล', 'โรงเรียนบ้านแท่นศึกษาภักดี', 'โรงเรียนจัตุรัสวิทยานุกฤต', 'โรงเรียนหนองบัววิทยา'],
    positions: ['ครู คศ.2', 'ครู คศ.3', 'ครูใหญ่', 'ศึกษานิเทศน์'],
    acadStds: ['ไม่มี', 'ชำนาญการพิเศษ', 'เชี่ยวชาญ', 'เชี่ยวชาญพิเศษ'],
    subjects: ['คอมพิวเตอร์', 'ภาษาไทย', 'คณิตศาสตร์', 'ศิลปะ-ดนตรี', 'วิทยาศาสตร์', 'สังคมศึกษา'],
    competitions: [
      { name: 'การแข่งขันคอมพิวเตอร์กราฟิก (Computer Graphics)', date: '20 มกราคม 2570', venue: 'โรงเรียนภูเขียว', quota: 5, taken: 2 },
      { name: 'การแข่งขันเรียงความภาษาไทย ระดับเขตพื้นที่', date: '25 มกราคม 2570', venue: 'โรงเรียนชัยภูมิภักดีชุมพล', quota: 3, taken: 3 },
      { name: 'การแข่งขันโครงงานวิทยาศาสตร์ (วิทย์-คณิต)', date: '1 กุมภาพันธ์ 2570', venue: 'โรงเรียนภูเขียว', quota: 4, taken: 1 }
    ],
    positionsPerEvent: {
      'การแข่งขันคอมพิวเตอร์กราฟิก (Computer Graphics)': ['ประธานกรรมการ', 'กรรมการ', 'กรรมการ'],
      'การแข่งขันเรียงความภาษาไทย ระดับเขตพื้นที่': ['ประธานกรรมการ', 'กรรมการ', 'กรรมการ'],
      'การแข่งขันโครงงานวิทยาศาสตร์ (วิทย์-คณิต)': ['ประธานกรรมการ', 'กรรมการ', 'กรรมการ']
    },
    users: {
      '0812345678': { password: 'Pass@123', name: 'นายสมชาย ใจดี', school: 'โรงเรียนภูเขียว', position: 'ครู คศ.3', acadStd: 'ชำนาญการพิเศษ', subject: 'คอมพิวเตอร์', email: 'somchai@example.com' }
    },
    applicants: {
      'การแข่งขันคอมพิวเตอร์กราฟิก (Computer Graphics)': [
        { name: 'นายประเสริฐ มงคลดี', subject: 'คอมพิวเตอร์', position: 'ประธานกรรมการ', school: 'โรงเรียนภูเขียว', time: '2026-11-01 09:15:22', phone: '0801112223' },
        { name: 'น.ส.สุนิสา รักษ์ไทย', subject: 'ศิลปะ-ดนตรี', position: 'กรรมการ', school: 'โรงเรียนจัตุรัสวิทยานุกฤต', time: '2026-11-01 10:02:41', phone: '0804445556' }
      ],
      'การแข่งขันเรียงความภาษาไทย ระดับเขตพื้นที่': [
        { name: 'นางสมศรี ภูมิใจไทย', subject: 'ภาษาไทย', position: 'ประธานกรรมการ', school: 'โรงเรียนบ้านแท่นศึกษาภักดี', time: '2026-10-30 14:33:10', phone: '0817778889' },
        { name: 'นายอนันต์ ชัยชนะ', subject: 'สังคมศึกษา', position: 'กรรมการ', school: 'โรงเรียนหนองบัววิทยา', time: '2026-10-31 08:44:05', phone: '0823334445' },
        { name: 'น.ส.กนกพร แสงทอง', subject: 'ภาษาไทย', position: 'กรรมการ', school: 'โรงเรียนชัยภูมิภักดีชุมพล', time: '2026-10-31 16:20:58', phone: '0839990001' }
      ],
      'การแข่งขันโครงงานวิทยาศาสตร์ (วิทย์-คณิต)': [
        { name: 'ดร.วิชัย นักวิจัยดี', subject: 'วิทยาศาสตร์', position: 'ประธานกรรมการ', school: 'โรงเรียนภูเขียว', time: '2026-11-01 11:30:00', phone: '0845556667' }
      ]
    }
  };

  function mockApi(action, data) {
    data = data || {};
    switch (action) {
      case 'meta':
        return { ok: true, titles: demoData.titles, schools: demoData.schools, positions: demoData.positions, acadStds: demoData.acadStds, subjects: demoData.subjects, competitions: demoData.competitions.map(function (c) { return Object.assign({}, c); }) };
      case 'login': {
        var u = demoData.users[digitsOnly(data.phone)];
        if (!u) return { ok: false, error: 'ไม่พบเบอร์โทรศัพท์นี้ในระบบ กรุณาลงทะเบียนก่อน' };
        if (u.password !== data.password) return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง' };
        return { ok: true, user: { phone: digitsOnly(data.phone), name: u.name, school: u.school, position: u.position, acadStd: u.acadStd, subject: u.subject, email: u.email } };
      }
      case 'register':
        if (demoData.users[digitsOnly(data.phone)]) return { ok: false, error: 'เบอร์โทรศัพท์นี้ลงทะเบียนแล้ว' };
        demoData.users[digitsOnly(data.phone)] = {
          password: data.password, name: data.fullName,
          school: data.school, position: data.position, acadStd: data.acadStd,
          subject: data.subject, email: data.email
        };
        return { ok: true };
      case 'forgot': {
        var fu = demoData.users[digitsOnly(data.phone)];
        if (!fu || fu.email !== data.email) return { ok: false, error: 'เบอร์โทรศัพท์หรือ E-mail ไม่ตรงกับข้อมูลที่ลงทะเบียน' };
        return { ok: true, password: fu.password };
      }
      case 'event': {
        var ev = data.event;
        var comp = demoData.competitions.filter(function (c) { return c.name === ev; })[0];
        if (!comp) return { ok: false, error: 'ไม่พบรายการแข่งขันนี้' };
        var apps = (demoData.applicants[ev] || []).map(function (a) { return Object.assign({}, a); });
        var used = {};
        apps.forEach(function (a) { if (a.position !== 'กรรมการ') used[a.position] = true; });
        var pos = (demoData.positionsPerEvent[ev] || []).map(function (p, i) {
          return { name: p, taken: !!used[p] && p !== 'กรรมการ', isJudge: p === 'กรรมการ', no: i + 1 };
        });
        return { ok: true, event: comp, applicants: apps, positions: pos };
      }
      case 'apply': {
        var ev2 = data.event;
        var comp2 = demoData.competitions.filter(function (c) { return c.name === ev2; })[0];
        var list2 = demoData.applicants[ev2] || [];
        if (list2.length >= comp2.quota) return { ok: false, error: 'รายการนี้สมัครเต็มตามจำนวนที่กำหนดแล้ว (ปิดรับสมัคร)' };
        if (list2.some(function (a) { return a.phone === digitsOnly(data.phone); })) return { ok: false, error: 'ท่านสมัครรายการนี้ไปแล้ว' };
        if (!ALLOW_MULTI) {
          for (var k in demoData.applicants) {
            if (demoData.applicants[k].some(function (a) { return a.phone === digitsOnly(data.phone); })) {
              return { ok: false, error: 'ท่านได้สมัครไปแล้ว 1 รายการ ("' + k + '") สามารถสมัครได้เพียง 1 รายการเท่านั้น' };
            }
          }
        }
        if (data.position !== 'กรรมการ' && list2.some(function (a) { return a.position === data.position; })) {
          return { ok: false, error: 'ตำแหน่งนี้มีผู้เลือกไปแล้ว กรุณาเลือกตำแหน่งอื่น' };
        }
        var u2 = demoData.users[digitsOnly(data.phone)];
        list2.push({ name: u2.name, subject: u2.subject, position: data.position, school: u2.school, time: new Date().toISOString().slice(0, 19).replace('T', ' '), phone: digitsOnly(data.phone) });
        comp2.taken = list2.length;
        return { ok: true };
      }
      case 'mine': {
        var mine = [];
        for (var k2 in demoData.applicants) {
          demoData.applicants[k2].forEach(function (a) {
            if (a.phone === digitsOnly(data.phone)) mine.push({ event: k2, position: a.position, time: a.time });
          });
        }
        return { ok: true, applications: mine };
      }
      default:
        return { ok: false, error: 'ไม่รองรับคำสั่งนี้ในโหมดตัวอย่าง' };
    }
  }

  /* ================= จัดการ Session ================= */
  // เก็บ session ในหน่วยความจำ + cookie (รองรับทั้ง GitHub Pages และสภาพแวดล้อมจำกัด)
  var _memStore = {};

  function storageSet(key, val) {
    _memStore[key] = val;
    try {
      document.cookie = 'sillapa_' + key + '=' + encodeURIComponent(val) + '; path=/; max-age=7200; SameSite=Lax';
    } catch (e) { /* noop */ }
  }

  function storageGet(key) {
    if (_memStore[key] !== undefined) return _memStore[key];
    try {
      var m = document.cookie.match(new RegExp('(?:^|;\\s*)sillapa_' + key + '=([^;]*)'));
      if (m) return decodeURIComponent(m[1]);
    } catch (e) { /* noop */ }
    return null;
  }

  function storageRemove(key) {
    delete _memStore[key];
    try {
      document.cookie = 'sillapa_' + key + '=; path=/; max-age=0';
    } catch (e) { /* noop */ }
  }

  function saveSession(user) {
    storageSet('session', JSON.stringify(user));
  }

  function loadSession() {
    try {
      var s = storageGet('session');
      if (s) return JSON.parse(s);
    } catch (e) { /* noop */ }
    return null;
  }

  function clearSession() {
    storageRemove('session');
  }

  function onLoggedIn(user) {
    state.user = user;
    saveSession(user);
    $('#user-name').textContent = user.name;
    $('#user-box').classList.remove('hidden');
    $('#main-nav').classList.remove('hidden');
    if (DEMO) $('#demo-badge').classList.remove('hidden');
    showView('events');
    loadEvents();
  }

  function logout() {
    state.user = null;
    clearSession();
    $('#user-box').classList.add('hidden');
    $('#main-nav').classList.add('hidden');
    $('#demo-badge').classList.add('hidden');
    $$('.view').forEach(function (v) { v.classList.add('hidden'); });
    $('#view-login').classList.remove('hidden');
    document.body.classList.add('auth-mode');
    $('#login-phone').value = '';
    $('#login-password').value = '';
  }

  /* ================= หน้าเข้าสู่ระบบ ================= */

  function initLogin() {
    bindPhoneInput($('#login-phone'));
    bindPhoneInput($('#reg-phone'));
    bindPhoneInput($('#forgot-phone'));

    $('#form-login').addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = digitsOnly($('#login-phone').value);
      var pw = $('#login-password').value;
      if (phone.length !== 10) { toast('กรุณากรอกเบอร์โทรศัพท์ให้ครบ 10 หลัก', 'error'); return; }
      if (!pw) { toast('กรุณากรอกรหัสผ่าน', 'error'); return; }
      var btn = $('#btn-login');
      btn.disabled = true; btn.textContent = 'กำลังตรวจสอบ...';
      api('login', { phone: phone, password: pw })
        .then(function (res) {
          toast('ยินดีต้อนรับ ' + res.user.name, 'success');
          onLoggedIn(res.user);
        })
        .catch(function (err) { toast(err.message || 'เข้าสู่ระบบไม่สำเร็จ', 'error'); })
        .then(function () { btn.disabled = false; btn.textContent = 'เข้าสู่ระบบ'; });
    });
  }

  /* ================= หน้าลงทะเบียน ================= */

  function fillSelect(sel, items, placeholder) {
    sel.innerHTML = '';
    if (placeholder) {
      var op = document.createElement('option');
      op.value = '';
      op.textContent = placeholder;
      sel.appendChild(op);
    }
    (items || []).forEach(function (it) {
      var o = document.createElement('option');
      o.value = it;
      o.textContent = it;
      sel.appendChild(o);
    });
  }

  function initRegister() {
    $('#link-register').addEventListener('click', function () { showView('register'); });
    $('#link-register-inline').addEventListener('click', function () { showView('register'); });
    $('#btn-reg-back').addEventListener('click', function () { showView('login'); });

    // โหลดรายการตัวเลือกจากแผ่นงาน list
    api('meta').then(function (meta) {
      state.meta = meta;
      fillSelect($('#reg-title'), meta.titles, '— เลือกคำนำหน้า —');
      fillSelect($('#reg-school'), meta.schools, '— เลือกโรงเรียน —');
      fillSelect($('#reg-position'), meta.positions, '— เลือกตำแหน่ง —');
      fillSelect($('#reg-acad'), meta.acadStds, '— ไม่ระบุ —');
      fillSelect($('#reg-subject'), meta.subjects, '— เลือกสาขาวิชา —');
    }).catch(function (err) { toast('โหลดข้อมูลรายการไม่สำเร็จ: ' + err.message, 'error'); });

    // เช็กลิสต์เงื่อนไขรหัสผ่านแบบสด ๆ ระบุชัดว่าผ่าน/ขาดข้อไหน
    var PW_RULES = {
      len: function (v) { return v.length >= 8; },
      num: function (v) { return /[0-9]/.test(v); },
      alpha: function (v) { return /[A-Za-z\u0E00-\u0E7F]/.test(v); },
      special: function (v) { return /[^0-9A-Za-z\u0E00-\u0E7F]/.test(v); }
    };

    function updatePwChecklist() {
      var v = $('#reg-password').value;
      $$('#pw-checklist li').forEach(function (li) {
        var rule = PW_RULES[li.dataset.rule];
        var ok = !!v && rule(v);
        li.classList.toggle('ok', ok);
        li.classList.toggle('miss', !!v && !ok);
        li.querySelector('.pc-ic').textContent = ok ? '✓' : '✕';
      });
      updatePw2Hint();
    }

    function updatePw2Hint() {
      var hint = $('#pw2-hint');
      var v = $('#reg-password').value;
      var v2 = $('#reg-password2').value;
      if (!v2) { hint.textContent = ''; hint.className = 'hint'; return; }
      if (v === v2) { hint.textContent = '✓ รหัสผ่านตรงกัน'; hint.className = 'hint ok'; }
      else { hint.textContent = '✕ รหัสผ่านยังไม่ตรงกัน'; hint.className = 'hint err'; }
    }

    $('#reg-password').addEventListener('input', updatePwChecklist);
    $('#reg-password2').addEventListener('input', updatePw2Hint);
    updatePwChecklist();

    $('#form-register').addEventListener('submit', function (e) {
      e.preventDefault();
      var title = $('#reg-title').value;
      var first = $('#reg-first').value.trim();
      var middle = $('#reg-middle').value.trim();
      var last = $('#reg-last').value.trim();
      var school = $('#reg-school').value;
      var phone = digitsOnly($('#reg-phone').value);
      var email = $('#reg-email').value.trim();
      var position = $('#reg-position').value;
      var acadStd = $('#reg-acad').value;
      var subject = $('#reg-subject').value;
      var pw = $('#reg-password').value;
      var pw2 = $('#reg-password2').value;

      // ตรวจสอบความถูกต้อง
      if (!title) return toast('กรุณาเลือกคำนำหน้าชื่อ', 'error');
      if (!isLettersOnly(first)) return toast('ชื่อ ให้กรอกเป็นตัวหนังสือเท่านั้น (ห้ามตัวเลข)', 'error');
      if (middle && !isLettersOnly(middle)) return toast('ชื่อกลาง ให้กรอกเป็นตัวหนังสือเท่านั้น', 'error');
      if (!isLettersOnly(last)) return toast('สกุล ให้กรอกเป็นตัวหนังสือเท่านั้น (ห้ามตัวเลข)', 'error');
      if (!school) return toast('กรุณาเลือกโรงเรียน', 'error');
      if (phone.length !== 10) return toast('เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก', 'error');
      if (!isValidEmail(email)) return toast('รูปแบบ E-mail ไม่ถูกต้อง (ต้องมี @)', 'error');
      if (!position) return toast('กรุณาเลือกตำแหน่ง', 'error');
      if (!subject) return toast('กรุณาเลือกสาขาวิชา', 'error');

      var pc = checkPassword(pw);
      if (!pc.ok) return toast(pc.msg, 'error');
      if (pw !== pw2) return toast('รหัสผ่านยืนยันไม่ตรงกัน', 'error');

      // สร้างชื่อเต็ม: คำนำหน้า + ชื่อ + " " + ชื่อกลาง + " " + สกุล
      var fullName = title + first + (middle ? ' ' + middle : '') + ' ' + last;

      var btn = $('#btn-register');
      btn.disabled = true; btn.textContent = 'กำลังบันทึก...';
      api('register', {
        title: title, first: first, middle: middle, last: last,
        fullName: fullName, school: school, phone: phone,
        email: email, position: position, acadStd: acadStd, subject: subject,
        password: pw
      }).then(function () {
        toast('ลงทะเบียนสำเร็จ กรุณาเข้าสู่ระบบ', 'success');
        showView('login');
        $('#login-phone').value = formatPhone(phone);
        $('#login-password').focus();
      }).catch(function (err) {
        toast(err.message || 'ลงทะเบียนไม่สำเร็จ', 'error');
      }).then(function () { btn.disabled = false; btn.textContent = 'ลงทะเบียน'; });
    });
  }

  /* ================= หน้าลืมรหัสผ่าน ================= */

  function initForgot() {
    $('#link-forgot').addEventListener('click', function () { showView('forgot'); });
    $('#link-back-login').addEventListener('click', function () { showView('login'); });

    $('#form-forgot').addEventListener('submit', function (e) {
      e.preventDefault();
      var phone = digitsOnly($('#forgot-phone').value);
      var email = $('#forgot-email').value.trim();
      if (phone.length !== 10) return toast('กรุณากรอกเบอร์โทรศัพท์ 10 หลัก', 'error');
      if (!isValidEmail(email)) return toast('รูปแบบ E-mail ไม่ถูกต้อง', 'error');
      var btn = $('#btn-forgot');
      btn.disabled = true; btn.textContent = 'กำลังค้นหา...';
      api('forgot', { phone: phone, email: email })
        .then(function (res) {
          hideToast();
          $('#modal-text').textContent = 'รหัสผ่านของเบอร์ ' + formatPhone(phone) + ' คือ';
          $('#modal-pw').textContent = res.password;
          $('#modal-forgot').classList.remove('hidden');
        })
        .catch(function (err) { toast(err.message || 'ไม่พบข้อมูลผู้ใช้นี้', 'error'); })
        .then(function () { btn.disabled = false; btn.textContent = 'ขอรหัสผ่าน'; });
    });

    $('#modal-close').addEventListener('click', function () {
      $('#modal-forgot').classList.add('hidden');
    });
  }

  /* ================= หน้ารายการแข่งขัน ================= */

  function loadEvents() {
    var grid = $('#events-grid');
    grid.innerHTML = '<div class="loading" style="grid-column:1/-1"><div class="spinner"></div>กำลังโหลดรายการแข่งขัน...</div>';
    api('meta').then(function (meta) {
      state.meta = meta;
      return api('mine', { phone: state.user.phone });
    }).then(function (res) {
      renderEvents(state.meta.competitions, res.applications || []);
    }).catch(function (err) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">⚠️</div>โหลดรายการไม่สำเร็จ: ' + escapeHtml(err.message) + '</div>';
    });
  }

  function renderEvents(competitions, myApplications) {
    var grid = $('#events-grid');
    var box = $('#my-apply-box');

    // แสดงสถานะการสมัครของผู้ใช้
    if (myApplications && myApplications.length) {
      box.classList.remove('hidden');
      box.innerHTML = '✅ <strong>ท่านสมัครแล้ว:</strong> ' + myApplications.map(function (a) {
        return escapeHtml(a.event) + ' (ตำแหน่ง: ' + escapeHtml(a.position) + ')';
      }).join(' · ');
    } else {
      box.classList.add('hidden');
    }

    if (!competitions.length) {
      grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1"><div class="icon">📋</div>ยังไม่มีรายการแข่งขันในระบบ</div>';
      return;
    }

    grid.innerHTML = '';
    competitions.forEach(function (c) {
      var closed = c.taken >= c.quota;
      var card = document.createElement('div');
      card.className = 'event-card' + (closed ? ' closed' : '');
      card.innerHTML =
        '<span class="badge ' + (closed ? 'badge-full' : 'badge-open') + '">' + (closed ? 'ปิดรับสมัคร' : 'เปิดรับสมัคร') + '</span>' +
        '<h3>' + escapeHtml(c.name) + '</h3>' +
        '<div class="event-meta">' +
        '<span>📅 วันที่แข่งขัน: <strong>' + escapeHtml(c.date || '-') + '</strong></span>' +
        '<span>📍 สถานที่: <strong>' + escapeHtml(c.venue || '-') + '</strong></span>' +
        '</div>' +
        '<div class="quota-bar"><div class="quota-fill" style="width:' + Math.min(100, (c.taken / Math.max(1, c.quota)) * 100) + '%"></div></div>' +
        '<div class="quota-text">สมัครแล้ว ' + c.taken + ' / ' + c.quota + ' คน</div>' +
        '<button class="btn ' + (closed ? 'btn-ghost' : 'btn-primary') + '" ' + (closed ? 'disabled' : '') + '>' + (closed ? 'สมัครเต็มแล้ว' : 'เลือกรายการนี้') + '</button>';
      card.querySelector('.btn').addEventListener('click', function () {
        openEvent(c.name);
      });
      grid.appendChild(card);
    });
  }

  /* ================= หน้ารายละเอียดรายการ ================= */

  function openEvent(name) {
    state.currentEvent = name;
    showView('event');
    var detail = $('#event-detail');
    detail.innerHTML = '<div class="loading"><div class="spinner"></div>กำลังโหลดข้อมูลรายการ...</div>';
    api('event', { event: name }).then(function (res) {
      renderEventDetail(res);
    }).catch(function (err) {
      detail.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div>' + escapeHtml(err.message) + '</div>';
    });
  }

  function renderEventDetail(res) {
    var ev = res.event;
    var apps = res.applicants || [];
    var positions = res.positions || [];
    var closed = ev.taken >= ev.quota;
    var myApplied = apps.some(function (a) { return a.phone === state.user.phone; });
    var alreadyElsewhere = false;
    var alreadyPos = '';

    // ถ้าไม่อนุญาตให้สมัครหลายรายการ ให้ตรวจกับข้อมูลที่ดึงมาแล้ว (ในหน้าหลัก)
    // การตรวจจริงจะเกิดที่ฝั่ง Apps Script อีกครั้งเมื่อกดสมัคร

    var html = '';

    // การ์ดข้อมูลรายการ
    html += '<div class="detail-card">' +
      '<h2>' + escapeHtml(ev.name) + '</h2>' +
      '<div class="detail-grid">' +
      '<div class="detail-item"><span class="k">วันที่แข่งขัน</span><span class="v">' + escapeHtml(ev.date || '-') + '</span></div>' +
      '<div class="detail-item"><span class="k">สถานที่แข่งขัน</span><span class="v">' + escapeHtml(ev.venue || '-') + '</span></div>' +
      '<div class="detail-item"><span class="k">จำนวนที่รับสมัคร</span><span class="v">' + ev.taken + ' / ' + ev.quota + ' คน</span></div>' +
      '<div class="detail-item"><span class="k">สถานะ</span><span class="v" style="color:' + (closed ? 'var(--color-danger)' : 'var(--color-success)') + '">' + (closed ? 'ปิดรับสมัคร (สมัครเต็มแล้ว)' : 'เปิดรับสมัคร') + '</span></div>' +
      '</div></div>';

    // รายชื่อผู้สมัครทั้งหมด
    html += '<h3 class="section-title">รายชื่อผู้สมัครทั้งหมด (' + apps.length + ' คน)</h3>';
    if (apps.length) {
      html += '<div class="table-wrap"><table><thead><tr><th class="num-col">ลำดับ</th><th>รายชื่อ - สกุล</th><th>สาขาวิชา</th><th>ตำแหน่งที่สมัคร</th><th>โรงเรียน</th></tr></thead><tbody>';
      apps.forEach(function (a, i) {
        html += '<tr><td class="num-col">' + (i + 1) + '</td><td>' + escapeHtml(a.name) + '</td><td>' + escapeHtml(a.subject) + '</td><td>' + escapeHtml(a.position) + '</td><td>' + escapeHtml(a.school) + '</td></tr>';
      });
      html += '</tbody></table></div>';
    } else {
      html += '<div class="empty-state"><div class="icon">👥</div>ยังไม่มีผู้สมัครในรายการนี้</div>';
    }

    // แบบฟอร์มเลือกตำแหน่ง
    html += '<h3 class="section-title">เลือกตำแหน่งคณะกรรมการ (เลือกได้คนละตำแหน่ง ยกเว้น "กรรมการ" ที่รับได้หลายท่าน)</h3>';
    if (closed) {
      html += '<div class="empty-state"><div class="icon">⛔</div>รายการนี้สมัครเต็มตามจำนวนที่กำหนดแล้ว จึงปิดรับการสมัคร</div>';
    } else if (myApplied) {
      html += '<div class="my-apply" style="margin:0">✅ <strong>ท่านสมัครรายการนี้แล้ว</strong> — หากต้องการเปลี่ยนแปลง กรุณาติดต่อผู้ดูแลระบบ</div>';
    } else {
      html += '<div class="position-list">';
      positions.forEach(function (p) {
        var dis = p.taken;
        html += '<label class="pos-item' + (dis ? ' disabled' : '') + '">' +
          '<input type="radio" name="pos" value="' + escapeHtml(p.name) + '" ' + (dis ? 'disabled' : '') + ' data-no="' + p.no + '">' +
          '<span><span class="pos-name">' + escapeHtml(p.no) + ') ' + escapeHtml(p.name) + '</span>' +
          '<span class="pos-status ' + (dis ? 'taken' : 'open') + '">' + (dis ? 'มีผู้เลือกแล้ว' : 'ยังว่าง') + (p.isJudge ? ' (รับได้หลายท่าน)' : '') + '</span></span></label>';
      });
      html += '</div>';
      html += '<button class="btn btn-primary" id="btn-apply">ยืนยันการสมัครในรายการนี้</button>';
    }

    var detail = $('#event-detail');
    detail.innerHTML = html;

    // ไฮไลต์ตัวเลือกที่เลือก
    $$('#event-detail input[name="pos"]').forEach(function (r) {
      r.addEventListener('change', function () {
        $$('.pos-item').forEach(function (el) { el.classList.remove('selected'); });
        if (r.checked) r.closest('.pos-item').classList.add('selected');
      });
    });

    var applyBtn = $('#btn-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', function () {
        var checked = $('#event-detail input[name="pos"]:checked');
        if (!checked) return toast('กรุณาเลือกตำแหน่งก่อนสมัคร', 'error');
        var position = checked.value;
        applyBtn.disabled = true; applyBtn.textContent = 'กำลังบันทึกการสมัคร...';
        api('apply', { phone: state.user.phone, event: ev.name, position: position })
          .then(function () {
            toast('สมัครเป็นกรรมการสำเร็จ: ' + ev.name, 'success');
            openEvent(ev.name);   // รีเฟรชหน้า
            loadEvents();         // อัปเดตหน้าหลักด้วย
          })
          .catch(function (err) {
            toast(err.message || 'สมัครไม่สำเร็จ', 'error');
            // อาจเป็นเพราะตำแหน่งถูกเลือกไปแล้ว ให้รีเฟรช
            openEvent(ev.name);
          });
      });
    }
  }

  /* ================= หน้ารายชื่อผู้สมัคร (ผลการสมัคร) ================= */

  function initResults() {
    $('#btn-export-excel').addEventListener('click', exportExcel);
    $('#btn-export-pdf').addEventListener('click', exportPdf);
  }

  function loadResults() {
    var sel = $('#results-select');
    sel.innerHTML = '<option value="">— กำลังโหลด —</option>';
    api('meta').then(function (meta) {
      state.meta = meta;
      sel.innerHTML = '';
      meta.competitions.forEach(function (c) {
        var o = document.createElement('option');
        o.value = c.name;
        o.textContent = c.name + ' (' + c.taken + '/' + c.quota + ')';
        sel.appendChild(o);
      });
      if (meta.competitions.length) {
        state.currentEvent = meta.competitions[0].name;
        sel.value = state.currentEvent;
        renderResultsFor(state.currentEvent);
      } else {
        $('#results-body').innerHTML = '<div class="empty-state"><div class="icon">📋</div>ยังไม่มีรายการแข่งขัน</div>';
      }
    }).catch(function (err) {
      $('#results-body').innerHTML = '<div class="empty-state"><div class="icon">⚠️</div>' + escapeHtml(err.message) + '</div>';
    });
  }

  function renderResultsFor(name) {
    state.currentEvent = name;
    var body = $('#results-body');
    body.innerHTML = '<div class="loading"><div class="spinner"></div>กำลังโหลดรายชื่อ...</div>';
    api('event', { event: name }).then(function (res) {
      var apps = res.applicants || [];
      var ev = res.event;
      var html = '<div class="detail-card"><h2>' + escapeHtml(ev.name) + '</h2>' +
        '<div class="detail-grid">' +
        '<div class="detail-item"><span class="k">วันที่แข่งขัน</span><span class="v">' + escapeHtml(ev.date || '-') + '</span></div>' +
        '<div class="detail-item"><span class="k">สถานที่</span><span class="v">' + escapeHtml(ev.venue || '-') + '</span></div>' +
        '<div class="detail-item"><span class="k">ผู้สมัคร</span><span class="v">' + apps.length + ' / ' + ev.quota + ' คน</span></div>' +
        '</div></div>';
      if (apps.length) {
        html += '<div class="table-wrap"><table id="results-table"><thead><tr><th class="num-col">ลำดับ</th><th>รายชื่อ - สกุล</th><th>สาขาวิชา</th><th>ตำแหน่งที่สมัคร</th><th>โรงเรียน</th></tr></thead><tbody>';
        apps.forEach(function (a, i) {
          html += '<tr><td class="num-col">' + (i + 1) + '</td><td>' + escapeHtml(a.name) + '</td><td>' + escapeHtml(a.subject) + '</td><td>' + escapeHtml(a.position) + '</td><td>' + escapeHtml(a.school) + '</td></tr>';
        });
        html += '</tbody></table></div>';
      } else {
        html += '<div class="empty-state"><div class="icon">👥</div>ยังไม่มีผู้สมัครในรายการนี้</div>';
      }
      body.innerHTML = html;
    }).catch(function (err) {
      body.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div>' + escapeHtml(err.message) + '</div>';
    });
  }

  /* ================= ส่งออก Excel ================= */

  function exportExcel() {
    var table = $('#results-table');
    if (!table) return toast('ยังไม่มีข้อมูลให้ส่งออก', 'error');
    if (typeof XLSX === 'undefined') return toast('ไม่สามารถโหลดไลบรารีส่งออก Excel ได้ (ตรวจสอบอินเทอร์เน็ต)', 'error');

    var wb = XLSX.utils.book_new();

    // หัวเรื่อง (3 บรรทัดแรก) + ตารางข้อมูล
    var rows = XLSX.utils.sheet_to_json(XLSX.utils.table_to_sheet(table), { header: 1 });
    var aoa = [
      ['รายชื่อผู้สมัครคณะกรรมการ: ' + state.currentEvent],
      ['แต่งตั้งคณะกรรมการดำเนินงานศิลปหัตกรรมนักเรียน ปีการศึกษา 2569'],
      ['ระดับสำนักงานเขตพื้นที่การศึกษา สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาชัยภูมิ'],
      []
    ].concat(rows);
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อผู้สมัคร');

    var fname = 'รายชื่อผู้สมัคร-' + String(state.currentEvent).replace(/[\\/:*?"<>|]/g, '-') + '.xlsx';
    XLSX.writeFile(wb, fname);
    toast('ส่งออกไฟล์ Excel เรียบร้อย', 'success');
  }

  /* ================= ส่งออก PDF (ผ่านการพิมพ์) ================= */

  function exportPdf() {
    var table = $('#results-table');
    if (!table) return toast('ยังไม่มีข้อมูลให้ส่งออก', 'error');

    var ev = null;
    if (state.meta && state.meta.competitions) {
      ev = state.meta.competitions.filter(function (c) { return c.name === state.currentEvent; })[0];
    }

    var html = '<!DOCTYPE html><html lang="th"><head><meta charset="UTF-8">' +
      '<title>รายชื่อผู้สมัคร - ' + escapeHtml(state.currentEvent) + '</title>' +
      '<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">' +
      '<style>' +
      'body { font-family: "Sarabun", sans-serif; color: #3d2e14; margin: 24px; }' +
      '.head { text-align: center; margin-bottom: 6px; }' +
      '.head h2 { margin: 0; color: #a83d00; }' +
      '.head p { margin: 2px 0; font-size: 13px; }' +
      '.meta { display: flex; justify-content: center; gap: 24px; font-size: 13px; margin: 10px 0 16px; }' +
      'table { border-collapse: collapse; width: 100%; font-size: 13px; }' +
      'th, td { border: 1px solid #b98a2e; padding: 6px 10px; text-align: left; }' +
      'th { background: #fff3d6; color: #a83d00; }' +
      '.num { text-align: center; width: 40px; }' +
      '.footer { margin-top: 24px; text-align: center; font-size: 11px; color: #8a7a55; }' +
      '@page { size: A4 landscape; margin: 12mm; }' +
      '</style></head><body>' +
      '<div class="head">' +
      '<h2>รายชื่อผู้สมัครคณะกรรมการการตัดสินผลการแข่งขัน</h2>' +
      '<p><b>' + escapeHtml(state.currentEvent) + '</b></p>' +
      '<p>แต่งตั้งคณะกรรมการดำเนินงานศิลปหัตกรรมนักเรียน ปีการศึกษา 2569</p>' +
      '<p>ระดับสำนักงานเขตพื้นที่การศึกษา สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาชัยภูมิ</p>' +
      '<p>ศูนย์พัฒนาวิชาการวิทยาศาสตร์และเทคโนโลยี โรงเรียนภูเขียว อำเภอภูเขียว จังหวัดชัยภูมิ</p>' +
      '</div>' +
      (ev ? '<div class="meta"><span>วันที่แข่งขัน: <b>' + escapeHtml(ev.date || '-') + '</b></span><span>สถานที่: <b>' + escapeHtml(ev.venue || '-') + '</b></span><span>สมัครแล้ว: <b>' + ev.taken + '/' + ev.quota + '</b> คน</span></div>' : '') +
      '<table><thead><tr><th class="num">ลำดับ</th><th>รายชื่อ - สกุล</th><th>สาขาวิชา</th><th>ตำแหน่งที่สมัคร</th><th>โรงเรียน</th></tr></thead><tbody>' +
      $('#results-table tbody').innerHTML +
      '</tbody></table>' +
      '<p class="footer">© SILLAPA CHAIYAPHUM 2026 ALL RIGHTS RESERVED — พิมพ์วันที่ ' + new Date().toLocaleString('th-TH') + '</p>' +
      '</body></html>';

    // สร้าง iframe ที่ซ่อนไว้แล้วสั่งพิมพ์ (เลี่ยง popup blocker)
    var old = document.getElementById('print-frame');
    if (old) old.remove();
    var frame = document.createElement('iframe');
    frame.id = 'print-frame';
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;visibility:hidden;';
    document.body.appendChild(frame);
    frame.srcdoc = html;
    frame.onload = function () {
      setTimeout(function () {
        try {
          frame.contentWindow.focus();
          frame.contentWindow.print();
        } catch (e) {
          toast('เบราว์เซอร์ไม่อนุญาตให้พิมพ์อัตโนมัติ กรุณาลองอีกครั้ง', 'error');
        }
      }, 350);
    };
    toast('เลือก "บันทึกเป็น PDF" ในหน้าต่างการพิมพ์', 'success');
  }

  /* ================= เมนูหลัก / เหตุการณ์ทั่วไป ================= */

  function initNav() {
    $$('.nav-link').forEach(function (btn) {
      btn.addEventListener('click', function () {
        $$('.nav-link').forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
        if (btn.dataset.nav === 'events') { showView('events'); loadEvents(); }
        if (btn.dataset.nav === 'results') { showView('results'); loadResults(); }
      });
    });
    $('#btn-logout').addEventListener('click', logout);
    $('#btn-back-events').addEventListener('click', function () { showView('events'); loadEvents(); });

    // ติดตามการเปลี่ยนรายการในหน้าผลการสมัคร
    $('#results-select').addEventListener('change', function () {
      if (this.value) renderResultsFor(this.value);
    });
  }

  // ปุ่มสลับแสดงรหัสผ่าน
  function initToggles() {
    $$('.toggle-eye').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var input = document.getElementById(btn.dataset.toggle);
        if (input) input.type = input.type === 'password' ? 'text' : 'password';
      });
    });
  }

  /* ================= เริ่มทำงาน ================= */

  document.addEventListener('DOMContentLoaded', function () {
    initLogin();
    initRegister();
    initForgot();
    initNav();
    initResults();
    initToggles();

    var sess = loadSession();
    if (sess && sess.phone) {
      // ตรวจ session เดิมกับเซิร์ฟเวอร์ (ดึงข้อมูลผู้ใช้ล่าสุด)
      api('mine', { phone: sess.phone }).then(function () {
        onLoggedIn(sess);
      }).catch(function () {
        // หากตรวจไม่ได้ ให้เริ่มใหม่ที่หน้าล็อกอิน
        clearSession();
        showView('login');
      });
    } else {
      showView('login');
    }
  });
})();
