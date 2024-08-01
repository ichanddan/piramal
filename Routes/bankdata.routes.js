import express from 'express';
import { UserProfileUpdateBankData, getBranchListByZone, getVerticalListByBranch, getZoneList } from '../controllers/bankdata.controllers.js';
const bankDataRoute=express.Router()

bankDataRoute.get("/bankzone", getZoneList)
bankDataRoute.get("/bankbranchbyzoneid/:zone", getBranchListByZone)
bankDataRoute.get("/bank_vartical_id/:branch_id", getVerticalListByBranch)
bankDataRoute.post("/update_user_bank_data", UserProfileUpdateBankData)

export default bankDataRoute