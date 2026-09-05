// Script untuk menghapus semua data dummy Activity
// Data Highlight (Update Aktivitas) TIDAK dihapus - itu data real

const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

async function main() {
  const prisma = new PrismaClient()
  
  try {
    // Cek jumlah data sebelum hapus
    const activityCount = await prisma.activity.count()
    const auditLogCount = await prisma.activityAuditLog.count()
    const highlightCount = await prisma.highlight.count()
    
    console.log('=== Status Data Sebelum Penghapusan ===')
    console.log(`Activity (dummy):     ${activityCount} records`)
    console.log(`ActivityAuditLog:     ${auditLogCount} records`)
    console.log(`Highlight (real):     ${highlightCount} records (TIDAK DIHAPUS)`)
    console.log('')
    
    if (activityCount === 0) {
      console.log('Tidak ada data Activity untuk dihapus.')
      return
    }
    
    // Hapus audit log dulu (FK constraint)
    const deletedLogs = await prisma.activityAuditLog.deleteMany({})
    console.log(`Deleted ${deletedLogs.count} ActivityAuditLog records`)
    
    // Hapus semua Activity
    const deletedActivities = await prisma.activity.deleteMany({})
    console.log(`Deleted ${deletedActivities.count} Activity records`)
    
    console.log('')
    console.log('=== Status Data Setelah Penghapusan ===')
    const remaining = await prisma.activity.count()
    const remainingHighlights = await prisma.highlight.count()
    console.log(`Activity:     ${remaining} records`)
    console.log(`Highlight:    ${remainingHighlights} records (tetap aman)`)
    console.log('')
    console.log('✅ Semua data dummy Activity berhasil dihapus!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
