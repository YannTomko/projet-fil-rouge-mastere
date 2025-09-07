import React from 'react';
import { User } from '../../models/User';
import { useNavigate, useLocation } from 'react-router-dom';
import './Header.css';

interface HeaderProps {
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const showLoginButton = location.pathname !== '/login';

  return (
    <header className="header">
      <h1 className="header-title">AirLocker - MVP</h1>
      {user ? (
        <div className="header-user-info">
          <span className="header-username">Connecté en tant que {user.username}</span>
          <button className="header-button" onClick={() => {onLogout(); navigate('/login');}}>Déconnexion</button>
        </div>
      ) : (
        showLoginButton && (
          <button className="header-button" onClick={() => navigate('/login')}>Connexion</button>
        )
      )}
    </header>
  );
};

export default Header;
