import axios from "axios";

export const handleRegister = async (username:string, email:string, password:string) => {
    try {
        const response = await axios.post('http://localhost:3001/api/auth/register', {
            username,
            email,
            password,
        });
        console.log('Inscription réussie:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Erreur lors de l\'inscription:', error.response?.data?.error || error.message);
        return null;
    }
};

export const handleLogin = async (username:string, password:string) => {
    try {
        const response = await axios.post('http://localhost:3001/api/auth/login', {
            username,
            password,
        });
        console.log('Connexion réussie:', response.data);
        return response.data;
    } catch (error: any) {
        console.error('Erreur de connexion:', error.response?.data?.error || error.message);
        return null;
    }
};

export const getAllUsers = async () => {
    try {
        const response = await axios.post('http://localhost:3001/api/auth/getall');
        console.log('Liste des utilisateurs:', response.data);
    } catch (error: any) {
        console.error('Erreur lors de la récupération des utilisateurs:', error.response?.data?.error || error.message);
    }
};

export const deleteAllUsers = async () => {
    try {
        const response = await axios.post('http://localhost:3001/api/auth/deleteall');
        console.log('Suppression des utilisateurs:', response.data);
    } catch (error: any) {
        console.error('Erreur lors de la suppression des utilisateurs:', error.response?.data?.error || error.message);
    }
};