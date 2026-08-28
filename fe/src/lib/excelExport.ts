import ExcelJS from 'exceljs'

interface ActivityItem {
  id: string
  no: number
  kegiatan: string
  descriptionAction?: string
  picNama?: string
  picEmail?: string
  dueDate?: string
  startDate?: string
  closedDate?: string
  status: string
  remarks?: string
}

interface SubItemExportData {
  parentKode: string
  parentNama: string
  subKode: string
  subNamaItem: string
  subKeterangan?: string
  year: number | string
  activities: ActivityItem[]
}

export async function exportSubItemToExcel(data: SubItemExportData) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'e-SIH PT INL'
  workbook.lastModifiedBy = 'e-SIH PT INL'
  workbook.created = new Date()

  const sheetName = `${data.subKode} ${data.subNamaItem}`.slice(0, 31).replace(/[\*\?:\/\\\[\]]/g, '-')
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  })

  const activities = data.activities || []
  const totalItems = activities.length
  const openCount = activities.filter(a => a.status === 'Open' || a.status === 'On Progress').length
  const closedCount = activities.filter(a => a.status === 'Closed').length
  const cancelledCount = activities.filter(a => a.status === 'Cancelled').length
  const closurePct = totalItems > 0 ? Math.round((closedCount / totalItems) * 100) : 0

  // 1. TOP RIGHT DOCUMENT HEADER BOX (Rows 1-4, Cols H to K)
  // Row 1 & 2: Header Titles
  worksheet.mergeCells('G1:K1')
  const titleCell = worksheet.getCell('G1')
  titleCell.value = 'SDM & SISTEM PROGRAM HIGHLIGHT REPORT'
  titleCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FFC00000' } } // Red bold
  titleCell.alignment = { horizontal: 'right', vertical: 'middle' }

  worksheet.mergeCells('G2:K2')
  const periodeCell = worksheet.getCell('G2')
  periodeCell.value = `PERIODE : ${data.year}`
  periodeCell.font = { name: 'Calibri', size: 10, bold: true }
  periodeCell.alignment = { horizontal: 'right', vertical: 'middle' }

  // Document Info Table Grid (Rows 3-4, Cols H to K)
  const docTableCells = [
    { cell: 'H3', val: 'No. Dokumen', bold: true, bg: 'F2F2F2' },
    { cell: 'I3', val: 'INLHO/REP-F/-021', bold: false, bg: 'FFFFFF' },
    { cell: 'J3', val: 'Tgl. Berlaku', bold: true, bg: 'F2F2F2' },
    { cell: 'K3', val: '12 -Nov- 18', bold: false, bg: 'FFFFFF' },
    { cell: 'H4', val: 'No. Revisi', bold: true, bg: 'F2F2F2' },
    { cell: 'I4', val: '0', bold: false, bg: 'FFFFFF' },
    { cell: 'J4', val: 'Halaman', bold: true, bg: 'F2F2F2' },
    { cell: 'K4', val: '1 dari 1', bold: false, bg: 'FFFFFF' },
  ]

  docTableCells.forEach(({ cell, val, bold, bg }) => {
    const c = worksheet.getCell(cell)
    c.value = val
    c.font = { name: 'Calibri', size: 9, bold }
    c.alignment = { horizontal: 'center', vertical: 'middle' }
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bg}` } }
    c.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    }
  })

  // 2. COMPANY NAME SUBHEADER (Row 6, Cols G to K)
  worksheet.mergeCells('G6:K6')
  const companyCell = worksheet.getCell('G6')
  companyCell.value = 'PT. INDUSTRI NABATI LESTARI OPERATION'
  companyCell.font = { name: 'Calibri', size: 10, bold: true, color: { argb: 'FF000080' } } // Navy Blue
  companyCell.alignment = { horizontal: 'right', vertical: 'middle' }

  // 3. KPI SUMMARY CARD (Rows 2-6, Cols A to C)
  const kpiData = [
    { row: 2, key: 'No. of Action Item', val: totalItems, bgKey: 'FCE4D6', bgVal: 'FCE4D6', boldKey: true },
    { row: 3, key: 'Open', val: openCount, bgKey: 'FFF2CC', bgVal: 'FFF2CC', boldKey: false },
    { row: 4, key: 'Closed', val: closedCount, bgKey: 'FFF2CC', bgVal: 'FFF2CC', boldKey: false },
    { row: 5, key: 'Cancelled', val: cancelledCount, bgKey: 'FFF2CC', bgVal: 'FFF2CC', boldKey: false },
    { row: 6, key: 'Closure (%)', val: `${closurePct}%`, bgKey: 'D9E1F2', bgVal: 'D9E1F2', boldKey: true },
  ]

  kpiData.forEach(({ row, key, val, bgKey, bgVal, boldKey }) => {
    // Key cell (Col A merged to B)
    worksheet.mergeCells(`A${row}:B${row}`)
    const kCell = worksheet.getCell(`A${row}`)
    kCell.value = key
    kCell.font = { name: 'Calibri', size: 9, bold: boldKey }
    kCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bgKey}` } }
    kCell.alignment = { horizontal: 'left', vertical: 'middle' }

    // Val cell (Col C)
    const vCell = worksheet.getCell(`C${row}`)
    vCell.value = val
    vCell.font = { name: 'Calibri', size: 9, bold: true }
    vCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${bgVal}` } }
    vCell.alignment = { horizontal: 'center', vertical: 'middle' }

    // Apply borders to A-C
    ;[`A${row}`, `B${row}`, `C${row}`].forEach(cellPos => {
      worksheet.getCell(cellPos).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      }
    })
  })

  // 4. SUBJECT & SUB SUBJECT HEADERS (Rows 8-9)
  worksheet.mergeCells('A8:K8')
  const subjectCell = worksheet.getCell('A8')
  subjectCell.value = `SUBJECT : ${data.parentNama || data.parentKode}`
  subjectCell.font = { name: 'Calibri', size: 10, bold: true }
  subjectCell.alignment = { horizontal: 'left', vertical: 'middle' }

  worksheet.mergeCells('A9:K9')
  const subSubjectCell = worksheet.getCell('A9')
  subSubjectCell.value = `SUB SUBJECT : ${data.subKode} ${data.subNamaItem}`
  subSubjectCell.font = { name: 'Calibri', size: 10, bold: true }
  subSubjectCell.alignment = { horizontal: 'left', vertical: 'middle' }

  // 5. MAIN TABLE HEADERS (Row 10)
  const headers = [
    { header: 'NO', key: 'no', width: 6 },
    { header: 'ITEM', key: 'item', width: 20 },
    { header: 'DESCRIPTION', key: 'description', width: 42 },
    { header: 'ACTION TO BE TAKEN', key: 'action', width: 45 },
    { header: 'NAME PIC', key: 'pic', width: 24 },
    { header: 'TARGET DATE', key: 'targetDate', width: 14 },
    { header: 'CLOSED DATE', key: 'closedDate', width: 14 },
    { header: 'STATUS', key: 'status', width: 15 },
    { header: 'REMARKS', key: 'remarks', width: 30 },
    { header: 'O', key: 'oFlag', width: 6 },
    { header: 'C', key: 'cFlag', width: 6 },
  ]

  const headerRow = worksheet.getRow(10)
  headerRow.height = 24

  headers.forEach((h, colIdx) => {
    const colNum = colIdx + 1
    const cell = headerRow.getCell(colNum)
    cell.value = h.header
    cell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFFFFFFF' } }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF006400' } } // Dark Green
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'medium', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FFFFFFFF' } },
      bottom: { style: 'medium', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FFFFFFFF' } },
    }
    worksheet.getColumn(colNum).width = h.width
  })

  // 6. MAIN TABLE DATA ROWS (Starting Row 11)
  activities.forEach((act, index) => {
    const rowNum = 11 + index
    const row = worksheet.getRow(rowNum)

    const isOpen = act.status === 'Open' || act.status === 'On Progress'
    const isClosed = act.status === 'Closed'

    row.getCell(1).value = index + 1 // NO
    row.getCell(2).value = data.subNamaItem // ITEM
    row.getCell(3).value = act.kegiatan || '-' // DESCRIPTION
    row.getCell(4).value = act.descriptionAction || '-' // ACTION TO BE TAKEN
    row.getCell(5).value = act.picNama || '-' // NAME PIC
    row.getCell(6).value = act.dueDate || act.startDate || '-' // TARGET DATE
    row.getCell(7).value = act.closedDate || '-' // CLOSED DATE

    const statusCell = row.getCell(8) // STATUS
    statusCell.value = act.status

    row.getCell(9).value = act.remarks || '-' // REMARKS
    row.getCell(10).value = isOpen ? 1 : '' // O (Open flag)
    row.getCell(11).value = isClosed ? 1 : '' // C (Close flag)

    // Cell Alignments & Formatting
    row.getCell(1).alignment = { horizontal: 'center', vertical: 'top' }
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    row.getCell(3).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    row.getCell(4).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    row.getCell(5).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    row.getCell(6).alignment = { horizontal: 'center', vertical: 'top' }
    row.getCell(7).alignment = { horizontal: 'center', vertical: 'top' }
    statusCell.alignment = { horizontal: 'center', vertical: 'top' }
    row.getCell(9).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    row.getCell(10).alignment = { horizontal: 'center', vertical: 'top' }
    row.getCell(11).alignment = { horizontal: 'center', vertical: 'top' }

    // Status font color
    if (isClosed) {
      statusCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF008000' } } // Green
    } else if (isOpen) {
      statusCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF2E75B6' } } // Blue/On Progress
    } else {
      statusCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFC00000' } } // Red/Cancelled
    }

    // Apply borders to data cells
    for (let c = 1; c <= 11; c++) {
      const cell = row.getCell(c)
      if (!cell.font?.color) {
        cell.font = { name: 'Calibri', size: 9 }
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      }
    }
  })

  // 7. DOWNLOAD EXCEL FILE
  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const cleanSubName = data.subNamaItem.replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Program_Kerja_${data.subKode}_${cleanSubName}_${data.year}.xlsx`
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}

export async function exportTableToExcel3(data: {
  title?: string
  subKode?: string
  subNamaItem?: string
  year: number | string
  activities: ActivityItem[]
}) {
  const workbook = new ExcelJS.Workbook()
  workbook.creator = 'e-SIH PT INL'
  workbook.lastModifiedBy = 'e-SIH PT INL'
  workbook.created = new Date()

  const sheetName = data.subKode ? `${data.subKode} ${data.subNamaItem}`.slice(0, 31).replace(/[\*\?:\/\\\[\]]/g, '-') : 'Activities Report'
  const worksheet = workbook.addWorksheet(sheetName, {
    views: [{ showGridLines: true }]
  })

  // Title Box (Row 1)
  worksheet.mergeCells('A1:H1')
  const titleCell = worksheet.getCell('A1')
  titleCell.value = data.title || `Weekly Activities SIH Tahun ${data.year}`
  titleCell.font = { name: 'Calibri', size: 11, bold: true }
  titleCell.alignment = { horizontal: 'left', vertical: 'middle' }

  // Main Headers (Row 3)
  const headers = [
    { header: 'No.', key: 'no', width: 6 },
    { header: 'Kegiatan', key: 'kegiatan', width: 45 },
    { header: 'Start', key: 'start', width: 13 },
    { header: 'Due Date', key: 'dueDate', width: 13 },
    { header: 'Tindak Lanjut', key: 'action', width: 50 },
    { header: 'Kendala', key: 'kendala', width: 30 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Keterangan', key: 'remarks', width: 35 },
  ]

  const headerRow = worksheet.getRow(3)
  headerRow.height = 24

  headers.forEach((h, colIdx) => {
    const colNum = colIdx + 1
    const cell = headerRow.getCell(colNum)
    cell.value = h.header
    cell.font = { name: 'Calibri', size: 9, bold: true }
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6E6' } } // Light Grey
    cell.alignment = { horizontal: 'center', vertical: 'middle' }
    cell.border = {
      top: { style: 'thin', color: { argb: 'FF000000' } },
      left: { style: 'thin', color: { argb: 'FF000000' } },
      bottom: { style: 'thin', color: { argb: 'FF000000' } },
      right: { style: 'thin', color: { argb: 'FF000000' } },
    }
    worksheet.getColumn(colNum).width = h.width
  })

  // Data Rows (Row 4 onwards)
  data.activities.forEach((act, index) => {
    const rowNum = 4 + index
    const row = worksheet.getRow(rowNum)

    row.getCell(1).value = index + 1
    row.getCell(2).value = act.kegiatan || '-'
    row.getCell(3).value = act.startDate || '-'
    row.getCell(4).value = act.dueDate || '-'
    row.getCell(5).value = act.descriptionAction || '-'
    row.getCell(6).value = '-' // Kendala
    
    const statusCell = row.getCell(7)
    statusCell.value = act.status === 'Closed' ? 'Done' : act.status
    row.getCell(8).value = act.remarks || '-'

    row.getCell(1).alignment = { horizontal: 'center', vertical: 'top' }
    row.getCell(2).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    row.getCell(3).alignment = { horizontal: 'center', vertical: 'top' }
    row.getCell(4).alignment = { horizontal: 'center', vertical: 'top' }
    row.getCell(5).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    row.getCell(6).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }
    statusCell.alignment = { horizontal: 'center', vertical: 'top' }
    row.getCell(8).alignment = { horizontal: 'left', vertical: 'top', wrapText: true }

    if (act.status === 'Closed') {
      statusCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF008000' } }
    } else if (act.status === 'On Progress') {
      statusCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FF2E75B6' } }
    } else {
      statusCell.font = { name: 'Calibri', size: 9, bold: true, color: { argb: 'FFC00000' } }
    }

    for (let c = 1; c <= 8; c++) {
      const cell = row.getCell(c)
      if (!cell.font?.color) {
        cell.font = { name: 'Calibri', size: 9 }
      }
      cell.border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'thin', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } },
      }
    }
  })

  const buffer = await workbook.xlsx.writeBuffer()
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const cleanSubName = (data.subNamaItem || 'Report').replace(/[^a-zA-Z0-9]/g, '_')
  const filename = `Weekly_Activities_${data.subKode || ''}_${cleanSubName}_${data.year}.xlsx`
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  window.URL.revokeObjectURL(url)
}
