import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:9000/api",
});

export const validatePassengersAPI = (data) =>
  API.post("/validate-passengers", data);

export const validateContactAPI = (data) => API.post("/validate-contact", data);

export const createReservationAPI = (data) =>
  API.post("/create-reservation", data);
