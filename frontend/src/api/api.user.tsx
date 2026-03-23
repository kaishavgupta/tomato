import axios from "axios";
import type { roles } from "../types/user.type";

export const authService = axios.create({
  baseURL: "http://localhost:3000/",
  withCredentials: true,
});

export const fetch_User = async () => {
  try {
    const response = await authService.get(`api/auth/user_profile`, {
    });    
    return response?.data
  } catch (error) {
    console.log(`Error From fetch_user ${error}`);
    throw error
  }
};


export const add_role=async(role:roles)=>{
  try {
    const response = await authService.post(`api/auth/add_role`,{role});    
    return response
  } catch (error) {
    console.log(error);
    throw error
  }
}

export const user_logOut=async()=>{
  try {
    const response=  await authService.post("/api/auth/logout");
    return response;
  } catch (error) {
    console.log(error);
    throw error
  }
}