export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'free' | 'starter' | 'professional' | 'enterprise'
  subscription_status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  subscription_id?: string | null
  max_users: number
  max_tables: number
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface OrganizationMember {
  id: string
  organization_id: string
  user_id: string
  role: 'owner' | 'admin' | 'staff'
  invited_by?: string | null
  joined_at: string
  user?: {
    id: string
    email: string
    name: string
  }
}

export interface OrganizationInvitation {
  id: string
  organization_id: string
  email: string
  role: 'owner' | 'admin' | 'staff'
  token: string
  invited_by: string
  expires_at: string
  accepted_at?: string | null
  created_at: string
}

export interface CreateOrganizationData {
  name: string
  slug?: string
}

export interface InviteMemberData {
  email: string
  role: 'admin' | 'staff'
}

