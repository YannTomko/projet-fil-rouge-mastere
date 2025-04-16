import api from "../utils/api";


export const handleRegister = async (username: string, email: string, password: string) => {
    try {
        const response = await api.post("/auth/register", {
            username,
            email,
            password,
        });
        return response.data;
    } catch (error: any) {
        console.error("Erreur lors de l'inscription:", error.response?.data?.error || error.message);
        return null;
    }
};

export const handleLogin = async (username: string, password: string) => {
    try {
        const response = await api.post("/auth/login", {
            username,
            password,
        });
        return response.data;
    } catch (error: any) {
        console.error("Erreur de connexion:", error.response?.data?.error || error.message);
        return null;
    }
};


