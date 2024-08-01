import Express  from "express";
import { pincode } from "../controllers/pincode.controllers.js";
const pincodeRoute= Express.Router()


pincodeRoute.get("/pincode/:pin", pincode)

export default pincodeRoute;