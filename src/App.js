import React from "react";
import firebase from "firebase";
import { config } from "./components/Firebase/firebase.js";

firebase.initializeApp(config);

var db = firebase.firestore();
function App() {
  return (
    <div>
      <button
        onClick={() =>
          db
            .collection("matches")
            .get()
            .then(querySnapshot => {
              querySnapshot.forEach(doc => {
                console.log(doc.data());
              });
            })
        }
      >
        CLICK ME
      </button>
    </div>
  );
}

export default App;
