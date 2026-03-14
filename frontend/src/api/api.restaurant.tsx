import axios from "axios";

// ✅ restaurant service runs on port 3003 (separate from user service on 3001)
export const restaurantService = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true,
});

// ✅ restaurant index.ts mounts routes under /api/auth → /api/auth/my-restaurant
export const fetch_Myrestaurant = async () => {
  try {
    const response = await restaurantService.get("api/auth/my-restaurant");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};

// ✅ restaurant index.ts mounts routes under /api/auth → /api/auth/new-restaurant
export const create_restaurant = async (formData: FormData) => {
  try {
    const response = await restaurantService.post(
      "api/auth/new-restaurant",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || new Error("Network Error");
  }
};

export const close_Restaurant=async(openClose:boolean)=>{
  try {
    const response=await restaurantService.post("api/auth/close-restaurant",openClose)
    
    return response.data
  } catch (error:any) {
    console.log(error);
    
    throw error.response?.data || new Error("Network Error");
  }
}