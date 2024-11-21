import React, { useEffect, useState } from 'react';
import { User } from '../../models/User';
import './LoginRegister.css';
import { handleLogin, handleRegister } from '../../services/authServices';

interface LoginRegisterProps {
  onLogin: (user: User) => void;
}

const LoginRegister: React.FC<LoginRegisterProps> = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isAccountCreated, setIsAccountCreated] = useState(false); // Nouvel état
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (isLoginMode) {
      if (username && password) {
        const response = await handleLogin(username, password);
        if (response) {
          onLogin({ username });
        } else {
          setMessage('Nom d\'utilisateur ou mot de passe incorrect');
        }
      }
    } else {
      if (username && password && password === confirmPassword) {
        const response = await handleRegister(username, email, password);
        if (response) {
          setIsAccountCreated(true); // Passe à l'interface de confirmation
        } else {
          setMessage('Nom d\'utilisateur ou email déjà utilisé');
        }
      } else {
        setMessage('Les mots de passe ne correspondent pas');
      }
    }
  };

  useEffect(() => {
    setMessage('');
  }, [isLoginMode, username, email, password, confirmPassword]);

  const switchMode = () => {
    setIsLoginMode(!isLoginMode);
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="login-register-container">
      {isAccountCreated ? (
        <div className="account-created-container">
          <h2>Compte créé avec succès !</h2>
          <p>Vous pouvez maintenant vous connecter avec vos identifiants.</p>
          <button
            className="form-button"
            onClick={() => {
              switchMode()
              setIsAccountCreated(false);
            }}
          >
            Accéder à la connexion
          </button>
        </div>
      ) : (
        <div className="login-register">
          <h2>{isLoginMode ? 'Connexion' : 'Inscription'}</h2>
          {message && <p className="form-message">{message}</p>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>
                Nom d'utilisateur:
                <input
                  className="form-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>
            </div>
            {!isLoginMode && (
              <div className="form-group">
                <label>
                  Adresse email:
                  <input
                    className="form-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </label>
              </div>
            )}
            <div className="form-group">
              <label>
                Mot de passe:
                <input
                  className="form-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
            </div>
            {!isLoginMode && (
              <div className="form-group">
                <label>
                  Confirmer le mot de passe:
                  <input
                    className="form-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </label>
              </div>
            )}
            <button className="form-button" type="submit">
              {isLoginMode ? 'Se connecter' : "S'inscrire"}
            </button>
          </form>
          <button className="switch-button" onClick={switchMode}>
            {isLoginMode
              ? "Pas de compte ? Inscrivez-vous"
              : 'Déjà un compte ? Connectez-vous'}
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginRegister;
