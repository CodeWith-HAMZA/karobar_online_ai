'use client'
import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext<any | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    // Decrypt function
    const decryptData = (encryptedString: string) => {
        try {
            const jsonString = atob(encryptedString);
            return JSON.parse(jsonString);
        } catch (e) {
            console.error('Decryption error:', e);
            return null;
        }
    };

    // Encrypt function
    const encryptData = (data: any) => {
        try {
            const jsonString = JSON.stringify(data);
            return btoa(jsonString);
        } catch (e) {
            console.error('Encryption error:', e);
            return null;
        }
    };

    // Check authentication on mount and route change
    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('authToken');

            if (token) {
                const userData = decryptData(token);
                if (userData && userData.isAuthenticated) {
                    setUser(userData);
                    // If user is authenticated and on auth page, redirect to home
                    if (pathname === '/auth') {
                        router.push('/');
                    }
                } else {
                    // Invalid token
                    setUser(null);
                    localStorage.removeItem('authToken');
                    if (pathname !== '/auth') {
                        router.push('/auth');
                    }
                }
            } else {
                // No token found
                setUser(null);
                if (pathname !== '/auth') {
                    router.push('/auth');
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, [pathname, router]);

    // Login function
    const login = (email: string) => {
        const authData = {
            email: email,
            isAuthenticated: true,
            loginTime: new Date().toISOString()
        };
        const encryptedData = encryptData(authData);
        if (encryptedData) {
            localStorage.setItem('authToken', encryptedData);
            setUser(authData);
            router.push('/');
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        router.push('/auth');
    };

    const value = {
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user
    };

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}