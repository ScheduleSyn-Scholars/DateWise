import React, { useState } from 'react';
import './Login.css';
import './Registration.css';
import firebase from '../config/firebase';
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
            await firebase.auth().signInWithEmailAndPassword(email, password);
            setSuccessMessage('Sign-in successful!');

            // Use navigate to redirect to the homepage
            navigate('/homepage');
        } catch (error) {
            setError(error.message);
        }
    };

    return (
        <div className="flex bg-transparent h-full">
            <div className="login-left flex flex-1 flex-col justify-center items-center p-1 mt-0">
                <img
                    className="w-72 h-72 mb-6"
                    src="/BearLogo.png"
                    alt="Bear Logo"
                />
                <h2 className="text-teal-700">Login</h2>
                <form className="flex flex-col justify-center items-center w-full max-w-72">
                    <label className="mb-2" htmlFor="email">
                        Email:
                    </label>
                    <input
                        className="w-full p-2 outline-none border-none rounded-2xl bg-gray-300"
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
                        className="w-full p-2 outline-none border-none rounded-2xl bg-gray-300"
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
                    <div className="flex justify-between w-full max-w-56 mt-5">
                        <button
                            className="w-24 bg-green-700 text-white p-2.5 border-none cursor-pointer rounded-2xl relative mt-5 left-1"
                            type="button"
                            onClick={handleSignIn}>
                            Login
                        </button>
                        <Link to="/sign-up">
                            <button
                                className="w-24 bg-green-700 text-white p-2.5 border-none cursor-pointer rounded-2xl relative mt-5 left-1"
                                type="button">
                                Sign-Up
                            </button>
                        </Link>
                    </div>
                </form>
            </div>
            <div
                className="login-right flex-1 relative bg-cover bg-[left_center] bg-no-repeat 
                bg-gradient-to-br from-transparent to-white">
                {/* Background image will be displayed here */}
            </div>
        </div>
    );
};

export default Login;
