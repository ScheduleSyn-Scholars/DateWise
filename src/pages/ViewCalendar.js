import React, { useEffect, useState } from 'react';
import { firebase, firestore } from '../resources/firebase';
import 'firebase/compat/firestore';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../resources/UserContext';
import AvailabilityForm from '../components/Calendar/AvailabilityForm';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Header from '../components/Header';

const ViewCalendar = () => {
    const { calendarId, calendarName } = useParams();
    const user = useUser();
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

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                await fetchUserAvailability(calendarId, user.uid);
                const teamAvailabilityData =
                    await fetchTeamAvailability(calendarId);
                await fetchUsersInfo(calendarId); // Await the fetchUsersInfo function here
                fetchTeamAvailabilityOnCommonDays(teamAvailabilityData);
            }
        };
    
        fetchData();
    }, [calendarId, user]);

    const handleAvailabilityChange = (newAvailability) => {
        // Handle changes in availability form
        const updatedAvailability = {
            selectedDays: Object.keys(newAvailability.times || {}),
            times: newAvailability.times || {},
        };
        setAvailability(updatedAvailability);
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

            console.log(
                'Team Availability On Common Days:',
                teamAvailabilityOnCommonDays,
            );
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

    const fetchUsersInfo = async (calendarId) => {
        try {
            const calendarDoc = await firestore.collection('calendars').doc(calendarId).get();
            if (calendarDoc.exists) {
                const usersIds = calendarDoc.data().users || [];
                const usersInfoPromises = usersIds.map(async (userId) => {
                    const userDoc = await firestore.collection('users').doc(userId).get();
                    if (userDoc.exists) {
                        const userData = userDoc.data();
                        return {
                            uid: userId,
                            emailAddress: userData.emailAddress,
                            imageURL: userData.imageURL,
                        };
                    } else {
                        console.error(`User with ID ${userId} not found in the 'users' collection.`);
                        return null;
                    }
                });
                const usersInfoData = await Promise.all(usersInfoPromises);
                setUsersInfo(usersInfoData.filter(user => user !== null));
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

            await eventsRef.add(eventData);

            console.log('Event created successfully!');
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const handleCreateEvent = async () => {
        try {
            const eventData = {
                name: calendarName, // Use calendarName directly
                dateTime: selectedDateTime,
                creator: user.uid,
                attendees: [user.uid],
            };
            console.log('Event Data:', eventData);
            await createEvent(eventData);
        } catch (error) {
            console.error('Error in handleCreateEvent:', error);
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

                // Query the calendars collection to find documents containing the calendarId
                const calendarsQuerySnapshot = await firestore
                    .collection('calendars')
                    .where('users', 'array-contains', user.uid)
                    .get();

                // Delete the calendar from each document found
                const deletePromises = [];
                calendarsQuerySnapshot.forEach((doc) => {
                    const calendarData = doc.data();
                    const updatedUsers = calendarData.users.filter(
                        (userId) => userId !== user.uid,
                    );
                    deletePromises.push(
                        doc.ref.update({ users: updatedUsers }),
                    );
                });

                // Wait for all delete operations to complete
                await Promise.all(deletePromises);

                console.log(
                    'Calendar removed successfully from both collections.',
                );

                navigate('/HomePage');
                window.location.reload();

                console.log('User removed from calendar:', calendarId);
            } else {
                console.error('User document does not exist');
            }
        } catch (error) {
            console.error('Error removing user from calendar:', error);
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <Header />
            <div className="mt-10vh text-center text-5xl font-medium text-gray-600">
                {calendarName}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center mt-5vh">
                <div className="flex flex-col items-center mb-5 sm:mb-0 sm:mr-10">
                    <AvailabilityForm
                        availability={availability}
                        onAvailabilityChange={handleAvailabilityChange}
                    />
                    <div className='flex flex-row'>
                        <button
                            className="mt-2 h-10 w-32 rounded-full border-none bg-green-800 text-white"
                            type="button"
                            onClick={() => updateAvailability()}>
                            Save
                        </button>
                        <button
                            className="mt-2 h-10 w-40 rounded-full border-none bg-green-800 text-white"
                            type="button"
                            onClick={handleShowBestTime}>
                            Show Best Time
                        </button>
                    </div>
                    {bestTime && (
                        <div className="mt-5">
                            <p>Best Time to Meet:</p>
                            <p>Day: {bestTime.day}</p>
                            <p>
                                Time: {bestTime.start !== undefined ? convertTo12HourFormat(bestTime.start) : ''}{' '}
                                {bestTime.start !== undefined && bestTime.end !== undefined ? '-' : ''}{' '}
                                {bestTime.end !== undefined ? convertTo12HourFormat(bestTime.end) : ''}
                            </p>
                        </div>
                    )}
                    {showSavedPopup && (
                        <div className="mt-5">
                            <p>Availability saved!</p>
                        </div>
                    )}
                </div>
                <div className="flex flex-col items-center h-full border-r border-gray-500 pr-5">

                Users:
                <div className="flex flex-col items-center mt-5vh">
    {usersInfo.map(user => (
        <div key={user.uid} className="flex flex-col items-center mb-5">
            <img src={user.imageURL} alt="User" className="rounded-full w-20 h-20 mb-2" />
            <p>{user.emailAddress}</p>
        </div>
    ))}
</div>
                
                </div>
                <div className="mt-5 sm:mt-0 flex flex-col items-center pl-5">
                    <DatePicker
                        selected={selectedDateTime}
                        onChange={(date) => setSelectedDateTime(date)}
                        inline
                        showTimeSelect
                        dateFormat="Pp"
                    />
                    <button
                        className="h-10 w-32 items center rounded-full border-none bg-green-800 text-white"
                        type="button"
                        onClick={handleCreateEvent}>
                        Submit Event
                    </button>
                </div>
            </div>
            <div className="flex justify-center mt-5">
                <Link to="/HomePage" className="ml-5">
                    <button className="h-10 w-40 rounded-full border-none bg-green-800 text-white">
                        Homepage
                    </button>
                </Link>
                <button
                    onClick={handleLeaveGroup}
                    className="ml-5 h-10 w-40 rounded-full border-none bg-green-800 text-white">
                    Leave Group
                </button>
            </div>
        </div>
    );
};

export default ViewCalendar;