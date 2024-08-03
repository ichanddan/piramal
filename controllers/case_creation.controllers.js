import { getConnectionAsync } from "../Db/DB.js";
import sql from "mssql";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const caseCreationUpload = async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).send({
      message: "No file available for upload",
    });
  }
  console.log(req.body.id);
  console.log(req.files);
  const data = req.files;
  const id = req.body.id;

  try {
    const dir = path.join(__dirname,'..', 'Valuation','DOC', id);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    for (const file of data) {
      const filePath = path.join(dir, id+"_"+Date.now()+"_"+file.originalname);
      fs.writeFileSync(filePath, file.buffer);
    }

    res.status(200).send({
      message: "Files uploaded successfully",
    });
  } catch (error) {
    res.status(500).send({
      message: "Error in file uploading",
    });
  }
};

const caseCreation = async (req, res) => {
  const {
    Bank_Id,
    User_Id,
    Branch_Id,
    NBFC_Number,
    A_Title,
    A_Name,
    A_Pincode,
    A_Locality,
    A_Sub_Location,
    A_City,
    A_State,
    A_Property_No,
    A_Bulding_Name,
    A_LandMark,
    Contect_Persion_Name,
    Contect_Persion_M1,
    Contect_Persion_M2,
    P_Area,
    Remark,
    Provided_Dacument,
    Case_Statu,
    Payment_Type,
  } = req.body;

  // Ensure the userId from the token matches User_Id from the request body
  if (req.user.userId !== User_Id) {
    return res.status(403).json({ message: "User ID does not match" });
  }

  // Validation checks
  if (!Payment_Type) return res.status(400).json({ message: "Payment_Type is required" });
  if (!Case_Statu) return res.status(400).json({ message: "Case_Status is required" });
  if (!Provided_Dacument) return res.status(400).json({ message: "Provided_Dacument is required" });
  if (!Bank_Id) return res.status(400).json({ message: "Bank_Id is required" });
  if (!User_Id) return res.status(400).json({ message: "User_Id is required" });
  if (!Branch_Id) return res.status(400).json({ message: "Branch_Id is required" });
  if (!NBFC_Number) return res.status(400).json({ message: "NBFC_Number is required" });
  if (!A_Title) return res.status(400).json({ message: "A_Title is required" });
  if (!A_Name) return res.status(400).json({ message: "A_Name is required" });
  if (!A_Pincode) return res.status(400).json({ message: "A_Pincode is required" });
  if (!A_Locality) return res.status(400).json({ message: "A_Locality is required" });
  if (!A_Sub_Location) return res.status(400).json({ message: "A_Sub_Location is required" });
  if (!A_City) return res.status(400).json({ message: "A_City is required" });
  if (!A_State) return res.status(400).json({ message: "A_State is required" });
  if (!A_Property_No) return res.status(400).json({ message: "A_Property_No is required" });
  // if (!A_Bulding_Name) return res.status(400).json({ message: "A_Bulding_Name is required" });
  // if (!A_LandMark) return res.status(400).json({ message: "A_LandMark is required" });
  if (!Contect_Persion_Name) return res.status(400).json({ message: "Contect_Persion_Name is required" });
  if (!Contect_Persion_M1) return res.status(400).json({ message: "Contect_Persion_M1 is required" });
  // if (!Contect_Persion_M2) return res.status(400).json({ message: "Contect_Persion_M2 is required" });
  // if (!P_Area) return res.status(400).json({ message: "P_Area is required" });
  // if (!Remark) return res.status(400).json({ message: "Remark is required" });

  const updateApplication_Name = A_Title + " " + A_Name;
  console.log(updateApplication_Name);
  console.log(typeof(updateApplication_Name));

  try {
    const pool = await getConnectionAsync();
    const update = `
      EXEC FTv_InsertCaseDetails 
      @ActionType = 'Insert',
        @Applicant_Name = @updateApplication_Name,
        @Pin_Code = @A_Pincode,
        @Location = @A_Locality,
        @SubLocalityId = @A_Sub_Location,
        @City = @A_City,
        @State = @A_State,
        @Property_No = @A_Property_No,
        @Building_No = @A_Bulding_Name,
        @Landmark = @A_LandMark,
        @Contact_Person_Name = @Contect_Persion_Name,
        @Contact_Persion_Mob1 = @Contect_Persion_M1,
        @Contact_Persion_Mob2 = @Contect_Persion_M2,
        @Area = @P_Area,
        @Case_Creation_Remark = @Remark,
        @Bank_ID = @Bank_Id,
        @Branch_Id = @Branch_Id,
        @Case_Created_By = @User_Id,
        @File_No = @NBFC_Number,
        @Documents = @Provided_Dacument,
        @Case_Status = @Case_Statu,
        @PaymentType = @Payment_Type;
      `;
    const result = await pool
      .request()
      .input("updateApplication_Name", sql.VarChar(200), updateApplication_Name)
      .input("A_Pincode", sql.VarChar(10), A_Pincode)
      .input("A_Locality", sql.Int, A_Locality)
      .input("A_Sub_Location", sql.Int, A_Sub_Location)
      .input("A_City", sql.Int, A_City)
      .input("A_State", sql.Int, A_State)
      .input("A_Property_No", sql.VarChar(1000), A_Property_No)
      .input("A_Bulding_Name", sql.VarChar(1000), A_Bulding_Name || null)
      .input("A_LandMark", sql.VarChar(1000), A_LandMark || null)
      .input("Contect_Persion_Name", sql.VarChar(200), Contect_Persion_Name)
      .input("Contect_Persion_M1", sql.VarChar(15), Contect_Persion_M1)
      .input("Contect_Persion_M2", sql.VarChar(15), Contect_Persion_M2 || null)
      .input("P_Area", sql.VarChar(50), P_Area || null)
      .input("Remark", sql.VarChar(500), Remark || null)
      .input("User_Id", sql.Int, User_Id)
      .input("Bank_Id", sql.Int, Bank_Id)
      .input("Branch_Id", sql.Int, Branch_Id)
      .input("NBFC_Number", sql.VarChar(200), NBFC_Number)
      .input("Provided_Dacument", sql.VarChar(500), Provided_Dacument)
      .input("Case_Statu", sql.Int, Case_Statu)
      .input("Payment_Type", sql.VarChar(10), Payment_Type)
      .query(update);

    console.log(result);
    res.status(200).json({ message: "Success", Data: result.recordset });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred", err: error.message });
  }
};


const caseDocument = async (req, res) => {
  try {
    const pool = await getConnectionAsync();
    if (!pool) return res.status(500).send("Database connection error");
    const getDocument = `FTv_GetDetailsByType @DetailType = 'Documents'`;
    const result = await pool.request().query(getDocument);
    console.log(result.recordset);
    if (!result.recordset) {
      res.status(499).json({ message: "Doucment not receved" });
    }
    res.status(200).json({ message: "Document data", data: result.recordset });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server problem" });
  }
};

const getCase_List_By_id = async (req, res) => {
  try {
    const token_id = req.user.userId;
    const user_id = parseInt(req.params.user_id, 10);
    console.log(token_id)
    console.log(typeof(token_id))
    console.log(user_id)
    console.log(typeof(user_id))
    if (token_id !== user_id) return res.status(403).json({ message: "User ID does not match" });
    
    const pool = await getConnectionAsync();
    if (!pool) return res.status(500).send("Database connection error");

    const getData = `EXEC FTv_GetCaseDetailsWithNames @Case_Created_By = @user_id`;
    const result = await pool
      .request()
      .input("user_id", sql.Int, user_id)
      .query(getData);

    console.log(result.recordset);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Document data", data: result.recordset });
  } catch (error) {
    res.status(500).json({ message: "Internal server problem", error });
  }
};
const getCase_d_by_case_id = async (req, res) => {
  try {
    const case_id = req.params.case_id;
    const pool = await getConnectionAsync();
    if (!pool) return res.status(500).send("Database connection error");

    const getData = `EXEC FTv_GetCaseDetailsWithNamebyCase_ID @Case_Id =@case_id`;
    const result = await pool
      .request()
      .input("case_id", sql.Int, case_id)
      .query(getData);

    console.log(result.recordset);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ message: "Document not found" });
    }

    res.status(200).json({ message: "Document data", data: result.recordset });
  } catch (error) {
    res.status(500).json({ message: "Internal server problem", error });
  }
};
const DocumentUpdate = async (req, res) => {
  try {
    const { Case_id, Doc_id } = req.body;
    if (!Case_id)
      return res.status(400).json({ message: "Case id is requred" });
    if (!Doc_id) return res.status(400).json({ message: "Case id is requred" });

    const pool = await getConnectionAsync();
    if (!pool) return res.status(500).json({ message: "Db error" });

    const update_Doc = `EXEC Ftv_UpdateDocument @Case_ID = @Case_id, @Documents = @Doc_id`;
    const result = await pool
      .request()
      .input("Case_id", sql.Int, Case_id)
      .input("Doc_id", sql.VarChar(500), Doc_id)
      .query(update_Doc);

    console.log(result)
    if (result) {
      res
        .status(200)
        .json({ message: "Document updated successfully" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server problem", error });
  }
};


export { caseCreationUpload, caseCreation, caseDocument,getCase_List_By_id, getCase_d_by_case_id , DocumentUpdate };
