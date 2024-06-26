import React, { useState } from 'react';
import { auth, firestore } from '../resources/firebase';
import 'firebase/compat/firestore';
import { useNavigate } from 'react-router-dom';
import { sendMessageNotification } from '../resources/NotificationService';

const Form = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        id: '',
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        userName: '',
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            formData.userName = formData.email.split('@')[0];
            const userCredential = await auth.createUserWithEmailAndPassword(
                formData.email,
                formData.password,
            );
            const userUid = userCredential.user.uid;

            const docRef = firestore.collection('users').doc(userUid);

            await docRef.set(formData);

            sendMessageNotification(
                formData.email,
                'These are your notifications! Accept or decline them below.',
            );

            if (userUid) {
                alert('Registered Successfully');
                navigate('/'); // Redirect to home page after successful registration
            } else {
                alert('Error Occurred');
            }
        } catch (error) {
            console.error('Error adding document or creating user: ', error);
            alert('Registration Failed: ' + error.message);
        }
    };

    return (
        <div className="flex h-screen">
            <div className="flex flex-1 items-center justify-center">
                <div className="form rounded-md bg-gray-200 p-8">
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 flex flex-col">
                            <label htmlFor="firstName">First Name:</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="input"
                            />
                        </div>
                        <div className="mb-4 flex flex-col">
                            <label htmlFor="lastName">Last Name:</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="input"
                            />
                        </div>
                        <div className="mb-4 flex flex-col">
                            <label htmlFor="email">Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                className="input"
                            />
                        </div>
                        <div className="mb-4 flex flex-col">
                            <label htmlFor="password">Password:</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="input"
                            />
                        </div>
                        <div className="flex justify-center">
                            <button
                                type="submit"
                                className="btn bg-green-800 text-white">
                                Sign Up
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            <div
                className="bg-left-center hidden flex-1 bg-cover md:block"
                style={{ backgroundImage: `url('/GGCLibrary.jpg')` }}></div>
        </div>
    );
};

export default Form;
