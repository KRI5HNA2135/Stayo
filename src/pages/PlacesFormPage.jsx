import { useEffect, useState } from "react";
import Perks from "./Perks";
import PhotosUploader from "./PhotoUploader";
import AccountNav from "../AccountNav";
import { Navigate, useParams } from "react-router-dom";
import axios from "axios";

export default function PlacesFormPage() {
  const { id } = useParams();
  
  // Ensuring default values to prevent uncontrolled inputs
  const [title, setTitle] = useState('');
  const [address, setAddress] = useState('');
  const [addedPhotos, setAddedPhotos] = useState([]);
  const [description, setDescription] = useState('');
  const [perks, setPerks] = useState([]);
  const [extraInfo, setExtraInfo] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [maxGuests, setMaxGuests] = useState(1);
  const [price, setPrice] = useState(100);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    if (!id) return;

    axios.get(`/places/${id}`).then(response => {
      const { data } = response;

      // Ensure values are never null or undefined
      setTitle(data.title || '');
      setAddress(data.address || '');
      setAddedPhotos(data.photos || []);
      setDescription(data.description || '');
      setPerks(data.perks || []);
      setExtraInfo(data.extraInfo || '');
      setCheckIn(data.checkIn || '');
      setCheckOut(data.checkOut || '');
      setMaxGuests(data.maxGuests ?? 1);
      setPrice(data.price ?? 100);
    });
  }, [id]);

  function inputHeader(text) {
    return <h2 className="text-2xl mt-4">{text}</h2>;
  }

  function inputDescription(text) {
    return <p className="text-gray-500 text-sm">{text}</p>;
  }

  function preInput(header, description) {
    return (
      <>
        {inputHeader(header)}
        {inputDescription(description)}
      </>
    );
  }

  async function savePlace(ev) {
    ev.preventDefault();
    const placeData = {
      title, 
      address, 
      addedPhotos,  // 👀 Check if this contains uploaded photos
      description, 
      perks, 
      extraInfo,
      checkIn, 
      checkOut, 
      maxGuests, 
      price,
    };
  
    console.log("Submitting placeData:", placeData);  // 🔍 Debugging log
  
    try {
      if (id) {
        await axios.put("/places", { id, ...placeData });
      } else {
        await axios.post("/places", placeData);
      }
      setRedirect(true);
    } catch (error) {
      console.error("Error saving place:", error);
    }
  }
  

  if (redirect) {
    return <Navigate to="/account/places" />;
  }

  return (
    <div>
      <AccountNav />
      <form onSubmit={savePlace}>
        {preInput("Title", "Title for your place. Should be short and catchy as in an advertisement")}
        <input type="text" value={title} onChange={ev => setTitle(ev.target.value || '')} placeholder="title, for example: My lovely apt" />

        {preInput("Address", "Address of this place")}
        <input type="text" value={address} onChange={ev => setAddress(ev.target.value || '')} placeholder="address" />

        {preInput("Photos", "More = better")}
        <PhotosUploader addedPhotos={addedPhotos} onChange={setAddedPhotos} />

        {preInput("Description", "Description of the place")}
        <textarea value={description} onChange={ev => setDescription(ev.target.value || '')} />

        {preInput("Perks", "Select all the perks of your place")}
        <div className="grid mt-2 gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          <Perks selected={perks} onChange={setPerks} />
        </div>

        {preInput("Extra Info", "House rules, etc.")}
        <textarea value={extraInfo} onChange={ev => setExtraInfo(ev.target.value || '')} />

        {preInput("Check-in & Check-out Times", "Add check-in and check-out times. Ensure time for room cleaning between guests.")}
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mt-2 -mb-1">Check-in Time</h3>
            <input type="text" value={checkIn || ''} onChange={ev => setCheckIn(ev.target.value)} placeholder="14" />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Check-out Time</h3>
            <input type="text" value={checkOut || ''} onChange={ev => setCheckOut(ev.target.value)} placeholder="11" />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Max Number of Guests</h3>
            <input type="number" value={maxGuests ?? 1} onChange={ev => setMaxGuests(Number(ev.target.value) || 1)} />
          </div>
          <div>
            <h3 className="mt-2 -mb-1">Price per Night</h3>
            <input type="number" value={price ?? 100} onChange={ev => setPrice(Number(ev.target.value) || 100)} />
          </div>
        </div>

        <button className="primary my-4">Save</button>
      </form>
    </div>
  );
}
