import React, { useEffect, useState } from 'react';
import { firestore, FieldValue } from '../resources/firebase';
import 'firebase/compat/firestore';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../resources/UserContext';
import AvailabilityForm from '../components/Calendar/AvailabilityForm';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';
import { sendEventInvite } from '../resources/NotificationService';
import CalendarEventModal from '../components/CalendarEvent';
import firebase from 'firebase/compat/app';
import CalendarSettingsModal from '../components/CalendarSettings';

const ViewCalendar = () => {
    const { calendarId, calendarName } = useParams();
    const user = useUser();
    const [users, setUsers] = useState([]); //list of users from the database
    const [userAdded, setUserAdded] = useState(false); //functionality to add user to database
    const [userId, setUserId] = useState(); //value to CRUD with database
    const [searchInput, setSearchInput] = useState(''); //input based on input tag value
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [exactMatchFound, setExactMatchFound] = useState(false);
    const [error, setError] = useState(false);
    const [description, setDescription] = useState(''); // Define description state variable
    const [availability, setAvailability] = useState({
        selectedDays: [],
        times: {},
    });
    const [teamAvailability, setTeamAvailability] = useState([]);
    const [showBestTime, setShowBestTime] = useState(false);
    const [bestTime, setBestTime] = useState(null);
    const [selectedDateTime, setSelectedDateTime] = useState(new Date());
    const [showSavedPopup, setShowSavedPopup] = useState(false);
    const [usersInfo, setUsersInfo] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [adminUids, setAdminUids] = useState([]);
    const [addUsersPermission, setAddUsersPermission] = useState('');
    const [createEventsPermission, setCreateEventsPermission] = useState('');
    const [manageAdminsPermission, setManageAdminsPermission] = useState('');
    const [creatorUid, setCreatorUid] = useState('');
    const [settingsOpen, setSettingsOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                const calendarData = (
                    await firestore
                        .collection('calendars')
                        .doc(calendarId)
                        .get()
                ).data();
                if (calendarData.admins) {
                    setAdminUids(calendarData.admins);
                    setAddUsersPermission(
                        calendarData.addUsersPermission || 'creator',
                    );
                    setCreateEventsPermission(
                        calendarData.createEventsPermission || 'creator',
                    );
                    setManageAdminsPermission(
                        calendarData.manageAdminsPermission || 'creator',
                    );
                }

                setCreatorUid(calendarData.creatorId);

                await fetchUserAvailability(calendarId, user.uid);
                await fetchUser2(calendarId);
                const teamAvailabilityData =
                    await fetchTeamAvailability(calendarId);
                await fetchUsersInfo(calendarId); // Await the fetchUsersInfo function here
                fetchTeamAvailabilityOnCommonDays(teamAvailabilityData);
            }
        };

        fetchData();
    }, [calendarId, user]);

    // State to store the availability of the selected user
    const [selectedUserAvailability, setSelectedUserAvailability] =
        useState(null);

    const handleAvailabilityChange = (newAvailability) => {
        // Handle changes in availability form
        const updatedAvailability = {
            selectedDays: Object.keys(newAvailability.times || {}),
            times: newAvailability.times || {},
        };
        setAvailability(updatedAvailability);
    };

    // Function to check if user's availability exists
    const userAvailabilityExists = (userId) => {
        return teamAvailability.some((member) => member.uid === userId);
    };

    const fetchUserAvailability = async (calendarId, uid) => {
        try {
            const availabilityRef = firestore
                .collection('calendars')
                .doc(calendarId)
                .collection('availability')
                .doc(uid);

            const availabilitySnapshot = await availabilityRef.get();
            if (availabilitySnapshot.exists) {
                const availabilityData = availabilitySnapshot.data();
                setAvailability(availabilityData);
            }
        } catch (error) {
            console.error('Error fetching user availability:', error);
        }
    };

    const fetchUser2 = async () => {
        //fetch all users from the users collection
        const usersDataArray = [];
        try {
            const userRef = firestore.collection('users');
            const userSnapshot = await userRef.get();
            userSnapshot.forEach((doc) => {
                const id = doc.id;
                const { email, firstName, imageURL, lastName } = doc.data();
                const userObject = { id, email, firstName, imageURL, lastName };
                usersDataArray.push(userObject);
            });
            setUsers(usersDataArray);
        } catch (Exception) {
            console.log('Error fetching use', Exception);
        }
    };
    const filterSuggestion = (input) => {
        let validatedInput = input.target.value.toLowerCase();
        let match = 0;
        if (input.target.value === '' || input.target.value.trim() === '') {
            setFilteredUsers([]);
            setSearchInput('');
            setUserId('');
            setExactMatchFound(false);
            return;
        } else {
            setSearchInput(input.target.value);
            const filtered = users.filter((user) => {
                //
                if (
                    (user.firstName?.toLowerCase().includes(validatedInput) ||
                        user.lastName
                            ?.toLowerCase()
                            .includes(validatedInput)) &&
                    match < 10
                ) {
                    match++;
                    return user;
                }
            });
            //if match < 10, then put the filtered option
            // Check if exact match is found
            const exactMatch = users.find((user) => {
                return (
                    user.firstName?.toLowerCase() === validatedInput ||
                    user.lastName?.toLowerCase() === validatedInput
                );
            });

            // If exact match found, set exactMatchFound to true and clear filtered list
            if (exactMatch) {
                setExactMatchFound(true);
                setFilteredUsers([]);
            } else {
                setExactMatchFound(false);
                setFilteredUsers(filtered);
            }
            //setFilteredUsers(filtered);
        }
    };
    //Button that handles Adding User to Calendar
    const handleNewUser = (user) => {
        setSearchInput(`${user.firstName} ${user.lastName}`);
        setExactMatchFound(true);
        setUserId(user.id);
    };

    const fetchTeamAvailability = async (calendarId) => {
        try {
            const teamAvailabilityRef = firestore
                .collection('calendars')
                .doc(calendarId)
                .collection('availability');

            const teamAvailabilitySnapshot = await teamAvailabilityRef.get();
            const teamAvailabilityData = teamAvailabilitySnapshot.docs
                .map((doc) => ({ uid: doc.id, ...doc.data() }))
                .filter(
                    (teamMember) =>
                        teamMember.selectedDays &&
                        teamMember.selectedDays.length > 0,
                );

            setTeamAvailability(teamAvailabilityData);

            return teamAvailabilityData; // Add this line
        } catch (error) {
            console.error('Error fetching team availability:', error);
            return [];
        }
    };

    const fetchTeamAvailabilityOnCommonDays = async (commonDays) => {
        try {
            const teamAvailabilityData =
                await fetchTeamAvailability(calendarId);

            // Filter the team availability data to include only common days
            const teamAvailabilityOnCommonDays = teamAvailabilityData.map(
                (teamMember) => ({
                    uid: teamMember.uid,
                    times: commonDays.reduce(
                        (acc, day) => ({
                            ...acc,
                            [day]: teamMember.times[day] || [],
                        }),
                        {},
                    ),
                }),
            );

            // console.log(
            //   'Team Availability On Common Days:',
            //   teamAvailabilityOnCommonDays,
            // );
            return teamAvailabilityOnCommonDays;
        } catch (error) {
            console.error(
                'Error fetching team availability on common days:',
                error,
            );
            return [];
        }
    };

    const handleShowBestTime = async () => {
        try {
            console.log('Handling Show Best Time...');
            await findBestTimeToMeet();
        } catch (error) {
            console.error('Error in handleShowBestTime:', error);
        }
    };

    const findBestTimeToMeet = async () => {
        // Find common days among all users
        console.log('Inside findBestTimeToMeet');
        const commonDays = findCommonDays();

        if (commonDays.length === 0) {
            setBestTime(null);
            return;
        }

        // Find overlapping time slots on common days
        const overlappingTimes = await findOverlappingTimes(commonDays);

        // Determine the best time to meet
        const bestTime = processOverlappingTimes(overlappingTimes);

        // Set the best time to meet in the state
        setBestTime(bestTime);
    };

    const compareTimeSlots = (commonDays, teamAvailabilityData) => {
        console.log('Raw Team Availability Data:', teamAvailabilityData);

        // Ensure teamAvailabilityData is an array
        const teamAvailabilityArray = Array.isArray(teamAvailabilityData)
            ? teamAvailabilityData
            : Object.values(teamAvailabilityData);

        console.log('Team Availability Array:', teamAvailabilityArray);

        // Compare time slots for each common day
        const overlappingTimes = commonDays.reduce((acc, day) => {
            const currentUserTimes = availability.times[day] || [];
            const teamMemberTimes = teamAvailabilityArray.reduce(
                (times, teamMember) => {
                    return times.concat(teamMember.times[day] || []);
                },
                [],
            );

            // Find overlapping times for each team member
            const overlappingTimesForDay = teamMemberTimes.filter((teamTime) =>
                currentUserTimes.some((userTime) =>
                    areTimeSlotsOverlapping(userTime, teamTime),
                ),
            );

            // Set day explicitly
            acc[day] = overlappingTimesForDay;

            return acc;
        }, {});

        console.log('Overlapping Times:', overlappingTimes);

        return overlappingTimes;
    };

    const findCommonDays = () => {
        // Extract selected days of the current user
        const currentUserDays = availability.selectedDays || [];

        // Extract selected days of team members
        const teamDays = teamAvailability.map(
            (teamMember) => teamMember.selectedDays || [],
        );

        // Find the common days among all users
        const commonDays = currentUserDays.filter((day) =>
            teamDays.every((teamDays) => teamDays.includes(day)),
        );

        return commonDays;
    };

    const findOverlappingTimes = async (commonDays) => {
        const teamAvailabilityOnCommonDays =
            await fetchTeamAvailabilityOnCommonDays(commonDays);

        const overlappingTimes = compareTimeSlots(
            commonDays,
            teamAvailabilityOnCommonDays,
        );

        console.log('Overlapping Times:', overlappingTimes);
        return overlappingTimes;
    };

    const areTimeSlotsOverlapping = (time1, time2) => {
        const start1 = new Date(`2000-01-01T${time1.start}`);
        const end1 = new Date(`2000-01-01T${time1.end}`);
        const start2 = new Date(`2000-01-01T${time2.start}`);
        const end2 = new Date(`2000-01-01T${time2.end}`);

        return start1 < end2 && end1 > start2;
    };

    //Used to fetch a users email, userName, and photo to show the list of users in a calendar
    const fetchUsersInfo = async (calendarId) => {
        try {
            const calendarDoc = await firestore
                .collection('calendars')
                .doc(calendarId)
                .get();
            if (calendarDoc.exists) {
                const usersIds = calendarDoc.data().users || [];
                const usersInfoPromises = usersIds.map(async (userId) => {
                    const userDoc = await firestore
                        .collection('users')
                        .doc(userId)
                        .get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        return {
                            uid: userId,
                            email: userData.email,
                            userName: `${userData.firstName} ${userData.lastName}`,
                            imageURL: userData.imageURL,
                        };
                    } else {
                        console.error(
                            `User with ID ${userId} not found in the 'users' collection.`,
                        );
                        return null;
                    }
                });
                const usersInfoData = await Promise.all(usersInfoPromises);
                setUsersInfo(usersInfoData.filter((user) => user !== null));
            } else {
                console.error(`Calendar with ID ${calendarId} not found.`);
            }
        } catch (error) {
            console.error('Error fetching users info:', error);
        }
    };

    const processOverlappingTimes = (overlappingTimes) => {
        // Process overlapping times to find the best time to meet
        // This includes finding the latest start time and earliest end time for each day

        console.log('Before loop - overlappingTimes:', overlappingTimes);

        const bestTime = Object.entries(overlappingTimes).reduce(
            (acc, [day, times]) => {
                console.log('Inside loop - day:', day, 'times:', times);

                if (!acc.day || times.length > acc.times.length) {
                    acc.day = day;
                    acc.times = times;
                } else if (times.length === acc.times.length) {
                    // If the same number of overlapping slots, consider the latest start time
                    const latestStartTime = Math.max(
                        ...times.map((time) => parseInt(time.start, 10)),
                    );
                    const currentLatestStartTime = Math.max(
                        ...acc.times.map((time) => parseInt(time.start, 10)),
                    );

                    if (latestStartTime > currentLatestStartTime) {
                        acc.day = day;
                        acc.times = times;
                    }
                }
                return acc;
            },
            { day: null, times: [] },
        );

        // Find the latest start time and earliest end time
        const latestStartTime = Math.max(
            ...bestTime.times.map((time) => parseInt(time.start, 10)),
        );
        const earliestEndTime = Math.min(
            ...bestTime.times.map((time) => parseInt(time.end, 10)),
        );

        // Set the overall start and end times
        bestTime.start = latestStartTime;
        bestTime.end = earliestEndTime;

        console.log('After loop - bestTime:', bestTime);

        return bestTime;
    };

    const updateAvailability = async () => {
        try {
            const availabilityRef = firestore
                .collection('calendars')
                .doc(calendarId)
                .collection('availability')
                .doc(user.uid);

            // Update selectedDays based on times object
            const updatedAvailability = {
                ...availability,
                selectedDays: Object.keys(availability.times || {}),
            };

            await availabilityRef.set(
                { ...updatedAvailability },
                { merge: true },
            );

            console.log('availRef" ', updatedAvailability);
            console.log(calendarId);
            await availabilityRef.update({ ...updatedAvailability });
            console.log('Adding availability for: ', user.uid);
            console.log('Availability updated successfully!');

            // Fetch team availability
            const teamAvailabilityData =
                await fetchTeamAvailability(calendarId);

            // Reset showBestTime state
            setShowBestTime(false);

            setShowSavedPopup(true);

            setTimeout(() => {
                setShowSavedPopup(false);
            }, 2000);
        } catch (error) {
            console.error('Error updating availability:', error);
        }
    };

    const createEvent = async (eventData) => {
        try {
            const eventsRef = firestore
                .collection('calendars')
                .doc(calendarId)
                .collection('events');

            const newEventData = {
                name: calendarName, // Use calendarName directly
                dateTime: selectedDateTime,
                creator: user.uid,
                attendees: [user.uid],
                description: description, // Include the description in the event data
            };

            const newEventRef = await eventsRef.add(newEventData);
            sendEventInvites(newEventRef.id);
            console.log('Event created successfully!');
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    //Retrieve user available times by clicking on the dot that turns green once they fill it out
    const handleDotClick = async (userUid) => {
        try {
            console.log('User UID:', userUid);

            // Find the user with the corresponding UID
            const selectedUser = usersInfo.find((user) => user.uid === userUid);
            if (!selectedUser) {
                console.log('User not found.');
                return;
            }

            console.log('Selected user:', selectedUser);

            // Fetch the availability of the selected user from the database
            const availabilityRef = firestore
                .collection('calendars')
                .doc(calendarId)
                .collection('availability')
                .doc(userUid);

            const availabilitySnapshot = await availabilityRef.get();
            console.log(
                'Availability snapshot exists:',
                availabilitySnapshot.exists,
            );

            if (availabilitySnapshot.exists) {
                const availabilityData = availabilitySnapshot.data();
                console.log('Availability data:', availabilityData);

                // Extract selected days and times from availability data
                const selectedDays = availabilityData.selectedDays || [];
                const times = availabilityData.times || {};

                // Display available days and times
                console.log('Selected Days:', selectedDays);
                console.log('Times:', times);

                // Update the selected user's availability state
                setSelectedUserAvailability({
                    times,
                });
            } else {
                console.log('Availability data does not exist for this user.');
                // Reset the selected user's availability state
                setSelectedUserAvailability(null);
            }
        } catch (error) {
            console.error('Error fetching user availability:', error);
        }
    };

    //code for adding user to a calendar
    const addUser = async () => {
        try {
            if (userId === '') {
                throw new Error('Please add a user');
            }
            const calRef = firestore.collection('calendars').doc(calendarId);
            const calSnapshot = await calRef.get();
            if (calSnapshot.exists) {
                await calRef.update({
                    users: FieldValue.arrayUnion(userId),
                });
            }
            setUserAdded(true);
            setSearchInput('');
            setError(false);
            setTimeout(() => {
                setUserAdded(false);
            }, 3000);
        } catch (error) {
            setError(true);
            console.error('Error while trying to add user', error);
            setTimeout(() => {
                setError(false);
            }, 3000);
        }
    };
    // Sends each calendar member a notification for the event
    const sendEventInvites = async (newEventId) => {
        for (const userInfo of usersInfo) {
            await sendEventInvite(user, userInfo.email, calendarId, newEventId);
        }
    };

    const convertTo12HourFormat = (time) => {
        const hour = parseInt(time, 10);
        const isPM = hour >= 12;
        const formattedHour = isPM ? (hour === 12 ? 12 : hour - 12) : hour;
        return `${formattedHour}:00 ${isPM ? 'PM' : 'AM'}`;
    };

    const handleLeaveGroup = async () => {
        try {
            const userRef = firestore.collection('users').doc(user.uid);

            // Fetch the user's document
            const userDoc = await userRef.get();
            if (userDoc.exists) {
                // Get the current calendars array
                const calendars = userDoc.data().calendars || [];

                // Remove the map with the specified calendarId
                const updatedCalendars = calendars.filter(
                    (calendar) => calendar.id !== calendarId,
                );

                // Update the user document with the updated calendars array
                await userRef.update({
                    calendars: updatedCalendars,
                });

                // Remove the user from the calendar's users array
                const calRef = firestore
                    .collection('calendars')
                    .doc(calendarId);
                await calRef.update({
                    users: firebase.firestore.FieldValue.arrayRemove(user.uid),
                });

                // Fetch the updated calendar document to check if any users are left
                const updatedCalDoc = await calRef.get();

                if (updatedCalDoc.exists) {
                    const updatedCalData = updatedCalDoc.data();

                    // If the users array is empty after removal, delete the calendar document
                    if (
                        updatedCalData.users &&
                        updatedCalData.users.length === 0
                    ) {
                        await calRef.delete();
                        console.log(
                            'Calendar deleted successfully due to no remaining users.',
                        );
                    } else {
                        console.log(
                            'User removed from the calendar successfully.',
                        );
                    }
                } else {
                    console.error('Failed to fetch updated calendar document.');
                }

                navigate('/HomePage');
                window.location.reload();

                console.log('User removed from calendar:', calendarId);
            } else {
                console.error('User document does not exist');
            }
        } catch (error) {
            console.error(
                'Error removing user from calendar or deleting calendar:',
                error,
            );
        }
    };

    const closeModal = () => {
        setIsOpen(false);
    };

    const handleSaveAndUpdate = async () => {
        await updateAvailability(); // Wait until updateAvailability completes
        handleShowBestTime(); // Then call handleShowBestTime
    };

    const isAdmin = (uid) => {
        return adminUids.includes(uid);
    };

    // When toggled, removes admins from admin list and adds nonadmins to admin list.
    const handleAdminToggle = async (uid) => {
        const calRef = firestore.collection('calendars').doc(calendarId);
        if (isAdmin(uid)) {
            await calRef.update({
                admins: firebase.firestore.FieldValue.arrayRemove(uid),
            });
            setAdminUids((prevAdminUids) => {
                return prevAdminUids.filter((adminUid) => {
                    return adminUid !== uid;
                });
            });
        } else {
            await calRef.update({
                admins: firebase.firestore.FieldValue.arrayUnion([uid]),
            });
            setAdminUids((prevAdminUids) => {
                return [...prevAdminUids, uid];
            });
        }
    };

    return (
        <div className="flex h-screen flex-col">
            <Header />
            <div className="mt-10vh flex items-center justify-center space-x-2 text-center text-5xl font-medium text-gray-600">
                <p>{calendarName}</p>
                {(user.uid === creatorUid ||
                    (isAdmin(user.uid) &&
                        manageAdminsPermission === 'admins')) && (
                    <CalendarSettingsModal
                        isOpen={settingsOpen}
                        setOpen={setSettingsOpen}
                        createEventsPermission={createEventsPermission}
                        addUsersPermission={addUsersPermission}
                        manageAdminsPermission={manageAdminsPermission}
                        adminList={adminUids}
                        usersInfo={usersInfo}
                        creatorUid={creatorUid}
                        calendarName={calendarName}
                    />
                )}
            </div>

            {/* Users Section */}
            <div className="mt-5 flex items-center justify-center">
                {usersInfo.map((calendarUser) => (
                    <div
                        key={calendarUser.uid}
                        className="mr-5 flex flex-col items-center">
                        <img
                            src={
                                calendarUser.imageURL ?? '/default-profile.png'
                            }
                            alt="User Profile Picture"
                            className="mb-2 h-20 w-20 cursor-pointer rounded-full"
                            onClick={() => handleDotClick(calendarUser.uid)} // Add onClick handler to show availability modal
                        />
                        {/* <p className="mb-1">{user.email}</p> //removed since we just wanna see userName */}
                        <div className="flex items-center">
                            <p>{calendarUser.userName}</p>
                            {userAvailabilityExists(calendarUser.uid) ? (
                                <span
                                    className="ml-2 h-3 w-3 cursor-pointer rounded-full bg-green-500"
                                    onClick={() =>
                                        handleDotClick(calendarUser.uid)
                                    }></span>
                            ) : (
                                <span className="ml-2 h-3 w-3 rounded-full bg-orange-500"></span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Rest of the content */}
            <div className="mt-5 flex flex-col items-center justify-center sm:flex-row">
                {/* Availability Form and Save Button */}
                <div className="mb-5 flex flex-col items-center sm:mb-0 sm:mr-10">
                    <AvailabilityForm
                        availability={availability}
                        onAvailabilityChange={handleAvailabilityChange}
                    />
                    <div className="flex flex-row">
                        <button
                            className="btn bg-green-800 text-white"
                            type="button"
                            onClick={handleSaveAndUpdate}>
                            Save
                        </button>
                    </div>
                    {bestTime && (
                        <div className="mt-5">
                            <p>Best Time to Meet:</p>
                            <p>Day: {bestTime.day}</p>
                            <p>
                                Time:{' '}
                                {bestTime.start !== undefined
                                    ? convertTo12HourFormat(bestTime.start)
                                    : ''}{' '}
                                {bestTime.start !== undefined &&
                                bestTime.end !== undefined
                                    ? '-'
                                    : ''}{' '}
                                {bestTime.end !== undefined
                                    ? convertTo12HourFormat(bestTime.end)
                                    : ''}
                            </p>
                        </div>
                    )}
                    {showSavedPopup && (
                        <div className="mt-5">
                            <p>Availability saved!</p>
                        </div>
                    )}
                    <div
                        className={`${(isAdmin(user.uid) && createEventsPermission === 'admins') || createEventsPermission === 'everyone' || creatorUid === user.uid ? '' : 'hidden'}`}>
                        <CalendarEventModal
                            isOpen={isOpen}
                            setIsOpen={setIsOpen}
                            closeModal={closeModal}
                        />
                    </div>
                </div>

                {/* Calendar Events */}
                <div className="ml-10 flex h-full flex-col items-center pr-5">
                    Users:
                    <div className="mt-5vh flex flex-col items-center">
                        {/* Users Section */}
                    </div>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <input
                            className="input input-sm input-bordered w-full md:max-w-md"
                            onChange={filterSuggestion}
                            type="text"
                            placeholder="Type here"
                            value={searchInput}></input>
                        {filteredUsers.length > 0 && !exactMatchFound && (
                            <div className="dropdown-content top-14 max-h-96 w-full flex-col overflow-auto rounded-md bg-base-200 md:max-w-md">
                                <ul className="menu-compact menu">
                                    {filteredUsers.map((user) => (
                                        <li
                                            className="w-full border-b border-b-base-content/10"
                                            key={user.id}>
                                            {' '}
                                            <button
                                                onClick={() =>
                                                    handleNewUser(user)
                                                }>
                                                {user.firstName} {user.lastName}
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <button
                            className={`btn bg-green-800 text-white ${creatorUid === user.uid || (isAdmin(user.uid) && addUsersPermission === 'admins') || addUsersPermission === 'everyone' ? '' : 'hidden'}`}
                            type="button"
                            onClick={addUser}>
                            Add User
                        </button>
                        {userAdded && !error && (
                            <div
                                role="alert"
                                className="alert alert-success relative">
                                <span>User has been added to Calendar!</span>
                            </div>
                        )}
                        {error && (
                            <div
                                role="alert"
                                className="alert-sm alert alert-error">
                                <span>
                                    Error occurred while trying to add user!
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={handleLeaveGroup}
                        className="btn mt-5 bg-green-800 text-white">
                        Leave Group
                    </button>
                </div>
            </div>

            {/* Modal for Selected User's Availability */}
            {selectedUserAvailability && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="rounded-lg bg-white p-8">
                        <h2 className="mb-4 text-lg font-bold">
                            User Availability
                        </h2>
                        {/* Display availability information */}
                        {Object.entries(selectedUserAvailability).map(
                            ([day, times]) => (
                                <div key={day}>
                                    {Array.isArray(times) &&
                                        times.map((time) => (
                                            <p key={time.start}>
                                                {time.start} - {time.end}
                                            </p>
                                        ))}
                                    {!Array.isArray(times) &&
                                        Object.entries(times).map(
                                            ([day, slots]) => (
                                                <div key={day}>
                                                    <p>{day}:</p>
                                                    {slots.map((slot) => (
                                                        <p key={slot.start}>
                                                            {slot.start} -{' '}
                                                            {slot.end}
                                                        </p>
                                                    ))}
                                                </div>
                                            ),
                                        )}
                                </div>
                            ),
                        )}
                        <button
                            className="mx-auto mt-4 block rounded-md bg-red-500 px-4 py-2 text-white"
                            onClick={() => setSelectedUserAvailability(null)}>
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewCalendar;
