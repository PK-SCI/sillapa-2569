/**
 * API Client Layer for Google Apps Script Web App
 */

const API = {
  isConfigured() {
    return Boolean(CONFIG.API_URL && CONFIG.API_URL.trim().startsWith("http"));
  },

  /**
   * Helper to execute GET request
   */
  async get(action, params = {}) {
    if (!this.isConfigured()) {
      return this.mockGet(action, params);
    }

    try {
      const url = new URL(CONFIG.API_URL);
      url.searchParams.set("action", action);
      Object.keys(params).forEach(k => url.searchParams.set(k, params[k]));

      const response = await fetch(url.toString(), {
        method: "GET",
        mode: "cors",
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.error("GAS GET API Error:", err);
      return { success: false, message: "เกิดข้อผิดพลาดในการโหลดข้อมูลจาก Google Sheets: " + (err.message || err) };
    }
  },

  /**
   * Helper to execute POST request
   */
  async post(action, payload = {}) {
    if (!this.isConfigured()) {
      return this.mockPost(action, payload);
    }

    try {
      const requestData = { action, ...payload };
      
      // Standard JSON POST to Google Apps Script
      const response = await fetch(CONFIG.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8"
        },
        body: JSON.stringify(requestData),
        redirect: "follow"
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const json = await response.json();
      return json;
    } catch (err) {
      console.error("GAS POST API Error:", err);
      return { success: false, message: "เกิดข้อผิดพลาดในการส่งข้อมูลไปยัง Google Sheets: " + (err.message || err) };
    }
  },

  // -------------------------------------------------------------
  // Public Business Methods
  // -------------------------------------------------------------

  async getInitialData() {
    return await this.get("getInitialData");
  },

  async login(username, password) {
    return await this.post("login", { username, password });
  },

  async register(formData) {
    return await this.post("register", formData);
  },

  async forgotPassword(phone, email, newPassword) {
    return await this.post("forgotPassword", { phone, email, newPassword });
  },

  async submitApplication(username, competitionName, selectedRole) {
    return await this.post("submitApplication", { username, competitionName, selectedRole });
  },

  async cancelApplication(username) {
    return await this.post("cancelApplication", { username });
  },

  async getRegistrations() {
    return await this.get("getRegistrations");
  },

  // -------------------------------------------------------------
  // Local Mock Simulation (When Google Apps Script URL is empty)
  // -------------------------------------------------------------

  getMockState() {
    const stored = localStorage.getItem("SILLAPA_LOCAL_STATE");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // fallback
      }
    }
    const initial = JSON.parse(JSON.stringify(CONFIG.DEMO_DATA));
    // Load local users
    initial.users = [
      {
        username: "0812345678",
        password: "Password123!",
        name: "นายชิษณุชา กรมศรี ขุ่นทาราม",
        school: "โรงเรียนภูเขียว",
        position: "ครู",
        academicStanding: "ชำนาญการพิเศษ",
        subject: "ฟิสิกส์",
        phone: "081-234-5678",
        email: "chitsanucha@example.com"
      }
    ];
    this.saveMockState(initial);
    return initial;
  },

  saveMockState(state) {
    localStorage.setItem("SILLAPA_LOCAL_STATE", JSON.stringify(state));
  },

  cleanPhone(phone) {
    return (phone || "").toString().replace(/[^0-9]/g, "");
  },

  formatPhone(phone) {
    const clean = this.cleanPhone(phone);
    if (clean.length === 10) {
      return `${clean.slice(0, 3)}-${clean.slice(3, 6)}-${clean.slice(6, 10)}`;
    }
    return phone;
  },

  async mockGet(action, params) {
    // Artificial slight delay for realistic UI transition
    await new Promise(r => setTimeout(r, 200));
    const state = this.getMockState();

    if (action === "getInitialData") {
      // Recount registered roles
      state.competitions.forEach(comp => {
        const regs = state.registrations.filter(r => r.competition === comp.name);
        comp.registeredCount = regs.length;
        comp.isFull = comp.registeredCount >= comp.quota;
        comp.registeredRoles = regs.map(r => r.committeeRole);
      });

      return {
        success: true,
        data: {
          prefixes: state.prefixes,
          schools: state.schools,
          positions: state.positions,
          academicStandings: state.academicStandings,
          subjects: state.subjects,
          competitions: state.competitions,
          committeeRoles: state.committeeRoles,
          registrations: state.registrations
        }
      };
    }

    if (action === "getRegistrations") {
      return {
        success: true,
        data: state.registrations
      };
    }

    return { success: false, message: "Mock action not handled" };
  },

  async mockPost(action, payload) {
    await new Promise(r => setTimeout(r, 300));
    const state = this.getMockState();

    if (action === "login") {
      const cleanUser = this.cleanPhone(payload.username);
      const user = state.users.find(u => this.cleanPhone(u.username) === cleanUser && u.password === payload.password);
      if (user) {
        const app = state.registrations.find(r => this.cleanPhone(r.username) === cleanUser);
        return {
          success: true,
          message: "เข้าสู่ระบบสำเร็จ (โหมดทดสอบ)",
          user,
          application: app || null
        };
      }
      return { success: false, message: "เบอร์โทรศัพท์ (Username) หรือรหัสผ่านไม่ถูกต้อง" };
    }

    if (action === "register") {
      const rawPhone = this.cleanPhone(payload.phone);
      if (state.users.some(u => this.cleanPhone(u.username) === rawPhone)) {
        return { success: false, message: "เบอร์โทรศัพท์นี้ลงทะเบียนไปแล้ว กรุณาเข้าสู่ระบบ หรือกดลืมรหัสผ่าน" };
      }

      const fullName = `${payload.prefix}${payload.firstName}${payload.middleName ? ' ' + payload.middleName : ''} ${payload.lastName}`;
      const newUser = {
        username: rawPhone,
        password: payload.password,
        name: fullName,
        school: payload.school,
        position: payload.position,
        academicStanding: payload.academicStanding,
        subject: payload.subject,
        phone: this.formatPhone(rawPhone),
        email: payload.email
      };

      state.users.push(newUser);
      this.saveMockState(state);

      return {
        success: true,
        message: "ลงทะเบียนเรียบร้อยแล้ว ท่านสามารถเข้าสู่ระบบได้ทันที",
        username: rawPhone,
        fullName
      };
    }

    if (action === "forgotPassword") {
      const rawPhone = this.cleanPhone(payload.phone);
      const email = (payload.email || "").toLowerCase().trim();
      const user = state.users.find(u => this.cleanPhone(u.username) === rawPhone && (u.email || "").toLowerCase().trim() === email);

      if (!user) {
        return { success: false, message: "ไม่พบข้อมูลที่ตรงกันของเบอร์โทรศัพท์และอีเมลนี้" };
      }

      if (payload.newPassword) {
        user.password = payload.newPassword;
        this.saveMockState(state);
        return { success: true, message: "เปลี่ยนรหัสผ่านใหม่เรียบร้อยแล้ว สามารถเข้าสู่ระบบได้ทันที" };
      }

      return {
        success: true,
        verified: true,
        message: "ตรวจสอบข้อมูลถูกต้อง",
        hint: `รหัสผ่านของคุณคือ: ${user.password}`
      };
    }

    if (action === "submitApplication") {
      const cleanUser = this.cleanPhone(payload.username);
      const user = state.users.find(u => this.cleanPhone(u.username) === cleanUser);
      if (!user) return { success: false, message: "ไม่พบข้อมูลผู้ใช้งาน กรุณาเข้าสู่ระบบใหม่" };

      const comp = state.competitions.find(c => c.name === payload.competitionName);
      if (!comp) return { success: false, message: "ไม่พบรายการแข่งขันนี้" };

      const existingInComp = state.registrations.filter(r => r.competition === payload.competitionName);

      // Check quota
      const userExistingIdx = state.registrations.findIndex(r => this.cleanPhone(r.username) === cleanUser);
      if (existingInComp.length >= comp.quota && userExistingIdx === -1) {
        return { success: false, message: `ขออภัย รายการนี้ปิดรับสมัครแล้ว เนื่องจากครบจำนวน ${comp.quota} คนแล้ว` };
      }

      // Check role taken (except "กรรมการ")
      if (payload.selectedRole !== "กรรมการ") {
        const isRoleTaken = existingInComp.some(r => r.committeeRole === payload.selectedRole && this.cleanPhone(r.username) !== cleanUser);
        if (isRoleTaken) {
          return { success: false, message: `ตำแหน่ง '${payload.selectedRole}' ในรายการนี้มีผู้เลือกแล้ว กรุณาเลือกตำแหน่งอื่นหรือเลือก 'กรรมการ'` };
        }
      }

      const now = new Date();
      const timestamp = `${now.toLocaleDateString("th-TH")} ${now.toLocaleTimeString("th-TH")}`;

      const newRecord = {
        timestamp,
        username: cleanUser,
        fullName: user.name,
        school: user.school,
        subject: user.subject,
        position: user.position,
        academicStanding: user.academicStanding,
        competition: payload.competitionName,
        committeeRole: payload.selectedRole,
        date: comp.date,
        venue: comp.venue
      };

      if (userExistingIdx !== -1) {
        state.registrations[userExistingIdx] = newRecord;
      } else {
        state.registrations.push(newRecord);
      }

      this.saveMockState(state);
      return {
        success: true,
        message: "บันทึกข้อมูลการสมัครเป็นคณะกรรมการตัดสินเรียบร้อยแล้ว",
        data: newRecord
      };
    }

    if (action === "cancelApplication") {
      const cleanUser = this.cleanPhone(payload.username);
      state.registrations = state.registrations.filter(r => this.cleanPhone(r.username) !== cleanUser);
      this.saveMockState(state);
      return { success: true, message: "ยกเลิกการสมัครเรียบร้อยแล้ว ท่านสามารถเลือกรายการใหม่ได้" };
    }

    return { success: false, message: "Unknown action" };
  }
};
