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
      sizeOriginal,
      badgeHolderType,
      badgeReelType,
      badgeReelCurrency,
      badgeHolderCurrency,
      customBadgeHolderCurrency,
      product_flag,

      // Lanyard attachments
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

    if (name.trim().length === 0 || email.trim().length === 0) {
      throw new ApiError(404, "Name and email fields are required");
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

    if (!response) throw new ApiError(400, "Error occurred");

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

    let contactId = null;
    let accountId = null;

    const contactUrl = `${instance_url}/services/data/v58.0/sobjects/Contact/email/${email}`;

    const contactResponse = await fetch(contactUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const contactData = await contactResponse.json();

    if (Array.isArray(contactData)) {
      // If the response is an array of contact URLs, use the last one
      if (contactData.length > 1) {
        const lastContactUrl = contactData[contactData.length - 1];
        contactId = lastContactUrl.split("/").pop();

        // Re-query using the extracted contact ID
        const lastContactDetailsUrl = `${instance_url}/services/data/v58.0/sobjects/Contact/${contactId}`;
        const lastContactResponse = await fetch(lastContactDetailsUrl, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const lastContactDetails = await lastContactResponse.json();
        accountId = lastContactDetails?.AccountId;

        if (!accountId) {
          throw new ApiError(400, "Failed to retrieve account ID from contact");
        }
      }
    } else if (contactData && contactData.Id) {
      // If the response is a single object
      contactId = contactData.Id;
      accountId = contactData.AccountId;
    } else if (contactData.errorCode === "NOT_FOUND") {
      // If the response indicates that the contact was not found
      console.log(
        "No existing contact found, will create a new contact and account"
      );
    } else {
      throw new ApiError(400, "Unexpected response from Salesforce");
    }

    // If no existing Contact, create new Account and Contact
    if (!contactId) {
      const accountUrl = `${instance_url}/services/data/v58.0/sobjects/Account`;

      const accountData = {
        Name: name,
        Email_Address__c: email,
        BillingCity: city,
        BillingState: state,
        BillingPostalCode: zip,
        Phone: phone,
      };

      const { data: accountObj } = await axios.post(
        accountUrl,
        accountData,
        _headers
      );

      accountId = accountObj?.id;

      if (!accountId) throw new ApiError(400, "Failed to create account");

      const contactUrl = `${instance_url}/services/data/v58.0/sobjects/Contact`;

      const contactObject = {
        LastName: name,
        Email: email,
        Phone: phone,
        AccountId: accountId,
      };

      const { data: contactData } = await axios.post(
        contactUrl,
        contactObject,
        _headers
      );

      contactId = contactData?.id;

      if (!contactId) throw new ApiError(400, "Failed to create contact");
    }

    const opportunityUrl = `${instance_url}/services/data/v58.0/sobjects/Opportunity`;

    const opportunityData = {
      AccountId: accountId,
      Name: name,
      Contact_Name__c: contactId,
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

    if (!opportunityId) throw new ApiError(400, "Failed to create opportunity");

    // For the image upload
    let fileUrl;

    if (req.file !== undefined) {
      fileUrl = await imageUploader(
        req.file.path.split(" ").join("_"),
        req.file.originalname.split(" ").join("_")
      );
    }

    let incomingData;

    if (product_flag === "lanyardField") {
      incomingData = {
        Opportunity__c: opportunityId,
        RecordTypeId: "0121N000001hNZ7QAM",
        Type__c: product_title,
        Size__c: sizeOriginal,
        Quantity__c: quantity < 100 ? 100 : quantity,
        Strap_Colors__c: color,
        Color__c: color,
        Customer_Received_Comments__c: notes,
        Imprint_Text__c: imprintText,

        // quantities
        Bulldog_Clips__c: bullDogClipQuantity ? 1 : 0,
        Key_Rings__c: keyRingQuantity ? 1 : 0,
        Thumb_Triggers__c: thumbTriggerQuantity ? 1 : 0,
        Swivel_J_Hooks__c: swivelJHooksQuantity ? 1 : 0,
        Cell_Phone_Loops__c: cellPhoneLoopsQuantity ? 1 : 0,
        Carabiner_Hooks__c: carabinarHooksQuantity ? 1 : 0,
        Plastic_J_Hooks__c: plasticJHooksQuantity ? 1 : 0,
        Oval_Hooks__c: ovalHooksQuantity ? 1 : 0,
        Disconnect_Buckles__c: discounnectBucklesQuantity ? 1 : 0,
        Safety_Breakaways__c: safetyBreakAwayQuantity ? 1 : 0,
        Length_Adjusters__c: lengthAdjusterQuantity ? 1 : 0,
        Thumb_Hooks__c: thumbHooksQuantity ? 1 : 0,
        No_Swivel_J_Hooks__c: noSwivelJHooksQuantity ? 1 : 0,
        Plastic_Clamp__c: plasticClampQuantity ? 1 : 0,

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
        Quantity__c: quantity < 100 ? 100 : quantity,
        Customer_Received_Comments__c: notes,
        Badge_Reel_Type__c: sizeOriginal,
      };
    } else if (product_flag === "badgeHolder") {
      incomingData = {
        Opportunity__c: opportunityId,
        RecordTypeId: "012R3000000rMiLIAU",
        Quantity__c: quantity < 100 ? 100 : quantity,
        type__c: sizeOriginal,
        Customer_Received_Comments__c: notes,
        Custom_Option_s__c:
          sizeOriginal === "Custom" ? customBadgeHolder : null,
      };
    } else if (product_flag === "tagIdField") {
      console.log("Inside tag id");
      incomingData = {
        Opportunity__c: opportunityId,
        Quantity__c: quantity < 150 ? 150 : quantity,
        RecordTypeId: "012R3000000p8TNIAY",
        Size__c: sizeOriginal,
        Item_Color__c: color,
        Imprint_Text__c: imprintText,
        Customer_Received_Comments__c: notes,
        Add_Dome_To_Label__c: false,
      };
    }

    // Order response
    const { data: productLineItemData } = await axios.post(
      `${instance_url}/services/data/v58.0/sobjects/Opportunity_Product__c`,
      incomingData,
      _headers
    );

    if (req.file !== undefined) {
      const imageData = {
        Product_Line_Item__c: productLineItemData?.id,
        NEILON__Opportunity__c: opportunityId,
        Name: req.file?.filename,
        link__c: fileUrl,
        image_preview__c: fileUrl,
      };

      const { data: mainImageData } = await axios.post(
        `${instance_url}/services/data/v58.0/sobjects/Product_Image__c`,
        imageData,
        _headers
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            "success",
            `Product ${productLineItemData?.id} created successfully`,
            mainImageData
          )
        );
    } else {
      res
        .status(200)
        .json(
          new ApiResponse(
            "success",
            `Product ${productLineItemData?.id} created successfully`
          )
        );
    }
  } catch (error) {
    console.log(error.response?.data || error.message || error);
    throw new ApiError(500, error.response?.data || error.message || error);
  }
});

export { createAccessToken };
