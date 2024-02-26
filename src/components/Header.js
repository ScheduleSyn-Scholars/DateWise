import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { auth, firestore } from '../resources/firebase';

const Header = () => {
    const [profilePictureUrl, setProfilePictureUrl] = useState(null);

    useEffect(() => {
        const fetchProfilePicture = async () => {
            try {
                const user = auth.currentUser;
                if (user) {
                    const userUid = user.uid;
                    const userDocRef = firestore.collection('users').doc(userUid);
                    const userDoc = await userDocRef.get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        if (userData && userData.imageURL) {
                            setProfilePictureUrl(userData.imageURL);
                        }
                    }
                }
            } catch (error) {
                console.error('Error fetching profile picture:', error);
            }
        };

        fetchProfilePicture();
    }, []);

    return (
        <header className="flex w-full items-center bg-green-800 px-2 py-2 text-white">
            <img src="BearLogo.png" alt="Logo.png" className="h-28 w-auto" />

            <p className="font m1-auto text-5xl">DateWise</p>

            <div className="flex-grow"></div>

            <Link to="/MyProfile">
                <div className="pr-4">
                    {profilePictureUrl ? (
                        <img
                            alt="User profile"
                            src={profilePictureUrl}
                            className="mt-2 h-24 w-24 rounded-full bg-gray-300"
                        />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-300"></div>
                    )}
                </div>
            </Link>
        </header>
    );
};

export default Header;
