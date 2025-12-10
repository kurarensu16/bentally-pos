import React from 'react'
import { useOrganizationStore } from '../../stores/useOrganizationStore'

export const OrganizationSelector: React.FC = () => {
  const { organizations, currentOrganization, switchOrganization } = useOrganizationStore()
  
  if (organizations.length <= 1) return null
  
  return (
    <div className="flex items-center gap-2">
      <select 
        id="org-select"
        value={currentOrganization?.id || ''}
        onChange={(e) => {
          const orgId = e.target.value
          if (orgId) {
            switchOrganization(orgId)
          }
        }}
        className="px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-colors"
        style={{ color: 'white' }}
      >
        {organizations.map(org => (
          <option key={org.id} value={org.id} className="text-gray-900">
            {org.name}
          </option>
        ))}
      </select>
    </div>
  )
}

