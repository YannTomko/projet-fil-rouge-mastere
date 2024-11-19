import axios from "axios";

export const uploadFile = async (file: File, owner: string) => {
    if (!file) {
      throw new Error('Aucun fichier sélectionné.');
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('owner', owner)
  
    try {
      const response = await axios.post('http://localhost:3001/api/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw error.response?.data?.error || error.message;
    }
  };


export const getAllFiles = async () => {
    try {
        const response = await axios.post('http://localhost:3001/api/files/getall');
        console.log('Liste des fichiers:', response.data);
        return response.data
    } catch (error: any) {
        console.error('Erreur lors de la récupération des fichiers:', error.response?.data?.error || error.message);
        return null
    }
};