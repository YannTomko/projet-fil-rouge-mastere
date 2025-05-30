import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { getUserFiles } from '../../services/filesServices';
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
        const fetchFiles = async () => {
            try {
                const response = await getUserFiles();
                setFiles(response.files);
                setLoading(false);
            } catch (err: any) {
                setError('Erreur lors de la récupération des fichiers');
                setLoading(false);
            }
        };

        fetchFiles();
    }, [refresh, user]);

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
            {location.pathname !== '/upload' && (
                <button
                    style={{marginTop:"2rem"}}
                    onClick={() => navigate(`/upload`)}
                    className="upload-redirect-button"
                >
                    Ajouter des fichiers
                </button>
            )}
        </aside>
    );
};

export default Sidebar;
