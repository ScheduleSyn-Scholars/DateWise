import React from 'react';
import {useState, useEffect} from 'react';
import './NewCalendar.css';
import { Link } from 'react-router-dom';
import firebase from '../config/firebase';
import 'firebase/compat/firestore';
import { useUser } from './UserContext';

const NewCalendar = () =>{
  const [inputValue, setInputValue] = useState('');
  const [invitees, setInvitees] = useState([]);

 
  /*
  const [userName, setUserName] = useState('');
  const [email, setEmailAddress] = useState('');
  const [image, setImage] = useState("");

*/

 // const [calendarName, setCalendarName] = useState('');

  const [amountOfEnteredUsers, setAmountOfEnteredUsers] = useState(new Set());
  const [limitMessage, setLimitMessage] = useState(false);


  // const [usernameToCheck, setUsernameToCheck] = useState('');
  // const [emailToCheck, setEmailToCheck] = useState('');
  
  const [addMessage, setAddMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  // ***********************************************************************************************************************

  const user = useUser();

  if (user.imageURL == null){
    user.image = './Screenshot 2023-09-15 at 1.46 1.png';
    console.log("Printing from image addition")
  } else{
    user.image = user.imageURL;
    console.log("Amount of entered users: ", amountOfEnteredUsers);
    console.log("Printing from successful image addition: ",)
  }

  // ***********************************************************************************************************************


  const firestore = firebase.firestore();

/*
  useEffect(() =>{
    const unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      if(user){
        const uuid = user.uid;
        dataReading(uuid);
      }
    });

    
    return () => unregisterAuthObserver();
  }, []);


  const uuid = firebase.auth().currentUser.uid;

  const dataReading = async(uuid) => {
    try{
        const userReference = firestore.collection('users').doc(uuid);
        console.log(uuid);
        const userDoc = await userReference.get();
        if(userDoc.exists){
          console.log('Printing from userDoc: ', userDoc.data);
          const uName = userDoc.data().userName;


          // const userID = userDoc.data().userID;


          const eAddress = userDoc.data().emailAddress;
          const img = userDoc.data().imageURL;

          setUserName(uName);
          setEmailAddress(eAddress);
          
          
        console.log(img)
        if (img == null){
          setImage('./Screenshot 2023-09-15 at 1.46 1.png')
        } else{
          setImage(img);
        }
        
        }else{
          console.log('User document not found.');
        }
    }catch (error){
      console.log('Error loading Firestore document:', error);
    }
  };
  
  console.log(firebase.auth().currentUser.uid);
    dataReading(uuid);
*/


  const handleInputValueChange = (e) => {
    const value = e.target.value;
    setInputValue(value);


    // setUsernameToCheck(value);


    //To reset error message and animation
    setErrorMessage('');
    setIsShaking(false);
  };
  const handleInputKeyDown = (e) =>{
    if(e.key === 'Enter'){
      const value = e.target.value;
      setInputValue(value);


      // setUsernameToCheck(e.target.value);
      // setEmailToCheck(e.target.value);


      //Checking that user doesn't enter their own info when creating calendar
      //But if they do then display an error message
      if(value === user.userName || value === user.email){
        console.log("User email: ", user.email);
        setErrorMessage("You can't enter your own information.");
        setIsShaking(true);
        return;
      }



      //Checking if the user info has already been submitted
      // if(amountOfEnteredUsers.has(value)){
      //   console.log("Amount of entered users: ", amountOfEnteredUsers);
      //   setErrorMessage("You already entered this user info. Try enter someone else.");
      //   setIsShaking(true);
      //   setLimitMessage(true);

      //   setTimeout(() => {
      //     setLimitMessage(false);
      //   }, 5000);
      //   return;
      // }

      //This is to check if an when the user has exceed their limit in adding people
      //It's because like array/arraylist it starts in 0 and counting so 4 but it's 5 numberically
      if(amountOfEnteredUsers.size > 4){
        setErrorMessage("You have reached your limit in adding people please create calendar.");
        setIsShaking(true);
        setLimitMessage(true);
        return;
      }
      
    // Query the Firestore collection for a document with the specified username
    firestore.collection('users')
      .where('userName', '==', value)
      .get()
      .then((querySnapshot) => {
        if (querySnapshot.size > 0) {
          // A document with the specified username exists
        
          console.log("User document exists for username", value);
          // You can access the document using querySnapshot.docs[0]


          const uid = querySnapshot.docs[0].id;



          //Add users to the amountOfEnteredUsers 
          
          if(amountOfEnteredUsers.has(uid)){
            console.log("Amount of entered users: ", amountOfEnteredUsers);
            setErrorMessage("You already entered this user info. Try enter someone else.");
            setIsShaking(true);
            setLimitMessage(true);

            setTimeout(() => {
              setLimitMessage(false);
            }, 5000);
            return;
          } else{
            setAmountOfEnteredUsers((prevSet) => new Set(prevSet).add(uid));
          setAddMessage('Person Added!');
           setInputValue('');

           setTimeout(()=>{
             setAddMessage('');
           }, 5000);
          }

        } else {
          // No document with the specified username, now checks if email exists
          firestore.collection('users')
          .where('emailAddress', '==', value)
          .get()
          .then((emailQuerySnapshot) => {
            if (emailQuerySnapshot.size > 0){

              console.log("User document exists for email:", value);

              const uid = emailQuerySnapshot.docs[0].id;
              



              //Add the user to the amountOfEnteredUsers
              // setAmountOfEnteredUsers((prevSet) => new Set(prevSet).add(value));
              // console.log("Amount of entered users: ", amountOfEnteredUsers);
              // setAddMessage('Person Added!');
              // setInputValue('');

              // setTimeout(()=>{
              //   setAddMessage('');
              //   console.log("Amount of entered users: ", amountOfEnteredUsers);
              // }, 5000);


              if(amountOfEnteredUsers.has(uid)){
                console.log("Amount of entered users: ", amountOfEnteredUsers);
                setErrorMessage("You already entered this user info. Try enter someone else.");
                setIsShaking(true);
                setLimitMessage(true);
    
                setTimeout(() => {
                  setLimitMessage(false);
                }, 5000);
                return;
              } else{
                setAmountOfEnteredUsers((prevSet) => new Set(prevSet).add(uid));
                setAddMessage('Person Added!');
                setInputValue('');
      
                setTimeout(()=>{
                  setAddMessage('');
                }, 5000);
              }
          
            } else{
              //If there no document with store username or email
              console.log("User document does not exist for username or email", value);
              setErrorMessage('Please enter an actual email or username!')
              setIsShaking(true);
        
            }
          })
          .catch((error) =>{
            console.error("Error checking for email: ", error);
          });
        }
      })
      .catch((error) => {
        console.error("Error checking for user document:", error);
        
      });
        

    }
  };

  const handleCreate = () => {
    if (inputValue) {
      // Put the input values into an array to store them before sending an invite link to other users.
      setInvitees([...invitees, inputValue]);
      setInputValue('');
    }
  
    const calendarTitleInput = document.getElementById('CalendarTitle');
    const calendarTitleValue = calendarTitleInput.value;
  
    // Include the creator of the calendar in the list of users
    const creatorUid = firebase.auth().currentUser.uid;
    const updatedAmountOfEnteredUsers = new Set([...Array.from(amountOfEnteredUsers), creatorUid]);
  
    const calendarData = {
      calendarName: calendarTitleValue,
      users: Array.from(updatedAmountOfEnteredUsers),
    };
  
    const docRef = firestore.collection('calendars');
  
    // Add a new document to Firestore
    docRef
      .add(calendarData)
      .then((doc) => {
        console.log('Document written with ID: ', doc.id);
      
      // After successfully adding the calendar document, create the 'availability' sub-collection
      const availabilityRef = docRef.doc(doc.id).collection('availability');
      
      const creatorAvailabilityData = {
        selectedDays: [], // Initialize with an empty array or any default values
        times: {}, // Initialize with an empty object or any default values
      };
      availabilityRef
        .doc(creatorUid) // Use the creator's UID as the document ID within the 'availability' collection
        .set(creatorAvailabilityData)
        .then(() => {
          console.log('Availability sub-collection created for the creator');
        })
        .catch((error) => {
          console.error('Error adding availability document for creator: ', error);
        });
      })

      .catch((error) => {
        console.error('Error adding document: ', error);
      });
  };


  const displayErrorMessage = (message) =>{
    setErrorMessage(message);
    setIsShaking(true);

    //The code to make it disappear after 5 second display
    setTimeout(() => {
      setErrorMessage('Please enter an actual email/username!');
      setIsShaking(false);
    }, 5000);
  };


  // console.log(firebase.auth().currentUser.uid);
  // dataReading(uuid);


/*
  const calendarStyle = {
    width: '100%',
    height: '600px',
    border: '1px solid #A0A0A0',
  };
  */

  const handleInputFocus = () => {
    setInputValue(''); // Clear the input value when focused
  };

  const imageStyle = {
    width: '215px',
    height: '200px',
    boxShadow: '0 0 0 rgba(0, 0, 0, 0.25)',
    borderRadius: '50%',
    border: '2px solid #DADADA',
    position: 'relative',
    top: '7px',
    left: '45px',
  };

  const nameStyle = {
    left: '50px',
    position: 'relative',
    margintop: '25px',
    color: '#7B7B7B',
    fontSize: '35px',
    fontFamily: 'Times New Roman, Times, Serif',
    fontWeight: '500',
    wordWrap: 'break-word',
  };

  const subjectStyle = {
    left: '450px',
    top: '95px',
    position: 'absolute',
    color: '#696969',
    fontSize: '45px',
    fontFamily: 'Inter',
    fontWeight: '700',
    wordWrap: 'break-word',
  };

  
  return(

    <div>
      

        <div className='left-side-panel'> 
        
      
        <div style={subjectStyle} > <input
        placeholder='       Calendar Title'
        type = 'text'
        className='Calendar-title-input'
        id = "CalendarTitle"
        >
        </input>
        <div className='addPeople'>
          <input type='text' style={{fontSize : '35px', border : 'none', fontFamily : 'Times New Roman, Times, serif', color : 'grey', background : 'transparent', outline : 'none'}}
          placeholder='   Enter email to invite'
          value = {inputValue}
          onChange={handleInputValueChange}
          onKeyDown={handleInputKeyDown}
          onFocus={handleInputFocus}
          className = {isShaking ? 'shake' : ''}
          ></input>
          {errorMessage && <div className = "error-message">{errorMessage}</div>}
          {limitMessage && <div className = "limit-message">{limitMessage}</div>}
          {addMessage && <div className = "add-message">{addMessage}</div>}
        </div>
        </div>
        <button className = "create-btn" onClick={handleCreate}>
          Create
          </button>
          <Link to = "/HomePage"> <button className='buttons'>Homepage</button>  </Link>  

          </div>
  
    
      </div>
  );
  
  };


export default NewCalendar;

