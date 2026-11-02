/**
 * Main Application Logic
 * ศิลปหัตถกรรมนักเรียน ปีการศึกษา 2569 สพม.ชัยภูมิ
 */

const App = {
  state: {
    currentUser: null,
    userApplication: null,
    initialData: null,
    activeView: 'public-overview', // 'public-overview', 'competitions', 'login', 'register', 'forgot'
    selectedCompetition: null,
    filterCompetition: 'ALL',
    searchQuery: ''
  },

  /**
   * Application Initialization
   */
  async init() {
    this.restoreUserSession();
    this.bindEvents();
    this.updateLogosAndTitles();
    await this.loadInitialData();

    // Determine initial view based on auth state or hash
    const hash = window.location.hash.replace('#', '');
    if (hash && ['public-overview', 'competitions', 'login', 'register', 'forgot'].includes(hash)) {
      this.switchView(hash);
    } else if (this.state.currentUser) {
      this.switchView('competitions');
    } else {
      this.switchView('public-overview');
    }
  },

  /**
   * Render Logos and Titles from CONFIG
   */
  updateLogosAndTitles() {
    document.querySelectorAll('.logo-primary').forEach(img => {
      img.src = CONFIG.LOGOS.PRIMARY;
      img.onerror = () => { img.style.display = 'none'; };
    });

    document.querySelectorAll('.logo-secondary').forEach(img => {
      img.src = CONFIG.LOGOS.SECONDARY;
      img.onerror = () => { img.style.display = 'none'; };
    });

    // Favicon
    let favicon = document.querySelector("link[rel*='icon']");
    if (!favicon) {
      favicon = document.createElement('link');
      favicon.rel = 'icon';
      document.head.appendChild(favicon);
    }
    favicon.href = CONFIG.LOGOS.PRIMARY;

    // Official Badge
    const apiStatusEl = document.getElementById('apiStatusBadge');
    if (apiStatusEl) {
      apiStatusEl.innerHTML = `<span class="api-status-dot" style="background:#10b981;"></span> เปิดรับสมัครคณะกรรมการ`;
    }
  },

  /**
   * Load Master Data from GAS or Mock
   */
  async loadInitialData() {
    this.showLoading(true);
    try {
      const response = await API.getInitialData();
      if (response && response.success) {
        this.state.initialData = response.data;
        this.populateDropdowns();
        this.renderCompetitions();
        this.renderPublicOverview();
        this.updateStats();

        // Refresh user's application status if logged in
        if (this.state.currentUser) {
          const userApp = this.state.initialData.registrations.find(
            r => API.cleanPhone(r.username) === API.cleanPhone(this.state.currentUser.username)
          );
          this.state.userApplication = userApp || null;
          this.updateUserAuthUI();
        }
      } else {
        this.showToast(response.message || 'ไม่สามารถโหลดข้อมูลได้', 'error');
      }
    } catch (err) {
      console.error(err);
      this.showToast('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล', 'error');
    } finally {
      this.showLoading(false);
    }
  },

  /**
   * Restore User Session from LocalStorage
   */
  restoreUserSession() {
    const saved = localStorage.getItem('SILLAPA_CURRENT_USER');
    if (saved) {
      try {
        this.state.currentUser = JSON.parse(saved);
      } catch (e) {
        localStorage.removeItem('SILLAPA_CURRENT_USER');
      }
    }
    this.updateUserAuthUI();
  },

  saveUserSession(user) {
    this.state.currentUser = user;
    if (user) {
      localStorage.setItem('SILLAPA_CURRENT_USER', JSON.stringify(user));
    } else {
      localStorage.removeItem('SILLAPA_CURRENT_USER');
      this.state.userApplication = null;
    }
    this.updateUserAuthUI();
  },

  /**
   * Update UI elements related to logged in user
   */
  updateUserAuthUI() {
    const userContainer = document.getElementById('userAuthContainer');
    const loginNavBtn = document.getElementById('navBtnLogin');
    const registerNavBtn = document.getElementById('navBtnRegister');
    const myAppBanner = document.getElementById('myApplicationBanner');

    if (this.state.currentUser) {
      if (userContainer) {
        userContainer.style.display = 'flex';
        document.getElementById('navUserName').textContent = this.state.currentUser.name || this.state.currentUser.fullName || 'ผู้ใช้งาน';
        document.getElementById('navUserSchool').textContent = this.state.currentUser.school || '';
      }
      if (loginNavBtn) loginNavBtn.style.display = 'none';
      if (registerNavBtn) registerNavBtn.style.display = 'none';

      // Update Registered Competition Banner
      if (myAppBanner) {
        if (this.state.userApplication) {
          myAppBanner.style.display = 'block';
          document.getElementById('myCompName').textContent = this.state.userApplication.competition;
          document.getElementById('myCompRole').textContent = this.state.userApplication.committeeRole;
          document.getElementById('myCompTime').textContent = this.state.userApplication.timestamp || '';
        } else {
          myAppBanner.style.display = 'none';
        }
      }
    } else {
      if (userContainer) userContainer.style.display = 'none';
      if (loginNavBtn) loginNavBtn.style.display = 'inline-flex';
      if (registerNavBtn) registerNavBtn.style.display = 'inline-flex';
      if (myAppBanner) myAppBanner.style.display = 'none';
    }
  },

  /**
   * Populate Registration and Filter Dropdowns
   */
  populateDropdowns() {
    const data = this.state.initialData;
    if (!data) return;

    // Register Form: Prefixes
    const prefixSelect = document.getElementById('regPrefix');
    if (prefixSelect && data.prefixes) {
      prefixSelect.innerHTML = '<option value="">-- เลือกคำนำหน้าชื่อ --</option>' +
        data.prefixes.map(p => `<option value="${p}">${p}</option>`).join('');
    }

    // Register Form: Schools
    const schoolSelect = document.getElementById('regSchool');
    if (schoolSelect && data.schools) {
      schoolSelect.innerHTML = '<option value="">-- เลือกสังกัดโรงเรียน --</option>' +
        data.schools.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    // Register Form: Positions
    const posSelect = document.getElementById('regPosition');
    if (posSelect && data.positions) {
      posSelect.innerHTML = '<option value="">-- เลือกตำแหน่ง --</option>' +
        data.positions.map(p => `<option value="${p}">${p}</option>`).join('');
    }

    // Register Form: Academic Standing
    const acadSelect = document.getElementById('regAcademicStanding');
    if (acadSelect && data.academicStandings) {
      acadSelect.innerHTML = '<option value="">-- เลือกวิทยฐานะ --</option>' +
        data.academicStandings.map(a => `<option value="${a}">${a}</option>`).join('');
    }

    // Register Form: Subjects
    const subjSelect = document.getElementById('regSubject');
    if (subjSelect && data.subjects) {
      subjSelect.innerHTML = '<option value="">-- เลือกสาขาวิชา --</option>' +
        data.subjects.map(s => `<option value="${s}">${s}</option>`).join('');
    }

    // Public Table: Filter Competitions Dropdown
    const filterCompSelect = document.getElementById('filterCompSelect');
    if (filterCompSelect && data.competitions) {
      filterCompSelect.innerHTML = '<option value="ALL">ทุกรายการการแข่งขัน</option>' +
        data.competitions.map(c => `<option value="${c.name}">${c.name}</option>`).join('');
    }
  },

  /**
   * Switch Active View (SPA Router)
   */
  switchView(viewName) {
    this.state.activeView = viewName;
    window.location.hash = viewName;

    // Toggle active class on pages
    document.querySelectorAll('.page-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
    }

    // Toggle nav active state
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === viewName);
    });

    // Check auth protection
    if (viewName === 'competitions' && !this.state.currentUser) {
      this.showToast('กรุณาเข้าสู่ระบบก่อนทำการเลือกรายการการแข่งขัน', 'info');
      this.switchView('login');
      return;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  /**
   * Render Competitions Grid
   * Rule: Displays competition name, date, venue, quota, and registered status
   */
  renderCompetitions() {
    const grid = document.getElementById('competitionsGrid');
    if (!grid || !this.state.initialData) return;

    const comps = this.state.initialData.competitions || [];
    const myCompName = this.state.userApplication ? this.state.userApplication.competition : null;

    grid.innerHTML = comps.map(comp => {
      const isMine = myCompName === comp.name;
      const isFull = comp.registeredCount >= comp.quota;
      const percent = Math.min(100, Math.round((comp.registeredCount / comp.quota) * 100));

      let badgeHtml = '';
      if (isMine) {
        badgeHtml = `<span class="status-badge badge-mine"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> รายการที่คุณสมัครแล้ว</span>`;
      } else if (isFull) {
        badgeHtml = `<span class="status-badge badge-closed"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg> ปิดรับสมัคร (เต็มแล้ว)</span>`;
      } else {
        badgeHtml = `<span class="status-badge badge-open"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 14 14"></polyline></svg> เปิดรับสมัคร</span>`;
      }

      return `
        <div class="competition-card ${isMine ? 'selected-by-user' : ''} ${isFull && !isMine ? 'full-quota' : ''}" 
             onclick="App.openCompetitionModal('${encodeURIComponent(comp.name)}')">
          <div>
            <div class="card-top-badge">
              ${badgeHtml}
              <span style="font-size: 0.8rem; font-weight:700; color:var(--text-muted);">
                รับ ${comp.quota} ท่าน
              </span>
            </div>

            <h3 class="comp-title">${comp.name}</h3>

            <!-- Small Sub-info specified by user: วันที่แข่งขัน, สถานที่แข่งขัน, จำนวนที่กำหนด -->
            <div class="comp-meta-list">
              <div class="comp-meta-item">
                <svg class="comp-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                <span><strong>วันที่แข่งขัน:</strong> ${comp.date || 'ตามประกาศ'}</span>
              </div>
              <div class="comp-meta-item">
                <svg class="comp-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                <span><strong>สถานที่:</strong> ${comp.venue || 'ศูนย์วิทย์ฯ โรงเรียนภูเขียว'}</span>
              </div>
              <div class="comp-meta-item">
                <svg class="comp-meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                <span><strong>จำนวนที่รับสมัคร:</strong> ${comp.quota} ท่าน (สมัครแล้ว ${comp.registeredCount} ท่าน)</span>
              </div>
            </div>
          </div>

          <div>
            <div class="comp-progress-wrapper">
              <div class="comp-progress-label">
                <span>ความคืบหน้าการรับสมัคร</span>
                <span>${comp.registeredCount}/${comp.quota} ท่าน (${percent}%)</span>
              </div>
              <div class="comp-progress-bar">
                <div class="comp-progress-fill" style="width: ${percent}%;"></div>
              </div>
            </div>

            <button type="button" class="btn ${isMine ? 'btn-outline-orange' : isFull ? 'btn-secondary' : 'btn-primary'} btn-sm" style="width: 100%;">
              ${isMine ? 'ดูข้อมูล / เปลี่ยนตำแหน่ง' : isFull ? 'ดูรายชื่อผู้สมัคร (เต็มแล้ว)' : 'เลือกรายการนี้'}
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Open Competition Details & Role Selection Modal
   * Rule: Displays all applicants, role selection from list Col J
   * Rule: Position already selected cannot be selected again, EXCEPT "กรรมการ"
   */
  openCompetitionModal(encodedCompName) {
    const compName = decodeURIComponent(encodedCompName);
    const comp = this.state.initialData.competitions.find(c => c.name === compName);
    if (!comp) return;

    this.state.selectedCompetition = comp;

    const modalTitle = document.getElementById('modalCompTitle');
    const modalMeta = document.getElementById('modalCompMeta');
    const applicantsTable = document.getElementById('modalApplicantsTable');
    const rolesGrid = document.getElementById('modalRolesGrid');
    const alertBox = document.getElementById('modalAlertBox');
    const submitBtn = document.getElementById('modalSubmitBtn');
    const cancelCompBtn = document.getElementById('modalCancelCompBtn');

    modalTitle.textContent = comp.name;
    modalMeta.innerHTML = `
      <span>📅 <strong>วันที่:</strong> ${comp.date}</span> &nbsp;|&nbsp;
      <span>📍 <strong>สถานที่:</strong> ${comp.venue}</span> &nbsp;|&nbsp;
      <span>👥 <strong>ยอดรับ:</strong> ${comp.quota} ท่าน (สมัครแล้ว ${comp.registeredCount} ท่าน)</span>
    `;

    // Filter applicants for this competition
    const compApplicants = (this.state.initialData.registrations || []).filter(r => r.competition === comp.name);

    if (compApplicants.length === 0) {
      applicantsTable.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">ยังไม่มีผู้สมัครในรายการนี้ เป็นท่านแรกที่ร่วมตัดสิน!</td></tr>`;
    } else {
      applicantsTable.innerHTML = compApplicants.map((app, index) => `
        <tr>
          <td style="text-align:center; font-weight:700;">${index + 1}</td>
          <td><strong>${app.fullName}</strong></td>
          <td><span class="tag-pill tag-pill-gold">${app.committeeRole}</span></td>
          <td>${app.school}</td>
          <td style="font-size:0.8rem; color:var(--text-muted);">${app.timestamp}</td>
        </tr>
      `).join('');
    }

    // Check if current user is logged in
    const currentUser = this.state.currentUser;
    const isUserRegisteredInThis = compApplicants.some(r => API.cleanPhone(r.username) === API.cleanPhone(currentUser?.username));
    const isRegisteredInOther = Boolean(this.state.userApplication && this.state.userApplication.competition !== comp.name);
    const isFull = comp.registeredCount >= comp.quota;

    // Render Committee Roles from list Col J
    const roles = this.state.initialData.committeeRoles || [
      'ประธานกรรมการ', 'รองประธานกรรมการ', 'กรรมการและเลขานุการ', 'กรรมการและผู้ช่วยเลขานุการ', 'กรรมการ'
    ];

    rolesGrid.innerHTML = roles.map(role => {
      // Find if this role is already taken in this competition
      const takenBy = compApplicants.find(r => r.committeeRole === role);
      const isTakenByOther = takenBy && API.cleanPhone(takenBy.username) !== API.cleanPhone(currentUser?.username);
      
      // EXCEPTION RULE: "ยกเว้น กรรมการ"
      const isCommitteeRole = (role.trim() === 'กรรมการ');
      const isDisabled = isRegisteredInOther || (!isCommitteeRole && isTakenByOther) || (isFull && !isUserRegisteredInThis);

      let badgeText = '';
      let badgeClass = '';
      if (isRegisteredInOther) {
        badgeText = 'ท่านสมัครรายการอื่นแล้ว';
        badgeClass = 'taken';
      } else if (isCommitteeRole) {
        badgeText = 'เลือกได้หลายท่าน';
        badgeClass = 'multiple';
      } else if (isTakenByOther) {
        badgeText = `เลือกแล้ว (${takenBy.fullName})`;
        badgeClass = 'taken';
      } else {
        badgeText = 'ว่าง';
        badgeClass = 'available';
      }

      const isChecked = isUserRegisteredInThis && takenBy && API.cleanPhone(takenBy.username) === API.cleanPhone(currentUser?.username);

      return `
        <label class="role-radio-label ${isDisabled ? 'disabled' : ''} ${isChecked ? 'selected' : ''}">
          <input type="radio" name="selectedRole" value="${role}" 
                 ${isDisabled ? 'disabled' : ''} 
                 ${isChecked ? 'checked' : ''}
                 onchange="App.handleRoleSelectionChange(this)">
          <span style="font-weight:700; color:var(--text-primary); font-size:0.95rem;">${role}</span>
          <span class="role-tag-badge ${badgeClass}">${badgeText}</span>
        </label>
      `;
    }).join('');

    // Configure Action Buttons & Alerts
    if (isRegisteredInOther) {
      alertBox.style.display = 'block';
      alertBox.className = 'auth-alert-box';
      alertBox.style.borderLeftColor = '#f59e0b';
      alertBox.style.background = '#fffbeb';
      alertBox.style.color = '#b45309';
      alertBox.innerHTML = `⚠️ <strong>ไม่สามารถสมัครรายการนี้ได้:</strong> ท่านได้ลงทะเบียนในรายการ <em>"${this.state.userApplication.competition}"</em> เรียบร้อยแล้ว (กำหนดให้ 1 บัญชีสามารถสมัครได้เพียง 1 รายการเท่านั้น)`;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
    } else if (isFull && !isUserRegisteredInThis) {
      alertBox.style.display = 'block';
      alertBox.className = 'auth-alert-box';
      alertBox.style.borderLeftColor = '#ef4444';
      alertBox.style.background = '#fef2f2';
      alertBox.style.color = '#b91c1c';
      alertBox.innerHTML = `⚠️ <strong>ปิดรับสมัครแล้ว:</strong> รายการนี้มีผู้สมัครครบ ${comp.quota} ท่านตามจำนวนที่กำหนดแล้ว`;
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
    } else {
      alertBox.style.display = 'none';
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }

    // Cancel Button logic
    if (isUserRegisteredInThis) {
      cancelCompBtn.style.display = 'inline-flex';
      submitBtn.textContent = 'บันทึกการแก้ไขตำแหน่ง';
    } else {
      cancelCompBtn.style.display = 'none';
      submitBtn.textContent = 'ยืนยันการสมัครเข้าร่วม';
    }

    // Show Modal
    document.getElementById('competitionModal').classList.add('active');
  },

  closeCompetitionModal() {
    document.getElementById('competitionModal').classList.remove('active');
    this.state.selectedCompetition = null;
  },

  handleRoleSelectionChange(input) {
    document.querySelectorAll('.role-radio-label').forEach(label => {
      label.classList.toggle('selected', label.contains(input) && input.checked);
    });
  },

  /**
   * Handle Competition Application Submission
   */
  async submitApplication() {
    if (!this.state.currentUser) {
      this.showToast('กรุณาเข้าสู่ระบบก่อนสมัคร', 'error');
      this.closeCompetitionModal();
      this.switchView('login');
      return;
    }

    const selectedRoleInput = document.querySelector('input[name="selectedRole"]:checked');
    if (!selectedRoleInput) {
      this.showToast('กรุณาเลือกตำแหน่งคณะกรรมการที่ท่านต้องการทำหน้าที่', 'error');
      return;
    }

    const selectedRole = selectedRoleInput.value;
    const compName = this.state.selectedCompetition.name;

    // RULE: 1 บัญชีสามารถสมัครได้เพียง 1 รายการเท่านั้น
    if (this.state.userApplication && this.state.userApplication.competition !== compName) {
      this.showToast(`ท่านได้ลงทะเบียนในรายการ "${this.state.userApplication.competition}" เรียบร้อยแล้ว (1 บัญชีสามารถสมัครได้เพียง 1 รายการเท่านั้น)`, 'error');
      return;
    }

    this.showLoading(true);
    try {
      const response = await API.submitApplication(
        this.state.currentUser.username,
        compName,
        selectedRole
      );

      if (response && response.success) {
        this.showToast(response.message || 'บันทึกการสมัครเรียบร้อยแล้ว', 'success');
        this.closeCompetitionModal();
        await this.loadInitialData();
      } else {
        this.showToast(response.message || 'ไม่สามารถสมัครได้', 'error');
      }
    } catch (err) {
      console.error(err);
      this.showToast('เกิดข้อผิดพลาดในการบันทึกข้อมูล', 'error');
    } finally {
      this.showLoading(false);
    }
  },

  /**
   * Cancel / Withdraw Current Application
   */
  async cancelApplication() {
    if (!this.state.currentUser) return;
    if (!confirm('ท่านต้องการยกเลิกการสมัครในรายการนี้ใช่หรือไม่? หลังจากยกเลิกแล้วท่านสามารถเลือกสมัครรายการอื่นได้')) {
      return;
    }

    this.showLoading(true);
    try {
      const response = await API.cancelApplication(this.state.currentUser.username);
      if (response && response.success) {
        this.showToast(response.message || 'ยกเลิกการสมัครเรียบร้อยแล้ว', 'success');
        this.closeCompetitionModal();
        await this.loadInitialData();
      } else {
        this.showToast(response.message || 'ไม่สามารถยกเลิกได้', 'error');
      }
    } catch (err) {
      console.error(err);
      this.showToast('เกิดข้อผิดพลาดในการยกเลิกข้อมูล', 'error');
    } finally {
      this.showLoading(false);
    }
  },

  /**
   * Render Public Overview Table
   * Rule: หน้าหลักให้ดูว่าแต่ละรายการ มีใครสมัคร โดยแสดง รายชื่อ - สกุล ,สาขาวิชา ,ตำแหน่งที่สมัคร ,โรงเรียน
   */
  renderPublicOverview() {
    const tbody = document.getElementById('publicTableBody');
    if (!tbody || !this.state.initialData) return;

    let regs = this.state.initialData.registrations || [];

    // Filter by Competition
    if (this.state.filterCompetition && this.state.filterCompetition !== 'ALL') {
      regs = regs.filter(r => r.competition === this.state.filterCompetition);
    }

    // Search Query
    if (this.state.searchQuery.trim() !== '') {
      const q = this.state.searchQuery.toLowerCase().trim();
      regs = regs.filter(r =>
        (r.fullName || '').toLowerCase().includes(q) ||
        (r.competition || '').toLowerCase().includes(q) ||
        (r.school || '').toLowerCase().includes(q) ||
        (r.subject || '').toLowerCase().includes(q) ||
        (r.committeeRole || '').toLowerCase().includes(q)
      );
    }

    if (regs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding: 2.5rem; color: var(--text-muted);">
            <div style="font-size: 1.1rem; font-weight: 600; margin-bottom: 0.35rem;">ไม่พบข้อมูลตามเงื่อนไขที่ค้นหา</div>
            <div style="font-size: 0.85rem;">ท่านสามารถปรับเปลี่ยนคำค้นหา หรือเลือกดูรายการอื่นได้</div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = regs.map((r, i) => `
      <tr>
        <td style="text-align:center; font-weight: 700;">${i + 1}</td>
        <td><strong>${r.fullName}</strong></td>
        <td><span class="tag-pill tag-pill-gold">${r.committeeRole}</span></td>
        <td><span style="font-weight: 600; color: var(--orange-700);">${r.competition}</span></td>
        <td>${r.subject || '-'}</td>
        <td><span class="tag-pill tag-pill-school">${r.school}</span></td>
        <td style="font-size: 0.82rem; color: var(--text-muted);">${r.timestamp}</td>
      </tr>
    `).join('');
  },

  /**
   * Update Summary Statistics on Hero Card
   */
  updateStats() {
    if (!this.state.initialData) return;
    const comps = this.state.initialData.competitions || [];
    const regs = this.state.initialData.registrations || [];

    const totalComps = comps.length;
    const totalRegs = regs.length;
    const fullComps = comps.filter(c => c.registeredCount >= c.quota).length;

    const statComps = document.getElementById('statTotalCompetitions');
    const statRegs = document.getElementById('statTotalRegistered');
    const statFull = document.getElementById('statFullCompetitions');

    if (statComps) statComps.textContent = totalComps;
    if (statRegs) statRegs.textContent = totalRegs;
    if (statFull) statFull.textContent = fullComps;
  },

  /**
   * Export Table Data to Excel (.xlsx) using SheetJS
   */
  exportToExcel() {
    if (!this.state.initialData) return;
    const regs = this.state.initialData.registrations || [];

    if (regs.length === 0) {
      this.showToast('ไม่มีข้อมูลสำหรับส่งออก', 'info');
      return;
    }

    // Prepare clean data array in Thai
    const exportData = regs.map((r, index) => ({
      'ลำดับ': index + 1,
      'ชื่อ - สกุล': r.fullName,
      'ตำแหน่งกรรมการที่สมัคร': r.committeeRole,
      'รายการการแข่งขัน': r.competition,
      'สาขาวิชา': r.subject,
      'สังกัดโรงเรียน': r.school,
      'ตำแหน่งในโรงเรียน': r.position || '',
      'วิทยฐานะ': r.academicStanding || '',
      'วันที่แข่งขัน': r.date || '',
      'สถานที่แข่งขัน': r.venue || '',
      'วันเวลาที่ลงทะเบียน': r.timestamp
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'รายชื่อคณะกรรมการ');

    // Auto-fit column width
    const maxWidths = [6, 25, 20, 45, 15, 30, 15, 15, 15, 25, 20];
    worksheet['!cols'] = maxWidths.map(w => ({ wch: w }));

    const dateStr = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `รายชื่อคณะกรรมการ_ศิลปหัตถกรรมชัยภูมิ_2569_${dateStr}.xlsx`);
    this.showToast('ส่งออกไฟล์ Excel เรียบร้อยแล้ว', 'success');
  },

  /**
   * Export to PDF / Print Official Document
   */
  exportToPDF() {
    window.print();
  },

  /**
   * Toast Notifications Helper
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let icon = 'ℹ️';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${icon}</span>
      <div style="flex:1;">${message}</div>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  },

  showLoading(show) {
    const loader = document.getElementById('globalLoading');
    if (loader) {
      loader.style.display = show ? 'flex' : 'none';
    }
  },

  /**
   * Bind DOM Events & Form Submissions
   */
  bindEvents() {
    // Nav Click Handling
    document.querySelectorAll('[data-view]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView(el.dataset.view);
      });
    });

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('คุณต้องการออกจากระบบหรือไม่?')) {
          this.saveUserSession(null);
          this.showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
          this.switchView('public-overview');
        }
      });
    }

    // Public Table Search & Filter
    const searchInput = document.getElementById('publicSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        this.renderPublicOverview();
      });
    }

    const filterComp = document.getElementById('filterCompSelect');
    if (filterComp) {
      filterComp.addEventListener('change', (e) => {
        this.state.filterCompetition = e.target.value;
        this.renderPublicOverview();
      });
    }

    // Phone Auto-format (###-###-####) on inputs & Ensure Leading Zero
    ['regPhone', 'loginUsername', 'forgotPhone'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', (e) => {
          let val = e.target.value.replace(/[^0-9]/g, '');
          if (val.length > 10) val = val.slice(0, 10);
          if (val.length > 6) {
            e.target.value = `${val.slice(0,3)}-${val.slice(3,6)}-${val.slice(6)}`;
          } else if (val.length > 3) {
            e.target.value = `${val.slice(0,3)}-${val.slice(3)}`;
          } else {
            e.target.value = val;
          }
        });

        input.addEventListener('blur', (e) => {
          let val = e.target.value.replace(/[^0-9]/g, '');
          if (val.length === 9) {
            val = '0' + val;
            e.target.value = `${val.slice(0,3)}-${val.slice(3,6)}-${val.slice(6)}`;
          }
        });
      }
    });

    // Password Real-time Validator
    const regPwd = document.getElementById('regPassword');
    const regConfirmPwd = document.getElementById('regConfirmPassword');
    if (regPwd) {
      regPwd.addEventListener('input', () => {
        const val = regPwd.value;
        const hasNum = /[0-9]/.test(val);
        const hasLetter = /[a-zA-Z]/.test(val);
        const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(val);

        document.getElementById('ruleNumber')?.classList.toggle('met', hasNum);
        document.getElementById('ruleLetter')?.classList.toggle('met', hasLetter);
        document.getElementById('ruleSpecial')?.classList.toggle('met', hasSpecial);

        if (regConfirmPwd && regConfirmPwd.value) {
          document.getElementById('pwdMatchHint')?.classList.toggle('valid', val === regConfirmPwd.value);
          document.getElementById('pwdMatchHint')?.classList.toggle('invalid', val !== regConfirmPwd.value);
        }
      });
    }

    if (regConfirmPwd) {
      regConfirmPwd.addEventListener('input', () => {
        const match = regPwd.value === regConfirmPwd.value && regConfirmPwd.value !== '';
        const hint = document.getElementById('pwdMatchHint');
        if (hint) {
          hint.textContent = match ? '✓ รหัสผ่านตรงกัน' : '✗ รหัสผ่านยังไม่ตรงกัน';
          hint.className = `form-helper ${match ? 'valid' : 'invalid'}`;
        }
      });
    }

    // 1. Login Form Submit
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const rawUser = document.getElementById('loginUsername').value;
        const username = API.cleanPhone(rawUser);
        const password = document.getElementById('loginPassword').value;

        this.showLoading(true);
        try {
          const res = await API.login(username, password);
          if (res && res.success) {
            this.showToast(res.message || 'เข้าสู่ระบบสำเร็จ', 'success');
            this.saveUserSession(res.user);
            this.state.userApplication = res.application || null;
            await this.loadInitialData();
            this.switchView('competitions');
          } else {
            this.showToast(res.message || 'เบอร์โทรหรือรหัสผ่านไม่ถูกต้อง', 'error');
          }
        } catch (err) {
          this.showToast('เกิดข้อผิดพลาดในการเข้าสู่ระบบ', 'error');
        } finally {
          this.showLoading(false);
        }
      });
    }

    // 2. Register Form Submit
    const regForm = document.getElementById('registerForm');
    if (regForm) {
      regForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const prefix = document.getElementById('regPrefix').value;
        const firstName = document.getElementById('regFirstName').value.trim();
        const middleName = document.getElementById('regMiddleName').value.trim();
        const lastName = document.getElementById('regLastName').value.trim();
        const school = document.getElementById('regSchool').value;
        const phone = document.getElementById('regPhone').value;
        const email = document.getElementById('regEmail').value.trim();
        const position = document.getElementById('regPosition').value;
        const academicStanding = document.getElementById('regAcademicStanding').value;
        const subject = document.getElementById('regSubject').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        // Frontend Validations
        if (!prefix || !firstName || !lastName || !school || !phone || !email || !position || !academicStanding || !subject || !password) {
          this.showToast('กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วนทุกช่อง', 'error');
          return;
        }

        if (password !== confirmPassword) {
          this.showToast('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน', 'error');
          return;
        }

        const cleanP = API.cleanPhone(phone);
        if (cleanP.length !== 10) {
          this.showToast('เบอร์โทรศัพท์ต้องมี 10 หลัก', 'error');
          return;
        }

        this.showLoading(true);
        try {
          const res = await API.register({
            prefix, firstName, middleName, lastName, school, phone, email,
            position, academicStanding, subject, password, confirmPassword
          });

          if (res && res.success) {
            this.showToast(res.message, 'success');
            regForm.reset();
            // Pre-fill username on login form and switch
            document.getElementById('loginUsername').value = API.formatPhone(cleanP);
            this.switchView('login');
          } else {
            this.showToast(res.message || 'การลงทะเบียนล้มเหลว', 'error');
          }
        } catch (err) {
          this.showToast('เกิดข้อผิดพลาดในการลงทะเบียน', 'error');
        } finally {
          this.showLoading(false);
        }
      });
    }

    // 3. Forgot Password Form Submit
    const forgotForm = document.getElementById('forgotPasswordForm');
    if (forgotForm) {
      forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const phone = document.getElementById('forgotPhone').value;
        const email = document.getElementById('forgotEmail').value.trim();
        const newPwd = document.getElementById('forgotNewPassword')?.value || '';

        this.showLoading(true);
        try {
          const res = await API.forgotPassword(phone, email, newPwd);
          if (res && res.success) {
            if (res.hint) {
              alert(`${res.message}\n${res.hint}`);
            } else {
              this.showToast(res.message, 'success');
            }
            forgotForm.reset();
            this.switchView('login');
          } else {
            this.showToast(res.message || 'ไม่พบข้อมูลที่ตรงกัน', 'error');
          }
        } catch (err) {
          this.showToast('เกิดข้อผิดพลาด', 'error');
        } finally {
          this.showLoading(false);
        }
      });
    }
  }
};

// Start application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
