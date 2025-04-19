import { v2 as cloudinary } from "cloudinary";
import { log } from "console";
import fs from "fs"; // file system of node js

(async function () {
  // Configuration
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      return null;
    }
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // file has been uploaded on cloudinary
    console.log("file has been uploaded on cloudinary", response.url);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    //remove the locally saved temp file as upload got failed
    return null;
  }
};

export { uploadOnCloudinary };
// Upload an image

// cloudinary.uploader.upload(
//   "https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg",
//   {
//     public_id: "shoes",
//   },
//   function (error, result) {
//     console.log(result, error);
//   }
// );
