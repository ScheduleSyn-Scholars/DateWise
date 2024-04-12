import React, { useEffect, useState } from 'react';
import { firestore } from '../resources/firebase';
import { useUser } from '../resources/UserContext';
import firebase from 'firebase/compat/app';
import { sendCalendarInvite } from '../resources/NotificationService';
import { ReactComponent as InfoIcon } from './info-icon.svg';

const NewCalendarModal = ({ isOpen, setIsOpen, closeModalAndRefresh }) => {
    const [errorMessage, setErrorMessage] = useState('');
    const [invitedList, setInvitedList] = useState([]);
    const [successMessage, setSuccessMessage] = useState('');
    const [adminList, setAdminList] = useState([]);
    const [createEventsPermission, setCreateEventsPermission] =
        useState('everyone');
    const [addUsersPermission, setAddUsersPermission] = useState('everyone');
    const [manageAdminsPermission, setManageAdminsPermission] =
        useState('creator');

    const user = useUser();

    const addEmail = async () => {
        const emailInput = document.getElementById('email');
        const emailToAdd = emailInput.value;
        emailInput.value = '';
        const query = firestore
            .collection('users')
            .where('email', '==', emailToAdd);
        const querySnapshot = await query.get();

        if (querySnapshot.docs.length === 0) {
            setSuccessMessage('');
            setErrorMessage('No user with that email exists');
        } else {
            const userToAddDoc = querySnapshot.docs[0];
            const userToAddData = userToAddDoc.data();
            const name = userToAddData.firstName + ' ' + userToAddData.lastName;
            const uid = userToAddDoc.id;
            setInvitedList((prevList) => [
                ...prevList,
                { name, uid, email: emailToAdd },
            ]);
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

        console.log(JSON.stringify(adminList));
        const newCalendarAdminList = adminList.map((admin) => {
            return admin.uid;
        });
        newCalendarAdminList.forEach((str) => {
            console.log(str);
        });
        console.log(
            `Admin uids added to calendar: ${newCalendarAdminList.toString()}`,
        );

        const calendarData = {
            calendarName: calendarTitleValue,
            users: [user.uid],
            creatorId: user.uid,
            admins: [user.uid, ...newCalendarAdminList],
            addUsersPermission: addUsersPermission,
            createEventsPermission: createEventsPermission,
            manageAdminsPermission: manageAdminsPermission,
        };

        try {
            console.log(
                `Adding calendar doc: ${JSON.stringify(calendarData, null, 2)}`,
            );
            const calendarDocRef = await firestore
                .collection('calendars')
                .add(calendarData); // Wait for the addition and get the reference
            console.log('added calendar doc');
            // Add the calendar to the creator's calendars' field
            const userDocRef = firestore.collection('users').doc(user.uid);
            await userDocRef.update({
                calendars: firebase.firestore.FieldValue.arrayUnion({
                    calendarName: calendarTitleValue,
                    id: calendarDocRef.id,
                }),
            });

            await Promise.all(
                invitedList.map((invited) =>
                    sendCalendarInvite(user, invited.email, calendarDocRef.id),
                ),
            );

            setIsOpen(false);
            closeModalAndRefresh();
        } catch (error) {
            console.error('Error creating calendar: ', error);
        }
    };

    const removeInvited = (email) => {
        setInvitedList(
            invitedList.filter((invited) => invited.email !== email),
        );
    };

    const makeAdmin = (name, uid, email) => {
        setAdminList((prevAdminList) => {
            return [
                ...prevAdminList,
                {
                    name,
                    uid,
                    email,
                },
            ];
        });
    };

    const removeAdmin = (name, uid, email) => {
        setAdminList((prevAdminList) => {
            return prevAdminList.filter(
                (admin) =>
                    admin.name !== name ||
                    admin.uid !== uid ||
                    admin.email !== email,
            );
        });
    };

    const isAdmin = (name, uid, email) => {
        return adminList.some(
            (admin) =>
                admin.name === name &&
                admin.uid === uid &&
                admin.email === email,
        );
    };

    const handleCreateEventsPermissionChange = (event) => {
        setCreateEventsPermission(event.target.value);
    };

    const handleAddUsersPermissionChange = (event) => {
        setAddUsersPermission(event.target.value);
    };

    const handleManageAdminsPermissionChange = (event) => {
        setManageAdminsPermission(event.target.value);
    };

    return (
        <>
            <button
                className="btn bg-green-800 font-sans text-lg text-white self-end"
                onClick={() => setIsOpen(true)}>
                 New Calendar
            </button>
            {isOpen && (
                <div className="modal modal-open">
                    <div className="modal-box">
                        <button
                            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
                            onClick={() => setIsOpen(false)}>
                            ✕
                        </button>
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
                                    onKeyDown={(e) =>
                                        e.key === 'Enter' && addEmail()
                                    }
                                />
                                <button
                                    className="btn bg-green-800 text-white"
                                    onClick={addEmail}>
                                    Add
                                </button>
                            </div>
                            {errorMessage && (
                                <div className="text-red-500">
                                    {errorMessage}
                                </div>
                            )}
                            {successMessage && (
                                <div className="text-green-500">
                                    {successMessage}
                                </div>
                            )}
                            <button
                                className="btn bg-green-800 text-white"
                                onClick={handleCreate}>
                                Create
                            </button>
                            <div
                                tabIndex={0}
                                className="collapse collapse-arrow bg-base-200">
                                <input type="checkbox" />
                                <div className="collapse-title text-xl font-medium">
                                    Calendar Settings
                                </div>
                                <div className="collapse-content">
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <tbody>
                                                <tr>
                                                    <th>
                                                        Who can add new members?
                                                    </th>
                                                    <td>
                                                        <select
                                                            onChange={
                                                                handleCreateEventsPermissionChange
                                                            }
                                                            className="select w-full max-w-xs">
                                                            <option value="everyone">
                                                                Everyone
                                                            </option>
                                                            <option value="admins">
                                                                Admins
                                                            </option>
                                                            <option value="creator">
                                                                Creator Only
                                                            </option>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>
                                                        Who can create events?
                                                    </th>
                                                    <td>
                                                        <select
                                                            onChange={
                                                                handleAddUsersPermissionChange
                                                            }
                                                            className="max-3-xs select w-full">
                                                            <option value="everyone">
                                                                Everyone
                                                            </option>
                                                            <option value="admins">
                                                                Admins
                                                            </option>
                                                            <option>
                                                                Creator Only
                                                            </option>
                                                        </select>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <th>
                                                        Who can manage admins?
                                                    </th>
                                                    <td>
                                                        <select
                                                            onChange={
                                                                handleManageAdminsPermissionChange
                                                            }
                                                            className="max-3-xs select w-full">
                                                            <option value="creator">
                                                                Creator Only
                                                            </option>
                                                            <option value="admins">
                                                                Admins
                                                            </option>
                                                        </select>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            {invitedList.length > 0 && (
                                <div className="overflow-x-auto">
                                    <table className="table w-full">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Email</th>
                                                <th>Remove</th>
                                                <th className="flex items-center">
                                                    Admin
                                                    <div
                                                        className=" tooltip tooltip-bottom tooltip-info absolute z-[99999999]"
                                                        data-tip="Admins have special permissions according to your settings.">
                                                        <button className="btn btn-ghost ml-1 rounded-full p-2">
                                                            <InfoIcon className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {invitedList.map(
                                                (invited, index) => (
                                                    <tr key={index}>
                                                        <td>{invited.name}</td>
                                                        <td>{invited.email}</td>
                                                        <td>
                                                            <button
                                                                className="btn btn-error"
                                                                onClick={() =>
                                                                    removeInvited(
                                                                        invited.email,
                                                                    )
                                                                }>
                                                                Remove
                                                            </button>
                                                        </td>
                                                        <td>
                                                            {isAdmin(
                                                                invited.name,
                                                                invited.uid,
                                                                invited.email,
                                                            ) ? (
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    onClick={() => {
                                                                        removeAdmin(
                                                                            invited.name,
                                                                            invited.uid,
                                                                            invited.email,
                                                                        );
                                                                    }}>
                                                                    Remove Admin
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="btn btn-secondary"
                                                                    onClick={() => {
                                                                        makeAdmin(
                                                                            invited.name,
                                                                            invited.uid,
                                                                            invited.email,
                                                                        );
                                                                    }}>
                                                                    Make Admin
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ),
                                            )}
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
