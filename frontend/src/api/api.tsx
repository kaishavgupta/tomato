import axios from "axios";

export const authService = axios.create({
  baseURL: "http://localhost:3000/",
  withCredentials: true,
});

export const fetch_User = async () => {
  try {
    const response = await authService.get(`api/auth/user_profile`, {
    });
    console.log(response);
    
    return response.data
  } catch (error) {
    console.log(`Error From fetch_user ${error}`);
    throw error
  }
};
