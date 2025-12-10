import React, { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../lib/api'
import { type MenuItem } from '../../types'
import { useOrganizationStore } from '../../stores/useOrganizationStore'

interface MenuModalProps {
  item?: MenuItem | null
  categories: any[]
  onClose: () => void
  onSuccess: () => void
  onNotify?: (payload: { type: 'success' | 'error'; message: string }) => void
}

export const MenuModal: React.FC<MenuModalProps> = ({ 
  item, 
  categories, 
  onClose, 
  onSuccess,
  onNotify
}) => {
  const { currentOrganization } = useOrganizationStore()
  const queryClient = useQueryClient()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_available: true
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [categoryError, setCategoryError] = useState('')


  useEffect(() => {
    // Clear errors when modal opens
    setErrors({})
    
    if (item) {
      setFormData({
        name: item.name,
        description: item.description || '',
        price: item.price.toString(),
        category_id: item.category_id,
        is_available: item.is_available
      })
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category_id: categories[0]?.id || '',
        is_available: true
      })
    }
  }, [item, categories])

  const createMutation = useMutation({
    mutationFn: (data: any) => api.createMenuItem(data, currentOrganization!.id),
    onSuccess: () => {
      onNotify?.({ type: 'success', message: 'Menu item created successfully' })
      onSuccess()
    }
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: string; data: any }) => api.updateMenuItem(data.id, data.data, currentOrganization!.id),
    onSuccess: () => {
      onNotify?.({ type: 'success', message: 'Menu item updated successfully' })
      onSuccess()
    }
  })

  const createCategoryMutation = useMutation({
    mutationFn: (categoryName: string) => api.createCategory(categoryName, currentOrganization!.id),
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: ['categories', currentOrganization?.id] })
      setFormData((prev) => ({
        ...prev,
        category_id: newCategory.id
      }))
      setIsAddingCategory(false)
      setNewCategoryName('')
      setCategoryError('')
      alert('Category created successfully')
    },
    onError: (error: any) => {
      setCategoryError(error?.message || 'Failed to create category')
    }
  })

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0'
    }
    
    if (!formData.category_id) {
      newErrors.category_id = 'Category is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    const submitData = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: parseFloat(formData.price),
      category_id: formData.category_id,
      is_available: formData.is_available
    }
    
    console.log('Form data:', formData)
    console.log('Submit data:', submitData)
    console.log('Item being edited:', item)

    try {
      if (item) {
        console.log('Updating menu item with data:', { id: item.id, data: submitData })
        await updateMutation.mutateAsync({ id: item.id, data: submitData })
      } else {
        console.log('Creating menu item with data:', submitData)
        await createMutation.mutateAsync(submitData)
      }
    } catch (error: any) {
      console.error('Error:', error)
      const errorMessage = error?.message || `Error ${item ? 'updating' : 'creating'} menu item`
      onNotify?.({ type: 'error', message: errorMessage })
    }
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      setCategoryError('Category name is required')
      return
    }

    try {
      await createCategoryMutation.mutateAsync(newCategoryName.trim())
    } catch {
      // handled via onError
    }
  }

  const isLoading = createMutation.isPending || updateMutation.isPending

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {item ? 'Edit Menu Item' : 'Add New Menu Item'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  if (errors.name) {
                    setErrors({ ...errors, name: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter item name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter item description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value })
                  if (errors.price) {
                    setErrors({ ...errors, price: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0.00"
              />
              {errors.price && (
                <p className="mt-1 text-sm text-red-600">{errors.price}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                required
                value={formData.category_id}
                onChange={(e) => {
                  setFormData({ ...formData, category_id: e.target.value })
                  if (errors.category_id) {
                    setErrors({ ...errors, category_id: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 ${
                  errors.category_id ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              {errors.category_id && (
                <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
              )}

              <div className="mt-2">
                {!isAddingCategory ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCategory(true)
                      setCategoryError('')
                    }}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Create new category
                  </button>
                ) : (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => {
                        setNewCategoryName(e.target.value)
                        if (categoryError) setCategoryError('')
                      }}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Category name"
                      disabled={createCategoryMutation.isPending}
                    />
                    {categoryError && (
                      <p className="text-sm text-red-600">{categoryError}</p>
                    )}
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        disabled={createCategoryMutation.isPending}
                        className="flex-1 bg-primary-500 text-white py-2 rounded-md font-medium hover:bg-primary-600 disabled:opacity-50"
                      >
                        {createCategoryMutation.isPending ? 'Saving...' : 'Save Category'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingCategory(false)
                          setNewCategoryName('')
                          setCategoryError('')
                        }}
                        disabled={createCategoryMutation.isPending}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md font-medium hover:bg-gray-300 disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
                Available for ordering
              </label>
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md font-medium hover:bg-gray-400 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-primary-500 text-white py-2 px-4 rounded-md font-medium hover:bg-primary-600 disabled:opacity-50 transition-colors"
              >
                {isLoading ? 'Saving...' : (item ? 'Update' : 'Create')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}