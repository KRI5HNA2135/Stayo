import { Link } from "react-router-dom";
import AccountNav from "../AccountNav";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PlacesPage() {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    axios.get("/places").then(({ data }) => {
      console.log("fetched places: ",data);
      setPlaces(data);
    });
  }, []);

  return (
    <div>
      <AccountNav />

      <div className="text-center mt-8">
        <p>List of new places</p>
        <Link
          className="inline-flex gap-1 bg-[#FF4463] text-white py-2 px-6 rounded-full"
          to={"/account/places/new"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add New Place
        </Link>
      </div>

      <div className="mt-4 space-y-4">
        {places.length > 0 &&
          places.map((place) => (
            <Link
              to={`/account/places/${place._id}`}
              key={place._id}
              className="flex bg-gray-100 p-4 rounded-2xl gap-4"
            >
             <div className="w-32 h-32 bg-gray-300 rounded-lg overflow-hidden">
  {console.log("Place data:", place)}
  {console.log("Photos array:", place.photos)}
  {place.photos?.length > 0 && (
    <img src={'http://localhost:4000/uploads/' + place.photos[0]} alt={place.title} className="w-full h-full object-cover" />
  )}
</div>

              <div className="flex-1">
                <h2 className="text-xl font-semibold">{place.title}</h2>
                <p className="text-sm mt-2 text-gray-700">{place.description}</p>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
