import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Alert from "react-bootstrap/Alert"
import { type UserRegister, registerUser, isValidEmail } from "./service";
import axios from "axios";
import { Link } from "react-router-dom";

const RegisterPage: React.FC = () => {
    const [invalid, setInvalid] = useState<string>("");
    const [success, setSuccess] = useState<boolean>(false);
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPass, setConfirmPass] = useState<string>("");
    const [email, setEmail] = useState<string>("");

    const handleRegister = async(): Promise<void> => {
        try {
            setInvalid("");
            setSuccess(false);
            if (userName.trim().length < 4) {
                setInvalid("Please input a username with at least 4 characters");
            } else if (password.replaceAll(" ", "").length !== password.length) {
                setInvalid("Please ensure there is no blank spaces in your password");
            } else if (!isValidEmail(email.trim())) {
                setInvalid("Please input a valid email address");
            } else if (password.trim().length < 8) {
                setInvalid("Please input a valid password with at least 8 characters");
            } else if (password !== confirmPass) {
                setInvalid("Your confirm password does not match your password");
            }  else {
                const userProfile: UserRegister = {username: userName, email, password};
                await registerUser(userProfile);
                setSuccess(true);
                setUserName("");
                setPassword("");
                setConfirmPass("");
                setEmail("");
            };
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const msg = err.response?.data?.message ?? "Request failed";
                setInvalid(msg);
            } else if (err instanceof Error) {
                setInvalid(err.message);
            } else {
                setInvalid("An unexpected error has occurred, please try again");
            }
        }
       
    };
    const handleDismissClick = (): void => {
        setInvalid("");
        setSuccess(false);
    }
    return (
    <>
        {success && <Alert variant="success" className="text-center" onClick={handleDismissClick} style={{ position: 'absolute', top: 0, left: 0, right: 0 }} dismissible>Your account has been succesfully registered</Alert>}
        {invalid && <Alert variant="danger" className="text-center" onClick={handleDismissClick} style={{ position: 'absolute', top: 0, left: 0, right: 0 }} dismissible>{ invalid }</Alert>}
        <div className="d-flex align-items-center" style={{ height: '100vh' }}>
            <Container> 
                <Row className="justify-content-center">
                    <Col md={8} lg={6}>
                        <Card className="auth-card">
                            <Card.Header as="h3" className="text-center">Register</Card.Header> 
                            <Card.Body>
                                <Form>
                                    <Form.Group className="mb-3" controlId="formUser">
                                        <Form.Label>Username:</Form.Label>
                                        <Form.Control type="text" placeholder="e.g. JaneDoe123" value={userName} isValid={userName.length > 3} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setUserName(e.target.value)}></Form.Control>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formEmail">
                                        <Form.Label>Email Address:</Form.Label>
                                        <Form.Control type="email" placeholder="e.g. xxx@cconnector.org" value={email} isValid={isValidEmail(email)} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setEmail(e.target.value)}></Form.Control>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formPassword">
                                        <Form.Label>Password:</Form.Label>
                                        <Form.Control type="password" placeholder="password" value={password} isValid={password.trim().length > 7} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setPassword(e.target.value)}></Form.Control>
                                    </Form.Group>
                                    <Form.Group className="mb-3" controlId="formConfirmPassword">
                                        <Form.Label>Confirm password:</Form.Label>
                                        <Form.Control type="password" placeholder="Confirm Your Password" value={confirmPass} isValid={password === confirmPass && password.trim().length > 7} onChange={(e: React.ChangeEvent<HTMLInputElement>)=>setConfirmPass(e.target.value)}></Form.Control>
                                    </Form.Group>
                                    <Button className="btnFormSend justify-content-center" onClick={handleRegister}>Register</Button>
                                </Form>
                                <Card.Text className="text-center" >Already have an account? <Link to="/login" style={{color: "white"}}>Login here.</Link></Card.Text>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container> 
        </div>
    </>
    
       
    )
}
export default RegisterPage;


