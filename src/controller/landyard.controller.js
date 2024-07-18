import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createAccessToken = asyncHandler(async (req, res) => {
  const {
    // General field
    name,
    email,
    phone,
    city,
    state,
    zip,

    // Products field
    quantity,
    comment,
    imprint_text,
    color,
    product_title,
    size,
    badge1,
    badge2,
    lanyard_attachments,
    product_flag,
  } = req.body;

  const body = req.body;
  if (!body) throw new ApiError(404, "Data not found");

  //   const url = "https://login.salesforce.com/services/oauth2/token";

  //   const data = {
  //     username: "support@cartmade.com",
  //     password: "Cartmade2019#DdRjVkrT5yQOniNyOJq4xyWM",
  //     grant_type: "password",
  //     client_id:
  //       "3MVG9mclR62wycM1Eli6OTTyBzrk4G_20zKJAqMoHzImlSsuMmuslzIb9_WROc17x7TWUHWXSOJw0bz97CU1m",
  //     client_secret:
  //       "451B4A40ECE20B40CA245DDD2F6D14687121EBF7C24107C88E5376ABB798E839",
  //   };

  const url =
    "https://fun-platform-869.my.salesforce.com/services/oauth2/token";

  const data = {
    username: "sdfsfsdfsdf929-vjsa@force.com",
    password: "Fawcdtgk789!YTPnEw22ecnt5eKDDUq34fHYB",
    grant_type: "password",
    client_id:
      "3MVG9Kr5_mB04D15ocKt.U7VBo9nZh7_E_.jF_hfi3NnEEDqiIGrRSaYNSnvenRW2CzrFIYtus.n4B6Mio304",
    client_secret:
      "562F5CBEE2FE302133DF74DB2C235C932D3680187DEB5721626B160F81E00DB6",
  };

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie:
        "BrowserId=w0z4pTqeEe-LtSXqHASufQ; CookieConsentPolicy=0:0; LSKey-c$CookieConsentPolicy=0:0",
    },
    maxBodyLength: Infinity,
  };

  try {
    const { data: response } = await axios.post(
      url,
      new URLSearchParams(data),
      config
    );

    const accessToken = response?.access_token;
    const instance_url = response?.instance_url;
    if (!accessToken) {
      throw new ApiError(400, "Failed to generate access token");
    }
    const accountUrl = `${instance_url}/services/data/v58.0/sobjects/Account`;

    const accountData = {
      Name: name,
    //   PersonEmail: email,
    //   Source_Website__c: "https://thelanyardauthority.myshopify.com/",
    //   PersonAssistantPhone: phone,
    //   city: city,
    //   state: state,
    //   zip: zip,
    };
    
    // creates the account id
    const { data:accountObj } = await axios.post(accountUrl, accountData,{
        headers:{
            "Content-Type":"application/json",
            "Authorization":`Bearer ${accessToken}`,
        }
    });

    return res
      .status(200)
      .json(new ApiResponse(200, accountObj, "Access token generate"));
  } catch (error) {
    console.log(error,"error")
    throw new ApiError(500, error);
  }
});

export { createAccessToken };
