import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Income from './pages/Income';
import Expenses from './pages/Expenses';
import Budget from './pages/Budget';
import Savings from './pages/Savings';
import Debts from './pages/Debts';
import Navbar from './components/Navbar';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <>
                    <Navbar />
                    <main className="container">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/income" element={<Income />} />
                        <Route path="/expenses" element={<Expenses />} />
                        <Route path="/budget" element={<Budget />} />
                        <Route path="/savings" element={<Savings />} />
                        <Route path="/debts" element={<Debts />} />
                      </Routes>
                    </main>
                  </>
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
