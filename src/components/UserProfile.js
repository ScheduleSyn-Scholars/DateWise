import React, { useRef, useState, useEffect } from 'react';
import { firestore, storage } from '../resources/firebase';
import { useUser } from '../resources/UserContext';

function UserProfileModal({ isOpen, setIsOpen }) {
    const [image, setImage] = useState('');
    const hiddenFileInput = useRef(null);
    const [newProfileName, setNewProfileName] = useState('');
    const user = useUser();

    // Load initial profile information from the user
    useEffect(() => {
        if (user) {
            setNewProfileName(user.userName || '');
            setImage(user.imageURL || './default-profile.png'); // Assuming you have a default profile image
        }
    }, [user]);

    // Function to save the name information to the database
    const handleProfileNameChange = (event) => {
        setNewProfileName(event.target.value);
    };

    const handleSaveName = async () => {
        if (!user || !user.uid) return; // Check if user is defined
        try {
            await firestore.collection('users').doc(user.uid).update({ userName: newProfileName });
            console.log('Document successfully updated!');
            setIsOpen(false); // Close modal after save
        } catch (error) {
            console.error('Error updating Firestore document:', error);
        }
    };

    const handleImageClick = () => {
        hiddenFileInput.current.click();
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file && user && user.uid) {
            const imageRef = storage.ref(`userImages/${user.uid}/${file.name}`);
            try {
                const snapshot = await imageRef.put(file);
                const url = await snapshot.ref.getDownloadURL();
                await firestore.collection('users').doc(user.uid).update({
                    imageURL: url,
                });
                setImage(url); // Update local state
            } catch (error) {
                console.error('Error uploading image or updating Firestore:', error);
            }
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="border-none">
                <img
                    src={image || './default-profile.png'} // Use the updated state or a default image
                    alt="User profile"
                    className="h-20 w-20 rounded-full"
                />
            </button>
            {isOpen && (
                <div className="modal modal-open">
                    <div className="modal-box flex justify-center items-center relative">
                        <button className="btn btn-sm btn-circle absolute right-2 top-2" onClick={() => setIsOpen(false)}>✕</button>
                        <div className="text-center">
                            <div onClick={handleImageClick} style={{ cursor: 'pointer' }}>
                                <img
                                    id="preview-image"
                                    src={image}
                                    alt="User update"
                                    className="h-[200px] rounded-[100%] mb-4"
                                />
                                <input
                                    id="image-upload-input"
                                    type="file"
                                    ref={hiddenFileInput}
                                    onChange={handleImageChange}
                                    style={{ display: 'none' }}
                                />
                            </div>
                            <button className="btn bg-green-700 text-white" onClick={handleImageClick}>
                                Change Image
                            </button>
                            <div className="text-black mt-4">Email: {user.email}</div>
                            <div className="text-black mt-4">
                                Profile Name:
                                <input defaultValue={newProfileName} type="text" onChange={handleProfileNameChange} className="input input-bordered mt-2" />
                            </div>
                            <div className="mt-4">
                                <button
                                    className="btn bg-green-700 text-white"
                                    type="button"
                                    onClick={handleSaveName}
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default UserProfileModal;
