
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type{ Partner } from '../types/partners';
import { api } from '../services/api';
import axios from 'axios';

interface PartnersState {
  partners: Partner[];
  meta: Record<string, unknown> | null;
  loading: 'idle' | 'pending' | 'succeeded' | 'failed';
  error: string | null;
  formErrors: Record<string, string[]>;
}

const initialState: PartnersState = {
  partners: [],
  meta: null,
  loading: 'idle',
  error: null,
  formErrors: {},
};

// --- THUNKS ASYNCHRONES ---

export const fetchPartners = createAsyncThunk(
  'partners/fetchPartners',
  async ({ filters, page }: { filters: Record<string, string | number | boolean | undefined>; page: number }) => {
    const response = await api.getPartners(filters, page);
    console.log(response);
    
    return response;
  }
);

export const addPartner = createAsyncThunk(
  'partners/addPartner',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await api.addPartner(data);
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response && err.response.status === 422) {
        return rejectWithValue(err.response.data.errors);
      }
      throw err;
    }
  }
);

export const updatePartner = createAsyncThunk(
  'partners/updatePartner',
  async ({ id, data }: { id: number; data: FormData }, { rejectWithValue }) => {
    try {
      const response = await api.updatePartner(id, data);
      return response.data;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response && err.response.status === 422) {
        return rejectWithValue(err.response.data.errors);
      }
      throw err;
    }
  }
);

export const deletePartner = createAsyncThunk(
  'partners/deletePartner',
  async (ids: number[]) => {
    await api.deletePartners(ids);
    return ids;
  }
);

// --- SLICE ---

const partnersSlice = createSlice({
  name: 'partners',
  initialState,
  reducers: {
    clearFormErrors(state) {
        state.formErrors = {};
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Partners
      .addCase(fetchPartners.pending, (state) => {
        state.loading = 'pending';
      })
      .addCase(fetchPartners.fulfilled, (state, action) => {
        state.loading = 'succeeded';
        state.partners = action.payload.data;
        state.meta = action.payload.meta ?? null;
      })
      .addCase(fetchPartners.rejected, (state, action) => {
        state.loading = 'failed';
        state.error = action.error.message || 'Failed to fetch partners';
      })
      // Add Partner
      .addCase(addPartner.fulfilled, (state, action: PayloadAction<Partner>) => {
        state.partners.unshift(action.payload); // Ajoute au début de la liste
        state.formErrors = {};
      })
      .addCase(addPartner.rejected, (state, action) => {
        state.formErrors = action.payload as Record<string, string[]>;
      })
      // Update Partner
      .addCase(updatePartner.fulfilled, (state, action: PayloadAction<Partner>) => {
        const index = state.partners.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.partners[index] = action.payload;
        }
        state.formErrors = {};
      })
       .addCase(updatePartner.rejected, (state, action) => {
        state.formErrors = action.payload as Record<string, string[]>;
      })
      // Delete Partner
      .addCase(deletePartner.fulfilled, (state, action: PayloadAction<number[]>) => {
        state.partners = state.partners.filter(p => !action.payload.includes(p.id));
      });
  },
});

export const { clearFormErrors } = partnersSlice.actions;
export default partnersSlice.reducer;
