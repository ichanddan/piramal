import  Express  from "express";
import { login, resend_otp, signup, verifyOTP } from "../controllers/user.controllers.js";
const userRoute = Express.Router()


userRoute.post('/signup', signup)
userRoute.patch('/signup/otp', verifyOTP)
userRoute.post('/login', login)
userRoute.post('/resend_otp', resend_otp)

export default userRoute;