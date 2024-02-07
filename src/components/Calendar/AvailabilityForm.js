import React, { useState } from 'react'
import './AvailabilityForm.css'

const add30Minutes = (time) => {
    const [hours, minutes] = time.split(':')
    let totalMinutes = parseInt(hours) * 60 + parseInt(minutes) + 30

    // Ensure the total minutes is a multiple of 30
    totalMinutes = Math.ceil(totalMinutes / 30) * 30

    const newHours = Math.floor(totalMinutes / 60)
    const newMinutes = totalMinutes % 60

    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`
}

const AvailabilityForm = ({ onAvailabilityChange }) => {
    const [selectedDays, setSelectedDays] = useState([])
    const [times, setTimes] = useState({})

    const handleDayToggle = (day) => {
        const newSelectedDays = [...selectedDays]
        let newTimes = { ...times }

        if (newSelectedDays.includes(day)) {
            // Day is already selected, remove it
            newSelectedDays.splice(newSelectedDays.indexOf(day), 1)
            delete newTimes[day]
        } else {
            // Day is not selected, add it with default times
            newSelectedDays.push(day)
            newTimes = {
                ...newTimes,
                [day]: [{ start: '09:00', end: '17:00' }],
            }
        }

        setSelectedDays(newSelectedDays)
        setTimes(newTimes)
        onAvailabilityChange({ selectedDays: newSelectedDays, times: newTimes })
    }

    const handleTimeChange = (day, index, timeType, value) => {
        const newTimes = { ...times }
        newTimes[day][index][timeType] = value
        setTimes(newTimes)
        onAvailabilityChange({ selectedDays, times })
    }

    const handleAddTimeSlot = (day) => {
        const newTimes = { ...times }
        newTimes[day] = newTimes[day] || []

        // Find the last time slot
        const lastTimeSlot = newTimes[day][newTimes[day].length - 1]

        // Initialize start and end times with 30-minute increments or defaults if NaN
        const defaultStartTime = lastTimeSlot
            ? add30Minutes(lastTimeSlot.end)
            : '09:00'
        const defaultEndTime = lastTimeSlot
            ? add30Minutes(lastTimeSlot.end)
            : '09:30'

        newTimes[day].push({ start: defaultStartTime, end: defaultEndTime })
        setTimes(newTimes)
        onAvailabilityChange({ selectedDays, times })
    }

    const handleRemoveTimeSlot = (day, index) => {
        const newTimes = { ...times }
        newTimes[day].splice(index, 1)
        setTimes(newTimes)
        onAvailabilityChange({ selectedDays, times })
    }

    return (
        <div className="form">
            <h2 className="form-title">Select Your Availability</h2>
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map((day) => (
                <div key={day} className="day-container">
                    <label className="day-lab">
                        <input
                            type="checkbox"
                            checked={selectedDays.includes(day)}
                            onChange={() => handleDayToggle(day)}
                        />
                        {day}
                    </label>
                    {selectedDays.includes(day) && (
                        <div className="time-container">
                            {times[day]?.map((timeSlot, index) => (
                                <div key={index} className="time-slot">
                                    <label className="time-input">
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
                                        />
                                    </label>
                                    <label className="time-input">
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
                                        />
                                    </label>
                                    <button
                                        className="remove-time-button"
                                        onClick={() =>
                                            handleRemoveTimeSlot(day, index)
                                        }
                                    >
                                        x
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="additional-times">
                        {selectedDays.includes(day) && (
                            <button
                                onClick={() => handleAddTimeSlot(day)}
                                className="add-time-button"
                            >
                                +
                            </button>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default AvailabilityForm
