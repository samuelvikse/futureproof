// Firebase Configuration for FutureProof Studio
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where, orderBy } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBqUlaPVNNqp0L9V6stXHdhRBdbCPdIp_Y",
  authDomain: "futureproof-studio.firebaseapp.com",
  projectId: "futureproof-studio",
  storageBucket: "futureproof-studio.firebasestorage.app",
  messagingSenderId: "42153080653",
  appId: "1:42153080653:web:c7052e668dd0372a28a904"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Projects Collection Reference
const projectsRef = collection(db, 'projects');

// Upload image to Firebase Storage
async function uploadProjectImage(file) {
  try {
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `projects/${timestamp}_${safeName}`;
    const storageRef = ref(storage, fileName);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

// Fetch all projects
async function getProjects() {
  try {
    const snapshot = await getDocs(query(projectsRef, orderBy('order', 'asc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

// Fetch featured projects (for homepage)
async function getFeaturedProjects() {
  try {
    const snapshot = await getDocs(query(projectsRef, where('showOnHomepage', '==', true), orderBy('order', 'asc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error('Error fetching featured projects:', error);
    return [];
  }
}

// Add a new project
async function addProject(project) {
  try {
    const docRef = await addDoc(projectsRef, {
      ...project,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding project:', error);
    throw error;
  }
}

// Update a project
async function updateProject(projectId, data) {
  try {
    const projectDoc = doc(db, 'projects', projectId);
    await updateDoc(projectDoc, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
}

// Delete a project
async function deleteProject(projectId) {
  try {
    const projectDoc = doc(db, 'projects', projectId);
    await deleteDoc(projectDoc);
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
}

// Auth functions
async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

async function logout() {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
}

function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback);
}

// Export everything
export {
  db,
  auth,
  storage,
  getProjects,
  getFeaturedProjects,
  addProject,
  updateProject,
  deleteProject,
  uploadProjectImage,
  login,
  logout,
  onAuthChange
};
