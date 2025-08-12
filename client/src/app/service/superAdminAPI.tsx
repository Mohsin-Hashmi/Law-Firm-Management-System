
import axios from "axios";
import BASE_URL from "../utils/constant";
import { FirmPayload } from "../types/firm";

export const createFirm = async(data: FirmPayload)=>{
    const response =  await axios.post(`${BASE_URL}/api/superadmin/firm`, data, { withCredentials: true });
    console.log("firm created", response);
    return response;
}