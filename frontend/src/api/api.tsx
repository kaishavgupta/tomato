import axios from "axios";

export const authService = axios.create({
  baseURL: "http://localhost:3000/",
  withCredentials: true,
});

export const fetch_User = async () => {
  try {
    const data = await authService.get(`api/auth/user_profile`, {
    });
    console.log(data);
  } catch (error) {
    console.log(`Error From fetch_user ${error}`);
  }
};
