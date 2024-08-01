import express from "express";
import { getConnectionAsync } from "./Db/DB.js";
import userRoute from "./Routes/user.routes.js";
import pincodeRoute from "./Routes/pincode.routes.js";
import bankDataRoute from "./Routes/bankdata.routes.js";
import cors from 'cors'
import dotenv from "dotenv";
import Case_Creation from "./Routes/case_creation.routes.js";
import captureImageRoute from "./Routes/captureImage.routes.js";
import locationRoute from "./Routes/location.routes.js";
dotenv.config();
const app = express();
const port = process.env.PORT;


app.use(cors({
    origin: ['http://localhost:4200','https://piramal.adroitvaluation.in'], 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE','PATCH']
}))
getConnectionAsync()
app.use(express.json())

app.use("/api/v1", userRoute)
app.use("/api/v1", pincodeRoute)
app.use("/api/v1", bankDataRoute)
app.use("/api/v1/case", Case_Creation)
app.use("/api/v1/image", captureImageRoute)
app.use("/api/v1/loc", locationRoute)

app.listen(port, ()=>{
    console.log(`your app is runing ${port}`)
});
