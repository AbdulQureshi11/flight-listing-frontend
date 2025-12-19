import React from "react";
import banner from "../../assets/740973.jpg";
import FlightSearch from "../FlightScheduleComponent/FlightSearch";

const HomeComp = () => {
    return (
        <div className="bg-gray-100 overflow-x-hidden">

            {/* HERO */}
            <div className="relative h-[45vh] sm:h-[55vh] md:h-[65vh] lg:h-[70vh]">
                <img
                    src={banner}
                    alt="banner"
                    className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0" />
            </div>

            {/* SEARCH */}
            <div className="relative -mt-20 sm:-mt-24 md:-mt-28 px-3 sm:px-6">
                <FlightSearch redirect />
            </div>
            <div className="flex w-[100%] h-[500px]"></div>

        </div>
    );
};

export default HomeComp;
