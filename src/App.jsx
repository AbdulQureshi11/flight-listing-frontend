import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from "react-router-dom";
import Navigation from "./Pages/Navigation/Navigation";
import Home from "./Pages/Home";
import Explore from "./Pages/Explore";
import CustomerSupport from "./Pages/CustomerSupport";
import FlightSchedule from "./Pages/FlightSchedule";
import BookingPage from "./Components/Booking/BookingPage";
import BookingSubmitted from "./Components/Booking/BookingSubmitted";
import AdminDashboard from "./Pages/AdminDash";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<Navigation />}>
        <Route path="/" element={<Home />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/customer-support" element={<CustomerSupport />} />
        <Route path="/flight-schedule" element={<FlightSchedule />} />
        <Route path="/booking" element={<BookingPage />} />
        <Route path="/booking-submitted" element={<BookingSubmitted />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>
    )
  );
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
