export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'staff'
}

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  email: string
  password: string
  name: string
  businessName?: string
}