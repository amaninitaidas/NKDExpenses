$(document).on("click", "#userDropdown .accordion-header", function () {
  const header = $(this);
  const content = header.next(".accordion-content");

  header.toggleClass("active");
  content.toggleClass("show");
});


$(document).on("click", "#viewExistingUser", function () {
  console.log("View Existing User");
});

$(document).on("click", "#addRequisitionBttn", function () {
  openRequisitionForm();
});

$(document).on("click", "#addRequisitionFromViewBttn", function () {
  $("#viewRequisitionsData").hide();
  openRequisitionForm();
});

$(document).on("click", "#requisitionBackBttn", function () {
  closeRequisitionForm();
});

$(document).on("click", "#submitRequisition", function () {
  submitRequisition();
});

$(document).on("click", "#resetRequisitionData", function () {
  resetRequisitionData();
});


$(document).on("click", "#viewRequisitionBttn", function () {
  $("#userMenuPopup").hide();
  $("#viewRequisitionsData").css("display", "flex");

  loadRequisitionList();
});

$(document).on("click", "#requisitionListBackBttn", function () {
  $("#viewRequisitionsData").hide();
  $("#userMenuPopup").css("display", "flex");
});

// ============================================================
// REQUISITION CONFIGURATION
// ============================================================

const requisitionFormConfig = {
  standard: {
    formId: "raiseNewRequisitionId",

    fields: {      
      description: "#requestDescription",
      amount: "#requestAmount",
      days: "#requestDays",
      category: "#requestCategory",
      subCategory: "#requestSubCategory",
    },

    requireCategory: true,
  }
};

function getRequisitionConfig() {
  return requisitionFormConfig.standard;
}

function openRequisitionForm() {
  const config = getRequisitionConfig();
  $("#userMenuPopup").hide();
  $(`#${config.formId}`).css("display", "flex");
}

function closeRequisitionForm() {
  const config = getRequisitionConfig();

  $(`#${config.formId}`).hide();

  $("#userMenuPopup").css("display", "flex");
}

async function submitRequisition() {
  const config = getRequisitionConfig();
  if (!validateRequisition()) {
    return;
  }

  const onlineRes = await IS_ONLINE();
  if (!onlineRes) {
    SHOW_ERROR_POPUP("No internet connection.");
    return;
  }

  const fields = config.fields;
  const inputData = {   
    description: $(fields.description).val().trim(),
    amount: $(fields.amount).val().trim(),
    days: $(fields.days).val(),
    category:  $(fields.category).val() ,
    subCategory:  $(fields.subCategory).val(),
    requestor: loginData.name,
    status: "Submitted",
    createDate: new Date(),
  };   

  const request = {
    apiType: "INSERT_REQUISITION_BY_USER",

    inputData: inputData,
  };

  try {
    const response = await API_HANDLER_AXIOS(request);
    if (response?.status === "success" && response.data) {
      SHOW_SUCCESS_POPUP("Requisition data saved successfully.");
      resetRequisitionData();
    } else {
      SHOW_ERROR_POPUP(
        response?.message ||
          "Data could not be saved. Please contact the admin.",
      );
    }
  } catch (ex) {
    console.error(`submit${isCustom ? "Custom" : ""}Requisition error:`, ex);
    SHOW_ERROR_POPUP("Error :- " + ex);
  }
}

function resetRequisitionData() {
  const config = getRequisitionConfig();
  const fields = config.fields; 
  $(fields.description).val("");
  $(fields.amount).val("");
  $(fields.days).val("");
  $(fields.category).val("");
  $(fields.subCategory).val("");
  
}


function validateRequisition() {
  const config = getRequisitionConfig();
  const fields = config.fields;

  const validations = [   
    {
      selector: fields.description,
      message: "Please enter Description.",
      validate: (value) => value !== "",
    },
    {
      selector: fields.amount,
      message: "Please enter Amount.",
      validate: (value) => value !== "" && !isNaN(value) && Number(value) > 0,
      invalidMessage: "Please enter a valid Amount.",
    },
    {
      selector: fields.days,
      message: "Please select Expected Days.",
      validate: (value) => value !== "" && !isNaN(value) && Number(value) > 0,
      invalidMessage: "Please enter a Expected Days.",
    },
  ];

  for (const validation of validations) {
    const value = $(validation.selector).val()?.trim() || "";
    if (!validation.validate(value)) {
      SHOW_ERROR_POPUP(validation.invalidMessage || validation.message);
      $(validation.selector).focus();
      return false;
    }
  }

  return true;
}

// ============================================================
// LOAD REQUISITION LIST
// ============================================================

async function loadRequisitionList() {
  const onlineRes = await IS_ONLINE();

  if (!onlineRes) {
    SHOW_ERROR_POPUP("No internet connection.");
    return;
  }

  const request = {
    apiType: "GET_REQUISITIONS_BY_USER",
    inputData: {
      requestor: loginData.name,
      role: loginData.role
    },
  };

  try {
    const response = await API_HANDLER_AXIOS(request);
    if (response?.status === "success" && response.data) {
      const config = getTableConfig();
      initializeTable(config);
      requisitionData = response.data;
      populateTable(config, response.data);
      $("#requisitionTableContainer").css("display", "flex");
    } else {
      requisitionData = [];
      SHOW_ERROR_POPUP(response?.message || "Unable to load requisition list.");
    }
  } catch (ex) {
    requisitionData = [];
    console.error("loadRequisitionList error:", ex);
    SHOW_ERROR_POPUP("Error loading requisition list.");
  }
}
