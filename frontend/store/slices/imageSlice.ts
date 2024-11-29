import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Define the structure of the image data
interface ImagePayload {
  image: string;
}

// Define the shape of the slice state
interface ImageState {
  isImageUploaded: boolean;
  image: ImagePayload | null;
}

// Define the initial state
const initialState: ImageState = {
  isImageUploaded: false,
  image: null,
};

// Create the slice
const imageSlice = createSlice({
  name: "img",
  initialState,
  reducers: {
    uploadImage(state, action: PayloadAction<ImagePayload>) {
      state.isImageUploaded = true;
      state.image = action.payload;
    },
  },
});

// Export the actions and reducer
export const { uploadImage } = imageSlice.actions;
export default imageSlice.reducer;
