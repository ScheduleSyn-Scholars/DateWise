import React from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../resources/firebase';
import { useUser } from '../resources/UserContext';
import { useNavigate } from 'react-router-dom';
import firebase from 'firebase/compat/app';
import { sendCalendarInvite } from '../resources/NotificationService';

const NewCalendar = () => {
    const [errorMessage, setErrorMessage] = useState('');
    const [invitedList, setInvitedList] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const user = useUser();
    const navigate = useNavigate();

    const handleInputKeyDown = async (e) => {
        if (e.key === 'Enter') {
            addEmail();
        }
    };

    const addEmail = async () => {
        // get the email and clear the input
        const emailInput = document.getElementById('email');
        const emailToAdd = emailInput.value;
        emailInput.value = '';
        // check the email exists in the db
        const query = firestore.collection('users').where('email', '==', emailToAdd);
        const querySnapshot = await query.get();

        if (querySnapshot.docs.length === 0) {
            setSuccessMessage('');
            setErrorMessage('No user with that email exists');
        } else {
            const userToAddDoc = querySnapshot.docs[0];
            const userToAddData = userToAddDoc.data();
            const name = userToAddData.firstName + ' ' + userToAddData.lastName;
            // Add the email 
            setInvitedList([...invitedList, { name, emailToAdd }]);

            setErrorMessage('');
            setSuccessMessage('User successfully added');
        }
    }

    const handleCreate = async () => {
        // Get the input calendar title, shows error if blank
        const calendarTitleInput = document.getElementById('CalendarTitle');
        const calendarTitleValue = calendarTitleInput.value;
        if (calendarTitleValue === '') {
            setErrorMessage('Add a calendar title!');
            return;
        }

        const calendarData = {
            calendarName: calendarTitleValue,
            users: [user.uid],
            creatorId: user.uid,
        };

        try {
            const calendarDocRef = await firestore
                .collection('calendars')
                .add(calendarData); // Wait for the addition and get the reference

            // Add the calendar to the creator's calendars' field
            const userDocRef = firestore.collection('users').doc(user.uid);
            await userDocRef.update({
                calendars: firebase.firestore.FieldValue.arrayUnion({
                    calendarName: calendarTitleValue,
                    id: calendarDocRef.id,
                }),
            });        
            
            for (const invited of invitedList) {
                sendCalendarInvite(user, invited.emailToAdd, calendarDocRef.id);
            }

            navigate('/homepage'); // Navigate after completing the process
        } catch (error) {
            console.error('Error creating calendar: ', error);
        }
    };

    const removeInvited = (email) => {
        const updatedInvitedList = invitedList.filter((invited) => {
            return invited.emailToAdd !== email
        });
        setInvitedList(updatedInvitedList);
    }

    return (
        <div className="h-full w-full bg-white flex">
            <div className='w-1/2 h-full flex flex-col items-center justify-center space-y-6'>
                <input
                    placeholder="Calendar Title"
                    type="text"
                    className="input input-bordered w-full max-w-xs font-times-new-roman text-[#696969]"
                    id="CalendarTitle"
                />
                <div className='flex justify-between'>
                    <input
                        id='email'
                        type="text"
                        placeholder="Enter email to invite"
                        onKeyDown={handleInputKeyDown}
                        className='input input-bordered w-full max-w-xs'
                    />
                    <button className='btn btn-primary' onClick={addEmail}>
                        Add
                    </button>
                </div>
                {errorMessage !== '' ? (
                    <div className="text-4xl font-semibold text-red-500">
                        {errorMessage}
                    </div>
                ) : (
                    <div className='text-4xl font-semibold text-green-500'>
                        {successMessage}
                    </div>
                )}
                <button
                    className="cursor-pointer btn btn-primary items-center justify-center rounded-[15px] border-[none] bg-[#0e724c] p-2.5 text-center font-times-new-roman text-[25px] font-medium text-[white] hover:bg-[#4caf50]"
                    onClick={handleCreate}>
                    Create
                </button>
                <Link to="/HomePage">
                    <button className="btn btn-primary cursor-pointer text-center font-times-new-roman text-[25px] font-medium text-[white]">
                        Homepage
                    </button>{' '}
                </Link>
            </div>
            <div className='flex w-1/2 items-center justify-center'>
                
                {invitedList.length === 0 ? (
                    <p className='text-4xl font-bold'>Add an email on the left!</p>
                ) : (
                    <div className='overflow-x-auto'>
                        <div className='table'>
                            <thead>
                                <tr>
                                    <th>
                                        Name
                                    </th>
                                    <th>
                                        Email
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {invitedList.map((invited, index) => (
                                    <tr>
                                        <td>
                                            {invited.name}
                                        </td>
                                        <td>
                                            {invited.emailToAdd}
                                        </td>
                                        <td>
                                            <button className='btn btn-secondary' onClick={() => removeInvited(invited.emailToAdd)}>
                                                Remove
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NewCalendar;
