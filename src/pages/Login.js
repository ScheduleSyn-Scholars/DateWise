import React, { useState } from 'react';
import './Login.css';
import './Registration.css'
import Form from './Registration'
import firebase from '../config/firebase';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Link } from 'react-router-dom';

const App = () => {
  return (
    <>
    <Form />
    </>
  )
}

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  var uid;
  // Get the navigate function
  const navigate = useNavigate();

  const handleSignIn = async () => {
    try {
      await firebase.auth().signInWithEmailAndPassword(email, password);
      setSuccessMessage('Sign-in successful!');
      uid = firebase.auth().currentUser.uid;

      // Use navigate to redirect to the homepage
      navigate('/homepage');
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-left">
        {/* Insert your image here */}
        <img src="/BearLogo.png" alt="Your Image" />
        <h2>Login</h2>
        <form>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="error-message">{error}</p>}
          {successMessage && <p className="success-message">{successMessage}</p>}
          <div className = 'buttonContainer'>
          <button type="button" onClick={handleSignIn}>Login</button>
          <Link to = "/sign-up">
            <button type='button' className='sign-up-btn'>sign-up</button>
          </Link>
          </div>
        </form>
      </div>
      <div className="login-right">
        {/* Background image will be displayed here */}
      </div>
    </div>
  );
};

export default Login;