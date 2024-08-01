import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const imgCapture = async (req, res) => {
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
    const dir = path.join(
      __dirname,
      "..",
      "Valuation",
      "Adroit_Case_Image",
      id
    );
    console.log(dir)
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

export { imgCapture };
