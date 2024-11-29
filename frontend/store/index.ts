import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import imageReducer from "./slices/imageSlice"

// Function to load the state from localStorage
const loadFromLocalStorage = () => {
    if (typeof window === "undefined") {
        // Return undefined during SSR
        return undefined;
    }
    try {
        const serializedState = localStorage.getItem("authState");
        return serializedState ? JSON.parse(serializedState) : undefined;
    } catch (error) {
        console.error("Failed to load state from localStorage", error);
        return undefined;
    }
};

const saveToLocalStorage = (state: any) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem("authState", serializedState);
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
};

// Preload state from localStorage for client-side only
const preloadedState = loadFromLocalStorage();

export const store = configureStore({
    reducer: {
        auth: authReducer,
        image: imageReducer,
    },
    preloadedState: {
        auth: preloadedState || undefined,
        image: preloadedState || undefined,
    },
});

// Subscribe to store changes to persist state to localStorage
if (typeof window !== "undefined") {
    store.subscribe(() => {
        saveToLocalStorage(store.getState().auth);
    });
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
