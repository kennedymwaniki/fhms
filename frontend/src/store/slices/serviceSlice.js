import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  services: [],
  selectedService: null,
  pricing: {
    basicFuneral: 5000,
    premiumFuneral: 8000,
    cremation: 3000,
    burial: 4000,
  },
  loading: false,
  error: null,
};

const serviceSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    fetchServicesStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchServicesSuccess: (state, action) => {
      state.loading = false;
      state.services = action.payload;
    },
    fetchServicesFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    addService: (state, action) => {
      state.services.push(action.payload);
    },
    updateService: (state, action) => {
      const index = state.services.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.services[index] = action.payload;
      }
    },
    deleteService: (state, action) => {
      state.services = state.services.filter(s => s.id !== action.payload);
    },
    updatePricing: (state, action) => {
      state.pricing = { ...state.pricing, ...action.payload };
    }
  },
});

export const {
  fetchServicesStart,
  fetchServicesSuccess,
  fetchServicesFailure,
  setSelectedService,
  addService,
  updateService,
  deleteService,
  updatePricing,
} = serviceSlice.actions;

export default serviceSlice.reducer;