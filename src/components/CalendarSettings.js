import { useLocation } from 'react-router-dom';
import { firestore } from '../resources/firebase';
import { useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import { useUser } from '../resources/UserContext';
import { sendMessageNotification } from '../resources/NotificationService';

const CalendarSettingsModal = ({
    isOpen,
    setOpen,
    adminList,
    createEventsPermission,
    addUsersPermission,
    manageAdminsPermission,
    usersInfo,
    creatorUid,
    calendarName
}) => {
    let path = useLocation().pathname;
    let calendarId = path.split('/')[2];

    const [createEvents, setCreateEvents] = useState(createEventsPermission);
    const [addUsers, setAddUsers] = useState(addUsersPermission);
    const [manageAdmins, setManageAdmins] = useState(manageAdminsPermission);
    const [admins, setAdmins] = useState(adminList);

    const user = useUser();

    useEffect(() => {
        setCreateEvents(createEventsPermission);
        setAddUsers(addUsersPermission);
        setManageAdmins(manageAdminsPermission);
        setAdmins(adminList);
    }, [createEventsPermission, addUsersPermission, manageAdminsPermission, adminList]);

    const handleCreateEventsPermissionChange = async (event) => {
        try {
            const newValue = event.target.value;
            setCreateEvents(newValue);
            const calendarDocRef = firestore
                .collection('calendars')
                .doc(calendarId);
            await calendarDocRef.update({
                createEventsPermission: newValue,
            });
        } catch (error) {
            console.error(`Error updating create events permission: ${error}`);
        }
    };

    const handleAddUsersPermissionChange = async (event) => {
        try {
            const newValue = event.target.value;
            setAddUsers(newValue);
            const calendarDocRef = firestore
                .collection('calendars')
                .doc(calendarId);
            await calendarDocRef.update({
                addUsersPermission: newValue,
            });
        } catch (error) {
            console.error(`Error updating add users permission: ${error}`);
        }
    };

    const handleManageAdminsPermissionChange = async (event) => {
        try {
            const newValue = event.target.value;
            setManageAdmins(newValue);
            const calendarDocRef = firestore
                .collection('calendars')
                .doc(calendarId);
            await calendarDocRef.update({
                manageAdminsPermission: newValue,
            });
        } catch (error) {
            console.error(`Error updating manage admins permission: ${error}`);
        }
    };

    const toggleAdmin = async (uid) => {
        try {
            const calendarDocRef = firestore.collection('calendars').doc(calendarId);

            if (admins.includes(uid)) {
                setAdmins(admins.filter((adminUid) => {
                    return adminUid !== uid
                }));
                await calendarDocRef.update({
                    admins: firebase.firestore.FieldValue.arrayRemove(uid)
                })
            } else {
                setAdmins([
                    ...admins,
                    uid
                ]);
                await calendarDocRef.update({
                    admins: firebase.firestore.FieldValue.arrayUnion(uid)
                })
            }
        } catch (error) {
            console.error(`Error updating admin status: ${error}`);
        }
    }

    const kickUser = async (userInfo) => {
        const confirmKick = window.alert(`Are you sure you want to kick ${userInfo.userName}`);
        if (confirmKick) {
            // Remove the calendar from the user's calendars
            const userDocRef = firestore.collection('users').doc(userInfo.uid);
            const userData = (await userDocRef.get()).data();
            userData.calendars = userData.calendars.filter((calendar) => {
                return calendar.id === calendarId;
            });
            await userDocRef.update(userData);

            // Remove the user from the calendar
            const calendarDocRef = firestore.collection('calendars').doc(calendarId);
            
            await calendarDocRef.update({
                admins: firebase.firestore.FieldValue.arrayRemove(userInfo.uid),
                users: firebase.firestore.FieldValue.arrayRemove(userInfo.uid)
            })

            // Send the kicked user a notification that they've been kicked.
            await sendMessageNotification(user, userInfo.email, `${user.firstName} ${user.lastName} has kicked you from ${calendarName}`)
        }
    }

    return (
        <>
            <button
                className="btn btn-ghost btn-sm p-0"
                onClick={() => setOpen(true)}>
                <img className="w-8" src={'/settings-icon.png'} />
            </button>
            {isOpen && (
                <div className="modal modal-open" style={{ marginLeft: '0px' }}>
                    <div className="modal-box flex flex-col items-center justify-center space-y-2">
                        <div className="flex w-full">
                            <p className="flex-grow">Calendar Settings</p>
                            <button
                                className="btn btn-circle btn-ghost btn-sm"
                                onClick={() => setOpen(false)}>
                                X
                            </button>
                        </div>

                        {creatorUid === user.uid && (
                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="my-accordion-2" />
                                <div className="collapse-title text-xl font-medium">
                                    Admin Settings
                                </div>
                                <div className="collapse-content">
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <tbody>
                                                <tr>
                                                    <th>
                                                        Who can create events?
                                                    </th>
                                                    <td>
                                                        <select
                                                            value={createEvents}
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
                                                        Who can add new members?
                                                    </th>
                                                    <td>
                                                        <select
                                                            value={addUsers}
                                                            onChange={
                                                                handleAddUsersPermissionChange
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
                                                        Who can manage admins?
                                                    </th>
                                                    <td>
                                                        <select
                                                            value={manageAdmins}
                                                            onChange={
                                                                handleManageAdminsPermissionChange
                                                            }
                                                            className="select w-full max-w-xs">
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
                        )}

                        {((adminList.includes(user.uid) && manageAdmins === 'admins') ||
                            creatorUid === user.uid) && (
                            <div className="collapse collapse-arrow bg-base-200">
                                <input type="radio" name="my-accordion-2" />
                                <div className="collapse-title text-xl font-medium">
                                    Manage Users
                                </div>
                                <div className="collapse-content">
                                    <div className="overflow-x-auto">
                                        <table className="table w-full">
                                            <tbody>
                                                {usersInfo.map((userInfo, index) => {
                                                    if (
                                                        userInfo.uid !==
                                                        creatorUid && userInfo.uid !== user.uid
                                                    ) {
                                                        return (
                                                            <tr key={index}>
                                                                <td>
                                                                    {
                                                                        userInfo.userName
                                                                    }
                                                                </td>
                                                                <td>
                                                                    <button onClick={() => kickUser(userInfo)} className='btn btn-error font-bold'>Kick User</button>
                                                                </td>
                                                                <td>
                                                                    <button onClick={() => toggleAdmin(userInfo.uid)} className='btn btn-info'>{admins.includes(userInfo.uid) ? 'Remove Admin' : 'Make Admin'}</button>
                                                                </td>
                                                            </tr>
                                                        );
                                                    }
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default CalendarSettingsModal;
