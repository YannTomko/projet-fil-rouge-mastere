import React, { useState } from 'react';
import { User } from '../../models/User';
import './MainFile.css';
import { deleteAllUsers, getAllUsers } from '../../services/authServices';
import { getAllFiles, uploadFile } from '../../services/filesServices';

interface MainFileProps {
    fileId: number;
}

const MainFile: React.FC<MainFileProps> = ({ fileId }) => {

    return (
        <main className="main-content">
            <p>{fileId}</p>
        </main>
    );
};

export default MainFile;
