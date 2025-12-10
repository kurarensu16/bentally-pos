import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { type User, type LoginFormData, type RegisterFormData } from '../types/auth'
import { supabase } from '../lib/supabase'
import { useOrganizationStore } from './useOrganizationStore'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  
  login: (credentials: LoginFormData) => Promise<void>
  register: (credentials: RegisterFormData) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,

      login: async (credentials: LoginFormData) => {
        set({ isLoading: true })
        
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: credentials.email,
            password: credentials.password,
          })

          if (error) throw error

          if (data.user) {
            // Get user profile from our profiles table (use limit instead of single to avoid 406)
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.user.id)
              .limit(1)

            const profile = profileData && profileData.length > 0 ? profileData[0] : null

            if (!profile) {
              // Profile doesn't exist - wait for trigger or create manually
              if (profileError) {
                console.log('Profile fetch error during login:', profileError)
              }
              
              // Wait a bit for trigger, then check again
              console.log('Profile not found during login, waiting for trigger...')
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              // Check again - trigger might have created it
              const { data: retryProfileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', data.user.id)
                .limit(1)
              
              const retryProfile = retryProfileData && retryProfileData.length > 0 ? retryProfileData[0] : null
              
              if (retryProfile) {
                set({
                  user: {
                    id: (retryProfile as any).id,
                    email: (retryProfile as any).email,
                    name: (retryProfile as any).name,
                    role: 'admin' // Default role, actual role is per-organization
                  },
                  isAuthenticated: true,
                  isLoading: false
                })
                
                // Load user's organizations
                await useOrganizationStore.getState().loadOrganizations(data.user.id)
              } else {
                // Still no profile, create one manually
                console.log('Trigger did not create profile, creating manually...')
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: data.user.id,
                    email: data.user.email || '',
                    name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Staff Member'
                  } as any)
                  .select()
                  .single()

                if (createError) {
                  console.error('Failed to create profile:', createError)
                  throw createError
                }

                if (newProfile) {
                  set({
                    user: {
                      id: (newProfile as any).id,
                      email: (newProfile as any).email,
                      name: (newProfile as any).name,
                      role: 'admin' // Default role, actual role is per-organization
                    },
                    isAuthenticated: true,
                    isLoading: false
                  })
                  
                  // Load user's organizations
                  await useOrganizationStore.getState().loadOrganizations(data.user.id)
                } else {
                  throw new Error('Failed to create profile')
                }
              }
            } else if (profile) {
              set({
                user: {
                  id: (profile as any).id,
                  email: (profile as any).email,
                  name: (profile as any).name,
                  role: 'admin' // Default role, actual role is per-organization
                },
                isAuthenticated: true,
                isLoading: false
              })
              
              // Load user's organizations
              await useOrganizationStore.getState().loadOrganizations(data.user.id)
            }
          }
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.message || 'Login failed')
        }
      },

      register: async (credentials: RegisterFormData) => {
        set({ isLoading: true })
        
        console.log('🚀 Starting registration for:', credentials.email)
        
        try {
          // Sign up with Supabase Auth (include name in metadata for trigger)
          console.log('📝 Signing up user...')
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: credentials.email,
            password: credentials.password,
            options: {
              data: {
                name: credentials.name
              }
            }
          })

          if (authError) {
            console.error('❌ Auth signup error:', authError)
            throw authError
          }
          
          if (!authData.user) {
            console.error('❌ No user returned from signup')
            throw new Error('User creation failed')
          }
          
          console.log('✅ User created:', authData.user.id)

          // If Supabase requires email confirmation, session will be null
          if (!authData.session) {
            console.log('Email confirmation required. Awaiting verification.')
            set({ 
              user: null,
              isAuthenticated: false,
              isLoading: false
            })
            return
          }

          // Profile is auto-created by trigger, but we need to update it with the actual name
          // First, try to fetch it (with retry in case trigger hasn't run yet)
          let profile: any = null
          let retries = 3
          
          while (retries > 0 && !profile) {
            // Use regular select instead of single() to avoid 406 errors
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', authData.user.id)
              .limit(1)
            
            if (data && data.length > 0) {
              profile = data[0]
              break
            }
            
            // If no data, profile doesn't exist yet - wait and retry
            if (retries > 1) {
              console.log('Profile not found, waiting for trigger (retry', 4 - retries, ')...')
              await new Promise(resolve => setTimeout(resolve, 1000))
              retries--
            } else {
              // Last retry - wait for session, then try to create profile
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              // Verify we have a valid session
              const { data: { session } } = await supabase.auth.getSession()
              if (!session) {
                throw new Error('No active session. Please try again.')
              }
              
              // Create the profile manually if it doesn't exist
              const { data: newProfile, error: createError } = await supabase
                .from('profiles')
                .insert({
                  id: authData.user.id,
                  email: credentials.email,
                  name: credentials.name
                } as any)
                .select()
                .single()
              
              if (createError) {
                console.error('Failed to create profile manually:', createError)
                
                // Check if profile already exists (409 conflict)
                if (createError.code === '23505' || createError.message?.includes('duplicate') || createError.message?.includes('unique')) {
                  console.log('Profile might already exist (409 conflict), fetching it...')
                  const { data: existingProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .limit(1)
                  
                  if (existingProfile && existingProfile.length > 0) {
                    console.log('✅ Profile found (already exists):', (existingProfile[0] as any).id)
                    profile = existingProfile[0] as any
                  }
                }
                // If RLS is blocking, wait longer and check if trigger created it
                else if (createError.code === '42501' || createError.message?.includes('row-level security')) {
                  console.log('RLS blocked profile creation, waiting for trigger (this may take a few seconds)...')
                  // Wait longer for trigger (up to 6 more seconds, checking every 1 second)
                  for (let i = 0; i < 6; i++) {
                    await new Promise(resolve => setTimeout(resolve, 1000))
                    const { data: retryProfileData } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('id', authData.user.id)
                      .limit(1)
                    
                    if (retryProfileData && retryProfileData.length > 0) {
                      console.log('✅ Profile found after trigger delay!')
                      profile = retryProfileData[0]
                      break
                    }
                    console.log(`Waiting for trigger... (${i + 1}/6)`)
                  }
                  
                  if (!profile) {
                    console.error('❌ Profile was not created by trigger after 6 seconds.')
                    console.error('User ID:', authData.user.id)
                    console.log('🔄 Attempting to use manual profile creation function...')
                    
                    // Try using the SECURITY DEFINER function if it exists
                    try {
                      const { error: functionError } = await (supabase as any).rpc('create_profile_for_user', {
                        user_uuid: authData.user.id
                      })
                      
                      if (!functionError) {
                        // Function succeeded, check if profile exists now
                        await new Promise(resolve => setTimeout(resolve, 500))
                        const { data: finalProfile } = await supabase
                          .from('profiles')
                          .select('*')
                          .eq('id', authData.user.id)
                          .limit(1)
                        
                        if (finalProfile && finalProfile.length > 0) {
                          console.log('✅ Profile created via function!')
                          profile = finalProfile[0] as any
                        }
                      } else {
                        console.error('Function call failed:', functionError)
                      }
                    } catch (funcErr) {
                      console.error('Error calling function:', funcErr)
                    }
                    
                    if (!profile) {
                      console.error('⚠️ ACTION REQUIRED:')
                      console.error('1. Run sql/FIX-PROFILE-TRIGGER-AND-POLICY.sql in Supabase SQL Editor')
                      console.error('2. Or run sql/CREATE-PROFILE-FOR-USER.sql with your user ID:', authData.user.id)
                      throw new Error(
                        'Profile creation failed. The database trigger is not working. ' +
                        'Please run the SQL fix script or manually create the profile.'
                      )
                    }
                  }
                } else {
                  // Other error - check if profile exists anyway
                  const { data: checkProfile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authData.user.id)
                    .limit(1)
                  
                  if (checkProfile && checkProfile.length > 0) {
                    console.log('✅ Profile exists despite error:', (checkProfile[0] as any).id)
                    profile = checkProfile[0] as any
                  } else {
                    throw createError
                  }
                }
              } else if (newProfile) {
                profile = newProfile
              } else {
                // No error but no profile - check one more time
                const { data: checkProfile } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', authData.user.id)
                  .limit(1)
                
                if (checkProfile && checkProfile.length > 0) {
                  console.log('✅ Profile found:', (checkProfile[0] as any).id)
                  profile = checkProfile[0] as any
                } else {
                  throw new Error('Failed to create profile')
                }
              }
              
              retries = 0 // Exit loop
            }
          }

          if (!profile) {
            console.error('❌ No profile found after retries')
            throw new Error('Failed to create user profile')
          }

          console.log('✅ Profile found/created:', profile.id)

          // Update profile with correct name if it's different
          if (profile.name !== credentials.name) {
            console.log('📝 Updating profile name...')
            const { error: updateError } = await (supabase as any)
              .from('profiles')
              .update({ name: credentials.name })
              .eq('id', authData.user.id)
            
            if (updateError) {
              console.error('Profile update error:', updateError)
              // Don't throw, just log - profile exists with email
            } else {
              profile.name = credentials.name
              console.log('✅ Profile name updated')
            }
          }

          // Set user state first
          console.log('👤 Setting user state...')
          set({
            user: {
              id: (profile as any).id,
              email: (profile as any).email,
              name: (profile as any).name,
              role: 'admin' // Default role, actual role is per-organization
            },
            isAuthenticated: true,
            isLoading: false
          })

          // Create organization for new user
          const orgName = credentials.businessName?.trim() || 
            (credentials.name.split(' ')[0] + "'s Restaurant")
          
          console.log('🏢 Attempting to create organization:', { orgName, userId: authData.user.id, businessName: credentials.businessName })
          
          try {
            const newOrg = await useOrganizationStore.getState().createOrganization(
              orgName,
              authData.user.id
            )
            console.log('Organization created successfully:', newOrg.id)
          } catch (orgError: any) {
            console.error('FAILED to create organization:', orgError)
            console.error('Error details:', {
              code: orgError.code,
              message: orgError.message,
              details: orgError.details,
              hint: orgError.hint
            })
            // Don't fail registration, but log the error clearly
            console.warn('⚠️ User registered but organization creation failed. User can create organization later.')
            
            // Still try to load organizations (in case one was created)
            try {
              await useOrganizationStore.getState().loadOrganizations(authData.user.id)
            } catch (loadError) {
              console.error('Failed to load organizations:', loadError)
            }
          }
        } catch (error: any) {
          set({ isLoading: false })
          throw new Error(error.message || 'Registration failed')
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        try {
          const { error } = await supabase.auth.signOut()
          if (error) throw error
        } catch (error) {
          console.error('Logout error:', error)
        } finally {
          set({ 
            user: null, 
            isAuthenticated: false 
          })
          // Clear organization state
          useOrganizationStore.setState({ 
            currentOrganization: null,
            organizations: [], 
            members: [] 
          })
        }
      },

      checkAuth: async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          
          if (session?.user) {
            // Get user profile (use limit instead of single to avoid 406 errors)
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .limit(1)

            const profile = profileData && profileData.length > 0 ? profileData[0] : null

            if (!profile) {
              // Profile doesn't exist - wait for trigger or create manually
              if (error) {
                console.log('Profile fetch error during checkAuth:', error)
              }
              
              // Wait a bit for trigger, then check again
              console.log('Profile not found, waiting for trigger...')
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              // Check again - trigger might have created it
              const { data: retryProfileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .limit(1)
              
              const retryProfile = retryProfileData && retryProfileData.length > 0 ? retryProfileData[0] : null
              
              if (retryProfile) {
                set({
                  user: {
                    id: (retryProfile as any).id,
                    email: (retryProfile as any).email,
                    name: (retryProfile as any).name,
                    role: 'admin' // Default role, actual role is per-organization
                  },
                  isAuthenticated: true
                })
                
                // Load user's organizations
                await useOrganizationStore.getState().loadOrganizations(session.user.id)
              } else {
                // Still no profile, try to create one manually (may fail due to RLS)
                console.log('Trigger did not create profile, attempting manual creation...')
                const { data: newProfile, error: createError } = await supabase
                  .from('profiles')
                  .insert({
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User'
                  } as any)
                  .select()
                  .single()

                if (createError) {
                  // If RLS blocks it, log but don't throw - trigger should create it eventually
                  if (createError.code === '42501' || createError.message?.includes('row-level security')) {
                    console.warn('RLS blocked profile creation. Trigger should create it. User may need to refresh.')
                    // Don't set user - they'll need to refresh or wait for trigger
                  } else {
                    console.error('Failed to create profile:', createError)
                    throw createError
                  }
                } else if (newProfile) {
                  set({
                    user: {
                      id: (newProfile as any).id,
                      email: (newProfile as any).email,
                      name: (newProfile as any).name,
                      role: 'admin' // Default role, actual role is per-organization
                    },
                    isAuthenticated: true
                  })
                  
                  // Load user's organizations
                  await useOrganizationStore.getState().loadOrganizations(session.user.id)
                }
              }
            } else if (profile) {
              set({
                user: {
                  id: (profile as any).id,
                  email: (profile as any).email,
                  name: (profile as any).name,
                  role: 'admin' // Default role, actual role is per-organization
                },
                isAuthenticated: true
              })
              
              // Load user's organizations
              await useOrganizationStore.getState().loadOrganizations(session.user.id)
            }
          }
        } catch (error) {
          console.error('Auth check error:', error)
          set({ user: null, isAuthenticated: false })
        } finally {
          set({ isInitialized: true })
        }
      }
    }),
    {
      name: 'auth-storage',
    }
  )
)