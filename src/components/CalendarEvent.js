import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import { firestore } from '../resources/firebase';
import { useUser } from '../resources/UserContext';
import { useParams } from 'react-router-dom';
import { sendEventInvite } from '../resources/NotificationService';
import 'react-datepicker/dist/react-datepicker.css';

const CalendarEventModal = ({ isOpen, setIsOpen }) => {
    const [selectedDateTime, setSelectedDateTime] = useState(new Date());
    const [description, setDescription] = useState(''); // Declare description state
    const { calendarName, calendarId } = useParams();
    const user = useUser();
    const [usersInfo, setUsersInfo] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            if (user) {
                await fetchUsersInfo(calendarId);
            }
        };
        fetchData();
    }, [calendarId, user]);

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

    const handleCreateEvent = async () => {
        try {
            const eventData = {
                name: calendarName,
                dateTime: selectedDateTime,
                creator: user.uid,
                attendees: [user.uid],
                description: description, // Add description to eventData
            };
            console.log('Event Data:', eventData);
            await createEvent(eventData);
            setIsOpen(false); // Close the modal after event creation
        } catch (error) {
            console.error('Error in handleCreateEvent:', error);
        }
    };

    const createEvent = async (eventData) => {
        try {
            const eventsRef = firestore
                .collection('calendars')
                .doc(calendarId)
                .collection('events');

            const newEventRef = await eventsRef.add(eventData);
            await sendEventInvites(newEventRef.id);
            console.log('Event created successfully!');
        } catch (error) {
            console.error('Error creating event:', error);
        }
    };

    const sendEventInvites = async (newEventId) => {
        for (const userInfo of usersInfo) {
            await sendEventInvite(user, userInfo.email, calendarId, newEventId);
        }
    };

    return (
        <>
            <button
                className="btn bg-green-800 text-white"
                onClick={() => setIsOpen(true)}>
                Schedule Meeting
            </button>
            {isOpen && (
                <div id="eventCal" className={`modal modal-open`}>
                    <div className="modal-box p-2">
                        <button
                            className="btn btn-circle btn-ghost btn-sm absolute right-2 top-2"
                            onClick={() => setIsOpen(false)}>
                            ✕
                        </button>

                        <div className="mt-5 flex flex-col items-center justify-center ">
                            <div className="items center mt-5 flex w-96 justify-center">
                                <DatePicker
                                    selected={selectedDateTime}
                                    onChange={(date) =>
                                        setSelectedDateTime(date)
                                    }
                                    inline
                                    showTimeSelect
                                    dateFormat="Pp"
                                />
                            </div>

                            <div className="flex flex-col items-center ">
                                <textarea
                                    type="text"
                                    placeholder="Enter event description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    className="mt-2 h-20 w-80 rounded-md border border-gray-300 p-2"
                                />
                            </div>
                            <button
                                className="items center mt-5 h-10 w-32 rounded-full border-none bg-green-800 text-white"
                                type="button"
                                onClick={handleCreateEvent}>
                                Submit Event
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default CalendarEventModal;
