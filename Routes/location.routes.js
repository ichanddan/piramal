import express from "express";
import { locationR } from "../controllers/location.controllers.js";
const locationRoute = express.Router()

locationRoute.post('/location',locationR)

export default locationRoute;