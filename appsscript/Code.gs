/**
 * ============================================================
 * ระบบแต่งตั้งคณะกรรมการดำเนินงานศิลปหัตกรรมนักเรียน ปีการศึกษา 2569
 * Google Apps Script (Backend) — เชื่อมต่อ Google Sheets
 * ------------------------------------------------------------
 * วิธีใช้งาน:
 * 1) เปิด Google Spreadsheet ที่ใช้เป็นฐานข้อมูล
 * 2) เมนู Extensions (ส่วนขยาย) > Apps Script แล้ววางโค้ดนี้ทั้งหมด
 * 3) Deploy > New deployment > Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4) คัดลอก URL ที่ลงท้ายด้วย /exec ไปใส่ในไฟล์ js/config.js
 * ------------------------------------------------------------
 * โครงสร้างแผ่นงาน (ต้องตรงตามนี้):
 *
 * แผ่นงาน "admin" (ข้อมูลผู้ใช้)
 *   A: เบอร์โทร (USERNAME 10 หลัก)
 *   B: รหัสผ่าน
 *   C: ชื่อ - สกุล (คำนำหน้า+ชื่อ+ชื่อกลาง+สกุล)
 *   D: โรงเรียน
 *   E: ตำแหน่ง
 *   F: วิทยฐานะ
 *   G: สาขาวิชา
 *   H: เบอร์โทร (รูปแบบ ###-###-####)
 *   I: E-mail
 *
 * แผ่นงาน "list" (ข้อมูลอ้างอิง)
 *   A: คำนำหน้าชื่อ
 *   B: โรงเรียน
 *   C: ตำแหน่ง
 *   D: วิทยฐานะ
 *   E: สาขาวิชา
 *   F: รายการแข่งขัน
 *   G: วันที่แข่งขัน (แถวเดียวกับ F)
 *   H: สถานที่แข่งขัน (แถวเดียวกับ F)
 *   I: จำนวนที่รับสมัคร (แถวเดียวกับ F)
 *   J: ตำแหน่งกรรมการ (คั่นด้วยเครื่องหมาย , เช่น ประธานกรรมการ,กรรมการ,กรรมการ)
 *
 * แผ่นงาน "save" (บันทึกการสมัคร)
 *   A: วันที่-เวลาที่สมัคร
 *   B: เบอร์โทรผู้สมัคร
 *   C: รายการแข่งขัน
 *   D: ชื่อ - สกุล
 *   E: โรงเรียน
 *   F: สาขาวิชา
 *   G: ตำแหน่งที่สมัคร
 *   H: E-mail
 * ============================================================
 */

// ⚙️ ตั้งค่าระบบ
var SPREADSHEET_ID = '1eTcOADESoLJxH19uEpErAfnF_rYJC3ZoTLml9IsViRQ'; // ID ของ Google Sheet ฐานข้อมูล
var SHEET_ADMIN = 'admin';
var SHEET_LIST = 'list';
var SHEET_SAVE = 'save';

// ตำแหน่ง "กรรมการ" สมัครได้หลายคน / ตำแหน่งอื่นรับได้คนเดียวต่อรายการ
var UNLIMITED_POSITIONS = ['กรรมการ'];
// ผู้ใช้ 1 คน สมัครได้กี่รายการ (false = 1 รายการเท่านั้น)
var ALLOW_MULTIPLE_EVENTS = false;
// อนุญาตให้แสดงรหัสผ่านบนหน้าจอเมื่อลืมรหัส (นอกจากนี้จะส่งอีเมลแจ้งเสมอ)
var SHOW_PASSWORD_ON_FORGOT = true;

/* ================== จุดเข้า API ================== */

function doPost(e) {
  var req;
  try {
    req = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut({ ok: false, error: 'รูปแบบคำขอไม่ถูกต้อง' });
  }
  return handleRequest(req);
}

// รองรับ GET (เผื่อใช้ทดสอบ) เช่น ?action=meta
function doGet(e) {
  var req = {};
  var p = e.parameter || {};
  for (var k in p) {
    if (k === 'action') continue;
    try { req[k] = p[k]; } catch (err) { req[k] = p[k]; }
  }
  req.action = p.action || 'meta';
  return handleRequest(req);
}

function handleRequest(req) {
  var out;
  var lock = null;
  try {
    switch (req.action) {
      case 'meta': out = actionMeta(); break;
      case 'login': out = actionLogin(req); break;
      case 'register': out = actionRegister(req); break;
      case 'forgot': out = actionForgot(req); break;
      case 'event': out = actionEvent(req); break;
      case 'apply': out = actionApply(req); break;
      case 'mine': out = actionMine(req); break;
      default: out = { ok: false, error: 'ไม่รองรับคำสั่ง: ' + req.action };
    }
  } catch (err) {
    out = { ok: false, error: 'เกิดข้อผิดพลาดภายในเซิร์ฟเวอร์: ' + (err && err.message ? err.message : err) };
  }
  return jsonOut(out);
}

function jsonOut(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ================== ตัวช่วย ================== */

function getSS() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getRows(sheetName) {
  var sh = getSS().getSheetByName(sheetName);
  if (!sh) throw new Error('ไม่พบแผ่นงาน "' + sheetName + '" ใน Google Sheet');
  var values = sh.getDataRange().getValues();
  var rows = [];
  for (var i = 1; i < values.length; i++) { // ข้ามแถวหัวตาราง (แถว 1)
    var row = values[i];
    // ถ้าแถวว่างทั้งหมดให้ข้าม
    if (row.join('') === '') continue;
    rows.push(row);
  }
  return rows;
}

function digitsOnly(s) {
  return String(s == null ? '' : s).replace(/\D/g, '');
}

// บังคับให้บันทึกเป็น "ข้อความ" กัน Google Sheets ตัดเลข 0 หน้าเบอร์โทร
function text(v) {
  return "'" + String(v == null ? '' : v);
}

// อ่านเบอร์โทร: ถ้า Google Sheet เคยเก็บเป็นตัวเลขจน 0 หน้าหาย (เหลือ 9 หลัก) ให้เติม 0 กลับ
function normPhone(v) {
  var p = digitsOnly(v);
  if (p.length === 9) p = '0' + p;
  return p;
}

function formatPhoneDisplay(d) {
  d = digitsOnly(d);
  if (d.length === 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
  return d;
}

function nowString() {
  var tz = getSS().getSpreadsheetTimeZone();
  return Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd HH:mm:ss');
}

function uniqueSorted(arr) {
  var seen = {};
  var out = [];
  arr.forEach(function (x) {
    var s = String(x == null ? '' : x).trim();
    if (s !== '' && !seen[s]) { seen[s] = true; out.push(s); }
  });
  return out;
}

// ตำแหน่งที่สมัครได้หลายคน (เช่น "กรรมการ")
function isUnlimitedPosition(name) {
  var n = String(name || '').trim();
  return UNLIMITED_POSITIONS.indexOf(n) !== -1;
}

// อ่านรายการแข่งขันทั้งหมดจากแผ่นงาน list (คอลัมน์ F)
function readCompetitions() {
  var rows = getRows(SHEET_LIST);
  var comps = [];
  rows.forEach(function (r) {
    var name = String(r[5] == null ? '' : r[5]).trim();
    if (!name) return;
    comps.push({
      name: name,
      date: String(r[6] == null ? '' : r[6]).trim(),
      venue: String(r[7] == null ? '' : r[7]).trim(),
      quota: parseInt(r[8], 10) || 0
    });
  });
  return comps;
}

// อ่านการสมัครทั้งหมดจากแผ่นงาน save
function readSaves() {
  var rows = getRows(SHEET_SAVE);
  var saves = [];
  rows.forEach(function (r) {
    var phone = normPhone(r[1]);
    if (!phone) return;
    saves.push({
      time: String(r[0] == null ? '' : r[0]),
      phone: phone,
      event: String(r[2] == null ? '' : r[2]).trim(),
      name: String(r[3] == null ? '' : r[3]).trim(),
      school: String(r[4] == null ? '' : r[4]).trim(),
      subject: String(r[5] == null ? '' : r[5]).trim(),
      position: String(r[6] == null ? '' : r[6]).trim(),
      email: String(r[7] == null ? '' : r[7]).trim()
    });
  });
  return saves;
}

function savesOfEvent(eventName, saves) {
  return (saves || readSaves()).filter(function (s) { return s.event === eventName; });
}

/* ================== action: meta ==================
 * ดึงข้อมูลอ้างอิง + รายการแข่งขันทั้งหมด (พร้อมสถานะเปิด/ปิด)
 */
function actionMeta() {
  var listRows = getRows(SHEET_LIST);
  var saves = readSaves();
  var comps = readCompetitions();

  // เพิ่มจำนวนผู้สมัครและสถานะปิดรับ
  comps.forEach(function (c) {
    var n = saves.filter(function (s) { return s.event === c.name; }).length;
    c.taken = n;
    c.closed = (c.quota > 0 && n >= c.quota);
  });

  return {
    ok: true,
    titles: uniqueSorted(listRows.map(function (r) { return r[0]; })),
    schools: uniqueSorted(listRows.map(function (r) { return r[1]; })),
    positions: uniqueSorted(listRows.map(function (r) { return r[2]; })),
    acadStds: uniqueSorted(listRows.map(function (r) { return r[3]; })),
    subjects: uniqueSorted(listRows.map(function (r) { return r[4]; })),
    competitions: comps
  };
}

/* ================== action: login ==================
 * ตรวจ USERNAME (เบอร์โทร A2:A) + PASSWORD (B2:B)
 */
function actionLogin(req) {
  var phone = digitsOnly(req.phone);
  var password = String(req.password == null ? '' : req.password);
  if (phone.length !== 10) return { ok: false, error: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก' };

  var rows = getRows(SHEET_ADMIN);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (normPhone(r[0]) !== phone) continue;
    if (String(r[1] == null ? '' : r[1]) !== password) {
      return { ok: false, error: 'รหัสผ่านไม่ถูกต้อง' };
    }
    return {
      ok: true,
      user: {
        phone: phone,
        name: String(r[2] == null ? '' : r[2]).trim(),
        school: String(r[3] == null ? '' : r[3]).trim(),
        position: String(r[4] == null ? '' : r[4]).trim(),
        acadStd: String(r[5] == null ? '' : r[5]).trim(),
        subject: String(r[6] == null ? '' : r[6]).trim(),
        email: String(r[8] == null ? '' : r[8]).trim()
      }
    };
  }
  return { ok: false, error: 'ไม่พบเบอร์โทรศัพท์นี้ในระบบ หากยังไม่เคยลงทะเบียนให้กดลงทะเบียนก่อน' };
}

/* ================== action: register ==================
 * บันทึกข้อมูลลงแผ่นงาน admin
 */
function actionRegister(req) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var phone = digitsOnly(req.phone);
    var email = String(req.email == null ? '' : req.email).trim();
    var password = String(req.password == null ? '' : req.password);

    // ตรวจสอบข้อมูล
    if (phone.length !== 10) return { ok: false, error: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก' };
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: 'รูปแบบ E-mail ไม่ถูกต้อง' };
    if (!checkPasswordServer(password).ok) return checkPasswordServer(password);
    if (req.password2 !== undefined && req.password2 !== password) {
      return { ok: false, error: 'การยืนยันรหัสผ่านไม่ตรงกัน' };
    }

    // ตรวจเบอร์ซ้ำ
    var rows = getRows(SHEET_ADMIN);
    for (var i = 0; i < rows.length; i++) {
      if (normPhone(rows[i][0]) === phone) {
        return { ok: false, error: 'เบอร์โทรศัพท์นี้ลงทะเบียนในระบบแล้ว หากลืมรหัสผ่านใช้เมนู "ลืมรหัสผ่าน"' };
      }
    }

    // บันทึกลงแผ่นงาน admin (A-I)
    var ss = getSS();
    var sh = ss.getSheetByName(SHEET_ADMIN);
    if (!sh) return { ok: false, error: 'ไม่พบแผ่นงาน admin' };
    sh.appendRow([
      text(phone),                             // A เบอร์โทร (USERNAME) เก็บเป็นข้อความ
      password,                                // B รหัสผ่าน
      req.fullName,                           // C ชื่อ-สกุล
      req.school,                             // D โรงเรียน
      req.position,                           // E ตำแหน่ง
      req.acadStd,                            // F วิทยฐานะ
      req.subject,                            // G สาขาวิชา
      formatPhoneDisplay(phone),              // H เบอร์โทร (###-###-####)
      email                                   // I E-mail
    ]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

function checkPasswordServer(pw) {
  if (!pw || pw.length < 8) return { ok: false, error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' };
  if (!/[0-9]/.test(pw)) return { ok: false, error: 'รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว' };
  if (!/[A-Za-z\u0E00-\u0E7F]/.test(pw)) return { ok: false, error: 'รหัสผ่านต้องมีตัวอักษรอย่างน้อย 1 ตัว' };
  if (!/[^0-9A-Za-z\u0E00-\u0E7F]/.test(pw)) return { ok: false, error: 'รหัสผ่านต้องมีอักขระพิเศษอย่างน้อย 1 ตัว' };
  return { ok: true };
}

/* ================== action: forgot ==================
 * ลืมรหัสผ่าน: ตรวจเบอร์โทร + E-mail ที่ตรงกับตอนลงทะเบียน
 */
function actionForgot(req) {
  var phone = digitsOnly(req.phone);
  var email = String(req.email == null ? '' : req.email).trim();
  if (phone.length !== 10) return { ok: false, error: 'เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก' };

  var rows = getRows(SHEET_ADMIN);
  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];
    if (normPhone(r[0]) !== phone) continue;
    if (String(r[8] == null ? '' : r[8]).trim().toLowerCase() !== email.toLowerCase()) {
      return { ok: false, error: 'E-mail ไม่ตรงกับข้อมูลที่ลงทะเบียนไว้' };
    }
    var password = String(r[1] == null ? '' : r[1]);
    // ส่งรหัสผ่านไปที่อีเมล (ถ้า MailApp ใช้ได้)
    try {
      MailApp.sendEmail({
        to: email,
        subject: 'แจ้งรหัสผ่าน — ระบบแต่งตั้งคณะกรรมการศิลปหัตกรรมนักเรียน ปีการศึกษา 2569',
        htmlBody: '<p>เรียน ' + String(r[2]) + '</p>' +
          '<p>รหัสผ่านของท่านคือ: <b style="font-size:18px">' + password + '</b></p>' +
          '<p style="color:#888">© SILLAPA CHAIYAPHUM 2026 ALL RIGHTS RESERVED</p>'
      });
    } catch (err) {
      // ถ้าส่งอีเมลไม่ได้ จะแสดงบนหน้าจอแทน (ถ้าอนุญาต)
    }
    return {
      ok: true,
      password: SHOW_PASSWORD_ON_FORGOT ? password : '(ระบบได้ส่งรหัสผ่านไปที่ E-mail ของท่านแล้ว)',
      sentEmail: true
    };
  }
  return { ok: false, error: 'ไม่พบเบอร์โทรศัพท์นี้ในระบบ' };
}

/* ================== action: event ==================
 * ดึงรายละเอียดรายการแข่งขัน + ผู้สมัครทั้งหมด + ตำแหน่งที่เลือกได้
 */
function actionEvent(req) {
  var eventName = String(req.event == null ? '' : req.event).trim();
  var comps = readCompetitions();
  var comp = null;
  for (var i = 0; i < comps.length; i++) {
    if (comps[i].name === eventName) { comp = comps[i]; break; }
  }
  if (!comp) return { ok: false, error: 'ไม่พบรายการแข่งขันนี้' };

  // ตำแหน่งกรรมการของรายการนี้จากแผ่นงาน list คอลัมน์ J
  var listRows = getRows(SHEET_LIST);
  var posRaw = [];
  for (var j = 0; j < listRows.length; j++) {
    if (String(listRows[j][5] == null ? '' : listRows[j][5]).trim() === eventName) {
      posRaw = String(listRows[j][9] == null ? '' : listRows[j][9]).split(/[,;\n]/);
      break;
    }
  }
  var positions = [];
  posRaw.forEach(function (p) {
    var name = String(p == null ? '' : p).trim();
    if (name !== '') positions.push(name);
  });

  // ผู้สมัครทั้งหมดของรายการนี้
  var apps = savesOfEvent(eventName);
  var takenCount = {};
  apps.forEach(function (a) {
    if (!isUnlimitedPosition(a.position)) takenCount[a.position] = (takenCount[a.position] || 0) + 1;
  });

  var posList = positions.map(function (p, idx) {
    return {
      no: idx + 1,
      name: p,
      isJudge: isUnlimitedPosition(p),
      taken: !isUnlimitedPosition(p) && (takenCount[p] || 0) > 0
    };
  });

  return {
    ok: true,
    event: {
      name: comp.name, date: comp.date, venue: comp.venue,
      quota: comp.quota, taken: apps.length, closed: comp.quota > 0 && apps.length >= comp.quota
    },
    applicants: apps.map(function (a) {
      return {
        name: a.name, subject: a.subject, position: a.position,
        school: a.school, time: a.time, phone: a.phone
      };
    }),
    positions: posList
  };
}

/* ================== action: apply ==================
 * บันทึกการสมัครลงแผ่นงาน save (พร้อมวันที่-เวลา)
 * ปิดรับทันทีเมื่อครบโควตา / ตำแหน่งที่ถูกเลือกแล้วเลือกไม่ได้อีก (ยกเว้น "กรรมการ")
 */
function actionApply(req) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    var phone = digitsOnly(req.phone);
    var eventName = String(req.event == null ? '' : req.event).trim();
    var position = String(req.position == null ? '' : req.position).trim();
    if (phone.length !== 10) return { ok: false, error: 'ข้อมูลผู้ใช้ไม่ถูกต้อง (กรุณาเข้าสู่ระบบใหม่)' };

    // หาข้อมูลผู้ใช้จาก admin
    var adminRows = getRows(SHEET_ADMIN);
    var user = null;
    for (var i = 0; i < adminRows.length; i++) {
      if (normPhone(adminRows[i][0]) === phone) { user = adminRows[i]; break; }
    }
    if (!user) return { ok: false, error: 'ไม่พบข้อมูลผู้ใช้ในระบบ (กรุณาเข้าสู่ระบบใหม่)' };

    // หารายการแข่งขัน
    var comps = readCompetitions();
    var comp = null;
    for (var c = 0; c < comps.length; c++) {
      if (comps[c].name === eventName) { comp = comps[c]; break; }
    }
    if (!comp) return { ok: false, error: 'ไม่พบรายการแข่งขันนี้' };

    // ผู้สมัครปัจจุบันของรายการ
    var apps = savesOfEvent(eventName);

    // ปิดรับเมื่อครบจำนวนที่กำหนด
    if (comp.quota > 0 && apps.length >= comp.quota) {
      return { ok: false, error: 'รายการนี้สมัครเต็มตามจำนวนที่กำหนดแล้ว (ปิดรับสมัคร)' };
    }

    // ตรวจสมัครรายการนี้ซ้ำ
    for (var a = 0; a < apps.length; a++) {
      if (apps[a].phone === phone) {
        return { ok: false, error: 'ท่านสมัครรายการนี้ไปแล้ว' };
      }
    }

    // ถ้ากำหนดให้สมัครได้ 1 รายการ ตรวจทุกรายการ
    if (!ALLOW_MULTIPLE_EVENTS) {
      var allSaves = readSaves();
      for (var s = 0; s < allSaves.length; s++) {
        if (allSaves[s].phone === phone) {
          return { ok: false, error: 'ท่านได้สมัครไปแล้ว 1 รายการ ("' + allSaves[s].event + '") กำหนดให้สมัครได้เพียง 1 รายการเท่านั้น' };
        }
      }
    }

    // ตรวจตำแหน่ง: ตำแหน่งที่มีคนเลือกแล้วเลือกไม่ได้ (ยกเว้นกรรมการ)
    if (!isUnlimitedPosition(position)) {
      for (var t = 0; t < apps.length; t++) {
        if (apps[t].position === position) {
          return { ok: false, error: 'ตำแหน่ง "' + position + '" มีผู้เลือกไปแล้วในรายการนี้ กรุณาเลือกตำแหน่งอื่น' };
        }
      }
    }

    // บันทึกลงแผ่นงาน save (A-H)
    var ss = getSS();
    var sh = ss.getSheetByName(SHEET_SAVE);
    if (!sh) return { ok: false, error: 'ไม่พบแผ่นงาน save' };
    sh.appendRow([
      text(nowString()),                      // A วันที่-เวลาที่สมัคร (เก็บเป็นข้อความ)
      text(phone),                             // B เบอร์โทรผู้สมัคร เก็บเป็นข้อความ
      eventName,                              // C รายการแข่งขัน
      String(user[2] == null ? '' : user[2]).trim(), // D ชื่อ-สกุล
      String(user[3] == null ? '' : user[3]).trim(), // E โรงเรียน
      String(user[6] == null ? '' : user[6]).trim(), // F สาขาวิชา
      position,                               // G ตำแหน่งที่สมัคร
      String(user[8] == null ? '' : user[8]).trim()  // H E-mail
    ]);
    return { ok: true };
  } finally {
    lock.releaseLock();
  }
}

/* ================== action: mine ==================
 * รายการที่ผู้ใช้รายนี้สมัครไว้
 */
function actionMine(req) {
  var phone = digitsOnly(req.phone);
  var saves = readSaves().filter(function (s) { return s.phone === phone; });
  return {
    ok: true,
    applications: saves.map(function (s) {
      return { event: s.event, position: s.position, time: s.time };
    })
  };
}
