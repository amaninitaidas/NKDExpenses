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

  const category = $(fields.category).val().trim();
  const subCategory = $(fields.subCategory).val().trim();
  const amount = Number($(fields.amount).val());

  const inputData = {
    description: $(fields.description).val().trim(),
    amount: $(fields.amount).val().trim(),
    days: $(fields.days).val(),
    category: category,
    subCategory: subCategory,
    requestor: loginData.name,
    status: "",
    createDate: new Date(),
  };


  if (!category || !subCategory) {

    SHOW_CONFIRMATION_POPUP(
      "Category / Sub Category is not defined.<br><br>" +
      "This request will be considered as a Custom Request.<br><br>" +
      "Do you want to continue?",
      async () => {
        inputData.status = "Custom_Request";
        await submitRequisitionData(inputData);
      }
    );
    return;
  }

  const availableLimit =
    Number($("#availableLimit").text()) || 0;

  if (amount > availableLimit) {

    SHOW_CONFIRMATION_POPUP(
      `Request amount (${amount}) is greater than the available limit (${availableLimit}).<br><br>
       This request will be submitted as a Custom Request.<br><br>
       Do you want to continue?`,

      async () => {
        inputData.status = "Custom_Request";
        await submitRequisitionData(inputData);
      }
    );
    return;
  }

  inputData.status = "Predefined_Request";
  await submitRequisitionData(inputData);
}

async function submitRequisitionData(inputData) {

  const request = {
    apiType: "INSERT_REQUISITION_BY_USER",
    inputData: inputData,
  };

  try {
    const response = await API_HANDLER_AXIOS(request);
    if (response?.status === "success" && response.data) {
      SHOW_SUCCESS_POPUP(
        "Requisition data saved successfully."
      );
      resetRequisitionData();
    } else if (response?.status === "validation_error") {
      SHOW_ERROR_POPUP(
        response?.message || "Monthly limit exceeded."
      );
    } else {
      SHOW_ERROR_POPUP(
        response?.message ||
        "Data could not be saved. Please contact the admin."
      );
    }
  } catch (ex) {

    console.error("submitRequisition error:", ex);

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

$(document).on("change","#requestCategory, #requestSubCategory",
  async function () {
    const category = $("#requestCategory").val();
    const subCategory = $("#requestSubCategory").val();
  
    $("#availableLimit").val("");
    if (!category || !subCategory) {
      return;
    }

    try {
      const request = {
        apiType: "GET_REQUISITIONS_LIMIT",
        inputData: {
          category: category,
          subCategory: subCategory
        }
      };

      const response = await API_HANDLER_AXIOS(request);
      if (response?.status === "success") {
          $("#availableLimit").text(response.limitAmount || 0);
      } else {
          $("#availableLimit").text(0);
        SHOW_ERROR_POPUP(response?.message || "Unable to get available limit.");
      }
    } catch (ex) {
      console.error("getAvailableLimit error:", ex);
      $("#availableLimit").val("");
      SHOW_ERROR_POPUP("Unable to get available limit.");
    }
  }
);
