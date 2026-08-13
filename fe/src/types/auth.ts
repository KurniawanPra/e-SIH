export interface EmployeeGrade {
  id?: string
  kode: string
  label?: string | null
  level: number
}

export interface OrganizationUnit {
  id: string
  kode?: string | null
  nama: string
  tipe?: string | null
  parentId?: string | null
  path?: string
  hierarchy?: Array<{
    id: string
    kode: string
    nama: string
    tipe: string
    parentId: string | null
  }>
}

export interface PlacementArea {
  id: string
  kode?: string | null
  nama: string
  latitude?: string | null
  longitude?: string | null
}

export interface SessionEmployee {
  id: string
  nrk?: string | null
  nama?: string | null
  namaLengkap: string
  jenisKelamin?: string | null
  jabatan?: string | null
  tanggalMasuk?: string | null
  fotoProfil?: string | null
  isActive?: boolean
  atasan?: {
    id: string
    nrk?: string | null
    nama?: string | null
    jabatan?: string | null
  } | null
  grade?: EmployeeGrade | null
  unit?: OrganizationUnit | null
  penempatanArea?: PlacementArea | null
}

export interface PortalEmployeeDirectoryItem {
  id: string
  employeeId: string
  namaLengkap: string
  jabatan?: string | null
  gradeLevel?: number | null
  gradeKode?: string | null
  unitNama?: string | null
  unitTipe?: string | null
  penempatanNama?: string | null
  penempatanLat?: string | null
  penempatanLng?: string | null
  atasanId?: string | null
}

export interface SessionUser {
  sub: string
  email: string
  employeeId: string
  name: string
  jabatan?: string | null
  role?: 'ADMIN' | 'USER' | string
  employee?: SessionEmployee
  grade?: EmployeeGrade | null
  unit?: OrganizationUnit | null
  penempatanArea?: PlacementArea | null
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  error?: string
}
