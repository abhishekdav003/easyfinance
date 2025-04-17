import {asyncHandler} from "../utils/asyncHandler.js";

const registerClient = asyncHandler(async(req , res , next) =>{
   res.status(200).json({
    message:"ok"
   })
})

export {registerClient}