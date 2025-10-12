import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert"
import { type UserLogin, loginUser, isValidEmail } from "./service";
import axios from "axios";
import { Link, useNavigate  } from "react-router-dom";
import { useDataMap } from "../../hooks/useMapData";
import "../../styles/Auth.css"

interface LoginPageProps {
    setIsAuthenticated: (isAuth: boolean) => void
    setToken: (token: string) => void,
};

const LoginPage: React.FC<LoginPageProps> = ({ setIsAuthenticated, setToken }) => {
    const { setUserID } = useDataMap();
    const navigate = useNavigate();
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [invalid, setInvalid] = useState<string>("");

    const handleLogin = async(): Promise<void> => {
        try {
            setInvalid("");
            if (!isValidEmail(email)) {
                setInvalid("There is no account connected this email");
            } else if (password.length < 8) {
                setInvalid("The password is of invalid length");
            } else {
                const loginProfile: UserLogin = { email, password };
                const user = await loginUser(loginProfile);
                setToken(user.token);
                localStorage.setItem("token", user.token);
                setUserID(user.id);
                setIsAuthenticated(true);
                navigate('/validated');
            };
        } catch (err) {
            setIsAuthenticated(false);
            if (axios.isAxiosError(err)) {
                const msg: string = err.response?.data?.message ?? "Request failed";
                setInvalid(msg);
            } else if (err instanceof Error) {
                setInvalid(err.message);
            } else {
                setInvalid("An unexpected error has occurred, please try again");
            }
        };
    };
    return (
        <>
            {invalid && <Alert variant="danger" className="text-center" style={{position: 'absolute', top: 0, left: 0, right: 0}}>{invalid}</Alert>}
            <div className="d-flex align-items-center" style={{height: '100vh'}}>
                <Container>
                    <Row className="justify-content-center">
                        <Col md={8} lg={6}>
                            <Card className="auth-card">
                                <Card.Header as="h3" className="text-center">Login</Card.Header>
                                <Card.Body>
                                    <Form>
                                        <Form.Group className="mb-3" controlId="formEmail">
                                            <Form.Label>Email:</Form.Label>
                                            <Form.Control type="email" placeholder="e.g. xxx.cconnector.org" onChange={(e)=>setEmail(e.target.value)}></Form.Control>
                                        </Form.Group>
                                        <Form.Group className="mb-3" controlId="fromPassword">
                                            <Form.Label>Password:</Form.Label>
                                            <Form.Control type="password" placeholder="password" onChange={(e)=>setPassword(e.target.value)}></Form.Control>
                                        </Form.Group>
                                    </Form>
                                    <Button onClick={handleLogin}>Login</Button>
                                    <Card.Text className="text-center">Don't have an account? <Link to="/register" style={{color: "white"}}>Register here.</Link></Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    )
}
export default LoginPage;