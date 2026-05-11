import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ErrorBoundary from './components/ErrorBoundary'
import BackendStatusBanner from './components/BackendStatusBanner'
import NotFound from './components/NotFound'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Chatbot from './pages/Chatbot'
import Profile from './pages/Profile'
import SavedChats from './pages/SavedChats'
import SymptomChecker from './pages/SymptomChecker'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="min-h-screen bg-slate-50 text-slate-900">
          <Router>
            <Navbar />
            <BackendStatusBanner />
            <main className="pt-24">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/chatbot" element={<Chatbot />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/saved-chats" element={<ProtectedRoute><SavedChats /></ProtectedRoute>} />
                <Route path="/symptom-checker" element={<ProtectedRoute><SymptomChecker /></ProtectedRoute>} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </Router>
        </div>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
