import { useState } from 'react';
import './css/AuthenticationPage.css';
import Login from '../components/Login';
import SignUp from '../components/SignUp';


function AuthenticationPage() {
    const [isLogin, setIsLogin] = useState(true)
    return (
        <div className="authentication-page-div">
            {isLogin ? <Login isLogin={isLogin} setIsLogin={setIsLogin} /> : <SignUp isLogin={isLogin} setIsLogin={setIsLogin} />}
        </div>
    );
}

export default AuthenticationPage;