import './styles/App.css'
import { ReactFlowProvider } from '@xyflow/react'
import Validated from './components/Validated'
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import RegisterPage from './components/AuthComponent/RegisterPage';
import LoginPage from './components/AuthComponent/LoginPage';
import { useCallback, useEffect,useState } from "react";
import { apiUrl } from './hooks/useMapData';
import axios, { type AxiosResponse } from 'axios';
import ProctectedRouter from './components/AuthComponent/ProctectedRouter';
import { useDataMap } from './hooks/useMapData';
import useAuthData from './hooks/useAuthData';

const App: React.FC = () => {
  const { token, setToken, setIsAuthenticated, isAuthenticated } = useAuthData();
  const [isLoading, setIsLoading] = useState(true);
  const { setUserID } = useDataMap();
  const navigate = useNavigate();
  const validateToken = useCallback(async (token: string) => {
      const response: AxiosResponse = await axios.post(`${apiUrl}user/authenticate`, null, { headers: { Authorization: `Bearer ${token}`} });
      return response.data;
  },[]);
  useEffect(() => {
    if (token) {
      validateToken(token)
        .then((data)=>{
          console.log("trying to auth")
          setIsAuthenticated(true);
          setIsLoading(false);
          setUserID(data.userID)
          navigate("/validated")
          console.log(data.userID)
        })
      .catch((err) => {
        console.log(err)
        setIsAuthenticated(false);
        setIsLoading(false);
        localStorage.removeItem("token");
      });
  } else {
    setIsAuthenticated(false);
    setIsLoading(false);
    console.log("no token")
  }}, [token, validateToken, navigate, setUserID, setIsAuthenticated]);

  return (
  <div>
    <ReactFlowProvider>
        {isLoading? <h1 style={{display: 'flex', justifyContent: 'center'}}>Loading...</h1>
        :
        <Routes>
          <Route path="/" element={<Navigate to="/register" />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} setToken={setToken}/>} />
          <Route path="/validated" 
            element=
            {
              <ProctectedRouter isAuthenticated={isAuthenticated}>
                <Validated />
              </ProctectedRouter>
            } 
          />
          </Routes>}
      </ReactFlowProvider>
  </div>
  )
}

export default App
