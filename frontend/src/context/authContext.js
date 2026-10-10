import axios from "axios";
import { createContext, useEffect, useReducer } from "react";

const INITIAL_STATE = {
  user: (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  })(),
  loading: false,
  error: null,
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { user: state.user, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return { user: action.payload, loading: false, error: null };
    case "LOGIN_FAILURE":
      return { user: null, loading: false, error: action.payload };
    case "LOGOUT":
      return { user: null, loading: false, error: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);

  useEffect(() => {
    if (state.user) localStorage.setItem("user", JSON.stringify(state.user));
    else localStorage.removeItem("user");
  }, [state.user]);

  const logout = async () => {
    try {
      await axios.post("auth/logout");
    } catch (error) {
      // Clear the local session even if the API is temporarily unavailable.
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  return (
    <AuthContext.Provider value={{ user: state.user, loading: state.loading, error: state.error, dispatch, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
