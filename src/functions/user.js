import axios from "axios";
import setBearerToken from "../helper/setBearerToken";

export const updatePasswordFn = async(currentPassword,updatedPassword,token) => {
    setBearerToken(token);
    return await axios.put(`${process.env.REACT_APP_SERVER_API}/user/updatePassword`,{currentPassword,updatedPassword})
}