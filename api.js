import axios from "axios";

const API = axios.create({
  baseURL: "https://travnetic.com/flightbackend" || "http://localhost:9000/api",
});

export const validatePassengersAPI = (data) =>
  API.post("/api/validate-passengers", data);

export const validateContactAPI = (data) =>
  API.post("/api/validate-contact", data);

export const createReservationAPI = (data) =>
  API.post("/api/create-reservation", data);

export default API;
