import { getConnectionAsync } from "../Db/DB.js";
import sql from "mssql";
import { genToken } from "../Middleware/jwt.auth.js";
import axios from "axios";
import { transporter } from "../Db/mailler.js";

const signup = async (req, res) => {
  try {
    const { name, phoneNumber, email, password } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required." });
    if (!email) return res.status(400).json({ message: "Email is required." });
    if (!phoneNumber)
      return res.status(400).json({ message: "Phone number is required." });
    if (!password)
      return res.status(400).json({ message: "Password is required." });

    const pool = await getConnectionAsync();
    if (!pool) return res.status(500).send("Database connection error");

    // Check for existing user
    const existingUserQuery = `
      SELECT *
      FROM [dbo].[ADR_VAL_Users]
      WHERE Email_Id = @Email OR Mobile_No = @PhoneNumber
    `;

    const existingUserResult = await pool
      .request()
      .input("Email", sql.VarChar(255), email)
      .input("PhoneNumber", sql.VarChar(20), phoneNumber)
      .query(existingUserQuery);

    if (existingUserResult.recordset.length > 0) {
      console.log("Existing user found:", existingUserResult.recordset);

      // Check if the email already exists
      if (
        existingUserResult.recordset.some((user) => user.Email_Id === email)
      ) {
        return res
          .status(409)
          .json({ message: "Email already exists.", success: false, email });
      }

      // Check if the phone number already exists
      if (
        existingUserResult.recordset.some(
          (user) => user.Mobile_No === phoneNumber
        )
      ) {
        return res
          .status(409)
          .json({
            message: "Number already exists.",
            success: false,
            phoneNumber,
          });
      }

      return res
        .status(400)
        .json({
          message: "User already exists. Please login.",
          success: false,
          email,
          phoneNumber,
        });
    }

    // Insert new user
    const insertNewUserQuery =
      "EXEC FTv_UserSignup @Email = @Email, @FullName = @Name, @MobileNo = @PhoneNumber, @Password = @Password";
    const insertResult = await pool
      .request()
      .input("Name", sql.VarChar(255), name)
      .input("Email", sql.VarChar(255), email)
      .input("PhoneNumber", sql.VarChar(20), phoneNumber)
      .input("Password", sql.VarChar(255), password) // Assuming password is hashed before insertion
      .query(insertNewUserQuery);
    if (
      insertResult.recordset &&
      insertResult.recordset[0] &&
      insertResult.recordset[0].Result === "success"
    ) {
      const phoneOTP = insertResult.recordset[0].MobileOTP;
      const emailOTP = insertResult.recordset[0].EmailOTP;
      // (await transporter()).sendMail({
      //   to: `${email}`,
      //   subject: `ADROIT - Login Details`,
      //   html: `Dear ${name},<br/><br/>We warmly welcome you to the family of ADROIT and thank you for choosing to login with ADROIT Technical.<br/>For login you will use your mobile number with below password.<br/><h1>" ${emailOTP} "</h1><br/><br/>Thanks and Regard...<br/>Team ADROIT"`,
      // });

      // const sms = await axios.get(
      //   `https://msgn.mtalkz.com/api?apikey=TjEE4c1TyPYYOjlD&senderid=ADRTSP&number=${phoneNumber}&message=SendSMS(${phoneNumber}, otp ${phoneOTP} " is your OTP for Adroit Lite. Please do not share it with anyone. LItr3ozp1FJ Team Adroit Technical");&format=json";`
      // );
      res
        .status(201)
        .json({
          message: "Signup successful",
          success: true,
          data: insertResult.recordset[0].User_Id,
        });
    } else {
      console.table(insertResult);
      res
        .status(500)
        .json({
          message: "Failed to create new account",
          success: false,
          data: insertResult.recordset[0],
        });
    }
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: err.message, success: false });
  }
};

const verifyOTP = async (req, res) => {
  try {
    const { userId, mobileOTP, emailOTP } = req.body;
    if (!userId)
      return res.status(400).json({ message: "User ID is required." });
    if (!mobileOTP)
      return res.status(400).json({ message: "Mobile OTP is required." });
    if (!emailOTP)
      return res.status(400).json({ message: "Email OTP is required." });

    const pool = await getConnectionAsync();
    if (!pool) return res.status(500).send("Database connection error");

    const updateUserQuery = `EXEC FTvOTP_Varification @UserId = @userId , @Action = 'U', @MobOTP = @mobileOTP, @EmailOTP = @emailOTP`;

    const updateResult = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .input("emailOTP", sql.Char(4), emailOTP)
      .input("mobileOTP", sql.Char(4), mobileOTP)
      .query(updateUserQuery);
    console.log(updateResult)
    if (updateResult.recordset[0].Status == '200') {
      return res
        .status(200)
        .json({
          message: "OTP verification successful.",
          success: true,
          User_Id: userId,
        });
    } else {
      return res
        .status(500)
        .json({
          message: updateResult.recordset[0].Message,
          success: false,
        });
    }
  } catch (err) {
    console.error("Error during OTP verification:", err);
    return res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required." });
    if (!password)
      return res.status(400).json({ message: "Password is required." });

    // Get a connection from the pool
    const pool = await getConnectionAsync();
    // const existingUserQuery = `
    //   SELECT *
    //   FROM [dbo].[ADR_VAL_Users]
    //   WHERE Email_Id = @Email OR Mobile_No = @PhoneNumber
    // `;
    // const result = pool.request().input("email",sql.VarChar(255)).query(existingUserQuery)

    // Log input values for debugging
    console.log("Input email:", email);
    console.log("Input password:", password);

    // SQL query to get the user data
    const getUserQuery =
      "EXEC FTv_Login @useremail = @email, @password = @password";

    const existingUserResult = await pool
      .request()
      .input("email", sql.VarChar(255), email)
      .input("password", sql.VarChar(255), password)
      .query(getUserQuery);

    console.log("Query result:", existingUserResult);

    if (existingUserResult.recordset[0].Result == "fail") {
      return res
        .status(401)
        .json({
          message: "please verfiy your account",
          success: false,
          data: existingUserResult.recordset[0],
        });
    }
    if (existingUserResult.recordset[0].Result == "email not found in DB") {
      return res.status(404).json({ message: "Please Signup", email });
    } else {
      // Generate and return a JWT token for the authenticated user
      const paylod = {
        userId: existingUserResult.recordset[0].User_Id,
      };
      const token = genToken(paylod);
      return res.status(200)
        .json({
          message: "Login successful",
          success: true,
          data: existingUserResult.recordset[0], token
        });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: err.message });
  }
};

const resend_otp = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId)
      return res.status(400).json({ message: "User ID is required." });
    const pool = await getConnectionAsync();
    if (!pool) return res.status(500).send("Database connection error");

    const getUserQuery = `EXEC FTvOTP_Varification @UserId = @userId , @Action = 'G'`;
    const userResult = await pool
      .request()
      .input("UserId", sql.Int, userId)
      .query(getUserQuery);

    const user = userResult.recordset[0]
    console.log(user)
    if (user) {
      (await transporter()).sendMail({
        to: `${user.EmailId}`,
        subject: `ADROIT - Login Details`,
        html: `Dear ${user.UserName} ,<br/><br/>We warmly welcome you to the family of ADROIT and thank you for choosing to login with ADROIT Technical.<br/>For login you will use your mobile number with below password.<br/><h1>" ${user.EmailOTP} "</h1><br/><br/>Thanks and Regard...<br/>Team ADROIT"`,
      });

      const sms = await axios.get(`https://msgn.mtalkz.com/api?apikey=TjEE4c1TyPYYOjlD&senderid=ADRTSP&number=${user.Mobile_Number}&message=Dear user ( ${user.Mobile_Number} ), this " ${user.MobileOTP} " is your OTP for Adroit Lite. Please do not share it with anyone. LItr3ozp1FJ Team Adroit Technical");&format=json";`)
      return res
        .status(200)
        .json({
          message: "OTP send successful.",
          success: true,
          User_Id: userId,
        });
    } else {
      return res
        .status(500)
        .json({
          message: "Failed to update verification status.",
          success: false,
        });
    }
  } catch (err) {
    console.error("genrate otp: ", err);
    return res.status(500).json({ message: err.message });
  }
};

const forgetPassword = async (req, res) =>{
  try {
    const {email} = req.body
    const pool = await getConnectionAsync()
    const ForgetQuryy = `select * FROM ADR_VAL_Users where Email_Id=@email`
    const result = await pool.request().input("email", sql.VarChar(255), email).query(ForgetQuryy)
    console.log(result)
    const user = result.recordset[0];
    (await transporter()).sendMail({
      to: `${email}`,
      subject: `ADROIT - Login Details`,
      html: `Dear ${user.Display_Name} ,<br/><br/>We warmly welcome you to the family of ADROIT and thank you for choosing to login with ADROIT Technical.<br/>For login you will use your mobile number with below password.<br/><h1>" ${user.EmailOTP} "</h1><br/><br/>Thanks and Regard...<br/>Team ADROIT"`,
    });

    res.status(200).json({message:"otp send" , data:result.recordset[0].Email_Id})
  } catch (error) {
    console.log(error)
    res.status(500).json({message:"internal server problem"}) 
  }
}

const changePassword = async (req, res) => {
  try {
    const { email, emailOTP, NewPassword } = req.body;
    const pool = await getConnectionAsync();

    const ForgetQuery = `SELECT * FROM ADR_VAL_Users WHERE Email_Id = @email`;
    const findUser = await pool
      .request()
      .input("email", sql.VarChar(255), email)
      .query(ForgetQuery);
    
    const user = findUser.recordset[0];
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Ensure that user.EmailOTP is correctly compared
    if (user.EmailOTP === emailOTP) {
      const updatePassword = `
        UPDATE ADR_VAL_Users
        SET Password = @NewPassword
        WHERE Email_Id = @email AND EmailOTP = @emailOTP
      `;
      
      const result = await pool
        .request()
        .input("email", sql.VarChar(255), email)
        .input("emailOTP", sql.Char(4), emailOTP)
        .input("NewPassword", sql.VarChar(255), NewPassword) // Adjust length as necessary
        .query(updatePassword);
      
      console.log(result.rowsAffected); // .rowsAffected will provide the number of rows affected
      res.status(200).json({ message: "Password updated successfully" });
    } else {
      res.status(400).json({ message: "Invalid OTP" });
    }

  } catch (error) {
    console.error(error); // Use console.error for errors
    res.status(500).json({ message: "Internal server error" });
  }
};


export { signup, login, verifyOTP, resend_otp, forgetPassword ,changePassword };
