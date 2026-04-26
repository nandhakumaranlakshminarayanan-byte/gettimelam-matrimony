import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:5000/api'
});

API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) req.headers.Authorization = `Bearer ${token}`;
    return req;
});

export const registerUser = (data) => API.post('/auth/register', data);
export const loginUser = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');
export const getProfiles = (filters) => API.get('/profiles', { params: filters });
export const getProfileById = (id) => API.get(`/profiles/${id}`);
export const createProfile = (data) => API.post('/profiles', data);
export const updateProfile = (data) => API.put('/profiles/my', data);
export const getServices = (filters) => API.get('/services', { params: filters });
export const createBooking = (data) => API.post('/bookings', data);
export const getMyBookings = () => API.get('/bookings/my');

export default API;