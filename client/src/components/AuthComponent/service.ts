import axios, { type AxiosResponse } from "axios";

const apiUrl: string = import.meta.env.VITE_API_URL || "http://localhost:3000/api/";
export interface UserRegister {
    username: string,
    email: string,
    password: string,
};
export interface UserLogin {
    email: string, 
    password: string,
};

export const registerUser = async (user: UserRegister) => {
    const response: AxiosResponse = await axios.post(`${apiUrl}user/register`, user);
    return response.data;
};

export const loginUser = async (user: UserLogin) => {
    const response: AxiosResponse = await axios.post(`${apiUrl}user/login`, user);
    return response.data;
};

export const isValidEmail = (email: string): boolean => {
    const trimmedEmail: string = email.trim();
    return /^[^\s@]+@([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/.test(trimmedEmail);
};

        
       