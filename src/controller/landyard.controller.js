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
    badgeHolderType,
    badgeReelType,
    badgeReelCurrency,
    badgeHolderCurrency,
    customBadgeHolderCurrency,
    landyardAttachmentQuantity,
    product_flag,

    // Landyard attachments
    bullDogClipQuantity,
    keyRingQuantity,
    thumbTriggerQuantity,
    swivelJHooksQuantity,
    cellPhoneLoopsQuantity,
    carabinarHooksQuantity,
    plasticJHooksQuantity,
    ovalHooksQuantity,
    discounnectBucklesQuantity,
    safetyBreakAwayQuantity,
    lengthAdjusterQuantity,
    thumbHooksQuantity,
    noSwivelJHooksQuantity,
    plasticClampQuantity,

    customBadgeHolder,
  } = req.body;

  const body = req.body;
  if (!body) throw new ApiError(404, "Data not found");
  const url = "https://login.salesforce.com/services/oauth2/token";

  const data = {
    username: "support@cartmade.com",
    password: "Cartmade2019#DdRjVkrT5yQOniNyOJq4xyWM",
    grant_type: "password",
    client_id:
      "3MVG9mclR62wycM1Eli6OTTyBzrk4G_20zKJAqMoHzImlSsuMmuslzIb9_WROc17x7TWUHWXSOJw0bz97CU1m",
    client_secret:
      "451B4A40ECE20B40CA245DDD2F6D14687121EBF7C24107C88E5376ABB798E839",
  };

  const config = {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie:
        "BrowserId=w0z4pTqeEe-LtSXqHASufQ; CookieConsentPolicy=0:0; LSKey-c$CookieConsentPolicy=0:0",
    },
    maxBodyLength: Infinity,
  };

  const { data: response } = await axios.post(
    url,
    new URLSearchParams(data),
    config
  );

  if (!response) throw new ApiError(400, "Error occured");

  const accessToken = response?.access_token;
  const instance_url = response?.instance_url;
  if (!accessToken) {
    throw new ApiError(400, "Failed to generate access token");
  }

  const _headers = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  };

  const accountUrl = `${instance_url}/services/data/v58.0/sobjects/Account`;

  const accountData = {
    Name: name,
    Email_Address__c: email,
  };

  // // creates the account id
  const { data: accountObj } = await axios.post(
    accountUrl,
    accountData,
    _headers
  );

  const accountId = accountObj?.id;

  if (!accountId) throw new ApiError(400, "Failed to create a account id");

  const opportunityUrl = `${instance_url}/services/data/v58.0/sobjects/Opportunity`;

  const opportunityData = {
    AccountId: accountId,
    Billing_First_Name__c: name,
    Contact_Email_Address__c: email,
    Source_Website_PL__c: "TEST JOB",
    Phone_Number__c: phone,
    Shipping_City__c: city,
    Shipping_State__c: state,
    Shipping_Zip_Postal_Code__c: zip,
  };

  const { data: opportunityObj } = await axios.post(
    opportunityUrl,
    opportunityData,
    _headers
  );

  const opportunityId = opportunityObj?.id;

  if (!opportunityId)
    throw new ApiError(400, "Failed to create opportunity id");

  let incomingData;

  if (product_flag === "lanyard_field") {
    incomingData = {
      Opportunity__c: opportunityId,
      RecordTypeId: "0121N000001hNZ7QAM",
      Type__c: product_title,
      Size__c: size,
      Quantity__c: quantity,
      Strap_Colors__c: color,
      Color__c: color,
      Customer_Received_Comments__c: comment,
      Imprint_Text__c: imprint_text,

      // quantitys
      Bulldog_Clips__c: bullDogClipQuantity ? quantity : 0,
      Key_Rings__c: keyRingQuantity ? quantity : 0,
      Thumb_Triggers__c: thumbTriggerQuantity ? quantity : 0,
      Swivel_J_Hooks__c: swivelJHooksQuantity ? quantity : 0,
      Cell_Phone_Loops__c: cellPhoneLoopsQuantity ? quantity : 0,
      Carabiner_Hooks__c: carabinarHooksQuantity ? quantity : 0,
      Plastic_J_Hooks__c: plasticJHooksQuantity ? quantity : 0,
      Oval_Hooks__c: ovalHooksQuantity ? quantity : 0,
      Disconnect_Buckles__c: discounnectBucklesQuantity ? quantity : 0,
      Safety_Breakaways__c: safetyBreakAwayQuantity ? quantity : 0,
      Length_Adjusters__c: lengthAdjusterQuantity ? quantity : 0,
      Thumb_Hooks__c: thumbHooksQuantity ? quantity : 0,
      No_Swivel_J_Hooks__c: noSwivelJHooksQuantity ? quantity : 0,
      Plastic_Clamp__c: plasticClampQuantity ? quantity : 0,

      Badge_Holder__c: badgeHolderType,
      Badge_Holder_Costs__c: badgeHolderCurrency,
      Custom_Badge_Holder_Costs__c: customBadgeHolderCurrency,

      Badge_Reel_Type__c: badgeReelType,
      Badge_Reel_Costs__c: badgeReelCurrency,
    };
  } else if (product_flag === "badgeReelField") {
    incomingData = {
      Opportunity__c: opportunityId,
      RecordTypeId: "0123m000001g0YHAAY",
      Quantity__c: quantity,
      Customer_Received_Comments__c: comment,
      Badge_Reel_Type__c: size,
      // Imprint_Text__c: imprint_text,
    };
  } else if (product_flag === "badgeHolder") {
    incomingData = {
      Opportunity__c: opportunityId,
      RecordTypeId: "012R3000000rMiLIAU",
      Quantity__c: quantity,
      type__c: size,
      Customer_Received_Comments__c: comment,
      Custom_Option_s__c: size === "Custom" ? customBadgeHolder : null,
    };
  } else if (product_flag === "tagIdField") {
    incomingData = {
      Opportunity__c: opportunityId,
      Quantity__c: quantity,
      RecordTypeId: "012R3000000p8TNIAY",
      Size__c: size,
      Customer_Received_Comments__c: comment,
      Badge_Holder__c: badgeHolderType,
      Imprint_Text__c: imprint_text,
      Item_Color__c: color,
      Add_Dome_To_Label__c: false,
    };
  }

  const opportunityLineItemUrl = `${instance_url}/services/data/v58.0/sobjects/Opportunity_Product__c`;

  try {
    const _response = await fetch(opportunityLineItemUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`, // Assuming `_headers` contains the `Authorization` header
      },
      body: JSON.stringify(incomingData),
    });

    if (!_response.ok) {
      const errorData = await _response.json();
      throw new Error(
        `Error: ${_response.status} - ${
          _response.statusText
        }. Details: ${JSON.stringify(errorData)}`
      );
    }

    const _responseData = await _response.json();

    return res
      .status(200)
      .json(new ApiResponse(200, _responseData, "Opportunity data"));
  } catch (error) {
    console.error("Error occurred:", error.message);
    throw new ApiError(
      400,
      `Failed to create Opportunity_Product__c: ${error.message}`
    );
  }
});

export { createAccessToken };
