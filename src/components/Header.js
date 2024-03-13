import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../resources/firebase';
import { useUser } from '../resources/UserContext';
import NotificationBell from './NotificationBell';
import UserProfileModal from './UserProfile.js';

const Header = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="flex w-full items-center bg-green-800 px-2 py-2 text-white">
            <img src="/BearLogo.png" alt="Logo.png" className="h-28 w-auto" />

            <p className="font m1-auto text-5xl">DateWise</p>

            <div className="flex-grow"></div>
            <div class="flex items-center space-x-5">
                <NotificationBell />
                <UserProfileModal isOpen={isProfileOpen} setIsOpen={setIsProfileOpen}/>
            </div>
        </header>
    );
};

export default Header;
