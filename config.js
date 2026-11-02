/* ============================================================
   ไฟล์ตั้งค่าระบบ (แก้ไขค่าในไฟล์นี้ได้โดยตรง)
   ------------------------------------------------------------
   1) APPS_SCRIPT_URL : ใส่ URL ของ Google Apps Script Web App
      ที่ได้จากการ Deploy (ลงท้ายด้วย /exec)
      ตัวอย่าง: https://script.google.com/macros/s/AKfycb.../exec
      - ถ้ายังไม่ใส่ (เว้นว่าง) ระบบจะทำงานใน "โหมดตัวอย่าง"
        โดยใช้ข้อมูลจำลอง เพื่อให้ทดสอบหน้าเว็บได้ก่อน

   2) ALLOW_MULTIPLE_EVENTS : กำหนดว่าผู้ใช้หนึ่งคนสมัครเป็น
      กรรมการได้กี่รายการ
      - false = สมัครได้เพียง 1 รายการ (ตามข้อกำหนด "เลือก 1 รายการ")
      - true  = สมัครได้หลายรายการ (แต่ซ้ำรายการเดิมไม่ได้)
   ============================================================ */

window.SILLAPA_CONFIG = {
  "https://script.google.com/macros/s/AKfycbwYHwQyCd3sgpAE1DOexEvUd6W43cH8v9WwBBguuoiW69aiAL3ke6Il1lFp93ezHQceZQ/exec",
  ALLOW_MULTIPLE_EVENTS: false
};
