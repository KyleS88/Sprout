import useAuth from "../store/authStore";

type AuthData = {
  setIsAuthenticated: (value: boolean) => void;
  isAuthenticated: boolean;
  setToken: (token: string) => void;
  token: string | null;
};

const useAuthData = (): AuthData => {
    const setIsAuthenticated = useAuth((state)=>state.setIsAuthenticated);
    const isAuthenticated = useAuth((state)=>state.isAuthenticated);
    const setToken = useAuth((state)=>state.setToken);
    const token = useAuth((state)=>state.token);
    return {
        setIsAuthenticated,
        isAuthenticated,
        setToken,
        token,
    }
}
export default useAuthData