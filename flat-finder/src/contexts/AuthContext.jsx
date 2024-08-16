import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const refreshCurrentUser = async () => {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setCurrentUser({
          uid: auth.currentUser.uid,
          email: auth.currentUser.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          isAdmin: userData.isAdmin || false, // Ensure isAdmin is included
        });
      }
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({
            uid: user.uid,
            email: user.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isAdmin: userData.isAdmin || false, // Ensure isAdmin is included
          });
        }
      } else {
        setCurrentUser(null);
      }
    });
  
    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user: currentUser, refreshCurrentUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
