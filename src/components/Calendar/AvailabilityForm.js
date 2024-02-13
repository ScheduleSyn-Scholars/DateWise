import React, { useState } from 'react';

const add30Minutes = (time) => {
    const [hours, minutes] = time.split(':');
    let totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + 30;

    // Ensure the total minutes is a multiple of 30
    totalMinutes = Math.ceil(totalMinutes / 30) * 30;

    const newHours = Math.floor(totalMinutes / 60);
    const newMinutes = totalMinutes % 60;

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
};

const AvailabilityForm = ({ onAvailabilityChange }) => {
    const [selectedDays, setSelectedDays] = useState([]);
    const [times, setTimes] = useState({});

    const handleDayToggle = (day) => {
        const newSelectedDays = [...selectedDays];
        let newTimes = { ...times };

        if (newSelectedDays.includes(day)) {
            // Day is already selected, remove it
            newSelectedDays.splice(newSelectedDays.indexOf(day), 1);
            delete newTimes[day];
        } else {
            // Day is not selected, add it with default times
            newSelectedDays.push(day);
            newTimes = {
                ...newTimes,
                [day]: [{ start: '09:00', end: '17:00' }],
            };
        }

        setSelectedDays(newSelectedDays);
        setTimes(newTimes);
        onAvailabilityChange({
            selectedDays: newSelectedDays,
            times: newTimes,
        });
    };

    const handleTimeChange = (day, index, timeType, value) => {
        const newTimes = { ...times };
        newTimes[day][index][timeType] = value;
        setTimes(newTimes);
        onAvailabilityChange({ selectedDays, times });
    };

    const handleAddTimeSlot = (day) => {
        const newTimes = { ...times };
        newTimes[day] = newTimes[day] || [];

        // Find the last time slot
        const lastTimeSlot = newTimes[day][newTimes[day].length - 1];

        // Initialize start and end times with 30-minute increments or defaults if NaN
        const defaultStartTime = lastTimeSlot
            ? add30Minutes(lastTimeSlot.end)
            : '09:00';
        const defaultEndTime = lastTimeSlot
            ? add30Minutes(lastTimeSlot.end)
            : '09:30';

        newTimes[day].push({ start: defaultStartTime, end: defaultEndTime });
        setTimes(newTimes);
        onAvailabilityChange({ selectedDays, times });
    };

    const handleRemoveTimeSlot = (day, index) => {
        const newTimes = { ...times };
        newTimes[day].splice(index, 1);
        setTimes(newTimes);
        onAvailabilityChange({ selectedDays, times });
    };

    return (
        <div className="flex flex-col items-start w-[90%] max-w-[500px] bg-[#f8f8f8] shadow-[0_0_10px_rgba(0,0,0,0.1)] m-5 p-5 rounded-[10px] border-2 border-solid border-[#228b22]">
            <h2 className="text-[#228b22] text-2xl mb-5">Select Your Availability</h2>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="flex items-baseline">
                    <label className="w-[75px] flex items-center text-base font-[bold] mb-2.5">
                        <input
                            type="checkbox"
                            checked={selectedDays.includes(day)}
                            onChange={() => handleDayToggle(day)}
                            className='w-[15px] h-[15px] mr-2.5'
                        />
                        {day}
                    </label>
                    {selectedDays.includes(day) && (
                        <div className="flex items-baseline">
                            {times[day]?.map((timeSlot, index) => (
                                <div key={index} className="flex items-center mb-2.5">
                                    <label className="w-[125px] flex items-center text-base font-[bold] mb-2.5">
                                        <input
                                            type="time"
                                            value={timeSlot.start}
                                            onChange={(e) =>
                                                handleTimeChange(
                                                    day,
                                                    index,
                                                    'start',
                                                    e.target.value,
                                                )
                                            }
                                            step="1800"
                                            className='h-10 w-[150%] mx-[1vw]'
                                        />
                                    </label>
                                    <label className="w-[125px] flex items-center text-base font-[bold] mb-2.5">
                                        -
                                        <input
                                            type="time"
                                            value={timeSlot.end}
                                            onChange={(e) =>
                                                handleTimeChange(
                                                    day,
                                                    index,
                                                    'end',
                                                    e.target.value,
                                                )
                                            }
                                            step="1800"
                                            className='h-10 w-[150%] mx-[1vw]'
                                        />
                                    </label>
                                    <button
                                        className="ml-[-1vw] bg-[#f8f8f8] text-[#747474] text-[larger] cursor-pointer mb-2.5 px-3 py-2 border-[none] hover:bg-[#85ab86] hover:rounded-[10px] mr-[1.5vw]"
                                        onClick={() =>
                                            handleRemoveTimeSlot(day, index)
                                        }>
                                        x
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex flex-col mt-2.5">
                        {selectedDays.includes(day) && (
                            <button
                                onClick={() => handleAddTimeSlot(day)}
                                className="font-bold ml-auto bg-[#f8f8f8] text-[#747474] text-[larger] cursor-pointer mb-2.5 px-3 py-2 border-[none] hover:bg-[#85ab86] hover:rounded-[10px] mr-[1.5vw]">
                                +
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default AvailabilityForm;
