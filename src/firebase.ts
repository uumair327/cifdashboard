import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJKvh4ZXb3npq8cL9-mk-kDlSIUO6VppU",
  authDomain: "guardiancare-a210f.firebaseapp.com",
  databaseURL: "https://guardiancare-a210f-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "guardiancare-a210f",
  storageBucket: "guardiancare-a210f.appspot.com",
  messagingSenderId: "331315801686",
  appId: "1:331315801686:web:c30800beace354e27595f7",
  measurementId: "G-X5JBB7DYL9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
