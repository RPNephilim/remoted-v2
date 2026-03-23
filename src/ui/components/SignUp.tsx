import { useState } from "react";
import properties from '../data/properties.json';
import './css/SignUp.css';
import { Button, TextField } from "@mui/material";

function SignUp(props: any) {

    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('')

    const validate = (event: string) => {
        switch (event) {
            case 'login':
                return true;
            case 'new-account':
                if (confirmPassword !== password) {
                    console.error("Password do not match!!!");
                    return false;
                }
                return true;
            default:
                return false;
        }
    }

    const createAccount = async () => {
        console.log("Creating Account!!!")
        try {
            const isValidInput = validate('new-account');
            if (!isValidInput) {
                console.error("Invalid Input!!!");
                return;
            }
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
            <TextField id="username" label="Username" variant="standard" onChange={(e) => setUsername(e.target.value)}
                sx={{
                    width: '10%',
                    '& .MuiInputLabel-root': { color: '#ffffff' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                    '& .MuiInput-underline:before': { borderBottomColor: '#ffffff' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#ffffff' },
                }} /><br />
            <TextField id="email" label="Email Id" variant="standard" onChange={(e) => setEmail(e.target.value)}
                sx={{
                    width: '10%',
                    '& .MuiInputLabel-root': { color: '#ffffff' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                    '& .MuiInput-underline:before': { borderBottomColor: '#ffffff' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#ffffff' },
                }} /><br />
            <TextField
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                variant="standard"
                onChange={(e) => setPassword(e.target.value)}
                sx={{
                    width: '10%',
                    '& .MuiInputLabel-root': { color: '#ffffff' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                    '& .MuiInput-underline:before': { borderBottomColor: '#ffffff' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#ffffff' },
                }}
            /> <br />
            <TextField
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                autoComplete="current-password"
                variant="standard"
                onChange={(e) => setConfirmPassword(e.target.value)}
                sx={{
                    width: '10%',
                    '& .MuiInputLabel-root': { color: '#ffffff' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                    '& .MuiInput-underline:before': { borderBottomColor: '#ffffff' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#ffffff' },
                }}
            /> <br />
            <Button variant="contained" onClick={createAccount} sx={{
                width: '8%'
            }}>Create Account</Button>
            <Button variant="contained" onClick={() => props.setIsLogin(true)} sx={{
                width: '5%',
                backgroundColor: '#9c0000', // Red background
                color: '#ffffff',           // White text
                '&:hover': {
                    backgroundColor: '#bb0000', // Darker red on hover
                }
            }}>Back</Button>
        </div>
    );
}

export default SignUp;