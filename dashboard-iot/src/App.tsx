import type React from "react"
import { Routes, Route, useLocation, Navigate } from "react-router-dom"
import "./App.css"
import Header from "./components/Header"
import Sidebar from "./components/Sidebar"
import Dashboard from "./components/Dashboard"
import ChartsPage from "./components/ChartsPage"
import DeleteParcPage from "./components/DeleteParcPage"
import LoginForm from "./components/LoginForm"
import RegisterForm from "./components/RegisterForm"
import RecoverPasswordForm from "./components/RecoverPasswordForm"
import ResetPasswordForm from "./components/ResetPasswordForm"
import Footer from "./components/Footer"
import { SidebarProvider } from "./context/SidebarContext"

// Importar el nuevo componente AuthRoute
import AuthRoute from "./components/auth-route"

// Componente de layout condicional
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation()
  const path = location.pathname

  // Rutas que no deben mostrar el layout completo
  const noLayoutRoutes = ["/login", "/register", "/recover-password", "/reset-password"]

  // Verificar si la ruta actual está en la lista de rutas sin layout
  const shouldShowLayout = !noLayoutRoutes.includes(path)

  if (!shouldShowLayout) {
    // Si es una ruta de login o register, solo mostrar el contenido sin layout
    return <div className="auth-page">{children}</div>
  }

  // Para otras rutas, mostrar el layout completo
  return (
    <>
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="content-wrapper">{children}</div>
      </div>
      <Footer />
    </>
  )
}

// Componente para proteger rutas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = localStorage.getItem("token") !== null
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirigir a login si no está autenticado
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

const DefaultRoute = () => {
  const isAuthenticated = localStorage.getItem("token") !== null
  return <Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />
}

function App() {
  return (
    <SidebarProvider>
      <div className="app-container">
        <Routes>
          {/* Ruta raíz que redirige dinámicamente */}
          <Route path="/" element={<DefaultRoute />} />

          {/* Rutas de autenticación */}
          <Route
            path="/login"
            element={
              <AuthRoute>
                <AppLayout>
                  <LoginForm />
                </AppLayout>
              </AuthRoute>
            }
          />
          <Route
            path="/register"
            element={
              <AuthRoute>
                <AppLayout>
                  <RegisterForm />
                </AppLayout>
              </AuthRoute>
            }
          />
          <Route
            path="/recover-password"
            element={
              <AuthRoute>
                <AppLayout>
                  <RecoverPasswordForm />
                </AppLayout>
              </AuthRoute>
            }
          />

          <Route
            path="/reset-password"
            element={
              <AuthRoute>
                <AppLayout>
                  <ResetPasswordForm />
                </AppLayout>
              </AuthRoute>
            }
          />

          {/* Rutas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/charts"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <ChartsPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/deleted"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DeleteParcPage />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          {/* Añadir más rutas según sea necesario */}
        </Routes>
      </div>
    </SidebarProvider>
  )
}

export default App

