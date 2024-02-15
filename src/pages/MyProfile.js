import React from 'react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import firebase from '../config/firebase'; // Import your firebase.js file
import 'firebase/compat/firestore';
import 'firebase/compat/storage';
import { useUser } from './UserContext';

function MyProfile() {
    const [image, setImage] = useState('');
    const hiddenFileInput = useRef(null);
    const [newProfileName, setNewProfileName] = useState('');
    const user = useUser();
    const firestore = firebase.firestore();
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
                    },
                    'image/jpeg',
                    0.8,
                );
            };
        };
    };

    // Create a root reference
    const storageRef = firebase.storage().ref();
    const db = firebase.firestore();

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

    return (
        <div className="justify-betweenshadow-[3px_4px_4px_rgba(0,0,0,0.25)] w-[1600px]">
            <div className="center-panel">
                <div className="mr-[20vh] flex items-center justify-center p-[2.6rem]">
                    <div className="ml-[15%] flex w-[500px] flex-col items-center justify-center p-[5px]">
                        <label
                            htmlFor="image-upload-input"
                            className="mb-4 cursor-pointer font-[bold] text-2xl">
                            {image ? image.name : ''}
                        </label>
                        <div
                            onClick={handleImageClick}
                            style={{ cursor: 'pointer' }}>
                            {image ? (
                                <img
                                    src={user.image}
                                    alt="user update"
                                    className="h-[200px] w-[200px] rounded-[100%]"
                                />
                            ) : (
                                <img
                                    src={user.image}
                                    alt="default"
                                    className="ml-[35px] h-[200px] w-[200px] rounded-[100%]"
                                />
                            )}
                            <input
                                id="image-upload-input"
                                type="file"
                                ref={hiddenFileInput}
                                onChange={handleImageChange}
                                style={{ display: 'none' }}
                            />
                        </div>

                        <button
                            className="mt-[2vh] h-[35px] w-[150px] flex-row rounded-[15px] border-[none] bg-[#0e724c] text-center font-times-new-roman text-xl font-medium text-[white] hover:bg-[#3e8e41]"
                            onClick={uploadImage}>
                            Upload
                        </button>

                        <div className="mt-[5px] rounded-[15px] p-[5px] text-center text-[35px] text-xl font-medium text-[#7b7b7b]">
                            Email: {user.email}
                        </div>

                        <div className="mb-2.5 mt-[4vh] items-center border-[none] font-times-new-roman text-3xl text-[35px] font-medium text-[gray] no-underline">
                            Profile Name:
                            <input
                                defaultValue={user.userName}
                                type="text"
                                onChange={handleProfileNameChange}
                            />
                        </div>
                        <div>
                            <button
                                className="ml-[18vh] mt-[10vh] h-[35px] w-[150px] cursor-pointer flex-row rounded-[15px] border-[none] bg-[#0e724c] p-0 text-center font-times-new-roman text-xl font-medium text-[white] hover:bg-[#4caf50]"
                                type="button"
                                onClick={handleSaveName}>
                                Save
                            </button>
                            <Link to="/HomePage">
                                {' '}
                                <button className="ml-[18vh] mt-[5vh] h-[35px] w-[150px] cursor-pointer flex-row rounded-[15px] border-[none] bg-[#0e724c] p-0 text-center font-times-new-roman text-xl font-medium text-[white] hover:bg-[#4caf50]">
                                    Homepage
                                </button>{' '}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MyProfile;
