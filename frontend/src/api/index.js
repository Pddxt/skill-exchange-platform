import api from "./axios.js";

// Auth
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const fetchMe = () => api.get("/auth/me");

// Users
export const fetchUserProfile = (id) => api.get(`/users/${id}`);
export const updateMyProfile = (data) => api.put("/users/profile", data);
export const searchUsers = (search) => api.get("/users", { params: { search } });

// Skills
export const fetchSkills = (params) => api.get("/skills", { params });
export const fetchSkillById = (id) => api.get(`/skills/${id}`);
export const fetchMySkills = () => api.get("/skills/mine");
export const createSkill = (data) => api.post("/skills", data);
export const updateSkill = (id, data) => api.put(`/skills/${id}`, data);
export const deleteSkill = (id) => api.delete(`/skills/${id}`);

// Bookings
export const fetchMyBookings = () => api.get("/bookings/mine");
export const createBooking = (data) => api.post("/bookings", data);
export const updateBookingStatus = (id, status) => api.put(`/bookings/${id}/status`, { status });
export const createPaymentIntent = (id) => api.post(`/bookings/${id}/pay`);

// Messages
export const fetchConversations = () => api.get("/messages/conversations");
export const fetchThread = (userId) => api.get(`/messages/${userId}`);
export const sendMessage = (data) => api.post("/messages", data);

// Reviews
export const createReview = (data) => api.post("/reviews", data);
export const fetchReviewsForUser = (userId) => api.get(`/reviews/user/${userId}`);
