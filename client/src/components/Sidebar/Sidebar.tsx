import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Sidebar.css';
import { getAllFiles } from '../../services/filesServices';
import { FileData } from '../../models/File';
import { User } from '../../models/User';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps {
  user: User;
  refresh: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, refresh }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchFiles = async (username: string) => {
      try {
        const response = await getAllFiles();
        console.log(response.files);
        setFiles(response.files);
        setLoading(false);
      } catch (err: any) {
        setError('Erreur lors de la récupération des fichiers');
        setLoading(false);
      }
    };

    fetchFiles(user.username);
  }, [refresh]);

  if (loading) {
    return <aside className="sidebar">Chargement des fichiers...</aside>;
  }

  if (error) {
    return <aside className="sidebar">{error}</aside>;
  }

  return (
    <aside className="sidebar">
      <nav>
        <ul className="sidebar-list">
          {files.map((file) => {
            const isActive = location.pathname === `/file/${file.id}`;
            return (
              <li key={file.id} className="sidebar-item">
                <button
                  onClick={() => navigate(`/file/${file.id}`)}
                  className={`file-link ${isActive ? 'active' : ''}`}
                >
                  {file.name}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="sidebar-footer">
        <button
          onClick={() => navigate(`/upload`)}
          className={`upload-redirect-button ${location.pathname === '/upload' ? 'active' : ''}`}
        >
          Ajouter des fichiers
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
