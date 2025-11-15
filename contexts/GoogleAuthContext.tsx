
import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authManager from '../services/authManager';
import * as configService from '../services/configService';

const SCOPES = 'openid profile email https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/gmail.send';

// Type declarations for external scripts
declare const google: any;

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    picture: string;
}

interface GoogleAuthContextType {
    isLoggedIn: boolean;
    user: UserProfile | null;
    login: () => void;
    logout: () => void;
}

export const GoogleAuthContext = createContext<GoogleAuthContextType>({
    isLoggedIn: false,
    user: null,
    login: () => {},
    logout: () => {},
});

export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isGisLoaded, setIsGisLoaded] = useState(false);

    // Initialize state from sessionStorage on component mount
    useEffect(() => {
        const token = authManager.getToken();
        const profile = authManager.getUserProfile();
        if (token && profile) {
            setUser(profile);
            setIsLoggedIn(true);
        }
    }, []);

    // Load the Google Identity Services (GIS) script
    useEffect(() => {
        const SCRIPT_ID = 'google-gis-script';
        if (document.getElementById(SCRIPT_ID)) {
            setIsGisLoaded(true);
            return;
        }

        const script = document.createElement('script');
        script.id = SCRIPT_ID;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => setIsGisLoaded(true);
        document.body.appendChild(script);

        return () => {
            const scriptElement = document.getElementById(SCRIPT_ID);
            if (scriptElement && document.body.contains(scriptElement)) {
                document.body.removeChild(scriptElement);
            }
        };
    }, []);

    const logout = useCallback(() => {
        const token = authManager.getToken();
        if (token && isGisLoaded && typeof google !== 'undefined' && google.accounts) {
            google.accounts.oauth2.revoke(token, () => {
                console.log('Token revoked');
            });
        }
        authManager.setToken(null);
        authManager.setUserProfile(null);
        setUser(null);
        setIsLoggedIn(false);
    }, [isGisLoaded]);

    const fetchUserProfile = useCallback(async (accessToken: string) => {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { 'Authorization': `Bearer ${accessToken}` }
            });
            if (!response.ok) throw new Error(`Failed to fetch user profile. Status: ${response.status}`);
            const profile = await response.json();
            const userProfile: UserProfile = {
                id: profile.sub,
                name: profile.name,
                email: profile.email,
                picture: profile.picture
            };
            setUser(userProfile);
            authManager.setUserProfile(userProfile);
            setIsLoggedIn(true);
        } catch (error) {
            console.error("Error fetching user profile:", error);
            logout(); // Log out if profile fetch fails
        }
    }, [logout]);


    const login = useCallback(async () => {
        if (!isGisLoaded || typeof google === 'undefined') {
            alert("Google services are not loaded yet. Please wait a moment and try again.");
            return;
        }
        
        const config = configService.getGoogleConfig();
        if (!config || !config.clientId) {
            alert("Google integration has not been configured. Please set the Client ID and API Key on the Admin page.");
            return;
        }

        try {
            const tokenClient = google.accounts.oauth2.initTokenClient({
                client_id: config.clientId,
                scope: SCOPES,
                callback: async (tokenResponse: any) => {
                    if (tokenResponse.error) {
                        console.error('Google Auth Error:', tokenResponse);
                        alert(`Failed to authenticate with Google: ${tokenResponse.error_description || tokenResponse.error}. Please check your Client ID configuration.`);
                        return;
                    }
                    if (tokenResponse.access_token) {
                        authManager.setToken(tokenResponse.access_token);
                        await fetchUserProfile(tokenResponse.access_token);
                    }
                },
            });

            tokenClient.requestAccessToken();

        } catch (error) {
            console.error("Failed to initiate Google login:", error);
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
            alert(`An error occurred during login: ${errorMessage}`);
        }
    }, [isGisLoaded, fetchUserProfile]);


    const value = { isLoggedIn, user, login, logout };

    return (
        <GoogleAuthContext.Provider value={value}>
            {children}
        </GoogleAuthContext.Provider>
    );
};
