import React, { useState } from 'react';
import { firestore } from '../resources/firebase';
import { useUser } from '../resources/UserContext';
import firebase from 'firebase/compat/app';
import { sendCalendarInvite } from '../resources/NotificationService';

const NewCalendarModal = ({ isOpen, setIsOpen, closeModalAndRefresh }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [invitedList, setInvitedList] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const user = useUser();

    const addEmail = async () => {
        const emailInput = document.getElementById('email');
        const emailToAdd = emailInput.value;
        emailInput.value = '';
        const query = firestore.collection('users').where('email', '==', emailToAdd);
        const querySnapshot = await query.get();
        
        if (querySnapshot.docs.length === 0) {
            setSuccessMessage('');
            setErrorMessage('No user with that email exists');
        } else {
            const userToAddDoc = querySnapshot.docs[0];
            const userToAddData = userToAddDoc.data();
            const name = userToAddData.firstName + ' ' + userToAddData.lastName;
            setInvitedList(prevList => [...prevList, { name, email: emailToAdd }]);
            setErrorMessage('');
            setSuccessMessage('User successfully added');
        }
    };

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

            await Promise.all(invitedList.map(invited => sendCalendarInvite(user, invited.email, calendarDocRef.id)));

    
            setIsOpen(false);
            closeModalAndRefresh();
        } catch (error) {
            console.error('Error creating calendar: ', error);
        }
    };

    const removeInvited = email => {
        setInvitedList(invitedList.filter(invited => invited.email !== email));
    };

    return (
        <>
            <button className="btn bg-green-800 text-white" onClick={() => setIsOpen(true)}>New Calendar</button>
            {isOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={() => setIsOpen(false)}>✕</button>
                        <div className="flex flex-col space-y-6">
                            <input
                                placeholder="Calendar Title"
                                type="text"
                                className="input input-bordered w-full max-w-xs"
                                id="CalendarTitle"
                            />
                            <div className="flex space-x-2">
                                <input
                                    id="email"
                                    type="text"
                                    placeholder="Enter email to invite"
                                    className="input input-bordered"
                                    onKeyDown={(e) => e.key === 'Enter' && addEmail()}
                                />
                                <button className="btn btn-primary" onClick={addEmail}>Add</button>
                            </div>
                            {errorMessage && <div className="text-red-500">{errorMessage}</div>}
                            {successMessage && <div className="text-green-500">{successMessage}</div>}
                            <button
                                className="btn bg-green-800 text-white"
                                onClick={handleCreate}
                            >
                                Create
                            </button>
                            {invitedList.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Remove</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invitedList.map((invited, index) => (
                                                <tr key={index}>
                                                    <td>{invited.name}</td>
                                                    <td>{invited.email}</td>
                                                    <td>
                                                        <button className="btn btn-error" onClick={() => removeInvited(invited.email)}>Remove</button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default NewCalendarModal;
