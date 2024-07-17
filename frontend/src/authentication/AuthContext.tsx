import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextProps {
    isAuthenticated: boolean;
    login: (token: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('Checking for token in localStorage...');
        const token = localStorage.getItem('token');
        if (token) {
            console.log('Token found');
            setIsAuthenticated(true);
        } else {
            console.log('No token found');
        }
        setIsLoading(false);
    }, []);

    const login = (token: string) => {
        console.log('Logging in with token:', token);
        localStorage.setItem('token', token);
        setIsAuthenticated(true);
    };

    const logout = () => {
        console.log('Logging out...');
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
