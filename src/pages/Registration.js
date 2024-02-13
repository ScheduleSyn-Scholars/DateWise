import React, { useState } from 'react';
import firebase from '../config/firebase';
import 'firebase/compat/firestore';
import { useNavigate } from 'react-router-dom';

const Form = () => {
    // Create instance of firestore database
    const db = firebase.firestore();

    // Method to handle the Input Change
    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };
    const navigate = useNavigate();
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
        formData.userName = formData.email.split('@')[0]; // Use part before @ in email address as default userName
        console.log('Username: ', formData.userName);

        // Add new user through authenticator to get a uid
        firebase
            .auth()
            .createUserWithEmailAndPassword(formData.email, formData.password)
            .then((userCredential) => {
                // Signed in
                const userUid = userCredential.user.uid;
                console.log('Printing from signup:', userUid);

                console.log('starting to add doc ', userUid);

                // Use uid as document id in firestore database
                const docRef = db.collection('users').doc(userUid);

                // Add a new document to Firestore
                docRef
                    .set(formData)
                    .then(() => {
                        if (userUid) {
                            // alert when registration is successful
                            alert('Register Successfully');
                        } else {
                            alert('Error Occurred');
                        }
                        console.log('Document written with ID: ', docRef.id);
                    })
                    .catch((error) => {
                        console.error('Error adding document: ', error);
                    });
            })
            .catch((error) => {
                var errorCode = error.code;
                var errorMessage = error.message;
                console.error('Error: ', errorCode, errorMessage);
            });
    };

    return (
        // Form to get the data
        <>
            <div className="form py-5 px-[30px] bg-[#f4f4f4] rounded-md">
                <div className="max-w-full">
                    <form className='flex flex-col' onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="id">Id:</label>
                            <input
                                type="text"
                                id="id"
                                name="id"
                                value={formData.id}
                                onChange={handleInputChange}
                                className='w-[300px] text-[#0d0d0d] mx-5 my-2.5 p-2.5 border-b-black border-[none] border-b border-solid'
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
                                className='w-[300px] text-[#0d0d0d] mx-5 my-2.5 p-2.5 border-b-black border-[none] border-b border-solid'

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
                                className='w-[300px] text-[#0d0d0d] mx-5 my-2.5 p-2.5 border-b-black border-[none] border-b border-solid'
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
                                className='w-[300px] text-[#0d0d0d] mx-5 my-2.5 p-2.5 border-b-black border-[none] border-b border-solid'
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
                                className='w-[300px] text-[#0d0d0d] mx-5 my-2.5 p-2.5 border-b-black border-[none] border-b border-solid'
                            />
                        </div>
                        <div>
                            <button className='bg-[#0cc0df] w-[100px] cursor-pointer ml-[30px] px-0 py-2.5' onClick={signUp}>Sign Up</button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default Form;
