import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Footer from './components/Footer';
import Login from './pages/Login';
import ViewCalendar from './pages/ViewCalendar';
import Registration from './pages/Registration';
import Homepage from './pages/HomePage';
import { UserProvider } from './resources/UserContext';

function App() {
    return (
        <Router>
            <UserProvider>
                <div className="flex h-screen w-screen flex-col">
                    <Routes>
                        <Route path="/" element={<Login />} />
                        <Route path="/sign-up" element={<Registration />} />
                        <Route path="/homepage" element={<Homepage />} />
                        <Route
                            path="/ViewCalendar/:calendarId/:calendarName"
                            element={<ViewCalendar />}
                        />
                    </Routes>
                    <Footer />
                </div>
            </UserProvider>
        </Router>
    );
}

export default App;
