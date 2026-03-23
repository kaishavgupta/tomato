import axios from "axios";

// ✅ Bug 1 fixed: removed space in URL
// ✅ Bug 2 fixed: $${long} → ${long}
export const getUserLocation = async (lat: number, long: number) => {
  try {
    const location = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`,
      {
        headers: {
          "Accept-Language": "en",
        },
      }
    );
    return location.data;
  } catch (error) {
    console.log(`Error from getUserLocation: ${error}`);
    throw error;
  }
};

export const updateUserLocation = async (location: string) => {
  try {
    return location;
  } catch (error) {
    console.log(`Error from updateUserLocation: ${error}`);
    throw error;
  }
};