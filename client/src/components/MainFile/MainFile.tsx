import React, { useEffect, useState } from 'react';
import './MainFile.css';
import axios from 'axios';
import { deleteFile, getFile, getFileInfo } from '../../services/filesServices';
import { useNavigate } from 'react-router-dom';
import { User } from '../../models/User';

interface MainFileProps {
    fileId: number;
    refreshSidebar: () => void;
    user: User | null;
}

const MainFile: React.FC<MainFileProps> = ({ fileId, refreshSidebar, user }) => {
    const [fileInfo, setFileInfo] = useState<{
        name: string;
        owner: string;
        size: number;
        created: string;
    } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [shareLink, setShareLink] = useState<string | null>(null); // État pour le lien de partage
    const navigate = useNavigate();

    // Charger les infos du fichier
    useEffect(() => {
        const fetchFileInfo = async () => {
            try {
                const response = await getFileInfo(fileId);
                if (response) setFileInfo(response.data);
            } catch (error: any) {
                setError('Erreur lors de la récupération des informations du fichier');
            }
        };

        fetchFileInfo();
        setShareLink(null)
    }, [fileId]);

    // Fonction pour télécharger le fichier
    const handleDownload = async () => {
        try {
            const response = await getFile(fileId);

            if (response) {
                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', fileInfo?.name || 'fichier'); // Nom du fichier
                document.body.appendChild(link);
                link.click();
                link.parentNode?.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Erreur lors du téléchargement du fichier', error);
        }
    };

    // Fonction pour générer le lien de partage
    const handleShare = async () => {
        try {
            const link = `${window.location.origin}/file/${fileId}`;
            setShareLink(link);
            await navigator.clipboard.writeText(link); // Copie dans le presse-papier
        } catch (error) {
            console.error('Erreur lors de la génération du lien de partage', error);
        }
    };

    if (error) {
        return <p className="error-message">{error}</p>;
    }

    if (!fileInfo) {
        return <p>Chargement des informations du fichier...</p>;
    }

    return (
        <main className="main-content">
            <h1>{fileInfo.name}</h1>
            <ul className="file-details">
                <li><strong>Propriétaire :</strong> {fileInfo.owner}</li>
                <li><strong>Taille :</strong> {fileInfo.size} octets</li>
                <li><strong>Date de création :</strong> {new Date(fileInfo.created).toLocaleString()}</li>
            </ul>
            <div className="file-actions">
                <button onClick={handleDownload} className="download-button">Télécharger</button>
                {user && ( // Vérifie si user n'est pas null
                    <>
                        <button
                            onClick={async () => {
                                try {
                                    await deleteFile(fileId);
                                    refreshSidebar();
                                    navigate("/upload");
                                } catch (error) {
                                    console.error('Erreur lors de la suppression du fichier', error);
                                }
                            }}
                            className="delete-button"
                        >
                            Supprimer
                        </button>
                        <button onClick={handleShare} className="share-button">Partager</button>
                    </>
                )}
            </div>
            {shareLink && (
                <p className="share-link">
                    Lien copié dans le presse papier
                </p>
            )}
        </main>
    );
};

export default MainFile;
