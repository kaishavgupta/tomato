import axios from "axios";

export const authService = axios.create({ baseURL: "http://localhost:3000/" });
