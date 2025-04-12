import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token && config.headers) {
            console.log("[API] Ajout de l'access token aux headers");
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log("[API] Pas d'access token trouvé dans localStorage.");
        }
        return config;
    },
    (error) => {
        console.error("[API] Erreur lors de la requête :", error);
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        console.log("[API] Réponse reçue :", response);
        return response;
    },
    async (error) => {
        console.error("[API] Erreur de réponse :", error);
        const originalRequest = error.config;
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            console.warn("[API] Code 401 reçu, tentative de rafraîchissement du token...");
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                console.warn("[API] Aucun refresh token trouvé. Déconnexion de l'utilisateur.");
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                //window.location.href = "/";
                return Promise.reject(error);
            }
            try {
                console.log("[API] Refresh token trouvé, demande d'un nouveau token via /auth/refresh");
                const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
                console.log("[API] Nouveau access token reçu :", data.accessToken);
                localStorage.setItem("accessToken", data.accessToken);
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
                return api(originalRequest);
            } catch (refreshError) {
                console.error("[API] Erreur lors du rafraîchissement du token, déconnexion de l'utilisateur :", refreshError);
                localStorage.removeItem("user");
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                //window.location.href = "/";
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
