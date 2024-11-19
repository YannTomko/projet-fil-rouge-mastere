import React, { useState, useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useParams } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar/Sidebar';
import LoginRegister from './components/LoginRegister/LoginRegister';
import { User } from './models/User';
import MainUpload from './components/MainUpload/MainUpload';
import MainFile from './components/MainFile/MainFile';


function App() {
  const [user, setUser] = useState<User | null>(null);
  const [refreshSidebar, setRefreshSidebar] = useState<boolean>(false);

  // Utilisez useEffect pour récupérer l'utilisateur depuis le localStorage lors du montage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (user: User) => {
    setUser(user);
    // Stocker l'utilisateur dans le localStorage
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setUser(null);
    // Supprimer l'utilisateur du localStorage
    localStorage.removeItem('user');
  };

  const handleRefreshSidebar = () => {
    setRefreshSidebar(prev => !prev); // Inverse la valeur pour déclencher useEffect
  };

  return (
    <Router>
      <Header user={user} onLogout={handleLogout} />

      <div style={{ display: 'flex' }}>
        {user && <Sidebar user={user} refresh={refreshSidebar} />}
        <div style={{ flexGrow: 1 }}>
          <Routes>
            <Route
              path="/"
              element={user ? <Navigate to="/upload" /> : <Navigate to="/login" />}
            />
            <Route
              path="/upload"
              element={<MainUpload user={user} refreshSidebar={handleRefreshSidebar} />}
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/upload" /> : <LoginRegister onLogin={handleLogin} />}
            />
            <Route
              path="/file/:id"
              element={user ? <ProtectedMainFile /> : <Navigate to="/login" />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

const ProtectedMainFile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const fileId = Number(id);
  return <MainFile fileId={fileId} />;
};

export default App;