export const mockBookingData = {
  flight: {
    currency: "USD",
    price: "520.00",
    segments: [
      {
        from: "LHR",
        to: "DXB",
        departure: "2025-02-10T10:00",
        arrival: "2025-02-10T20:00",
        airline: "EK",
        flightNumber: "202",
      },
    ],
  },
  pricingSolution: {
    "@_TotalPrice": "USD520.00",
    "@_BasePrice": "USD480.00",
    "@_Taxes": "USD40.00",
  },
  itinerary: {
    journeyType: "ONE_WAY",
  },
};
