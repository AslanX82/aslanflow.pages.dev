
import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (pb.authStore.isValid) {
        try {
          await pb.collection('users').authRefresh();
          setCurrentUser(pb.authStore.model);
        } catch (error) {
          pb.authStore.clear();
          setCurrentUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(model);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const authData = await pb.collection('users').authWithPassword(email, password, { $autoCancel: false });
    setCurrentUser(authData.record);
    return authData;
  };

  const signup = async (email, password, passwordConfirm) => {
    const record = await pb.collection('users').create({
      email,
      password,
      passwordConfirm,
    }, { $autoCancel: false });
    
    // Auto login after signup
    await login(email, password);
    return record;
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
