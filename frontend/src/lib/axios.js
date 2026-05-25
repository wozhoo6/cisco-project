import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://192.168.8.15:3000/api/v1",
  withCredentials: true,
});

export default axiosInstance;
