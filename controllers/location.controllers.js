import { getConnectionAsync } from "../Db/DB.js";
import sql from "mssql";

const locationR = async (req, res) => {
  try {
    const {
      case_id,
      latitude,
      longitude,
      BoundaryMismatch,
      IsOnsiteValuation,
    } = req.body;
    if (!case_id)
      return res.status(400).json({ message: "Case id is requred" });
    if (!latitude)
      return res.status(400).json({ message: "Latitude id is requred" });
    if (!longitude)
      return res.status(400).json({ message: "Longitude id is requred" });
    if (!BoundaryMismatch)
      return res.status(400).json({ message: "BoundaryMismatch is requred" });

    const pool = await getConnectionAsync();
    const getUpdate = `EXEC [dbo].[FTvUpdateImageStatus] @CaseID = @case_id, @Latitude = @latitude, @Longitude = @longitude, @BoundaryMismatch = @BoundaryMismatch ,@IsOnsiteValuation = @IsOnsiteValuation `;

    const result = await pool
      .request()
      .input("case_id", sql.VarChar(30), case_id)
      .input("latitude", sql.VarChar(50), latitude)
      .input("longitude", sql.VarChar(50), longitude)
      .input("BoundaryMismatch", sql.VarChar(50), BoundaryMismatch)
      .input("IsOnsiteValuation", sql.VarChar(50), IsOnsiteValuation || null)
      .query(getUpdate);

    res.status(200).json({ message: "Success", data: result.recordset });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "internal server problem", error });
  }
};
export { locationR };
