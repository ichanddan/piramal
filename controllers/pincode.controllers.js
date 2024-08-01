import { getConnectionAsync } from "../Db/DB.js";
import sql from "mssql";

const pincode = async (req, res)=>{
    try {
        const pincode =req.params.pin
        const pool = await getConnectionAsync();
        if (!pool) return res.status(500).send("Database connection error");
        const QurryFind="exec FTV_GetLocationDetailsByPinCode @pincode=@pincode;"
        const result = await pool.request()
        .input("pincode", sql.Char, pincode)
        .query(QurryFind);
        if (!result.recordset.length<0) return res.status(404).json({ message: "Pincode not found" });
        console.table(result.recordset)
        res.status(200).json({ message: "Pincode is valid", data:result.recordset });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

export {pincode}