import React, { useState } from 'react';
import { User } from '../../models/User';
import './MainUpload.css';
import { uploadFile } from '../../services/filesServices';

interface MainUploadProps {
    user: User | null;
    refreshSidebar: () => void;
}

const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo
const SUSPICIOUS_EXTENSIONS = ['.sh', '.exe', '.bat', '.cmd', '.ps1'];

const MainUpload: React.FC<MainUploadProps> = ({ user, refreshSidebar }) => {
    const [uploaded, setUploaded] = useState<boolean>(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>('');

    const hasSuspiciousExtension = (name: string) => {
        const lower = name.toLowerCase();
        return SUSPICIOUS_EXTENSIONS.some(ext => lower.endsWith(ext));
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            const file = event.target.files[0];

            if (file.size > MAX_SIZE_BYTES) {
                setSelectedFile(null);
                setErrorMessage("Le fichier dépasse la taille maximale de 50 Mo.");
                return;
            }

            if (hasSuspiciousExtension(file.name)) {
                setSelectedFile(null);
                setErrorMessage("Extension de fichier non autorisée.");
                return;
            }

            setSelectedFile(file);
        }
    };

    const handleFileUpload = async () => {
        if (!selectedFile) {
            return;
        }

        if (!user) return;
        try {
            await uploadFile(selectedFile, user.id);
            setUploaded(true)
            refreshSidebar()
        } catch (error) {
            console.error('Erreur lors de l\'upload du fichier', error);
            setErrorMessage("Erreur lors de l'upload. Réessayez.");
        }
    };

    const handleFileDeselect = () => {
        setSelectedFile(null);
        setErrorMessage('');
    };

    return (
        <main className="main-content">
            {user ? (
                <>
                    <div className="upload-section">
                        <div className="file-upload">
                            {uploaded ? (
                                <div className="file-info-section">
                                    <p>Le fichier a été téléchargé avec succès.</p>
                                    <button
                                        onClick={() => {
                                            setUploaded(false);
                                            setSelectedFile(null);
                                            setErrorMessage('');
                                        }}
                                        className="upload-another-button"
                                    >
                                        Uploader un autre fichier
                                    </button>
                                </div>
                            ) : !selectedFile ? (
                                <div className="file-info-section">
                                    <p>Sélectionnez un fichier à uploader</p>
                                    <label htmlFor="fileInput" className="file-upload-label">
                                        Sélectionner un fichier
                                        <input
                                            id="fileInput"
                                            type="file"
                                            onChange={handleFileChange}
                                            className="file-input"
                                        />
                                    </label>
                                    {errorMessage && (
                                        <p className="error-message">{errorMessage}</p>
                                    )}
                                </div>
                            ) : (
                                <div className="file-info-section">
                                    <p>Fichier sélectionné : {selectedFile.name}</p>
                                    <button onClick={handleFileDeselect} className="deselect-button">
                                        Désélectionner
                                    </button>
                                    <button onClick={handleFileUpload} className="upload-button">
                                        Uploader le fichier
                                    </button>
                                    {errorMessage && (
                                        <p className="error-message">{errorMessage}</p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <p>Veuillez vous connecter pour commencer à utiliser AirLocker.</p>
            )}
            <br />
        </main>

    );
};

export default MainUpload;
