/**
 * =========================================================================
 * โครงการ: แต่งตั้งคณะกรรมการดำเนินงานศิลปหัตถกรรมนักเรียน ปีการศึกษา 2569
 * ระดับสำนักงานเขตพื้นที่การศึกษา สำนักงานเขตพื้นที่การศึกษามัธยมศึกษาชัยภูมิ
 * ศูนย์พัฒนาวิชาการวิทยาศาสตร์ และเทคโนโลยี โรงเรียนภูเขียว อำเภอภูเขียว จังหวัดชัยภูมิ
 * =========================================================================
 */

var SPREADSHEET_ID = "1eTcOADESoLJxH19uEpErAfnF_rYJC3ZoTLml9IsViRQ";

function getSpreadsheet() {
  if (SPREADSHEET_ID && SPREADSHEET_ID !== "") {
    try {
      return SpreadsheetApp.openById(SPREADSHEET_ID);
    } catch (e) {
      return SpreadsheetApp.getActiveSpreadsheet();
    }
  }
  return SpreadsheetApp.getActiveSpreadsheet();
}

/**
 * Handle HTTP GET Requests
 */
function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : "getInitialData";
  var result = {};

  try {
    if (action === "getInitialData") {
      result = getInitialData();
    } else if (action === "getRegistrations") {
      result = getRegistrations();
    } else if (action === "ping") {
      result = { success: true, message: "Apps Script API is ready" };
    } else {
      result = { success: false, message: "Action not recognized" };
    }
  } catch (err) {
    result = { success: false, message: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle HTTP POST Requests
 */
function doPost(e) {
  var result = {};
  var postData = {};

  try {
    if (e && e.postData && e.postData.contents) {
      postData = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    var action = postData.action;

    if (action === "login") {
      result = handleLogin(postData);
    } else if (action === "register") {
      result = handleRegister(postData);
    } else if (action === "forgotPassword") {
      result = handleForgotPassword(postData);
    } else if (action === "submitApplication") {
      result = handleSubmitApplication(postData);
    } else if (action === "cancelApplication") {
      result = handleCancelApplication(postData);
    } else if (action === "getInitialData") {
      result = getInitialData();
    } else if (action === "getRegistrations") {
      result = getRegistrations();
    } else if (action === "ping") {
      result = { success: true, message: "pong" };
    } else {
      result = { success: false, message: "Invalid action: " + action };
    }
  } catch (err) {
    result = { success: false, message: "Server error: " + err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Clean phone numbers to 10-digit standard
 * จัดการกรณี Google Sheets แปลงเป็นตัวเลขแล้วตัด 0 ตัวหน้าทิ้ง (เหลือ 9 หลัก) ให้เติม 0 กลับคืนเสมอ
 */
function cleanPhone(phone) {
  if (!phone) return "";
  var str = phone.toString().replace(/[^0-9]/g, "");
  if (str.length === 9) {
    str = "0" + str;
  }
  return str;
}

/**
 * Format phone to ###-###-####
 */
function formatPhone(phone) {
  var clean = cleanPhone(phone);
  if (clean.length === 10) {
    return clean.substring(0, 3) + "-" + clean.substring(3, 6) + "-" + clean.substring(6, 10);
  }
  return phone;
}

/**
 * 1. ดึงข้อมูลตัวเลือกตั้งต้นจากแผ่นงาน list และ save
 */
function getInitialData() {
  var ss = getSpreadsheet();
  var listSheet = ss.getSheetByName("list");
  var saveSheet = ss.getSheetByName("save");

  if (!listSheet) {
    return { success: false, message: "ไม่พบแผ่นงานชื่อ 'list'" };
  }

  var listData = listSheet.getDataRange().getValues();
  var prefixes = [];
  var schools = [];
  var positions = [];
  var academicStandings = [];
  var subjects = [];
  var competitions = [];
  var committeeRoles = [];

  for (var i = 1; i < listData.length; i++) {
    var row = listData[i];
    // Col A: คำนำหน้าชื่อ
    if (row[0] && row[0].toString().trim() !== "" && prefixes.indexOf(row[0].toString().trim()) === -1) {
      prefixes.push(row[0].toString().trim());
    }
    // Col B: โรงเรียน
    if (row[1] && row[1].toString().trim() !== "" && schools.indexOf(row[1].toString().trim()) === -1) {
      schools.push(row[1].toString().trim());
    }
    // Col C: ตำแหน่ง
    if (row[2] && row[2].toString().trim() !== "" && positions.indexOf(row[2].toString().trim()) === -1) {
      positions.push(row[2].toString().trim());
    }
    // Col D: วิทยฐานะ
    if (row[3] && row[3].toString().trim() !== "" && academicStandings.indexOf(row[3].toString().trim()) === -1) {
      academicStandings.push(row[3].toString().trim());
    }
    // Col E: สาขาวิชา
    if (row[4] && row[4].toString().trim() !== "" && subjects.indexOf(row[4].toString().trim()) === -1) {
      subjects.push(row[4].toString().trim());
    }
    // Col F: รายการการแข่งขัน
    if (row[5] && row[5].toString().trim() !== "") {
      var compName = row[5].toString().trim();
      var compDate = row[6] ? (row[6] instanceof Date ? Utilities.formatDate(row[6], "GMT+7", "dd/MM/yyyy") : row[6].toString().trim()) : "";
      var compVenue = row[7] ? row[7].toString().trim() : "";
      var compQuota = row[8] ? parseInt(row[8], 10) || 5 : 5;

      var existing = competitions.find(function(c) { return c.name === compName; });
      if (!existing) {
        competitions.push({
          name: compName,
          date: compDate,
          venue: compVenue,
          quota: compQuota
        });
      }
    }
    // Col J: ตำแหน่งกรรมการ
    if (row[9] && row[9].toString().trim() !== "" && committeeRoles.indexOf(row[9].toString().trim()) === -1) {
      committeeRoles.push(row[9].toString().trim());
    }
  }

  // Get registrations from save sheet
  var registrations = [];
  if (saveSheet && saveSheet.getLastRow() > 1) {
    var saveData = saveSheet.getDataRange().getValues();
    for (var j = 1; j < saveData.length; j++) {
      var sRow = saveData[j];
      if (sRow[1] && sRow[1].toString().trim() !== "") {
        registrations.push({
          timestamp: sRow[0] instanceof Date ? Utilities.formatDate(sRow[0], "GMT+7", "dd/MM/yyyy HH:mm:ss") : sRow[0].toString(),
          username: cleanPhone(sRow[1]),
          fullName: sRow[2] ? sRow[2].toString().trim() : "",
          name: sRow[2] ? sRow[2].toString().trim() : "",
          school: sRow[3] ? sRow[3].toString().trim() : "",
          subject: sRow[4] ? sRow[4].toString().trim() : "",
          position: sRow[5] ? sRow[5].toString().trim() : "",
          academicStanding: sRow[6] ? sRow[6].toString().trim() : "",
          competition: sRow[7] ? sRow[7].toString().trim() : "",
          committeeRole: sRow[8] ? sRow[8].toString().trim() : "",
          date: sRow[9] ? sRow[9].toString().trim() : "",
          venue: sRow[10] ? sRow[10].toString().trim() : ""
        });
      }
    }
  }

  // Count registered per competition
  competitions.forEach(function(comp) {
    var compRegs = registrations.filter(function(r) { return r.competition === comp.name; });
    comp.registeredCount = compRegs.length;
    comp.isFull = comp.registeredCount >= comp.quota;
    comp.registeredRoles = compRegs.map(function(r) { return r.committeeRole; });
  });

  return {
    success: true,
    data: {
      prefixes: prefixes,
      schools: schools,
      positions: positions,
      academicStandings: academicStandings,
      subjects: subjects,
      competitions: competitions,
      committeeRoles: committeeRoles,
      registrations: registrations
    }
  };
}

/**
 * 2. เข้าสู่ระบบ (Login)
 */
function handleLogin(data) {
  var username = cleanPhone(data.username);
  var password = (data.password || "").toString().trim();

  if (!username || !password) {
    return { success: false, message: "กรุณากรอกเบอร์โทรศัพท์และรหัสผ่านให้ครบถ้วน" };
  }

  var ss = getSpreadsheet();
  var adminSheet = ss.getSheetByName("admin");
  if (!adminSheet) {
    return { success: false, message: "ไม่พบแผ่นงาน 'admin'" };
  }

  var adminData = adminSheet.getDataRange().getValues();
  for (var i = 1; i < adminData.length; i++) {
    var row = adminData[i];
    var rowUser = cleanPhone(row[0]);
    var rowPass = row[1] ? row[1].toString().trim() : "";

    if (rowUser === username && rowPass === password) {
      // หากใน Google Sheets เก็บเป็นตัวเลขแล้วไม่มี 0 ให้นำ 0 กลับไปอัปเดตให้อัตโนมัติ
      if (row[0].toString().length === 9) {
        try {
          adminSheet.getRange(i + 1, 1).setValue("'" + rowUser);
        } catch (e) {}
      }

      var userProfile = {
        username: rowUser,
        name: row[2] ? row[2].toString().trim() : "",
        school: row[3] ? row[3].toString().trim() : "",
        position: row[4] ? row[4].toString().trim() : "",
        academicStanding: row[5] ? row[5].toString().trim() : "",
        subject: row[6] ? row[6].toString().trim() : "",
        phone: row[7] ? row[7].toString().trim() : formatPhone(rowUser),
        email: row[8] ? row[8].toString().trim() : ""
      };

      // Check current registration in save sheet
      var saveSheet = ss.getSheetByName("save");
      var userApplication = null;
      if (saveSheet && saveSheet.getLastRow() > 1) {
        var saveData = saveSheet.getDataRange().getValues();
        for (var j = 1; j < saveData.length; j++) {
          if (cleanPhone(saveData[j][1]) === username) {
            userApplication = {
              timestamp: saveData[j][0] instanceof Date ? Utilities.formatDate(saveData[j][0], "GMT+7", "dd/MM/yyyy HH:mm:ss") : saveData[j][0].toString(),
              competition: saveData[j][7] ? saveData[j][7].toString().trim() : "",
              committeeRole: saveData[j][8] ? saveData[j][8].toString().trim() : "",
              date: saveData[j][9] ? saveData[j][9].toString().trim() : "",
              venue: saveData[j][10] ? saveData[j][10].toString().trim() : ""
            };
            break;
          }
        }
      }

      return {
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
        user: userProfile,
        application: userApplication
      };
    }
  }

  return { success: false, message: "เบอร์โทรศัพท์ (Username) หรือรหัสผ่านไม่ถูกต้อง" };
}

/**
 * 3. ลงทะเบียนผู้ใช้งานใหม่ (Register)
 */
function handleRegister(data) {
  var prefix = (data.prefix || "").toString().trim();
  var firstName = (data.firstName || "").toString().trim();
  var middleName = (data.middleName || "").toString().trim();
  var lastName = (data.lastName || "").toString().trim();
  var school = (data.school || "").toString().trim();
  var rawPhone = cleanPhone(data.phone);
  var email = (data.email || "").toString().trim();
  var position = (data.position || "").toString().trim();
  var academicStanding = (data.academicStanding || "").toString().trim();
  var subject = (data.subject || "").toString().trim();
  var password = (data.password || "").toString().trim();
  var confirmPassword = (data.confirmPassword || "").toString().trim();

  if (!prefix || !firstName || !lastName || !school || !rawPhone || !email || !position || !academicStanding || !subject || !password) {
    return { success: false, message: "กรุณากรอกข้อมูลที่จำเป็นให้ครบทุกช่อง" };
  }

  if (rawPhone.length !== 10) {
    return { success: false, message: "เบอร์โทรศัพท์ต้องเป็นตัวเลข 10 หลัก" };
  }

  if (email.indexOf("@") === -1) {
    return { success: false, message: "รูปแบบอีเมลไม่ถูกต้อง ต้องมี @" };
  }

  if (password !== confirmPassword) {
    return { success: false, message: "รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน" };
  }

  var hasNumber = /[0-9]/.test(password);
  var hasLetter = /[a-zA-Z]/.test(password);
  var hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

  if (!hasNumber || !hasLetter || !hasSpecial) {
    return { success: false, message: "รหัสผ่านต้องประกอบด้วยตัวเลข ตัวอักษร และอักขระพิเศษอย่างน้อยอย่างละ 1 ตัว" };
  }

  var formattedPhone = formatPhone(rawPhone);
  var fullName = prefix + firstName + (middleName ? " " + middleName : "") + " " + lastName;

  var ss = getSpreadsheet();
  var adminSheet = ss.getSheetByName("admin");
  if (!adminSheet) {
    return { success: false, message: "ไม่พบแผ่นงาน 'admin'" };
  }

  // Check if phone already registered
  var adminData = adminSheet.getDataRange().getValues();
  for (var i = 1; i < adminData.length; i++) {
    if (cleanPhone(adminData[i][0]) === rawPhone) {
      return { success: false, message: "เบอร์โทรศัพท์นี้ลงทะเบียนไปแล้ว กรุณาเข้าสู่ระบบ หรือกดลืมรหัสผ่าน" };
    }
  }

  // ใส่เครื่องหมาย ' นำหน้า rawPhone เพื่อบังคับให้ Google Sheets บันทึกเป็นข้อความ (Text) และคงเลข 0 ตัวหน้าไว้เสมอ
  adminSheet.appendRow([
    "'" + rawPhone,
    password,
    fullName,
    school,
    position,
    academicStanding,
    subject,
    "'" + formattedPhone,
    email
  ]);

  return {
    success: true,
    message: "ลงทะเบียนเรียบร้อยแล้ว ท่านสามารถเข้าสู่ระบบด้วยเบอร์โทรศัพท์และรหัสผ่านได้ทันที",
    username: rawPhone,
    fullName: fullName
  };
}

/**
 * 4. ลืมรหัสผ่าน (Forgot Password)
 */
function handleForgotPassword(data) {
  var rawPhone = cleanPhone(data.phone);
  var email = (data.email || "").toString().trim().toLowerCase();
  var newPassword = (data.newPassword || "").toString().trim();

  if (!rawPhone || !email) {
    return { success: false, message: "กรุณากรอกเบอร์โทรศัพท์และอีเมลที่ตรงกับตอนลงทะเบียน" };
  }

  var ss = getSpreadsheet();
  var adminSheet = ss.getSheetByName("admin");
  if (!adminSheet) {
    return { success: false, message: "ไม่พบแผ่นงาน 'admin'" };
  }

  var adminData = adminSheet.getDataRange().getValues();
  var foundRowIndex = -1;

  for (var i = 1; i < adminData.length; i++) {
    var rowUser = cleanPhone(adminData[i][0]);
    var rowEmail = adminData[i][8] ? adminData[i][8].toString().trim().toLowerCase() : "";

    if (rowUser === rawPhone && rowEmail === email) {
      foundRowIndex = i + 1;
      break;
    }
  }

  if (foundRowIndex === -1) {
    return { success: false, message: "ไม่พบข้อมูลที่ตรงกันของเบอร์โทรศัพท์และอีเมลนี้" };
  }

  if (newPassword) {
    var hasNumber = /[0-9]/.test(newPassword);
    var hasLetter = /[a-zA-Z]/.test(newPassword);
    var hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(newPassword);

    if (!hasNumber || !hasLetter || !hasSpecial) {
      return { success: false, message: "รหัสผ่านใหม่ต้องมีตัวเลข ตัวอักษร และอักขระพิเศษอย่างน้อยอย่างละ 1 ตัว" };
    }

    adminSheet.getRange(foundRowIndex, 2).setValue(newPassword);
    return { success: true, message: "เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบได้ทันที" };
  }

  var currentPassword = adminData[foundRowIndex - 1][1];
  return {
    success: true,
    verified: true,
    message: "ตรวจสอบข้อมูลถูกต้อง",
    hint: "รหัสผ่านของคุณคือ: " + currentPassword
  };
}

/**
 * 5. สมัครเข้าร่วมเป็นคณะกรรมการ (Submit Application)
 * กฎ: 1 บัญชีสามารถสมัครได้เพียง 1 รายการเท่านั้น
 */
function handleSubmitApplication(data) {
  var username = cleanPhone(data.username);
  var competitionName = (data.competitionName || "").toString().trim();
  var selectedRole = (data.selectedRole || "").toString().trim();

  if (!username || !competitionName || !selectedRole) {
    return { success: false, message: "ข้อมูลไม่ครบถ้วน กรุณาเลือกรายการและตำแหน่งกรรมการ" };
  }

  var ss = getSpreadsheet();
  var adminSheet = ss.getSheetByName("admin");
  var listSheet = ss.getSheetByName("list");
  var saveSheet = ss.getSheetByName("save");

  if (!saveSheet) {
    saveSheet = ss.insertSheet("save");
    saveSheet.appendRow([
      "วันที่-เวลาที่สมัคร", "USERNAME", "ชื่อ-สกุล", "โรงเรียน", "สาขาวิชา",
      "ตำแหน่ง", "วิทยฐานะ", "รายการการแข่งขัน", "ตำแหน่งกรรมการที่สมัคร",
      "วันที่แข่งขัน", "สถานที่แข่งขัน", "เบอร์โทร", "E-mail"
    ]);
  }

  // 1. Get user profile from admin sheet
  var adminData = adminSheet.getDataRange().getValues();
  var userProfile = null;
  for (var i = 1; i < adminData.length; i++) {
    if (cleanPhone(adminData[i][0]) === username) {
      userProfile = {
        username: username,
        password: adminData[i][1],
        fullName: adminData[i][2],
        school: adminData[i][3],
        position: adminData[i][4],
        academicStanding: adminData[i][5],
        subject: adminData[i][6],
        phone: adminData[i][7] ? formatPhone(adminData[i][7]) : formatPhone(username),
        email: adminData[i][8]
      };
      break;
    }
  }

  if (!userProfile) {
    return { success: false, message: "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่อีกครั้ง" };
  }

  // 2. Check competition info & quota from list sheet
  var listData = listSheet.getDataRange().getValues();
  var compInfo = null;
  for (var k = 1; k < listData.length; k++) {
    if (listData[k][5] && listData[k][5].toString().trim() === competitionName) {
      compInfo = {
        name: competitionName,
        date: listData[k][6] ? (listData[k][6] instanceof Date ? Utilities.formatDate(listData[k][6], "GMT+7", "dd/MM/yyyy") : listData[k][6].toString().trim()) : "",
        venue: listData[k][7] ? listData[k][7].toString().trim() : "",
        quota: listData[k][8] ? parseInt(listData[k][8], 10) || 5 : 5
      };
      break;
    }
  }

  if (!compInfo) {
    return { success: false, message: "ไม่พบรายการการแข่งขันนี้ในระบบ" };
  }

  // 3. Inspect existing save sheet registrations
  var saveData = saveSheet.getDataRange().getValues();
  var compRegisteredCount = 0;
  var userAlreadyRegisteredRow = -1;
  var userExistingComp = null;
  var roleAlreadyTaken = false;

  for (var r = 1; r < saveData.length; r++) {
    var regUser = cleanPhone(saveData[r][1]);
    var regComp = saveData[r][7] ? saveData[r][7].toString().trim() : "";
    var regRole = saveData[r][8] ? saveData[r][8].toString().trim() : "";

    // Check if user has registered for any competition
    if (regUser === username) {
      userAlreadyRegisteredRow = r + 1;
      userExistingComp = regComp;
    }

    // Count applicants for this specific competition
    if (regComp === competitionName) {
      compRegisteredCount++;

      // Check role taken (except "กรรมการ")
      if (selectedRole !== "กรรมการ" && regRole === selectedRole && regUser !== username) {
        roleAlreadyTaken = true;
      }
    }
  }

  // ข้อกำหนด: 1 บัญชีสามารถสมัครได้เพียง 1 รายการเท่านั้น
  // หากเคยสมัครในรายการอื่นไว้แล้ว ไม่อนุญาตให้สมัครซ้ำซ้อนในรายการใหม่
  if (userExistingComp && userExistingComp !== competitionName) {
    return {
      success: false,
      message: "ท่านได้ลงทะเบียนในรายการ '" + userExistingComp + "' เรียบร้อยแล้ว (1 บัญชีสามารถสมัครได้เพียง 1 รายการเท่านั้น หากต้องการเปลี่ยนรายการ กรุณายกเลิกการสมัครในรายการเดิมก่อน)"
    };
  }

  // Check quota
  if (compRegisteredCount >= compInfo.quota && userAlreadyRegisteredRow === -1) {
    return { success: false, message: "ขออภัย รายการนี้ปิดรับสมัครแล้ว เนื่องจากมีผู้สมัครครบ " + compInfo.quota + " ท่านแล้ว" };
  }

  // Check role taken
  if (roleAlreadyTaken) {
    return { success: false, message: "ตำแหน่ง '" + selectedRole + "' ในรายการนี้มีผู้เลือกแล้ว กรุณาเลือกตำแหน่งอื่น (หรือเลือก 'กรรมการ')" };
  }

  var now = new Date();
  var timestampStr = Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy HH:mm:ss");

  var rowValues = [
    timestampStr,
    "'" + username, // บันทึกด้วย ' เพื่อรักษาเลข 0 ตัวหน้า
    userProfile.fullName,
    userProfile.school,
    userProfile.subject,
    userProfile.position,
    userProfile.academicStanding,
    competitionName,
    selectedRole,
    compInfo.date,
    compInfo.venue,
    "'" + userProfile.phone,
    userProfile.email
  ];

  if (userAlreadyRegisteredRow !== -1) {
    saveSheet.getRange(userAlreadyRegisteredRow, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    saveSheet.appendRow(rowValues);
  }

  return {
    success: true,
    message: "บันทึกข้อมูลการสมัครเป็นคณะกรรมการตัดสินเรียบร้อยแล้ว",
    data: {
      timestamp: timestampStr,
      competition: competitionName,
      committeeRole: selectedRole,
      date: compInfo.date,
      venue: compInfo.venue
    }
  };
}

/**
 * 6. ยกเลิกการสมัคร (Cancel Application)
 */
function handleCancelApplication(data) {
  var username = cleanPhone(data.username);
  if (!username) {
    return { success: false, message: "ไม่พบข้อมูลผู้ใช้งาน" };
  }

  var ss = getSpreadsheet();
  var saveSheet = ss.getSheetByName("save");
  if (!saveSheet || saveSheet.getLastRow() <= 1) {
    return { success: false, message: "ยังไม่มีข้อมูลการสมัคร" };
  }

  var saveData = saveSheet.getDataRange().getValues();
  for (var i = 1; i < saveData.length; i++) {
    if (cleanPhone(saveData[i][1]) === username) {
      saveSheet.deleteRow(i + 1);
      return { success: true, message: "ยกเลิกการสมัครเรียบร้อยแล้ว ท่านสามารถเลือกสมัครรายการอื่นได้" };
    }
  }

  return { success: false, message: "ไม่พบข้อมูลการสมัครในระบบ" };
}

/**
 * 7. ดึงข้อมูลผู้สมัครทั้งหมดสำหรับหน้าหลักและการส่งออก PDF/Excel
 */
function getRegistrations() {
  var ss = getSpreadsheet();
  var saveSheet = ss.getSheetByName("save");

  var results = [];
  if (saveSheet && saveSheet.getLastRow() > 1) {
    var data = saveSheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      if (row[1] && row[1].toString().trim() !== "") {
        results.push({
          timestamp: row[0] instanceof Date ? Utilities.formatDate(row[0], "GMT+7", "dd/MM/yyyy HH:mm:ss") : row[0].toString(),
          username: cleanPhone(row[1]),
          fullName: row[2] ? row[2].toString().trim() : "",
          name: row[2] ? row[2].toString().trim() : "",
          school: row[3] ? row[3].toString().trim() : "",
          subject: row[4] ? row[4].toString().trim() : "",
          position: row[5] ? row[5].toString().trim() : "",
          academicStanding: row[6] ? row[6].toString().trim() : "",
          competition: row[7] ? row[7].toString().trim() : "",
          committeeRole: row[8] ? row[8].toString().trim() : "",
          date: row[9] ? row[9].toString().trim() : "",
          venue: row[10] ? row[10].toString().trim() : ""
        });
      }
    }
  }

  return {
    success: true,
    data: results
  };
}
