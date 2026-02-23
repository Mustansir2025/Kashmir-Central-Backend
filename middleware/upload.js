const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const uploadToCloudinary = async (file, preset) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", preset);

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/dazo498dd/auto/upload",
    {
      method: "POST",
      body: formData,
    },
  );

  const data = await response.json();
  return data.secure_url;
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "kashmir-central";

    if (file.mimetype === "application/pdf") {
      return {
        folder: `${folder}/pdfs`,
        resource_type: "raw", // IMPORTANT for PDFs
        public_id: Date.now() + "-" + file.originalname,
      };
    } else {
      return {
        folder: `${folder}/images`,
        resource_type: "image",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
        public_id: Date.now() + "-" + file.originalname,
      };
    }
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB per file
  },
});

module.exports = upload;
