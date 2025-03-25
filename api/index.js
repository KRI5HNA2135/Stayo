import express from "express";
import cors from "cors";
const app = express();
import 'dotenv/config'
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/User.js";
import cookieParser from "cookie-parser";
import downloader from 'image-downloader';
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from 'fs';
import Place from './models/Place.js'


const bcryptSalt = bcrypt.genSaltSync(10)
const JWT_SECRET = '123123'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors({
   credentials : true,
   origin : 'http://localhost:5173'
}));


mongoose.connect(process.env.MONGO_URL)

app.get('/test', (req,res) => {
   res.json('test OK')
})

app.post('/register', async (req,res) => {
   try {
      const {name,email,password} = req.body;
   
      const userDoc = await User.create({
         name, email, password : bcrypt.hashSync(password, bcryptSalt),
      })
      res.json(userDoc)
   
   
   } catch (error) {
      res.status(422).json(e)
   }
})

app.post('/login', async (req, res) => {
   mongoose.connect(process.env.MONGO_URL);
   const {token} = req.cookies;
   const { email, password } = req.body;
   const userDoc = await User.findOne({ email });

   if (userDoc) {
      const passOk = bcrypt.compareSync(password, userDoc.password);
      if (passOk) {
         jwt.sign(
            { email: userDoc.email, id: userDoc._id , name : userDoc.name},
            JWT_SECRET,
            {},
            (err, token) => {
               if (err) throw err;
               res.cookie("token", token).json(userDoc);
            }
         );
      } else {
         res.status(422).json("pass not ok");
      }
   } else {
      res.json("not found");
   }
});


app.get('/profile', (req,res) => {
   const {token} = req.cookies;
   
   if(token) {
      jwt.verify(token, JWT_SECRET, {},async (err,userData) => {
         if (err) throw err;
         const {name, email, _id} = await User.findById(userData.id)
         res.json({name, email, _id});
      })
   }else {
      res.json(null)
   }
})

app.post('/logout', (req,res) => {
   res.cookie('token','').json(true);
})

app.post('/upload-by-link', async(req,res) => {
   const {link} = req.body;
   const newName = 'photo'+  Date.now() + '.jpg';
   await downloader.image({
      url: link,
      dest: __dirname + "/uploads/" + newName,
   })
   res.json(newName);
})

const storage = multer.diskStorage({
   destination: 'uploads/',
   filename: (req, file, cb) => {
       const ext = path.extname(file.originalname);
       const filename = `${Date.now()}${ext}`;
       cb(null, filename);
   }
});

const upload = multer({ storage });

// Upload Endpoint
app.post('/upload', upload.array('photos', 100), (req, res) => {
   const uploadedFiles = req.files.map(file => file.filename);
   res.json(uploadedFiles);
});

app.post('/places', async (req, res) => {
   const { token } = req.cookies;
   if (!token) return res.status(401).json({ error: "Unauthorized" });

   jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
      if (err) return res.status(403).json({ error: "Invalid token" });

      try {
         const { title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests } = req.body;

         // Ensure addedPhotos is an array
         const photoArray = Array.isArray(addedPhotos) ? addedPhotos : [];

         const placeDoc = await Place.create({
            owner: userData.id,
            title,
            address,
            addedPhotos: photoArray,  // ✅ Make sure it's an array
            description,
            perks,
            extraInfo,
            checkIn,
            checkOut,
            maxGuests,
         });

         console.log("✅ Created Place:", placeDoc);
         res.json(placeDoc);
      } catch (error) {
         console.error("❌ Error creating place:", error);
         res.status(500).json({ error: "Database error", details: error });
      }
   });
});


app.get('/places', (req,res) => {
   const {token} = req.cookies;
   jwt.verify(token, JWT_SECRET, {} , async(err, userData) => {
      const {id} = userData;
      res.json( await Place.find({owner: id}));
   })
})

app.get('/places/:id', async (req, res) => {
   const { id } = req.params;
   const place = await Place.findById(id);
   if (!place) {
      return res.status(404).json({ error: "Place not found" });
   }
   res.json(place);
});


app.put('/places', async(req,res) => {
   const { token } = req.cookies;
   const { id, title, address, addedPhotos, description, perks, extraInfo, checkIn, checkOut, maxGuests } = req.body;

   jwt.verify(token, JWT_SECRET, {}, async (err, userData) => {
      if (err) return res.status(403).json({ error: "Invalid token" });

      const placeDoc = await Place.findById(id);
      if (!placeDoc) return res.status(404).json({ error: "Place not found" });

      if (userData.id !== placeDoc.owner.toString()) {
         return res.status(403).json({ error: "Unauthorized" });
      }

      // ✅ Preserve old photos if `addedPhotos` is undefined
      const updatedPhotos = addedPhotos !== undefined ? addedPhotos : placeDoc.addedPhotos;

      placeDoc.set({
         title,
         address,
         addedPhotos: updatedPhotos,  // ✅ Keep previous photos if not provided
         description,
         perks,
         extraInfo,
         checkIn,
         checkOut,
         maxGuests,
      });

      await placeDoc.save();
      res.json({ message: "Updated successfully", place: placeDoc });
console.log("🖼️ Uploaded Photos:", req.body.addedPhotos);

   });
});


// Route to delete a photo
app.delete("/delete-photo/:filename", (req, res) => {
   const { filename } = req.params;
   const filePath = path.join(__dirname, "uploads", filename);

   console.log("Attempting to delete:", filePath);  // ✅ Check the path

   fs.access(filePath, fs.constants.F_OK, (err) => {
       if (err) {
           console.error("File not found:", filePath);
           return res.status(404).json({ message: "File not found" });
       }

       fs.unlink(filePath, (err) => {
           if (err) {
               console.error("Error deleting file:", err);
               return res.status(500).json({ message: "Failed to delete file" });
           }

           console.log("File deleted successfully:", filePath);
           res.json({ message: "File deleted successfully" });
       });
   });
});



 

app.listen(4000);


// Mongo Pass-  fn1aglGFyDqija8e

