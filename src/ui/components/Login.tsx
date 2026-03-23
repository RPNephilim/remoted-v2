// import { useContext, useState } from 'react';
import './css/Login.css';
// import properties from '../data/properties.json';
import { useNavigate } from 'react-router-dom';
// import { UserContext } from '../contexts/UserContext';
import { Button, TextField } from '@mui/material';

function Login(props: any) {
    // const [username, setUsername] = useState('');
    // const [password, setPassword] = useState('');
    const navigate = useNavigate();
    // const { updateUser } = useContext(UserContext)!;

    const loginUser = async () => {
        try {
            // const payload = {
            //     username: username,
            //     password: password
            // }
            // const loginUrl = properties.serverBaseUrl + properties.loginPath
            // const response = await fetch(loginUrl, {
            //     method: "POST",
            //     headers: {
            //         "Content-Type": "application/json"
            //     },
            //     body: JSON.stringify(payload)
            // });

            // const devices = await response.json();
            // console.log(devices)
            // console.info("Successfully logged In");
            // const user = {
            //     username: username,
            //     devices: devices
            // }
            // updateUser(user);
            navigate('/device-select');
        } catch (error) {
            console.error("Error while login user", error);
        }
    }
    return (
        <div className="login-div">
            {/* <TextField id="username" label="Username" variant="standard" onChange={(e) => setUsername(e.target.value)}
                sx={{
                    width: '10%',
                    '& .MuiInputLabel-root': { color: '#ffffff' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                    '& .MuiInput-underline:before': { borderBottomColor: '#ffffff' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#ffffff' },
                }} /><br /> */}
            <TextField
                id="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                variant="standard"
                // onChange={(e) => setPassword(e.target.value)}
                sx={{
                    width: '10%',
                    '& .MuiInputLabel-root': { color: '#ffffff' },
                    '& .MuiInputLabel-root.Mui-focused': { color: '#ffffff' },
                    '& .MuiInputBase-input': { color: '#ffffff' },
                    '& .MuiInput-underline:before': { borderBottomColor: '#ffffff' },
                    '& .MuiInput-underline:after': { borderBottomColor: '#ffffff' },
                }}
            /> <br />
            <Button variant="contained" onClick={loginUser} sx={{
                width: '5%'
            }}>Login</Button> <br />
            <Button variant="contained" onClick={() => props.setIsLogin(false)} sx={{
                width: '5%'
            }}>Sign Up</Button>
        </div>
    )
}

export default Login;