import axios from "axios";
import BASE_URL from "../utils/constant";



/**Get all firm API call */
export const getAllFirms = async () => {
  const response = await axios.get(`${BASE_URL}/api/super-admin/firms`, {
    withCredentials: true,
  });
  return response;
};

/**Delete firm API call */
export const deleteFirm = async (id: number) => {
  const response = await axios.delete(`${BASE_URL}/api/superadmin/firm/${id}`, {
    withCredentials: true,
  });
  return response;
};
