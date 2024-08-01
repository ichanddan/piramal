import Express  from "express";
import { caseCreation, caseCreationUpload, caseDocument, getCase_List_By_id, getCase_d_by_case_id } from "../controllers/case_creation.controllers.js";
import { verifyToken } from "../Middleware/jwt.auth.js";
import { uploadMulti } from "../Middleware/Upload.js";
const Case_Creation= Express.Router()


Case_Creation.post("/cas_creation",verifyToken,caseCreation)
Case_Creation.post("/cas_creation/upload", uploadMulti, caseCreationUpload)
Case_Creation.get("/cas_document", caseDocument)
Case_Creation.get("/cas_document/list_of_case/:user_id",verifyToken ,getCase_List_By_id);
Case_Creation.get("/cas_document/d_of_case/:case_id", getCase_d_by_case_id);


export default Case_Creation;