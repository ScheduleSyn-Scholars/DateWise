import React, { useState } from 'react';
import { auth } from '../resources/firebase';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const navigate = useNavigate();

    const handleSignIn = async () => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            setSuccessMessage('Sign-in successful!');
            navigate('/homepage');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="flex-1 flex items-center justify-center">
                <div className="w-72 flex flex-col items-center">
                    <img
                        className="mb-6 h-72 w-72"
                        src="/BearLogo.png"
                        alt="Bear Logo"
                    />
                    <form className="w-full flex flex-col items-center">
                        <label className="mb-2" htmlFor="email">
                            Email:
                        </label>
                        <input
                            className="w-full rounded-2xl border-none bg-gray-300 p-2 outline-none"
                            type="email"
                            id="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <label className="mb-2" htmlFor="password">
                            Password:
                        </label>
                        <input
                            className="w-full rounded-2xl border-none bg-gray-300 p-2 outline-none"
                            type="password"
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {error && <p className="error-message">{error}</p>}
                        {successMessage && (
                            <p className="success-message">{successMessage}</p>
                        )}
                        <div className="mt-5 flex w-full justify-evenly">
                            <button
                                className="btn bg-green-800 text-white"
                                type="button"
                                onClick={handleSignIn}>
                                Login
                            </button>
                        </div>
                        <p className='mt-5'>Don't have an account?</p>
                        <Link to="/sign-up">
                                <p className='text-blue-800'>Register</p>
                            </Link>
                    </form>
                </div>
            </div>
            <div className="flex-1 bg-left-center bg-cover hidden md:block" style={{ backgroundImage: `url('/GGCLibrary.jpg')` }}></div>
        </div>
    );
};

export default Login;

