import mongoose from "mongoose";


const connectDb=async()=>{
    try {
        const URI = process.env.URI as string
        await mongoose.connect(URI);
        console.log("Db Connected Successfully");
    } catch (error) {
        console.log(`Error from db.ts ${error}`);
        
    }
}

export default connectDb