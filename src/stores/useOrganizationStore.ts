import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase } from '../lib/supabase'
import type { Organization, OrganizationMember } from '../types/organization'

interface OrganizationState {
  currentOrganization: Organization | null
  organizations: Organization[]
  members: OrganizationMember[]
  isLoading: boolean
  
  setCurrentOrganization: (org: Organization) => void
  loadOrganizations: (userId: string) => Promise<void>
  createOrganization: (name: string, userId: string) => Promise<Organization>
  loadMembers: (orgId: string) => Promise<void>
  inviteMember: (orgId: string, email: string, role: 'admin' | 'staff') => Promise<void>
  switchOrganization: (orgId: string) => Promise<void>
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      currentOrganization: null,
      organizations: [],
      members: [],
      isLoading: false,
      
      setCurrentOrganization: (org) => {
        set({ currentOrganization: org })
        get().loadMembers(org.id)
      },
      
      loadOrganizations: async (userId) => {
        set({ isLoading: true })
        try {
          console.log('Loading organizations for user:', userId)
          
          // First, try to get memberships directly (without join to debug)
          const { data: membersData, error: membersError } = await supabase
            .from('organization_members')
            .select('organization_id, role, user_id')
            .eq('user_id', userId)
          
          console.log('Direct members query (no join):', { membersData, membersError })
          
          // Then get organizations with join
          const { data, error } = await supabase
            .from('organization_members')
            .select(`
              organization_id,
              role,
              organizations (*)
            `)
            .eq('user_id', userId)
          
          if (error) {
            console.error('Error loading organizations:', error)
            console.error('Error details:', {
              code: error.code,
              message: error.message,
              details: error.details,
              hint: error.hint
            })
            throw error
          }
          
          console.log('Organization members query result (with join):', data)
          
          if (data && data.length > 0) {
            const orgs = data.map((item: any) => {
              if (!item.organizations) {
                console.warn('Organization data missing for member:', item)
                return null
              }
              return {
                ...item.organizations,
                userRole: item.role
              }
            }).filter(Boolean) as Organization[]
            
            console.log('Parsed organizations:', orgs)
            set({ organizations: orgs })
            
            // Auto-select first org if none selected or if current org is not in the list
            const currentOrg = get().currentOrganization
            if (!currentOrg || !orgs.find(o => o.id === currentOrg.id)) {
              if (orgs.length > 0) {
                get().setCurrentOrganization(orgs[0])
              }
            }
          } else {
            // No organizations found
            console.warn('No organizations found for user:', userId)
            console.warn('Direct members query showed:', membersData?.length || 0, 'members')
            console.warn('Possible causes:')
            console.warn('1. Organization creation failed during registration (check console for errors)')
            console.warn('2. RLS policy is blocking the organizations join')
            console.warn('3. User was not added as a member (member insert failed)')
            console.warn('4. Organization was created but member insert failed and org was deleted')
            set({ organizations: [], currentOrganization: null })
          }
        } catch (error) {
          console.error('Error loading organizations:', error)
          set({ organizations: [], currentOrganization: null })
        } finally {
          set({ isLoading: false })
        }
      },
      
      createOrganization: async (name, userId) => {
        const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
        
        console.log('🏢 [createOrganization] Starting:', { name, slug, userId })
        
        // Step 1: Create organization
        console.log('📝 [createOrganization] Step 1: Inserting organization...')
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .insert({
            name,
            slug,
            plan: 'free'
          } as any)
          .select()
          .single()
        
        if (orgError) {
          console.error('❌ [createOrganization] Organization insert failed:', orgError)
          console.error('Error details:', {
            code: orgError.code,
            message: orgError.message,
            details: orgError.details,
            hint: orgError.hint
          })
          throw new Error(`Failed to create organization: ${orgError.message}`)
        }
        
        if (!org) {
          console.error('❌ [createOrganization] No organization data returned')
          throw new Error('Organization creation returned no data')
        }
        
        console.log('✅ [createOrganization] Organization created:', org.id, org.name)
        
        // Step 2: Add user as owner
        console.log('📝 [createOrganization] Step 2: Adding user as owner...')
        const { data: member, error: memberError } = await supabase
          .from('organization_members')
          .insert({
            organization_id: org.id,
            user_id: userId,
            role: 'owner'
          } as any)
          .select()
          .single()
        
        if (memberError) {
          console.error('❌ [createOrganization] Member insert failed:', memberError)
          console.error('Error details:', {
            code: memberError.code,
            message: memberError.message,
            details: memberError.details,
            hint: memberError.hint
          })
          console.log('🧹 [createOrganization] Cleaning up organization...')
          // Clean up organization if member creation fails
          const { error: deleteError } = await supabase.from('organizations').delete().eq('id', org.id)
          if (deleteError) {
            console.error('❌ [createOrganization] Failed to delete organization:', deleteError)
          } else {
            console.log('✅ [createOrganization] Organization deleted')
          }
          throw new Error(`Failed to add user to organization: ${memberError.message}`)
        }
        
        console.log('✅ [createOrganization] User added as owner:', member)
        
        // Step 3: Set as current and reload
        console.log('📝 [createOrganization] Step 3: Setting current organization...')
        const newOrg = { ...org, userRole: 'owner' } as Organization
        get().setCurrentOrganization(newOrg)
        
        console.log('📝 [createOrganization] Step 4: Loading organizations...')
        await get().loadOrganizations(userId)
        
        console.log('✅ [createOrganization] Complete!')
        return newOrg
      },
      
      loadMembers: async (orgId) => {
        try {
          const { data, error } = await supabase
            .from('organization_members')
            .select(`
              *,
              profiles:user_id (id, email, name)
            `)
            .eq('organization_id', orgId)
          
          if (error) throw error
          
          if (data) {
            set({ 
              members: data.map((item: any) => ({
                ...item,
                user: item.profiles
              })) as OrganizationMember[]
            })
          }
        } catch (error) {
          console.error('Error loading members:', error)
        }
      },
      
      inviteMember: async (orgId, email, role) => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('User must be authenticated')
        
        const token = crypto.randomUUID()
        const { error } = await supabase
          .from('organization_invitations')
          .insert({
            organization_id: orgId,
            email,
            role,
            token,
            invited_by: user.id
          } as any)
        
        if (error) throw error
        
        // TODO: Send invitation email (implement email service)
        // await sendInvitationEmail(email, token)
      },
      
      switchOrganization: async (orgId) => {
        const org = get().organizations.find(o => o.id === orgId)
        if (org) {
          get().setCurrentOrganization(org)
        }
      }
    }),
    { 
      name: 'organization-storage',
      partialize: (state) => ({ 
        currentOrganization: state.currentOrganization 
      })
    }
  )
)

