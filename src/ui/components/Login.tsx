import { useContext, useState } from 'react';
import './css/Login.css';
import properties from '../data/properties.json';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../contexts/UserContext';
import { Button, TextField } from '@mui/material';

function Login(props: any) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const { updateUser } = useContext(UserContext)!;

    const loginUser = async () => {
        try {
            const payload = {
                username: username,
                password: password
            }
            const loginUrl = properties.serverBaseUrl + properties.loginPath

            console.log("Logging in user with payload: and url: ", payload, loginUrl);
            const response = await fetch(loginUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            console.log("Login response: ", response);
            if (response.status == 404) {
                console.error("Login failed with status: ", response.status);
                throw new Error("User not found");
            }else if (!response.ok) {
                console.error("Login failed with status: ", response.status);
                throw new Error("Error logging in user");
            }
            const devices = await response.json();
            console.info("Successfully logged In, user devices: ", devices);
            const user = {
                username: username,
                devices: devices
            }
            updateUser(user);
            navigate('/device-select');
        } catch (error) {
            console.error("Error while login user", error);
            alert("Login Failed! Please check your credentials and try again.");
        }
    }
    return (
        <div className="login-div">
            <TextField className="login-input" id="username" label="Username" variant="standard" onChange={(e) => setUsername(e.target.value)}
                 /><br />
            <TextField
                className="login-input"
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                variant="standard"
                onChange={(e) => setPassword(e.target.value)}/> <br />
            <Button variant="contained" onClick={loginUser} sx={{
                width: '20%'
            }}>Login</Button>
            <p className="signup-link" onClick={()=> props.setIsLogin(false)}>Don't have an account?</p>
            
        </div>
    )
}

export default Login;