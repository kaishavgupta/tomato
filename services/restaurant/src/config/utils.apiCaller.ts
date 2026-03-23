import axios from "axios";
import DataURIParser from "datauri/parser";
import dotenv from "dotenv";

dotenv.config();
const url = process.env.UTILS_SERVICE;

if (!url) {
  throw new Error("UTILS_SERVICE env variable is not defined");
}

const UTILS_SERVICE = axios.create({
  baseURL: url,
});

export const upload_service = async (fileBuffer: DataURIParser) => {
  const response = await UTILS_SERVICE.post(`/api/upload`, {
    fileBuffer: fileBuffer.content,
  });
  return response.data;
};

export const delete_service = async (publicId: string) => {
  const response = await UTILS_SERVICE.delete(`/api/delete/${publicId}`);
  return response.data;
};

export const reUpload_service = async (fileBuffer: DataURIParser,publicId: string) => {
  const response = await UTILS_SERVICE.patch(`/api/update/${publicId}`, {
    imageurlBuffer: fileBuffer.content,
  });
  return response.data;
};




// const userUrl=process.env.USER_SERVICE as string
type operationType="ADD" | "DELETE"


export const userAddress_service=async(userId:string, defaultAddressId:string,operation:operationType)=>{
  console.log(userId,defaultAddressId);
  
  const response=await axios.patch(`http://localhost:3000/api/auth/updateUserAddreess`,{
    userId,
    defaultAddressId,
    operation
  })  
  return  response.data
}

export const peakadress_service=async(userId:string)=>{  
  if (!userId) {
    return console.log({ message: "User ID is required" });
}
  const response=await axios.get(`http://localhost:3000/api/auth/peakUserAddress/${userId}`)
  return  response.data
}