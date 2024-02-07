const React = require('react')
const { render, screen } = require('@testing-library/react')
const userEvent = require('@testing-library/user-event')
const { act } = require('react-dom/test-utils')
const Form = require('../pages/Registration')

// Mocking the react-router-dom useNavigate hook
jest.mock('react-router-dom', () => ({
    useNavigate: () => jest.fn(),
}))

// Mocking firebase methods
jest.mock('../config/firebase', () => ({
    firestore: jest.fn(() => ({
        collection: jest.fn(() => ({
            doc: jest.fn(() => ({
                set: jest.fn(() => Promise.resolve()),
            })),
        })),
    })),
    auth: jest.fn(() => ({
        createUserWithEmailAndPassword: jest.fn(() =>
            Promise.resolve({ user: { uid: 'testUid' } }),
        ),
    })),
}))

describe('Registration Form', () => {
    it('submits the form and navigates to home screen', async () => {
        render(React.createElement(Form))

        // Fill in the form
        userEvent.type(screen.getByLabelText(/id/i), '900898976')
        userEvent.type(screen.getByLabelText(/first name/i), 'Jackie')
        userEvent.type(screen.getByLabelText(/last name/i), 'Longhorn')
        userEvent.type(screen.getByLabelText(/email/i), 'jlonghorn@ggc.edu')
        userEvent.type(screen.getByLabelText(/password/i), 'Thatiswork90*()')

        // Mock the signUp function to ensure it gets called
        const signUpMock = jest.fn()
        jest.spyOn(Form.prototype, 'signUp').mockImplementation(signUpMock)

        // Submit the form
        userEvent.click(screen.getByText(/sign up/i))

        // Wait for async operations to complete
        await act(async () => {
            await Promise.resolve()
        })

        // Assert that the signUp function was called
        expect(signUpMock).toHaveBeenCalled()

        // Assert that the form data was logged
        expect(console.log).toHaveBeenCalledWith({
            id: '900898976',
            firstName: 'Jackie',
            lastName: 'Longhorn',
            email: 'jlonghorn@ggc.edu',
            password: 'Thatiswork90*()',
            userName: 'jlonghorn',
        })

        // Assert that the navigate function was called with the correct argument
        expect(useNavigate()).toHaveBeenCalledWith('/')

        // Assert that the registration alert was called
        expect(window.alert).toHaveBeenCalledWith('Register Successfully')
    })
})
