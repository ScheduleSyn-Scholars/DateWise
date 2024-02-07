import React, { useState } from 'react'
import './SignUp.css' // Import the CSS file for styling
import firebase from '../firebase.js'

// To allow a user to sign up or add a user to the firebase collection of users.

const Signup = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

    const signUp = async () => {
        firebase
            .auth()
            .createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in
                var user = userCredential.user
                // alert("Successful Sign Up");
                // ...
            })
            .catch((error) => {
                var errorCode = error.code
                var errorMessage = error.message
                // ..
            })
    }

    return (
        <div className="signup-container">
            <div className="signup-left">
                <h2>Sign Up</h2>
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

                    <button onClick={signUp}>Sign Up</button>
                </form>
            </div>
            <div className="signup-right">
                {/* Background image will be displayed here */}
            </div>
        </div>
    )
}

export default Signup
