import React, { useState } from 'react';
import { User } from '../../models/User';
import './MainUpload.css';
import { uploadFile } from '../../services/filesServices';

interface MainUploadProps {
    user: User | null;
    refreshSidebar: () => void;
}

const MainUpload: React.FC<MainUploadProps> = ({ user, refreshSidebar }) => {
    const [uploaded, setUploaded] = useState<boolean>(false)
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length > 0) {
            setSelectedFile(event.target.files[0]);
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
        }
    };

    const handleFileDeselect = () => {
        setSelectedFile(null);
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
