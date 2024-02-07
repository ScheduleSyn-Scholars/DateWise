import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import ViewCalendar from './pages/ViewCalendar'
import Registration from './pages/Registration'
import Homepage from './pages/HomePage'
import MyProfile from './pages/MyProfile'
import NewCalendar from './pages/NewCalendar'
import { UserProvider } from './pages/UserContext'
import { NotificationsProvider } from './components/NotificationsContext'

function App() {
    return (
        <Router>
            <UserProvider>
                <div className="App">
                    <Header />
                    <NotificationsProvider>
                        <Routes>
                            <Route path="/" element={<Login />} />
                            <Route path="/sign-up" element={<Registration />} />
                            <Route path="/homepage" element={<Homepage />} />
                            <Route path="/MyProfile" element={<MyProfile />} />
                            <Route
                                path="/ViewCalendar/:calendarId/:calendarName"
                                element={<ViewCalendar />}
                            />
                            <Route
                                path="/NewCalendar"
                                element={<NewCalendar />}
                            />
                        </Routes>
                    </NotificationsProvider>
                    <Footer />
                </div>
            </UserProvider>
        </Router>
    )
}

export default App
