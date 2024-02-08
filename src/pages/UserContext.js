import React, { createContext, useContext, useState, useEffect } from 'react';
import firebase from '../config/firebase'; // Import your firebase.js file
import { PacmanLoader } from 'react-spinners';

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state

    useEffect(() => {
        const unsubscribe = firebase
            .auth()
            .onAuthStateChanged(async (authUser) => {
                try {
                    if (authUser) {
                        const userDocRef = firebase
                            .firestore()
                            .collection('users')
                            .doc(authUser.uid);
                        const userDocSnapshot = await userDocRef.get();

                        if (userDocSnapshot.exists) {
                            const userData = userDocSnapshot.data();
                            setUser({
                                uid: authUser.uid,
                                email: userData.emailAddress,
                                firstName: userData.firstName,
                                lastName: userData.lastName,
                                userName: userData.userName,
                                imageURL: userData.imageURL,
                                id: userData.id,
                            });
                        } else {
                            console.error('User not Found');
                            setUser(null);
                        }
                    } else {
                        setUser(null);
                    }
                    setLoading(false); // Set loading state to false once user status is determined
                } catch (error) {
                    console.error('Error fetching user data:', error);
                    setUser(null);
                    setLoading(false);
                }
            });

        return () => unsubscribe();
    }, []);
    if (loading) {
        // Handle loading state if user data is being fetched
        return (
            <div className="loading-spinner">
                <PacmanLoader color="#36D7B7" size={50} />
            </div>
        );
    }

    return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useUser() {
    const user = useContext(UserContext);
    if (user === null) {
        // Handle the case where the user is not authenticated or data is not yet available
        throw new Error('User not authenticated or data not available');
    }
    return user;
}
