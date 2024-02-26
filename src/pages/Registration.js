import React, { useState } from 'react';
import { auth, firestore } from '../resources/firebase';
import 'firebase/compat/firestore';
import { useNavigate } from 'react-router-dom';

const Form = () => {
    const navigate = useNavigate();

    // Method to handle the Input Change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    
    // Method to handle the submission of a form
    const handleSubmit = (event) => {
        event.preventDefault(); // Prevent the form from actually submitting (which would refresh the page)

        navigate('/');
        // You can access all the form data as an object in 'formData' state variable
        console.log(formData);
    };

    // To store form Data with user's details
    const [formData, setFormData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        userName: '',
    });

    const signUp = async () => {
        try {
            // Use part before @ in email address as default userName
            formData.userName = formData.email.split('@')[0];

            // Add new user through authenticator to get a uid
            const userCredential = await auth
                .createUserWithEmailAndPassword(
                    formData.email,
                    formData.password,
                );
            const userUid = userCredential.user.uid;

            // Use uid as document id in firestore database
            const docRef = firestore
                .collection('users')
                .doc(userUid);

            // Add a new document to Firestore
            await docRef.set(formData);

            // Check if userUid exists to confirm successful registration
            if (userUid) {
                alert('Register Successfully');
            } else {
                alert('Error Occurred');
            }

            console.log('Document written with ID: ', userUid); // Using userUid since it's the doc ID
        } catch (error) {
            console.error('Error adding document or creating user: ', error);
            alert('Registration Failed: ' + error.message);
        }
    };

    return (
        // Form to get the data
        <>
            <div className="form rounded-md bg-[#f4f4f4] px-[30px] py-5">
                <div className="max-w-full">
                    <form className="flex flex-col" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="id">Id:</label>
                            <input
                                type="text"
                                id="id"
                                name="id"
                                value={formData.id}
                                onChange={handleInputChange}
                                className="mx-5 my-2.5 w-[300px] border-b border-solid border-[none] border-b-black p-2.5 text-[#0d0d0d]"
                            />
                        </div>

                        <div>
                            <label htmlFor="firstName">First Name:</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="mx-5 my-2.5 w-[300px] border-b border-solid border-[none] border-b-black p-2.5 text-[#0d0d0d]"
                            />
                        </div>

                        <div>
                            <label htmlFor="lastName">Last Name:</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="mx-5 my-2.5 w-[300px] border-b border-solid border-[none] border-b-black p-2.5 text-[#0d0d0d]"
                            />
                        </div>

                        <div>
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="mx-5 my-2.5 w-[300px] border-b border-solid border-[none] border-b-black p-2.5 text-[#0d0d0d]"
                            />
                        </div>

                        <div>
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="mx-5 my-2.5 w-[300px] border-b border-solid border-[none] border-b-black p-2.5 text-[#0d0d0d]"
                            />
                        </div>
                        <div>
                            <button
                                className="ml-[30px] w-[100px] cursor-pointer bg-[#0cc0df] px-0 py-2.5"
                                onClick={signUp}>
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Form;
