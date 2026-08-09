import cloudinary from "../config/cloudinary.js";
import streamifier from 'streamifier'

export const uploadToCloudinary = (buffer, folder = "general") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {folder},
            (err, result) => {
                if(result) resolve(result);
                else reject(err)
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    })
}