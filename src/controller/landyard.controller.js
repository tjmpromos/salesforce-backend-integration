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
    bullDogClipCurrency,
    keyRingCurrency,
    thumbTriggerCurrency,
    swivelJHooksCurrency,
    cellPhoneLoopsCurrency,
    carabinarHooksCurrency,
    plasticJHooksCurrency,
    ovalHooksCurrency,
    discounnectBucklesCurrency,
    safetyBreakAwayCurrency,
    lengthAdjusterCurrency,
    thumbHooksCurrency,
    noSwivelJHooksCurrency,
    plasticClampCurrency,
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
    // Website__c: "https://thelanyardauthority.com/",
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
      Bulldog_Clips__c: quantity,
      Key_Rings__c: quantity,
      Thumb_Triggers__c: quantity,
      Swivel_J_Hooks__c: quantity,
      Cell_Phone_Loops__c: quantity,
      Carabiner_Hooks__c: quantity,
      Plastic_J_Hooks__c: quantity,
      Oval_Hooks__c: quantity,
      Disconnect_Buckles__c: quantity,
      Safety_Breakaways__c: quantity,
      Length_Adjusters__c: quantity,
      Thumb_Hooks__c: quantity,
      No_Swivel_J_Hooks__c: quantity,
      Plastic_Clamp__c: quantity,

      Bulldog_Clip__c: bullDogClipCurrency,
      Key_Ring__c: keyRingCurrency,
      Thumb_Trigger__c: thumbTriggerCurrency,
      Swivel_J_Hook__c: swivelJHooksCurrency,
      Cell_Phone_Loop__c: cellPhoneLoopsCurrency,
      Carabiner_Hook__c: carabinarHooksCurrency,
      Plastic_J_Hook__c: plasticJHooksCurrency,
      Oval_Hook__c: ovalHooksCurrency,
      Disconnect_Buckle__c: discounnectBucklesCurrency,
      Safety_Breakaway__c: safetyBreakAwayCurrency,
      Length_Adjuster__c: lengthAdjusterCurrency,
      Thumb_Hook__c: thumbHooksCurrency,
      No_Swivel_J_Hook__c: noSwivelJHooksCurrency,
      Plastic_Clamps__c: plasticClampCurrency,

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
      // Badge_Reel_Type__c: badgeReelType,
      Badge_Holder__c: badgeHolderType,
    };
  } else if (product_flag === "tagIdField") {
    incomingData = {
      Opportunity__c: opportunityId,
      Quantity__c: quantity,
      RecordTypeId: "012R3000000p8TNIAY",
      Customer_Received_Comments__c: comment,
      Item_Color__c: color,
      Size__c: size,
      Imprint_Text__c: imprint_text,
      Add_Dome_To_Label__c: null,
      Badge_Holder__c: badge1,
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
