import React, { createContext, useState, useEffect, useContext } from 'react';
import API from '../utils/api';

const AdminContext = createContext();

export const AdminProvider = ({ children }) => {
    const [admin, setAdmin] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('adminToken');
        if (token) {
            API.get('/auth/me')
                .then(res => {
                    if (res.data.user.role === 'admin') {
                        setAdmin(res.data.user);
                    } else {
                        localStorage.removeItem('adminToken');
                    }
                })
                .catch(() => localStorage.removeItem('adminToken'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (mobile, password) => {
        const res = await API.post('/auth/login', { mobile, password });
        if (res.data.user.role !== 'admin') {
            throw new Error('Access denied! Admin only.');
        }
        localStorage.setItem('adminToken', res.data.token);
        setAdmin(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('adminToken');
        setAdmin(null);
    };

    return (
        <AdminContext.Provider value={{ admin, loading, login, logout }}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => useContext(AdminContext);
export default AdminContext;