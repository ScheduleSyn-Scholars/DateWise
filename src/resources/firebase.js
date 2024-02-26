import firebase from 'firebase/compat/app';
import 'firebase/compat/auth'; // Import the authentication module
import 'firebase/compat/firestore';

const firebaseConfig = {
    apiKey: 'AIzaSyDxaF7YXlPGMvKhkd273GtGxAe83lRPViQ',
    authDomain: 'ggcbeartrack.firebaseapp.com',
    databaseURL: 'https://ggcbeartrack-default-rtdb.firebaseio.com',
    projectId: 'ggcbeartrack',
    storageBucket: 'ggcbeartrack.appspot.com',
    messagingSenderId: '579132941046',
    appId: '1:579132941046:web:391f29a70ec9c4a7f542d7',
    measurementId: 'G-XYCVV6X503',
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore();

export {
    firebase,
    firestore
}
