import axios from "axios";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { imageUploader } from "../utils/ImageUpload.js";
const createAccessToken = asyncHandler(async (req, res) => {
  try {
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
      notes,
      imprintText,
      color,
      product_title,
      size,
      badgeHolderType,
      badgeReelType,
      badgeReelCurrency,
      badgeHolderCurrency,
      customBadgeHolderCurrency,
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
    console.log("Length of name");
    console.log(name.trim().length === 0);
    if (name.trim().length === 0 || email.trim().length === 0) {
      throw new ApiError(404, "Name and email field is required");
    }
    const url = "https://login.salesforce.com/services/oauth2/token";

    const data = {
      username: process.env.SALESFORCE_USERNAME,
      password: process.env.SALESFORCE_PASSWORD,
      grant_type: "password",
      client_id: process.env.SALESFORCE_CLIENT_ID,
      client_secret: process.env.SALESFORCE_CLIENT_SECRET,
    };

    const config = {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
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

    // For the image upload

    let fileUrl;

    if (req.file !== undefined)
      fileUrl = await imageUploader(req.file.path, req.file.originalname);

    let incomingData;

    if (product_flag === "lanyardField") {
      incomingData = {
        // Custom_Field_Image__c: imageLinkId,
        Opportunity__c: opportunityId,
        RecordTypeId: "0121N000001hNZ7QAM",
        Type__c: product_title,
        Size__c: size,
        Quantity__c: quantity < 100 ? 100 : quantity,
        Strap_Colors__c: color,
        Color__c: color,
        Customer_Received_Comments__c: notes,
        Imprint_Text__c: imprintText,

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
        // View_Files__c: fileUrl,
      };
    } else if (product_flag === "badgeReelField") {
      incomingData = {
        Opportunity__c: opportunityId,
        RecordTypeId: "0123m000001g0YHAAY",
        Quantity__c: quantity < 100 ? 100 : quantity,
        Customer_Received_notess__c: notes,
        Badge_Reel_Type__c: size,
        // Imprint_Text__c: imprintText,
      };
    } else if (product_flag === "badgeHolder") {
      incomingData = {
        Opportunity__c: opportunityId,
        RecordTypeId: "012R3000000rMiLIAU",
        Quantity__c: quantity < 100 ? 100 : quantity,
        type__c: size,
        Customer_Received_notess__c: notes,
        Custom_Option_s__c: size === "Custom" ? customBadgeHolder : null,
      };
    } else if (product_flag === "tagIdField") {
      incomingData = {
        Opportunity__c: opportunityId,
        Quantity__c: quantity < 150 ? 150 : quantity,
        RecordTypeId: "012R3000000p8TNIAY",
        Size__c: size,
        Item_Color__c: color,
        Imprint_Text__c: imprintText || "Imprint text",
        Customer_Received_notess__c: notes,
        // Badge_Holder__c: badgeHolderType,
        Add_Dome_To_Label__c: false,
      };
    }

    // Order response
    const { data: mainData } = await axios.post(
      `${instance_url}/services/data/v58.0/sobjects/Opportunity_Product__c`,
      incomingData,
      _headers
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { res: mainData, imgUrl: fileUrl },
          "Opportunity data"
        )
      );
  } catch (error) {
    console.log("Error start");
    console.log(error);
    throw new ApiError(
      400,
      error.response?.data[0].message ||
        error.response?.data.error ||
        error ||
        "Try again in few minutes"
    );
  }
});

export { createAccessToken };
