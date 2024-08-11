import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { RootState } from '../store';

export interface InterestState {
    interests: string[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: InterestState = {
    interests: [],
    status: 'idle',
    error: null,
};

// Async thunk for fetching interests
export const fetchInterest = createAsyncThunk('interests/fetchInterest', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No token found');
    }

    const response = await axios.get('http://127.0.0.1:8787/api/v1/update/me', {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response.data.user.interests;
});

const interestSlice = createSlice({
    name: 'interests',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchInterest.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(fetchInterest.fulfilled, (state, action: PayloadAction<string[]>) => {
                state.status = 'succeeded';
                state.interests = action.payload;
            })
            .addCase(fetchInterest.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.error.message || 'Something went wrong';
            });
    },
});

export default interestSlice.reducer;

// Selectors
export const selectAllInterests = (state: RootState) => state.interests.interests;
export const selectInterestStatus = (state: RootState) => state.interests.status;
export const selectInterestError = (state: RootState) => state.interests.error;
