import firebase from 'firebase'
require('@firebase/firestore')

const firebaseConfig = {
    apiKey: "AIzaSyBaFJ-HL9Fkg5Itj5H5WzBguc1g-0EEBsc",
    authDomain: "wily-5e0a8.firebaseapp.com",
    projectId: "wily-5e0a8",
    storageBucket: "wily-5e0a8.appspot.com",
    messagingSenderId: "573821618879",
    appId: "1:573821618879:web:04cc0b635f3040ce00140a"
  };
  // Initialize Firebase
  if(!firebase.apps.length)
  firebase.initializeApp(firebaseConfig);

  export default firebase.firestore();