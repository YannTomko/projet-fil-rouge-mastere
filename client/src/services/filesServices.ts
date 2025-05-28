import api from "../utils/api";

// Upload d'un fichier
export const uploadFile = async (file: File, owner: number) => {
  if (!file) {
    throw new Error("Aucun fichier sélectionné.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("owner", owner.toString());
  formData.append("size", file.size.toString());

  try {
    const response = await api.post("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error: any) {
    throw error.response?.data?.error || error.message;
  }
};

// Suppression d’un fichier
export const deleteFile = async (fileId: number) => {
  try {
    await api.delete(`/files/delete/${fileId}`);
  } catch (error) {
    console.error("Erreur lors de la suppression du fichier", error);
  }
};

// Récupération de tous les fichiers
export const getUserFiles = async () => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.error("Aucun utilisateur trouvé dans le localStorage");
      return null;
    }
    const user = JSON.parse(storedUser);
    const response = await api.get(`/files/user/${user.id}`);
    return response.data;
  } catch (error: any) {
    console.error(
      "Erreur lors de la récupération des fichiers:",
      error.response?.data?.error || error.message
    );
    return null;
  }
};

// Téléchargement d’un fichier
export const getFile = async (fileId: number) => {
  try {
    const user = localStorage.getItem("user");
    const response = await api.get(`/files/${fileId}`, {
      responseType: "blob",
      headers: { user },
    });
    return response;
  } catch (error: any) {
    console.error("Erreur lors de la récupération du fichier:", error.response?.data?.error || error.message);
    return null;
  }
};

// Infos d’un fichier
export const getFileInfo = async (fileId: number) => {
  try {
    const response = await api.get(`/files/info/${fileId}`);
    return response;
  } catch (error: any) {
    console.error("Erreur lors de la récupération des infos du fichier:", error.response?.data?.error || error.message);
    return null;
  }
};