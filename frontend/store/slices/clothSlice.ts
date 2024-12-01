import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Cloth {
  name: string;
  id: string;
  category: string;
  price: string; // Consider changing to `number` if applicable
  sizes: string; // Consider changing to `string[]` if multiple sizes
  color: string;
  thumbnail_path: string;
}

interface ClothState {
  isClothSelected: boolean;
  cloth: Cloth | null;
}

const initialState: ClothState = {
  isClothSelected: false,
  cloth: null,
};

const clothSlice = createSlice({
  name: "cloth",
  initialState,
  reducers: {
    selectCloth(state, action: PayloadAction<Cloth>) {
      state.isClothSelected = true;
      state.cloth = action.payload;
    },
    clearCloth(state) {
      state.isClothSelected = false;
      state.cloth = null;
    },
  },
});

export const { selectCloth, clearCloth } = clothSlice.actions;
export default clothSlice.reducer;
