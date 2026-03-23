import axios from "axios";

// ✅ restaurant service runs on port 3003 (separate from user service on 3001)
export const restaurantService = axios.create({
  baseURL: "http://localhost:4000/",
  withCredentials: true,
});

// ✅ restaurant index.ts mounts routes under /api/auth → /api/auth/my-restaurant
export const fetch_Myrestaurant = async () => {
  try {
    const response = await restaurantService.get("api/restaurant/my-restaurant");
    return response.data;
  } catch (error: any) {
    throw error.response?.data || new Error("Network Error");
  }
};

// ✅ restaurant index.ts mounts routes under /api/auth → /api/auth/new-restaurant
export const create_restaurant = async (formData: FormData) => {
  try {
    const response = await restaurantService.post(
      "api/restaurant/new-restaurant",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || new Error("Network Error");
  }
};

export const close_Restaurant=async(open:boolean)=>{
  try {    
    const response=await restaurantService.post(`api/restaurant/close-restaurant/?open=${open}`)
    return response.data
  } catch (error:any) {
    console.log(error);
    
    throw error.response?.data || new Error("Network Error");
  }
}

export const update_Restaurant=async(formData:FormData,public_id:string)=>{
  try {
    const response = await restaurantService.patch(
      `api/restaurant/restaurent_update/${public_id}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return response.data;
  } catch (error: any) {
    throw error?.response?.data || new Error("Network Error");
  }
}


export const delete_Restaurant=async()=>{
  try {
    
    const response = await restaurantService.delete(`api/restaurant/delete-restaurent`)
    return response.data
  } catch (error) {
    throw error?.response?.data || new Error("Network Error");
  }
}

export const pause_Restaurent=async(pauseRestaurent:boolean)=>{
   try {
    const response=await restaurantService.patch('api/restaurant/pause-Restaurent',{
      pauseRestaurent
    })
    return response.data
  } catch (error) {
    throw error?.response?.data || new Error("Network Error");
  }
}