import React, { useState } from 'react';
import NotificationBell from './NotificationBell';
import UserProfileModal from './UserProfile.js';
import { Link } from 'react-router-dom';

const Header = () => {
    const [isProfileOpen, setIsProfileOpen] = useState(false);

    return (
        <header className="flex w-full items-center bg-green-800 px-2 py-2 text-white">
            <Link className='flex items-center' to='/HomePage'>
                <img src="/BearLogo.png" alt="Logo.png" className="h-20 w-auto" />
                <p className="font m1-auto text-4xl">DateWise</p>
            </Link>

            <div className="flex-grow"></div>

            <div className="flex items-center space-x-5 pr-5">
                <NotificationBell />
                <UserProfileModal
                    isOpen={isProfileOpen}
                    setIsOpen={setIsProfileOpen}
                />
            </div>
        </header>
    );
};

export default Header;
