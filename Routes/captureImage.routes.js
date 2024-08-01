import express from "express";
import { imgCapture } from "../controllers/imageCaputre.controllers.js";
import { uploadMulti } from "../Middleware/Upload.js";

const captureImageRoute=express.Router()

captureImageRoute.post("/image_capture", uploadMulti ,imgCapture)

export default captureImageRoute