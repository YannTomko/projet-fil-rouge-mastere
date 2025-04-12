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

  const handleLogin = (response:any) => {
    console.log(response)
    setUser(response.user);
    localStorage.setItem('user', JSON.stringify(response.user));
    localStorage.setItem("accessToken", JSON.stringify(response.accessToken));
    localStorage.setItem("refreshToken", JSON.stringify(response.refreshToken));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  };

  const handleRefreshSidebar = () => {
    setRefreshSidebar(prev => !prev); // Inverse la valeur pour déclencher useEffect
  };

  const ProtectedMainFile: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const fileId = Number(id);
    return <MainFile fileId={fileId} refreshSidebar={handleRefreshSidebar} user={user}/>;
  };

  return (
    <Router basename={process.env.REACT_APP_BASENAME || '/'}>
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
              element={<ProtectedMainFile />}
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}



export default App;
