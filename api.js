import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

export const validatePassengersAPI = (data) =>
  API.post("/api/validate-passengers", data);

export const validateContactAPI = (data) =>
  API.post("/api/validate-contact", data);

export const createReservationAPI = (data) =>
  API.post("/api/create-reservation", data);

export default API;
