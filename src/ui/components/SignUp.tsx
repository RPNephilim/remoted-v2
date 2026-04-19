import { useState } from "react";
import properties from '../data/properties.json';
import './css/SignUp.css';
import { Button, TextField } from "@mui/material";

function SignUp(props: any) {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');


    const createAccount = async () => {
        console.log("Creating Account!!!")
        try {
            const payload = {
                email: email,
                username: username,
                password: password
            }
            const createAccountUrl = properties.serverBaseUrl + properties.newAccountPath
            await fetch(createAccountUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            console.info("Successfully Created Account");
        } catch (error) {
            console.error("Error while creating account", error);
        }
        props.setIsLogin(true);
    }

    return (
        <div className='signup-div'>
            <TextField className="signup-input" id="email" label="Email Id" variant="standard" onChange={(e) => setEmail(e.target.value)}/><br />
            <TextField className="signup-input" id="username" label="Username" variant="standard" onChange={(e) => setUsername(e.target.value)}/><br />
            <TextField
                className="signup-input"
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                variant="standard"
                onChange={(e) => setPassword(e.target.value)}/> <br />
            <Button variant="contained" onClick={createAccount} sx={{
                width: '20%'
            }}>SIGN UP</Button>
            <p className="signup-link" onClick={() => props.setIsLogin(true)}>Already have an account?</p>
        </div>
    );
}

export default SignUp;