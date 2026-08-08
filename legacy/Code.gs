/**
 * e-SIH (Sistem Informasi Highlight & Laporan Aktivitas Mingguan)
 * Backend Script - Google Apps Script (GAS)
 * MONOLITHIC VERSION (All-in-one)
 */

const SHEETS = {
  USERS: 'Users',
  PROGRAMS: 'Master_Program',
  ACTIVITIES: 'Weekly_Activities'
};

const SPREADSHEET_ID = '';

function doGet(e) {
  const template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('e-SIH - Highlight Report & Activity Tracking')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function getSpreadsheet() {
  try {
    if (typeof SPREADSHEET_ID !== 'undefined' && SPREADSHEET_ID && SPREADSHEET_ID.trim() !== '') {
      return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
    }
    const propId = PropertiesService.getScriptProperties().getProperty('DB_ID');
    if (propId) {
      try {
        return SpreadsheetApp.openById(propId);
      } catch(e) {
        PropertiesService.getScriptProperties().deleteProperty('DB_ID');
      }
    }
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active) return active;
    return null;
  } catch (err) {
    Logger.log("Error getting spreadsheet: " + err.toString());
    return null;
  }
}

function initDatabase() {
  let ss = getSpreadsheet();
  let isNewSpreadsheet = false;
  
  if (!ss) {
    try {
      ss = SpreadsheetApp.create("e-SIH Database (Auto-Generated)");
      PropertiesService.getScriptProperties().setProperty('DB_ID', ss.getId());
      isNewSpreadsheet = true;
    } catch (e) {
      return { success: false, message: "Gagal membuat/mengakses Spreadsheet. Error: " + e.message };
    }
  }

  // Users Sheet
  let sheetUsers = ss.getSheetByName(SHEETS.USERS);
  if (!sheetUsers) {
    sheetUsers = ss.insertSheet(SHEETS.USERS);
    sheetUsers.appendRow(['Email', 'Nama', 'Role', 'SubBagian']);
    const usersData = [
      ['pimpinan@perusahaan.com', 'Kasubag SDM & Sistem', 'Pimpinan', 'SDM & Sistem'],
      ['salman@perusahaan.com', 'Salman', 'Bawahan', 'IT Development'],
      ['fitri@perusahaan.com', 'Fitri', 'Bawahan', 'SDM'],
      ['herbina@perusahaan.com', 'Herbina', 'Bawahan', 'HSE'],
      ['agung@perusahaan.com', 'Agung', 'Bawahan', 'HSE'],
      ['reza@perusahaan.com', 'Reza', 'Bawahan', 'IT Infrastructure'],
      ['dina@perusahaan.com', 'Dina', 'Bawahan', 'SDM & Umum']
    ];
    sheetUsers.getRange(2, 1, usersData.length, usersData[0].length).setValues(usersData);
    sheetUsers.getRange("1:1").setFontWeight("bold").setBackground("#d9ead3");
  }

  // Programs Sheet
  let sheetPrograms = ss.getSheetByName(SHEETS.PROGRAMS);
  if (!sheetPrograms) {
    sheetPrograms = ss.insertSheet(SHEETS.PROGRAMS);
    sheetPrograms.appendRow(['ID_Program', 'Kategori', 'Nama_Item', 'Status', 'Progress', 'Keterangan']);
    const programData = [
      ['PROG-01', 'A. ENABLING DIGITAL OPERATION', 'IT Development', 'On Progress', 80, 'Integrasi sistem & ERP'],
      ['PROG-02', 'A. ENABLING DIGITAL OPERATION', 'IT Network & Infrastructure', 'On Progress', 60, 'Upgrade bandwidth & maintenance'],
      ['PROG-03', 'A. ENABLING DIGITAL OPERATION', 'IT Administration', 'Open', 10, 'Perpanjangan Lisensi Antivirus'],
      ['PROG-04', 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', 'Sertifikasi Eksternal', 'On Progress', 25, 'Audit Halal & Kosher'],
      ['PROG-05', 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', 'Audit Internal', 'On Progress', 70, 'Audit Mutu Semester 1'],
      ['PROG-06', 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', 'Inspeksi & Monitoring', 'Open', 15, 'Monitoring limbah'],
      ['PROG-07', 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', 'Emergency Preparedness', 'Closed', 100, 'Simulasi kebakaran selesai'],
      ['PROG-08', 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', 'HSE Training', 'On Progress', 30, 'Pelatihan K3 Umum'],
      ['PROG-09', 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', 'Risk Management', 'On Progress', 50, 'Review HIRADC']
    ];
    sheetPrograms.getRange(2, 1, programData.length, programData[0].length).setValues(programData);
    sheetPrograms.getRange("1:1").setFontWeight("bold").setBackground("#c9daf8");
  }

  // Activities Sheet
  let sheetActivities = ss.getSheetByName(SHEETS.ACTIVITIES);
  if (!sheetActivities) {
    sheetActivities = ss.insertSheet(SHEETS.ACTIVITIES);
    sheetActivities.appendRow([
      'ID_Activity', 'No', 'ID_Program', 'Kategori_Program', 'Item_Name',
      'Kegiatan', 'Description_Action', 'Start_Date', 'Due_Date', 'Closed_Date',
      'Tindak_Lanjut', 'Kendala', 'Status', 'Keterangan_Remarks', 'PIC_Email',
      'PIC_Nama', 'Created_At'
    ]);

    const today = new Date();
    const formatDateStr = (d) => d.toISOString().split('T')[0];
    const todayStr = formatDateStr(today);
    const getPastDate = (daysAgo) => {
      let d = new Date(today);
      d.setDate(d.getDate() - daysAgo);
      return formatDateStr(d);
    };

    const activitiesData = [
      ['ACT-001', 1, 'PROG-01', 'A. ENABLING DIGITAL OPERATION', 'IT Development', 'Integrasi SAP ERP Module', 'Develop & Testing API', getPastDate(90), getPastDate(60), getPastDate(60), 'UAT selesai', '-', 'Closed', 'Sukses go-live', 'salman@perusahaan.com', 'Salman', getPastDate(90)],
      ['ACT-002', 2, 'PROG-01', 'A. ENABLING DIGITAL OPERATION', 'IT Development', 'Pembuatan Modul Approval HR', 'Coding & Design', getPastDate(50), getPastDate(20), getPastDate(20), 'Deploy ke Production', '-', 'Closed', 'Modul HR live', 'salman@perusahaan.com', 'Salman', getPastDate(50)],
      ['ACT-003', 3, 'PROG-01', 'A. ENABLING DIGITAL OPERATION', 'IT Development', 'Perbaikan Bug Absensi', 'Tracing bug di backend', getPastDate(15), getPastDate(5), getPastDate(6), 'Upload patch', '-', 'Closed', 'Absensi lancar', 'salman@perusahaan.com', 'Salman', getPastDate(15)],
      ['ACT-004', 4, 'PROG-01', 'A. ENABLING DIGITAL OPERATION', 'IT Development', 'Migrasi Database Utama', 'Backup & Restore Data', getPastDate(5), getPastDate(-10), '', 'Test integrasi', 'Kapasitas server penuh', 'On Progress', 'Menunggu persetujuan upgrade server', 'salman@perusahaan.com', 'Salman', getPastDate(5)],
      
      ['ACT-005', 5, 'PROG-02', 'A. ENABLING DIGITAL OPERATION', 'IT Network & Infrastructure', 'Pemasangan Access Point Area Produksi', 'Tarik kabel & Pasang AP', getPastDate(60), getPastDate(55), getPastDate(55), 'Sinyal stabil', '-', 'Closed', 'Selesai tepat waktu', 'reza@perusahaan.com', 'Reza', getPastDate(60)],
      ['ACT-006', 6, 'PROG-02', 'A. ENABLING DIGITAL OPERATION', 'IT Network & Infrastructure', 'Maintenance Server Room', 'Pembersihan fisik & cek kabel', getPastDate(30), getPastDate(28), getPastDate(29), 'Selesai', '-', 'Closed', 'Suhu server stabil', 'reza@perusahaan.com', 'Reza', getPastDate(30)],
      ['ACT-007', 7, 'PROG-02', 'A. ENABLING DIGITAL OPERATION', 'IT Network & Infrastructure', 'Upgrade Bandwidth ISP', 'Meeting dengan Telkom', getPastDate(10), getPastDate(-5), '', 'Draft BAST', 'Menunggu tanda tangan GM', 'On Progress', '-', 'reza@perusahaan.com', 'Reza', getPastDate(10)],
      
      ['ACT-008', 8, 'PROG-04', 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', 'Sertifikasi Eksternal', 'Persiapan Audit Halal', 'Review dokumen bahan baku', getPastDate(120), getPastDate(90), getPastDate(85), 'Dokumen di-submit', '-', 'Closed', 'Sertifikat terbit', 'fitri@perusahaan.com', 'Fitri', getPastDate(120)],
      ['ACT-009', 9, 'PROG-04', 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', 'Sertifikasi Eksternal', 'Audit Surveillance ISO 9001', 'Mendampingi auditor', getPastDate(45), getPastDate(40), getPastDate(40), 'Perbaikan minor', '-', 'Closed', 'Lolos audit', 'fitri@perusahaan.com', 'Fitri', getPastDate(45)],
      ['ACT-010', 10, 'PROG-05', 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', 'Audit Internal', 'Audit Mutu Internal Semester 1', 'Pelaksanaan Audit', getPastDate(15), getPastDate(-15), '', 'Kompilasi temuan', 'Beberapa auditee sedang cuti', 'On Progress', 'Jadwal diatur ulang', 'fitri@perusahaan.com', 'Fitri', getPastDate(15)],
      
      ['ACT-011', 11, 'PROG-07', 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', 'Emergency Preparedness', 'Simulasi Kebakaran Gabungan', 'Praktik pemadaman api', getPastDate(75), getPastDate(70), getPastDate(70), 'Evaluasi waktu tanggap', '-', 'Closed', 'Waktu evakuasi 3 menit', 'herbina@perusahaan.com', 'Herbina', getPastDate(75)],
      ['ACT-012', 12, 'PROG-08', 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', 'HSE Training', 'Pelatihan K3 Umum Batch 1', 'Training in-house', getPastDate(40), getPastDate(35), getPastDate(35), 'Sertifikat internal dibagikan', '-', 'Closed', 'Dihadiri 30 orang', 'herbina@perusahaan.com', 'Herbina', getPastDate(40)],
      ['ACT-013', 13, 'PROG-09', 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', 'Risk Management', 'Review HIRADC Pabrik', 'Inspeksi lapangan', getPastDate(10), getPastDate(-10), '', 'Revisi dokumen', 'Menunggu input manager produksi', 'On Progress', '-', 'herbina@perusahaan.com', 'Herbina', getPastDate(10)],

      ['ACT-014', 14, 'PROG-08', 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', 'HSE Training', 'Pelatihan First Aid', 'Kerjasama dengan PMI', getPastDate(100), getPastDate(98), getPastDate(98), 'Selesai', '-', 'Closed', 'Berjalan lancar', 'agung@perusahaan.com', 'Agung', getPastDate(100)],
      ['ACT-015', 15, 'PROG-09', 'C. HEALTH, SAFETY AND ENVIRONMENT (HSE)', 'Risk Management', 'Inspeksi APAR Bulanan', 'Cek tekanan & kondisi fisik', getPastDate(20), getPastDate(18), getPastDate(19), 'Penggantian 2 APAR bocor', '-', 'Closed', 'Aman', 'agung@perusahaan.com', 'Agung', getPastDate(20)],
      ['ACT-016', 16, 'PROG-06', 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', 'Inspeksi & Monitoring', 'Pengujian Kualitas Air Limbah', 'Ambil sampel ke lab', todayStr, getPastDate(-5), '', 'Menunggu hasil lab eksternal', 'Lab penuh', 'On Progress', '-', 'agung@perusahaan.com', 'Agung', todayStr],
      
      ['ACT-017', 17, 'PROG-03', 'A. ENABLING DIGITAL OPERATION', 'IT Administration', 'Perpanjangan Lisensi Microsoft', 'Rekap user aktif', todayStr, getPastDate(-7), '', 'Approval PO', '-', 'Open', '-', 'dina@perusahaan.com', 'Dina', todayStr],
      ['ACT-018', 18, 'PROG-03', 'A. ENABLING DIGITAL OPERATION', 'IT Administration', 'Pengadaan Laptop Staff Baru', 'Survey harga vendor', getPastDate(5), getPastDate(-14), '', 'Tunggu barang datang', 'Stok kosong di distributor', 'On Progress', '-', 'dina@perusahaan.com', 'Dina', getPastDate(5)],

      ['ACT-019', 19, 'PROG-05', 'B. SUSTAINABLE & RESPONSIBLE OPERATIONS', 'Audit Internal', 'Meeting Tinjauan Manajemen', 'Persiapan materi presentasi KPI', getPastDate(3), getPastDate(-2), '', 'Finalisasi slide', '-', 'On Progress', '-', 'pimpinan@perusahaan.com', 'Kasubag SDM & Sistem', getPastDate(3)]
    ];
    sheetActivities.getRange(2, 1, activitiesData.length, activitiesData[0].length).setValues(activitiesData);
    sheetActivities.getRange("1:1").setFontWeight("bold").setBackground("#fff2cc");
  }

  const sheet1 = ss.getSheetByName("Sheet1");
  if (sheet1) {
    try { ss.deleteSheet(sheet1); } catch(e) {}
  }
  return { success: true };
}

function getDashboardData() {
  const user = getCurrentUser();
  const activities = getWeeklyActivities({ pic: 'ALL', status: 'ALL', category: 'ALL' });
  
  let totalItems = activities.length;
  let openCount = 0;
  let closedCount = 0;
  let cancelledCount = 0;
  let onProgressCount = 0;

  let programMap = {};
  let employeeMap = {};

  activities.forEach(act => {
    const st = (act.status || '').toUpperCase();
    let progVal = 0;

    if (st === 'CLOSED' || st === 'DONE') {
      closedCount++;
      progVal = 100;
    } else if (st === 'CANCELLED') {
      cancelledCount++;
    } else if (st === 'ON PROGRESS') {
      onProgressCount++;
      openCount++;
      progVal = 50;
    } else {
      openCount++;
      progVal = 0; // Open
    }

    // --- Hierarchical Program Progress ---
    const progId = act.idProgram || 'UNASSIGNED';
    const progCat = act.kategoriProgram || 'Uncategorized';
    const subItem = act.itemName || 'Umum';

    if (!programMap[progId]) {
      programMap[progId] = { id: progId, name: progCat, activities: 0, progressSum: 0, subItemsMap: {} };
    }
    programMap[progId].activities++;
    programMap[progId].progressSum += progVal;

    if (!programMap[progId].subItemsMap[subItem]) {
      programMap[progId].subItemsMap[subItem] = { name: subItem, activities: 0, progressSum: 0 };
    }
    programMap[progId].subItemsMap[subItem].activities++;
    programMap[progId].subItemsMap[subItem].progressSum += progVal;

    // --- Employee Progress ---
    const picEmail = act.picEmail;
    const picNama = act.picNama;
    if (picEmail) {
      if (!employeeMap[picEmail]) {
        employeeMap[picEmail] = { email: picEmail, name: picNama, total: 0, progressSum: 0, open: 0, onProgress: 0, closed: 0 };
      }
      employeeMap[picEmail].total++;
      employeeMap[picEmail].progressSum += progVal;
      if (progVal === 100) employeeMap[picEmail].closed++;
      else if (progVal === 50) employeeMap[picEmail].onProgress++;
      else employeeMap[picEmail].open++;
    }
  });

  // Calculate Aggregates
  let finalPrograms = [];
  let overallProgSum = 0;

  Object.values(programMap).forEach(prog => {
    const pProg = prog.activities > 0 ? Math.round(prog.progressSum / prog.activities) : 0;
    overallProgSum += pProg;
    
    let subItems = [];
    Object.values(prog.subItemsMap).forEach(sub => {
      subItems.push({
        name: sub.name,
        activities: sub.activities,
        progress: sub.activities > 0 ? Math.round(sub.progressSum / sub.activities) : 0
      });
    });

    finalPrograms.push({
      id: prog.id,
      name: prog.name,
      activities: prog.activities,
      progress: pProg,
      subItems: subItems
    });
  });

  let finalEmployees = [];
  Object.values(employeeMap).forEach(emp => {
    finalEmployees.push({
      email: emp.email,
      name: emp.name,
      total: emp.total,
      open: emp.open,
      onProgress: emp.onProgress,
      closed: emp.closed,
      progress: emp.total > 0 ? Math.round(emp.progressSum / emp.total) : 0
    });
  });
  
  // Sort by highest progress
  finalEmployees.sort((a,b) => b.progress - a.progress);

  const overallPerformance = finalPrograms.length > 0 ? Math.round(overallProgSum / finalPrograms.length) : 0;

  return {
    kpi: {
      totalItems, openCount, closedCount, cancelledCount, onProgressCount,
      closurePercentage: totalItems > 0 ? Math.round((closedCount / totalItems) * 100) : 0
    },
    programs: finalPrograms,
    employees: finalEmployees,
    overallPerformance: overallPerformance,
    user: user,
    recentHighlights: activities.slice(0, 15),
    activities: activities,
    usersList: getUsersList(),
    masterPrograms: getMasterPrograms()
  };
}

function getMasterPrograms() {
  const ss = getSpreadsheet();
  if (!ss) return [];
  const sheet = ss.getSheetByName(SHEETS.PROGRAMS);
  if (!sheet) return [];
  const data = sheet.getDataRange().getValues();
  let programs = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (row[0]) {
      programs.push({
        idProgram: row[0],
        kategori: row[1],
        namaItem: row[2],
        status: row[3],
        progress: row[4],
        keterangan: row[5]
      });
    }
  }
  return programs;
}

function getCurrentUser() {
  let email = "pimpinan@perusahaan.com";
  try { email = Session.getActiveUser().getEmail() || email; } catch (e) {}
  return getUserByEmail(email);
}

function loginUser(emailInput, passwordInput) {
  if (!emailInput) return { success: false, message: "Email harus diisi." };
  const user = getUserByEmail(emailInput.trim());
  if (user && user.email === emailInput.trim().toLowerCase()) return { success: true, user: user };
  return { success: false, message: "Email tidak terdaftar." };
}

function getUserByEmail(emailStr) {
  emailStr = String(emailStr || 'pimpinan@perusahaan.com').trim().toLowerCase();
  const ss = getSpreadsheet();
  let role = "Bawahan", subBagian = "SDM & Sistem", name = emailStr.split('@')[0];

  if (ss) {
    try {
      const userSheet = ss.getSheetByName(SHEETS.USERS);
      if (userSheet) {
        const data = userSheet.getDataRange().getValues();
        for (let i = 1; i < data.length; i++) {
          if (data[i][0] && data[i][0].toString().toLowerCase() === emailStr) {
            name = data[i][1]; role = data[i][2]; subBagian = data[i][3];
            return { email: emailStr, name, role, subBagian };
          }
        }
      }
    } catch (err) {}
  }
  if (emailStr.includes("pimpinan") || emailStr.includes("admin")) role = "Pimpinan";
  return { email: emailStr, name: name.charAt(0).toUpperCase() + name.slice(1), role, subBagian };
}

function getWeeklyActivities(filters) {
  const user = getCurrentUser();
  const ss = getSpreadsheet();
  if (!ss) return [];
  const sheet = ss.getSheetByName(SHEETS.ACTIVITIES);
  if (!sheet) return [];
  
  const data = sheet.getDataRange().getValues();
  let activities = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const picEmail = (row[14] || "").toString().toLowerCase();

    if (user.role === "Bawahan" && picEmail !== user.email.toLowerCase()) continue;
    if (filters && filters.pic && filters.pic !== 'ALL' && picEmail !== filters.pic.toLowerCase()) continue;
    if (filters && filters.status && filters.status !== 'ALL' && (row[12] || "").toString().toUpperCase() !== filters.status.toUpperCase()) continue;
    if (filters && filters.category && filters.category !== 'ALL' && (row[3] || "").toString() !== filters.category) continue;
    if (filters && filters.search) {
      const s = filters.search.toLowerCase();
      if (!row[5].toString().toLowerCase().includes(s) && !row[6].toString().toLowerCase().includes(s) && !row[15].toString().toLowerCase().includes(s)) continue;
    }
    
    activities.push({
      id: row[0], no: row[1], idProgram: row[2], kategoriProgram: row[3], itemName: row[4],
      kegiatan: row[5], descriptionAction: row[6], startDate: formatDate(row[7]),
      dueDate: formatDate(row[8]), closedDate: formatDate(row[9]), tindakLanjut: row[10],
      kendala: row[11], status: row[12] || 'Open', remarks: row[13], picEmail: row[14], picNama: row[15]
    });
  }
  return activities;
}

function saveActivity(formObj) {
  const user = getCurrentUser();
  const ss = getSpreadsheet();
  if (!ss) return { success: false, message: "Spreadsheet error." };
  let sheet = ss.getSheetByName(SHEETS.ACTIVITIES);
  
  const data = sheet.getDataRange().getValues();
  const id = formObj.id || ('ACT-' + String(Date.now()).slice(-5));
  const now = new Date().toISOString().split('T')[0];
  let closedDate = formObj.closedDate || '';
  if ((formObj.status === 'Closed' || formObj.status === 'Done') && !closedDate) closedDate = now;

  let rowToUpdate = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) { rowToUpdate = i + 1; break; }
  }

  let picEmail = formObj.picEmail || user.email;
  let picNama = formObj.picNama || user.name;
  if (user.role === 'Bawahan') { picEmail = user.email; picNama = user.name; }

  const rowValues = [
    id, formObj.no || (data.length), formObj.idProgram || 'PROG-01', formObj.kategoriProgram || 'Umum',
    formObj.itemName || 'Umum', formObj.kegiatan || '', formObj.descriptionAction || '',
    formObj.startDate || now, formObj.dueDate || '', closedDate, formObj.tindakLanjut || '',
    formObj.kendala || '', formObj.status || 'Open', formObj.remarks || '', picEmail, picNama, now
  ];

  if (rowToUpdate > 0) {
    if (user.role === 'Bawahan' && data[rowToUpdate - 1][14].toLowerCase() !== user.email.toLowerCase()) return { success: false, message: "Akses ditolak." };
    sheet.getRange(rowToUpdate, 1, 1, rowValues.length).setValues([rowValues]);
  } else {
    sheet.appendRow(rowValues);
  }
  return { success: true, message: "Berhasil disimpan", id: id };
}

function deleteActivity(id) {
  const user = getCurrentUser();
  const ss = getSpreadsheet();
  const sheet = ss.getSheetByName(SHEETS.ACTIVITIES);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === id) {
      if (user.role === 'Bawahan' && data[i][14].toLowerCase() !== user.email.toLowerCase()) return { success: false, message: "Akses ditolak." };
      sheet.deleteRow(i + 1);
      return { success: true, message: "Dihapus" };
    }
  }
  return { success: false, message: "Tidak ditemukan" };
}

function getUsersList() {
  const ss = getSpreadsheet();
  if (!ss) return [];
  const userSheet = ss.getSheetByName(SHEETS.USERS);
  const data = userSheet.getDataRange().getValues();
  let users = [];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) users.push({ email: data[i][0], nama: data[i][1], role: data[i][2], subBagian: data[i][3] });
  }
  return users;
}

function saveUser(userObj, executorEmail) {
  const currentUser = getUserByEmail(executorEmail || Session.getActiveUser().getEmail());
  if (currentUser.role !== 'Pimpinan') return { success: false, message: "Hanya Pimpinan." };
  const ss = getSpreadsheet();
  const userSheet = ss.getSheetByName(SHEETS.USERS);
  const email = (userObj.email || '').trim().toLowerCase();
  const data = userSheet.getDataRange().getValues();
  let rowToUpdate = -1;
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().toLowerCase() === email) { rowToUpdate = i + 1; break; }
  }
  const rowValues = [email, userObj.nama, userObj.role || 'Bawahan', userObj.subBagian || 'SDM & Sistem'];
  if (rowToUpdate > 0) userSheet.getRange(rowToUpdate, 1, 1, rowValues.length).setValues([rowValues]);
  else userSheet.appendRow(rowValues);
  return { success: true };
}

function deleteUser(emailTarget, executorEmail) {
  const currentUser = getUserByEmail(executorEmail || Session.getActiveUser().getEmail());
  if (currentUser.role !== 'Pimpinan') return { success: false };
  const ss = getSpreadsheet();
  const userSheet = ss.getSheetByName(SHEETS.USERS);
  const data = userSheet.getDataRange().getValues();
  const target = (emailTarget || '').trim().toLowerCase();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] && data[i][0].toString().toLowerCase() === target) {
      userSheet.deleteRow(i + 1);
      return { success: true };
    }
  }
  return { success: false };
}

function formatDate(val) {
  if (!val) return '';
  try {
    if (val instanceof Date) return val.getFullYear() + '-' + String(val.getMonth() + 1).padStart(2, '0') + '-' + String(val.getDate()).padStart(2, '0');
    return String(val).includes('T') ? String(val).split('T')[0] : String(val);
  } catch (e) { return String(val); }
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}
