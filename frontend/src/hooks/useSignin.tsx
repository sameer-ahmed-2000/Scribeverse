import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';

export function useSignin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [emailError, setEmailerror] = useState('');
    const [passwordError, setPassworderror] = useState('');

    const handleSignin = async () => {
        if (!email || !password) {
            setError('Please fill in all fields');
            if (!email) {
                setEmailerror('Please enter a valid email');
            }
            if (!password) {
                setPassworderror('Please enter a valid password');
            }
            return null;
        }
        
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:8787/api/v1/user/signin', {
                email,
                password,
            });
            localStorage.setItem('token', response.data.jwt);
            login(response.data.jwt);
            navigate('/main');
        } catch (err) {
            setError('Sign in failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return {
        email,
        setEmail,
        password,
        setPassword,
        loading,
        error,
        setError,
        emailError,
        setEmailerror,
        passwordError,
        setPassworderror,
        handleSignin,
    };
}
