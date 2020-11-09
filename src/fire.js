import firebase from 'firebase'
var config = {
    apiKey: "AIzaSyAwMyWeFpRwrrUfSOa5dyNiWu1xe20omRU",
    authDomain: "todo-993bc.firebaseapp.com",
    databaseURL: "https://todo-993bc.firebaseio.com",
    projectId: "todo-993bc",
    storageBucket: "todo-993bc.appspot.com",
    messagingSenderId: "577773433420",
    appId: "1:577773433420:web:4862ca379016740cfa7ae9",
    measurementId: "G-DRBGL9VD6S"
  };
var fire = firebase.initializeApp(config);
export default fire;