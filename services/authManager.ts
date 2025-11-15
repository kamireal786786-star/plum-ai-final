
import { UserProfile } from "../contexts/GoogleAuthContext";

const TOKEN_KEY = 'plum_ai_google_token';
const PROFILE_KEY = 'plum_ai_user_profile';

export const setToken = (token: string | null) => {
    console.log("Auth token set.");
    if (token) {
        sessionStorage.setItem(TOKEN_KEY, token);
    } else {
        sessionStorage.removeItem(TOKEN_KEY);
    }
};

export const getToken = (): string | null => {
    return sessionStorage.getItem(TOKEN_KEY);
};

export const setUserProfile = (profile: UserProfile | null) => {
    console.log("User profile set.");
    if (profile) {
        sessionStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    } else {
        sessionStorage.removeItem(PROFILE_KEY);
    }
};

export const getUserProfile = (): UserProfile | null => {
    try {
        const profileStr = sessionStorage.getItem(PROFILE_KEY);
        return profileStr ? JSON.parse(profileStr) : null;
    } catch (e) {
        console.error("Failed to parse user profile from sessionStorage", e);
        return null;
    }
};
