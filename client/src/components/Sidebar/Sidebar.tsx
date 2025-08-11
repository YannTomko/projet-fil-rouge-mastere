import React, { useEffect, useState, useRef } from 'react';
import './Sidebar.css';
import { getUserFiles } from '../../services/filesServices';
import { FileData } from '../../models/File';
import { User } from '../../models/User';
import { useLocation, useNavigate } from 'react-router-dom';

interface SidebarProps { user: User; refresh: boolean; }

const Sidebar: React.FC<SidebarProps> = ({ user, refresh }) => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const asideRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        const mm = window.matchMedia('(max-width: 768px)');
        const apply = (e: MediaQueryList | MediaQueryListEvent) => {
            const mobile = 'matches' in e ? e.matches : (e as MediaQueryList).matches;
            setIsMobile(mobile);
            setIsOpen(!mobile);
        };
        apply(mm);
        mm.addEventListener('change', apply);
        return () => mm.removeEventListener('change', apply);
    }, []);

    useEffect(() => {
        (async () => {
            try {
                const response = await getUserFiles();
                setFiles(response.files);
                setLoading(false);
            } catch {
                setError('Erreur lors de la récupération des fichiers');
                setLoading(false);
            }
        })();
    }, [refresh, user]);

    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
        document.addEventListener('keydown', onEsc);
        return () => document.removeEventListener('keydown', onEsc);
    }, []);

    const go = (path: string) => {
        navigate(path);
        if (isMobile) setIsOpen(false);
    };

    if (loading) return <aside className="sidebar">Chargement des fichiers...</aside>;
    if (error) return <aside className="sidebar">{error}</aside>;

    return (
        <>
            {isMobile && (
                <button
                    className="sidebar-toggle"
                    aria-label={isOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
                    onClick={() => setIsOpen(v => !v)}
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M3 6h18M3 12h18M3 18h18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
            )}

            {isMobile && isOpen && <div className="sidebar-backdrop" onClick={() => setIsOpen(false)} />}

            <aside ref={asideRef} className={`sidebar ${isOpen ? 'open' : ''}`}>
                <nav>
                    <ul className="sidebar-list">
                        {files.map((file) => {
                            const isActive = location.pathname === `/file/${file.id}`;
                            return (
                                <li key={file.id} className="sidebar-item">
                                    <button
                                        onClick={() => go(`/file/${file.id}`)}
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
                        style={{ marginTop: '2rem' }}
                        onClick={() => go('/upload')}
                        className="upload-redirect-button"
                    >
                        Ajouter des fichiers
                    </button>
                )}
            </aside>
        </>
    );
};

export default Sidebar;
