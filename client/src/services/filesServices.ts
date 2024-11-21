import axios from "axios";

export const uploadFile = async (file: File, owner: string) => {
  if (!file) {
    throw new Error('Aucun fichier sélectionné.');
  }
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner)
  formData.append('size', file.size.toString());
  console.log(formData)

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

export const deleteFile = async (fileId:number) => {
  try {
    await axios.delete(`http://localhost:3001/api/files/delete/${fileId}`);
  } catch (error) {
    console.error('Erreur lors de la suppression du fichier', error);
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

export const getFile = async (fileId: number) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/files/get/${fileId}`, {
      responseType: 'blob',
    });
    return response
  } catch (error: any) {
    console.error('Erreur lors de la récupération du fichier:', error.response?.data?.error || error.message);
    return null
  }
}

export const getFileInfo = async (fileId: number) => {
  try {
    const response = await axios.get(`http://localhost:3001/api/files/getinfo/${fileId}`);
    return response
  } catch (error: any) {
    console.error('Erreur lors de la récupération des infos du fichier:', error.response?.data?.error || error.message);
    return null
  }
}