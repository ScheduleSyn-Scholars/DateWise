import React, { useRef, useState, useEffect } from 'react';
import {firestore, storage, auth} from '../resources/firebase';
import { useUser } from '../resources/UserContext';

function UserProfileModal() {
    const [image, setImage] = useState('');
    const hiddenFileInput = useRef(null);
    const [newProfileName, setNewProfileName] = useState('');
    const user = useUser();
    const uuid = user.uid;

    if (user.imageURL == null) {
        console.log('Printing from image addition My Profile');
        user.image = './Screenshot 2023-09-15 at 1.46 1.png';
    } else {
        user.image = user.imageURL;
        //console.log("Printing from successful image addition My Profile: ", user.imageURL)
    }
    console.log('user : ', user.uid);

    // function to save the name information to the database
    const handleProfileNameChange = (event) => {
        setNewProfileName(event.target.value);
    };
    const handleSaveName = async () => {
        try {
            firestore
                .collection('users')
                .doc(uuid)
                .update({ userName: newProfileName });
            console.log(user.userName);
            console.log('Document successfully updated!');
        } catch (error) {
            console.error('Error updating Firestore document:', error);
        }
    };
    const handleImageClick = () => {
        hiddenFileInput.current.click();
    };
    const handleImageChange = (event) => {
        const file = event.target.files[0];
        const imgname = event.target.files[0].name;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            const img = new Image();
            img.src = reader.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const maxSize = Math.max(img.width, img.height);
                canvas.width = maxSize;
                canvas.height = maxSize;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(
                    img,
                    (maxSize - img.width) / 2,
                    (maxSize - img.height) / 2,
                );
                canvas.toBlob(
                    (blob) => {
                        const file = new File([blob], imgname, {
                            type: 'image/png',
                            lastModified: Date.now(),
                        });
                        console.log(file);
                        setImage(file);
                        // Update the preview of the image in the modal
                        document.getElementById('preview-image').src = URL.createObjectURL(file);
                    },
                    'image/jpeg',
                    0.8,
                );
            };
        };
    };

    // Create a root reference
    const storageRef = storage.ref();
    const db = firestore;

    const uploadImage = () => {
        const imageInput = document.getElementById('image-upload-input');
        const file = imageInput.files[0];

        if (file && user) {
            const imageRef = storageRef.child(
                `userImages/${user.uid}/${file.name}`,
            );

            imageRef
                .put(file)
                .then((snapshot) => {
                    // Image uploaded, get the download URL
                    imageRef
                        .getDownloadURL()
                        .then((url) => {
                            // Update the Firestore document for the user
                            const userDocRef = db
                                .collection('users')
                                .doc(user.uid);
                            userDocRef
                                .update({
                                    imageURL: url,
                                })
                                .then(() => {
                                    console.log(
                                        'Image URL added to user document.',
                                    );
                                    setImage(url); // Update the image in your app state
                                })
                                .catch((error) => {
                                    console.error(
                                        'Error updating Firestore document:',
                                        error,
                                    );
                                });
                        })
                        .catch((error) => {
                            console.error('Error getting download URL:', error);
                        });
                })
                .catch((error) => {
                    console.error('Error uploading image:', error);
                });
        }
    };

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
    }, [user.imageURL]);

    return (
        <>
            <button>
                <div className="pr-4" onClick={() => document.getElementById('userProfile').showModal()}>
                    {profilePictureUrl ? (
                        <img
                            alt="User profile"
                            src={profilePictureUrl}
                            className="mt-2 h-24 w-24 rounded-full bg-gray-300" />
                    ) : (
                        <div className="h-24 w-24 rounded-full bg-gray-300"></div>
                    )}
                </div>
            </button>
            <dialog id="userProfile" className="modal">
                <div className="modal-box flex justify-center items-center">
                    <form method="dialog">
                        <button className="btn btn-sm btn-circle absolute right-2 top-2">✕</button>
                    </form>
                    <div className="text-center">
                        <label htmlFor="image-upload-input">{image ? image.name : ''}</label>
                        <div onClick={handleImageClick} style={{ cursor: 'pointer' }}>
                            <img
                                id="preview-image"
                                src={profilePictureUrl || user.image}
                                alt="User update"
                                className="h-[200px] rounded-[100%]"
                            />
                            <input
                                id="image-upload-input"
                                type="file"
                                ref={hiddenFileInput}
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>
    
                        <button className="btn bg-green-700 text-white" onClick={uploadImage}>
                            Upload
                        </button>
    
                        <div className="text-black">Email: {user.email}</div>
    
                        <div className="text-black">
                            Profile Name:
                            <input defaultValue={user.userName} type="text" onChange={handleProfileNameChange} />
                        </div>
                        <div>
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
            </dialog>
        </>
    );
}
    

export default UserProfileModal;