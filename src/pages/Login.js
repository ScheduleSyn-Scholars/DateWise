import React, { useState } from 'react';
import { auth } from '../resources/firebase';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    // Get the navigate function
    const navigate = useNavigate();

    const handleSignIn = async () => {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            setSuccessMessage('Sign-in successful!');

            // Use navigate to redirect to the homepage
            navigate('/homepage');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex h-full w-full bg-white">
            <div className="flex w-full flex-col items-center justify-center">
                <img
                    className="mb-6 h-72 w-72"
                    src="/BearLogo.png"
                    alt="Bear Logo"
                />
                <h2 className="text-teal-700">Login</h2>
                <form className="flex w-full max-w-72 flex-col items-center justify-center">
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
                    <div className="mt-5 flex w-full max-w-56 justify-between">
                        <button
                            className="relative left-1 mt-5 w-24 cursor-pointer rounded-2xl border-none bg-green-700 p-2.5 text-white"
                            type="button"
                            onClick={handleSignIn}>
                            Login
                        </button>
                        <Link to="/sign-up">
                            <button
                                className="relative left-1 mt-5 w-24 cursor-pointer rounded-2xl border-none bg-green-700 p-2.5 text-white"
                                type="button">
                                Sign-Up
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
            <div
                className="bg-left-center w-full bg-cover"
                style={{ backgroundImage: `url('/GGCLibrary.jpg')` }}></div>
        </div>
    );
};

export default Login;
