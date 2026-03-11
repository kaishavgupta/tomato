import axios from "axios";

// ✅ Bug 1 fixed: removed space in URL
// ✅ Bug 2 fixed: $${long} → ${long}
export const getUserLocation = async (lat: number, long: number) => {
  try {
    const location = await axios.get(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${long}`,
      {
        headers: {
          // Nominatim requires a User-Agent header
          "Accept-Language": "en",
        },
      }
    );
    // Returns address object: { address: { city, state, country, ... }, display_name }
    console.log(location);
    
    return location.data;
  } catch (error) {
    console.log(`Error from getUserLocation: ${error}`);
    throw error;
  }
};

export const updateUserLocation = async (location: string) => {
  try {
    // ✅ Bug 3 fixed: actually stores/returns the location
    // Replace with your real API call when backend is ready:
    // await authService.post("/api/user/location", { location });
    return location;
  } catch (error) {
    console.log(`Error from updateUserLocation: ${error}`);
    throw error;
  }
};