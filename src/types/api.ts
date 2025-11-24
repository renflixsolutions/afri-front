export interface ApiResponse<T = any> {
    status: boolean;
    message: string;
    data: T;
}

export interface User {
    username: string;
    name: string;
    phone: string;
    role_name: string;
    first_time_login: boolean;
    account_locked: boolean;
    email: string;
    countries: Array<{
        id: string;
        name: string;
    }>;
    address: string | null;
    created_at: string | null;
}

export interface AuthResponse {
    user: User;
    access_token: string;
    refresh_token: string;
    token_expires_at: number;
}

export interface NonceResponse {
    cf: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    accessToken: string | null;
    refreshToken: string | null;
    tokenExpiresAt: number | null;
}
