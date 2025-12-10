import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './stores/useAuthStore'
import { LoginForm } from './components/auth/LoginForm'
import { RegisterForm } from './components/auth/RegisterForm'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Dashboard } from './components/dashboard/Dashboard'
import { PosPage } from './components/pos/PosPage'
import { OrdersPage } from './components/pages/OrdersPage'
import { MenuPage } from './components/pages/MenuPage'
import { ReportsPage } from './components/pages/ReportsPage'
import { SettingsPage } from './components/pages/SettingsPage'
import { LandingPage } from './components/pages/LandingPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { PWAInstallPrompt } from './components/PWAInstallPrompt'

const queryClient = new QueryClient()

function AppContent() {
  const { isAuthenticated, checkAuth, isInitialized } = useAuthStore()

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Show loading state while checking authentication
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
            } 
          />
          
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginForm />
            } 
          />
          
          <Route 
            path="/register" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterForm />
            } 
          />
          
          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Dashboard />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/pos"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <PosPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/orders"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <OrdersPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/menu"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <MenuPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <ReportsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <SettingsPage />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* 404 fallback - respect auth status */}
          <Route
            path="*"
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />}
          />
        </Routes>
      </Router>
      
      {/* PWA Install Prompt */}
      <PWAInstallPrompt />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  )
}

export default App