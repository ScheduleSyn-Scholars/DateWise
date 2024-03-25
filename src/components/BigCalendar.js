import CustomEventComponent from './Calendar/CustomEvent';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import { useEffect, useRef, useState } from 'react';
import { ReactComponent as XIcon } from './x-icon.svg';
import { firestore } from '../resources/firebase';
import { useUser } from '../resources/UserContext';
import firebase from 'firebase/compat/app';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const BigCalendar = (props) => {
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [popupPosition, setPopupPosition] = useState({top: 0, left: 0})
    const popupRef = useRef(null);
    
    const user = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                popupRef.current &&
                selectedEvent &&
                !popupRef.current.contains(event.target)
            ) {
                handleClosePopup();
            }
        }
        setEvents(props.events);

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [props.events, popupPosition, selectedEvent]);

    const handleSelectEvent = (event, e) => {
        const eventRect = e.target.getBoundingClientRect();
        setPopupPosition({
            top: eventRect.top - 425,
            left: eventRect.left - eventRect.width / 2,
        });
        console.log(JSON.stringify(event, null, 2));
        setSelectedEvent(event);
    }

    const handleClosePopup = () => {
        setSelectedEvent(null);
    }
    
    const leaveEvent = async () => {
        const confirmedLeave = window.confirm(`Would you like to stop attending ${selectedEvent.title}?`);
        // Remove the current user from the event attendees
        console.log(`selected event: ${JSON.stringify(selectedEvent, null, 2)}`);
        if (confirmedLeave) {
            const eventDocRef = firestore.collection('calendars').doc(selectedEvent.calendarId).collection('events').doc(selectedEvent.id);
            await eventDocRef.update({
                attendees: firebase.firestore.FieldValue.arrayRemove(user.uid)
            });
        }        
    }

    const goToCalendar = () => {
        navigate(`/ViewCalendar/${selectedEvent.calendarId}/${encodeURIComponent(selectedEvent.calendarName)}`)
    }
    
    return (
        <div>
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                toolbar={true}
                onSelectEvent={handleSelectEvent}
                timezone="America/New_York"
                components={{
                    event: CustomEventComponent,
                }}
            />
            {selectedEvent && (
                <div style={{
                        top: `${popupPosition.top}px`,
                        left: `${popupPosition.left}px`
                    }}
                    className='p-3 border-2 border-primary shadow-2xl absolute w-64 bg-secondary flex flex-col items-center justify-center z-[99999] rounded-2xl'
                    ref={popupRef}
                >   
                    <div className='top-0 w-full flex items-center'>
                        <div className='flex-grow text-center font-bold text-2xl'>
                            <h1>Event Details</h1>
                        </div>
                        <button className='float-right btn btn-ghost rounded-full' onClick={handleClosePopup}>
                            <XIcon className='w-4 h-4'/>
                        </button>
                    </div>
                    
                    <div className='overflow-x-auto'>
                        <table className='table font-times-new-roman text-sm'>
                            <tbody>
                                <tr>
                                    <th>Calendar</th>
                                    <td>{selectedEvent.name}</td>
                                </tr>
                                <tr>
                                    <th>Date</th>
                                    <td>{new Date(selectedEvent.start).toLocaleDateString()}</td>
                                </tr>
                                <tr>
                                    <th>Time</th>
                                    <td>{new Date(selectedEvent.start).toLocaleTimeString()}</td>
                                </tr>
                                <tr>
                                    <td><button className='btn btn-primary' onClick={goToCalendar}>Go To Calendar</button></td>
                                    <td><button className='btn btn-error' onClick={leaveEvent}>Leave Event</button></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BigCalendar;