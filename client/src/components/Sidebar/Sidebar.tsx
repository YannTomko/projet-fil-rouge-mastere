import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './Sidebar.css';
import { getAllFiles } from '../../services/filesServices';
import { FileData } from '../../models/File';
import { User } from '../../models/User';

interface SidebarProps {
  user: User;
  refresh: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ user, refresh }) => {
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFiles = async (username:string) => {
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

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await axios.get(`http://localhost:3001/api/files/get/${fileId}`, {
        responseType: 'blob',
      });

      console.log(response)

      // Créer un lien de téléchargement dynamique
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Nom du fichier à télécharger
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement du fichier', error);
    }
  };

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
          {files.map((file) => (
            <li key={file.id} className="sidebar-item">
              <button
                onClick={() => handleDownload(file.id, file.name)}
                className="file-link"
              >
                {file.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
