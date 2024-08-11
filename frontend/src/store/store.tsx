import { configureStore } from '@reduxjs/toolkit';
import interestReducer, { InterestState } from './Slices/interestSlice';
// Configure the store with your reducers
export const store = configureStore({
    reducer: {
        interests: interestReducer,
    },
});

// Define the RootState type from the store itself
export type RootState ={
    interests:InterestState
}

// Define the AppDispatch type from the store's dispatch function
export type AppDispatch = typeof store.dispatch;
