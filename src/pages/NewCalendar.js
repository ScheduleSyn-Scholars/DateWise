import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import firebase from '../config/firebase';
import 'firebase/compat/firestore';
import { useUser } from './UserContext';
import { useNavigate } from 'react-router-dom';
const NewCalendar = () => {
    const [inputValue, setInputValue] = useState('');
    const [invitees, setInvitees] = useState([]);

    const [amountOfEnteredUsers, setAmountOfEnteredUsers] = useState(new Set());
    const [limitMessage, setLimitMessage] = useState(false);

    const [addMessage, setAddMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [isShaking, setIsShaking] = useState(false);
    const shakingInputClass = 'font-times-new-roman text-3xl border-0 text-gray-500 bg-transparent outline-none';

    // ***********************************************************************************************************************

    const user = useUser();

    if (user.imageURL == null) {
        user.image = './Screenshot 2023-09-15 at 1.46 1.png';
        console.log('Printing from image addition');
    } else {
        user.image = user.imageURL;
        console.log('Amount of entered users: ', amountOfEnteredUsers);
        console.log('Printing from successful image addition: ');
    }

    const firestore = firebase.firestore();

    const handleInputValueChange = (e) => {
        const value = e.target.value;
        setInputValue(value);

        //To reset error message and animation
        setErrorMessage('');
        setIsShaking(false);
    };
    const handleInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            const value = e.target.value;
            setInputValue(value);

            //Checking that user doesn't enter their own info when creating calendar
            //But if they do then display an error message
            if (value === user.userName || value === user.email) {
                console.log('User email: ', user.email);
                setErrorMessage("You can't enter your own information.");
                setIsShaking(true);
                return;
            }

            //Checking if the user info has already been submitted
            // if(amountOfEnteredUsers.has(value)){
            //   console.log("Amount of entered users: ", amountOfEnteredUsers);
            //   setErrorMessage("You already entered this user info. Try enter someone else.");
            //   setIsShaking(true);
            //   setLimitMessage(true);

            //   setTimeout(() => {
            //     setLimitMessage(false);
            //   }, 5000);
            //   return;
            // }

            //This is to check if an when the user has exceed their limit in adding people
            //It's because like array/arraylist it starts in 0 and counting so 4 but it's 5 numberically
            if (amountOfEnteredUsers.size > 4) {
                setErrorMessage(
                    'You have reached your limit in adding people please create calendar.',
                );

                setIsShaking(true);
                setLimitMessage(true);
                return;
            }

            // Query the Firestore collection for a document with the specified username
            firestore
                .collection('users')
                .where('userName', '==', value)
                .get()
                .then((querySnapshot) => {
                    if (querySnapshot.size > 0) {
                        // A document with the specified username exists

                        console.log('User document exists for username', value);
                        // You can access the document using querySnapshot.docs[0]

                        const uid = querySnapshot.docs[0].id;

                        //Add users to the amountOfEnteredUsers

                        if (amountOfEnteredUsers.has(uid)) {
                            console.log(
                                'Amount of entered users: ',
                                amountOfEnteredUsers,
                            );
                            setErrorMessage(
                                'You already entered this user info. Try enter someone else.',
                            );
                            setIsShaking(true);
                            setLimitMessage(true);

                            setTimeout(() => {
                                setLimitMessage(false);
                            }, 5000);
                            return;
                        } else {
                            setAmountOfEnteredUsers((prevSet) =>
                                new Set(prevSet).add(uid),
                            );
                            setAddMessage('Person Added!');
                            setInputValue('');

                            setTimeout(() => {
                                setAddMessage('');
                            }, 5000);
                        }
                    } else {
                        // No document with the specified username, now checks if email exists
                        firestore
                            .collection('users')
                            .where('emailAddress', '==', value)
                            .get()
                            .then((emailQuerySnapshot) => {
                                if (emailQuerySnapshot.size > 0) {
                                    console.log(
                                        'User document exists for email:',
                                        value,
                                    );

                                    const uid = emailQuerySnapshot.docs[0].id;

                                    //Add the user to the amountOfEnteredUsers
                                    // setAmountOfEnteredUsers((prevSet) => new Set(prevSet).add(value));
                                    // console.log("Amount of entered users: ", amountOfEnteredUsers);
                                    // setAddMessage('Person Added!');
                                    // setInputValue('');

                                    // setTimeout(()=>{
                                    //   setAddMessage('');
                                    //   console.log("Amount of entered users: ", amountOfEnteredUsers);
                                    // }, 5000);

                                    if (amountOfEnteredUsers.has(uid)) {
                                        console.log(
                                            'Amount of entered users: ',
                                            amountOfEnteredUsers,
                                        );
                                        setErrorMessage(
                                            'You already entered this user info. Try enter someone else.',
                                        );
                                        setIsShaking(true);
                                        setLimitMessage(true);

                                        setTimeout(() => {
                                            setLimitMessage(false);
                                        }, 5000);
                                        return;
                                    } else {
                                        setAmountOfEnteredUsers((prevSet) =>
                                            new Set(prevSet).add(uid),
                                        );
                                        setAddMessage('Person Added!');
                                        setInputValue('');

                                        setTimeout(() => {
                                            setAddMessage('');
                                        }, 5000);
                                    }
                                } else {
                                    //If there no document with store username or email
                                    console.log(
                                        'User document does not exist for username or email',
                                        value,
                                    );
                                    setErrorMessage(
                                        'Please enter an actual email or username!',
                                    );
                                    setIsShaking(true);
                                }
                            })
                            .catch((error) => {
                                console.error(
                                    'Error checking for email: ',
                                    error,
                                );
                            });
                    }
                })
                .catch((error) => {
                    console.error('Error checking for user document:', error);
                });
        }
    };

    const navigate = useNavigate();

    const handleCreate = async () => {
        if (inputValue) {
            // Put the input values into an array to store them before sending an invite link to other users.
            setInvitees([...invitees, inputValue]);
            setInputValue('');
        }

        const calendarTitleInput = document.getElementById('CalendarTitle');
        const calendarTitleValue = calendarTitleInput.value;

        // Include the creator of the calendar in the list of users
        const creatorUid = firebase.auth().currentUser.uid;
        //const updatedAmountOfEnteredUsers = new Set([...Array.from(amountOfEnteredUsers), creatorUid]);

        const calendarData = {
            calendarName: calendarTitleValue,
            users: Array.from(amountOfEnteredUsers),
            creatorId: creatorUid,
        };

        try {
            const docRef = await firestore
                .collection('calendars')
                .add(calendarData); // Wait for the addition and get the reference

            console.log('Document written with ID: ', docRef.id); // Log the ID of the created calendar document

            // After successfully adding the calendar document, create the 'availability' sub-collection
            const availabilityRef = docRef.collection('availability');
            const creatorAvailabilityData = {
                selectedDays: [], // Initialize with an empty array or any default values
                times: {}, // Initialize with an empty object or any default values
            };
            await availabilityRef.doc(creatorUid).set(creatorAvailabilityData); // Set availability for the creator

            // Add the calendar to the creator's calendars' field
            const userDocRef = firestore.collection('users').doc(creatorUid);
            const userDoc = await userDocRef.get();
            if (userDoc.exists) {
                const userData = userDoc.data();
                const updatedCalendars = userData.calendars || [];
                updatedCalendars.push({
                    id: docRef.id,
                    calendarName: calendarTitleValue,
                });
                await userDocRef.set(
                    { calendars: updatedCalendars },
                    { merge: true },
                );
            }

            // Loop through invitees, but don't add to their 'calendars' field
            for (const userId of amountOfEnteredUsers) {
                if (userId !== creatorUid) {
                    const notificationData = {
                        sender: user.uid,
                        receiver: userId,
                        message: `You have been invited to join the calendar "${calendarTitleValue}".`,
                        calendarId: docRef.id,
                        decision: null,
                    };
                    try {
                        await firestore
                            .collection('Notification-Data')
                            .add(notificationData);
                    } catch (error) {
                        console.error('Error adding notification: ', error);
                    }
                }
            }

            navigate('/homepage'); // Navigate after completing the process
        } catch (error) {
            console.error('Error creating calendar: ', error);
        }
    };

    const handleInputFocus = () => {
        setInputValue(''); // Clear the input value when focused
    };


    return (
        <div className="h-full w-full bg-white">
            <div className="h-[1vh]">
                <div className='font-inter left-[450px] top-[95px] absolute text-[#696969] text-5xl font-bold'>
                    {' '}
                    <input
                        placeholder="       Calendar Title"
                        type="text"
                        className="font-times-new-roman text-[35px] text-[#696969] underline font-bold text-xl border no-underline ml-[28vh] mt-[0vh] mb-[5vh] p-[5px] rounded-[15px] border-[none] border-solid border-[#ccc]"
                        id="CalendarTitle"></input>
                    <div className="font-times-new-roman text-[gray] font-medium text-xl no-underline border ml-[20vh] mt-[0vh] rounded-[15px] border-[none] border-solid border-[#ccc]">
                        <input
                            type="text"
                            placeholder="   Enter email to invite"
                            value={inputValue}
                            onChange={handleInputValueChange}
                            onKeyDown={handleInputKeyDown}
                            onFocus={handleInputFocus}
                            className={isShaking ? shakingInputClass + 'animate-bounce': shakingInputClass}></input>
                        {errorMessage && (
                            <div className="text-4xl text-red-500 font-semibold">{errorMessage}</div>
                        )}
                        {limitMessage && (
                            <div className="text-4xl text-red-500 font-semibold">{limitMessage}</div>
                        )}
                        {addMessage && (
                            <div className="text-4xl text-green-600 font-semibold">{addMessage}</div>
                        )}
                    </div>
                </div>
            </div>
            <div className="mt-[50vh]">
                <button className="font-times-new-roman text-center bg-[#0e724c] text-[white] font-medium text-[25px] cursor-pointer w-[150px] h-[35px] relative flex items-center justify-center ml-[85vh] mt-[0vh] mb-[5vh] p-2.5 rounded-[15px] border-[none] hover:bg-[#4caf50]" onClick={handleCreate}>
                    Create
                </button>
                <Link to="/HomePage">
                    {' '}
                    <button className="font-times-new-roman text-center bg-[#0e724c] text-[white] font-medium text-[25px] cursor-pointer w-[150px] h-[35px] relative leading-[10px] ml-[85vh] my-[0vh] p-2.5 rounded-[15px] border-[none] hover:bg-[#4caf50]">Homepage</button>{' '}
                </Link>
            </div>
        </div>
    );
};

export default NewCalendar;
