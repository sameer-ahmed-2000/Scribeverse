import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../authentication/AuthContext';

export function useSignup() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [name, setName] = useState('');
    const [email,setEmail] = useState('')
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSignup = async () => {
        if (!name || !email || !password) {
            setError('Please fill in all fields');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await axios.post('http://127.0.0.1:8787/api/v1/user/signup', {
                name,
                email,
                password,
            });
            localStorage.setItem('token', response.data.token);
            login(response.data.token);
            navigate('/main');
        } catch (err) {
            setError('Sign in failed. Please check your credentials and try again.');
        } finally {
            setLoading(false);
        }
    };

    return {
        name,
        setName,
        email,
        setEmail,
        password,
        setPassword,
        loading,
        error,
        handleSignup,
    };
}