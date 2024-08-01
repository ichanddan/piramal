import { getConnectionAsync } from "../Db/DB.js";
import sql from "mssql";

const getZoneList = async (req, res) => {
  try {
    const pool = await getConnectionAsync();
    if (!pool) return res.status(500).send("Database connection error");

    const query = `EXEC FTvGetBankZoneList`;

    const result = await pool.request().query(query);

    res.status(200).json({message:"List of zone" ,success: true ,data:result.recordset});
  } catch (err) {
    console.error("Error fetching zone list:", err);
    res.status(500).json({ message: err.message });
  }
};

// 2304

const getBranchListByZone = async (req, res) => {
    try {
      const zoneId = req.params.zone;
      if (!zoneId) return res.status(400).json({ message: "Zone ID is required." });
  
      const pool = await getConnectionAsync();
      if (!pool) return res.status(500).send("Database connection error");
  
      const query = `EXEC FTvGetBankBranchList @Zone_ID = @zoneId `;
  
      const result = await pool.request()
        .input('ZoneId', sql.Int, zoneId)
        .query(query);
  
      res.status(200).json({ message:"List of Branch" ,success: true ,data:result.recordset});
    } catch (err) {
      console.error('Error fetching branch list:', err);
      res.status(500).json({ message: err.message });
    }
  };

const getVerticalListByBranch = async (req, res) => {
    try {
      const  branchId  = req.params.branch_id;
      if (!branchId) return res.status(400).json({ message: "Branch ID is required." });
  
      const pool = await getConnectionAsync();
      if (!pool) return res.status(500).send("Database connection error");
  
      const query = `EXEC FTvGetBranchVerticalList @Branch_Id = @branchId`;
  
      const result = await pool.request()
        .input('BranchId', sql.Int, branchId)
        .query(query);
  
      res.status(200).json({message:"List of vartucal id" ,success: true,data:result.recordset});
    } catch (err) {
      console.error('Error fetching vertical list:', err);
      res.status(500).json({ message: err.message });
    }
  };


const UserProfileUpdateBankData = async (req, res) => {
  try {
    const { zoneId, branchId, vrtId, user_Id } = req.body;
    if (!zoneId || !branchId || !vrtId || !user_Id) {
      return res
        .status(400)
        .json({
          message: "Zone ID, Branch ID, Vertical ID, and Unique ID are required.",
        });
    }

    const pool = await getConnectionAsync();
    if (!pool) return res.status(500).send("Database connection error");

    const insertQuery = `EXEC FTvUpdateUserProfile
      @ZONE_ID = @zoneId,
      @Branch_id = @branchId,
      @VRT_ID = @vrtId,
      @UniqueID = @user_Id;`;
    const request = await pool.request()
      .input("user_Id", sql.VarChar, user_Id)
      .input("ZoneId", sql.Int, zoneId)
      .input("BranchId", sql.Int, branchId)
      .input("VrtId", sql.Int, vrtId)
      .query(insertQuery);

    if (request.recordset[0].Result=='success') {
      res
        .status(200)
        .json({
          message: "User bank profile updated.",
          success: true,
          data: request.recordset,
        });
    } else {
      res.status(401).json({ message: "Faild User bank profile updated.",success: false});
    }
  } catch (err) {
    console.error("Error during user bank mapping:", err);
    res.status(500).json({ message: err.message });
  }
};

export {getZoneList, getBranchListByZone, getVerticalListByBranch, UserProfileUpdateBankData}