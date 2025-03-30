// authService.js
import api from "./api";

export const loginUser = async (email, password) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.mfaRequired) {
      localStorage.setItem("pendingLogin", JSON.stringify({ email, timestamp: Date.now() }));
    } else if (response.data.token) {
      const tokenData = { token: response.data.token, expiresAt: Date.now() + (60 * 60 * 1000) };
      localStorage.setItem("token", JSON.stringify(tokenData));
      const userData = {
        email: response.data.email,
        username: response.data.username || "Invitado",
        role: response.data.role,
        userId: response.data.userId
      };
      localStorage.setItem("user", JSON.stringify(userData));
    }
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al iniciar sesión");
  }
};

export const verifyProfileMFA = async (email, code) => {
  try {
    const response = await api.post("/users/verify-profile-mfa", { email, code });
    const storedUser = JSON.parse(localStorage.getItem("user")) || {};
    const updatedUser = {
      ...storedUser,
      username: response.data.username || storedUser.username || "Invitado",
      email: response.data.email || email,
      role: response.data.role || storedUser.role
    };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al verificar el código MFA");
  }
};

export const verifyMFA = async (email, code) => {
  try {
    const response = await api.post("/auth/verify-mfa", { email, code });
    if (response.data.token) {
      const tokenData = { token: response.data.token, expiresAt: Date.now() + (60 * 60 * 1000) };
      localStorage.setItem("token", JSON.stringify(tokenData));
      const userData = {
        email: response.data.email || email,
        username: response.data.username,
        role: response.data.role,
        userId: response.data.userId
      };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.removeItem("pendingLogin");
    }
    return response.data;
  } catch (error) {
    console.error("MFA verification failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error al verificar MFA");
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("pendingLogin");
};

export const getUsers = async () => {
  try {
    const response = await api.get("/users");
    console.log("Respuesta de getUsers:", response.data); // Depuración
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al obtener usuarios");
  }
};

export const addUser = async (userData) => {
  try {
    const response = await api.post("/users", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al agregar usuario");
  }
};

export const editUser = async (id, userData) => {
  try {
    console.log("Enviando actualización para ID:", id, "Datos:", userData); // Depuración
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al editar usuario");
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await api.delete(`/users/${id}`);
    return response.data; // Devolver la respuesta del backend
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al eliminar usuario");
  }
};

export const updateUserProfile = async (userData) => {
  try {
    const response = await api.post("/users/update-profile", userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Error al iniciar la actualización del perfil");
  }
};

export const registerUser = async (username, email, password) => {
  try {
    const response = await api.post("/auth/register", { username, email, password, temp: true });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al iniciar el registro");
  }
};

export const verifyRegisterMFA = async (email, code, username, password) => {
  try {
    const response = await api.post("/users/verify-register-mfa", {
      email,
      code,
      username,
      password,
      completeRegistration: true
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.error || "Error al verificar MFA");
  }
};

export const requestPasswordReset = async (email) => {
  try {
    const response = await api.post("/auth/password-reset-request", { email });
    return response.data;
  } catch (error) {
    console.error("Password reset request failed:", error.response?.data || error.message);
    const errorMessage = error.response?.data?.error || error.message || "Error al solicitar recuperación de contraseña";
    throw new Error(errorMessage);
  }
};

export const resetPassword = async (email, code, newPassword) => {
  try {
    if (!newPassword || newPassword.length < 8) {
      throw new Error("La nueva contraseña debe tener al menos 8 caracteres");
    }
    const response = await api.post("/auth/password-reset", { email, code, newPassword });
    return response.data;
  } catch (error) {
    console.error("Password reset failed:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error al restablecer la contraseña");
  }
};

export const getReservedBooks = async (title) => {
  try {
    const response = await api.get("/reserved-books", {
      params: { title },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reserved books:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error al obtener libros apartados");
  }
};

export const reserveBook = async (bookData) => {
  try {
    const response = await api.post("/books/reserve", bookData);
    return response.data;
  } catch (error) {
    console.error("Error reserving book:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error al apartar el libro");
  }
};

export const addToWaitingList = async (title, userId) => {
  try {
    const response = await api.post("/books/waiting-list", { title, userId });
    return response.data;
  } catch (error) {
    console.error("Error adding to waiting list:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error al añadir a la lista de espera");
  }
};

export const getReservedUserBooks = async (title = null, params = {}) => {
  try {
    const response = await api.get("/books/reserved-user", {
      params: { title, ...params },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching reserved books:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error al obtener libros apartados");
  }
};

export const getWaitingListBooks = async (userId) => {
  try {
    const response = await api.get("/books/waiting-list", {
      params: { userId },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching waiting list books:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error al obtener libros en espera");
  }
};

export const cancelReservation = async (reservationId, userId) => {
  try {
    const response = await api.post("/books/cancel-reservation", { reservationId, userId });
    return response.data;
  } catch (error) {
    console.error("Error cancelling reservation:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error al cancelar la reserva");
  }
};

export const cancelWaitingList = async (reservationId, userId) => {
  try {
    const response = await api.post("/books/cancel-waiting-list", { reservationId, userId });
    return response.data;
  } catch (error) {
    console.error("Error cancelling waiting list:", error.response?.data || error.message);
    throw new Error(error.response?.data?.error || "Error al cancelar de la lista de espera");
  }
};