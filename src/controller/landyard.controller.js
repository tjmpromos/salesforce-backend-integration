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

    const opportunityUrl = `${instance_url}/services/data/v58.0/sobjects/Opportunity`;

    const opportunityDataFields = {
      name: name,
      email: email,
      website: "https://thelanyardauthority.myshopify.com/",
      phone: phone,
      city: city,
      state: state,
      zip: zip,
    };

    const { data: opportunityData } = await axios.post(
      opportunityUrl,
      {
        Name: "New Opp 3",
        AccountId: "001F900001lTWRJIA4",
        CloseDate: "2024-08-08",
        StageName: "Qualify",
        Amount: 123,
        Description: "Color: blue, size: 23",
        ForecastCategoryName: "Omitted",
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: ` Bearer ${accessToken}`,
        },
      }
    );
    let salesForceData;

    if (product_flag === "lanyardField") {
      salesForceData = {
        Opportunity__c: opportunityData?.id,
        Quantity__c: quantity,
        Customer_Received_Comments__c: comment,
        Type__c: product_title,
        Size__c: size,
        Imprint_Text__c: imprint_text,
        Strap_Colors__c: color,
        Color__c: color,
        Badge_Holder__c: badge1,
        Badge_Reel_Type__c: badge2,
        Lanyard_Attachments: lanyard_attachments,
      };
    } else if (product_flag === "badgeReelField") {
      salesForceData = {
        Opportunity__c: opportunityData?.id,
        Quantity__c: quantity,
        Customer_Received_Comments__c: comment,
        Quantity__c: quantity,
        Badge_Reel_Type__c: badge2,
        Badge_Holder__c: badge1,
      };
    } else if (product_flag === "tagIdField") {
      salesForceData = {
        Opportunity__c: opportunityData?.id,
        Quantity__c: quantity,
        Customer_Received_Comments__c: comment,
        Item_Color__c: color,
        Size__c: size,
        Imprint_Text__c: imprint_text,
        Add_Dome_To_Label__c: null,
        Badge_Holder__c: badge1,
      };
    }
    console.log(salesForceData);
    return res
      .status(200)
      .json(new ApiResponse(200, opportunityData, "Access token generate"));
  } catch (error) {
    throw new ApiError(500, error);
  }
});

export { createAccessToken };
