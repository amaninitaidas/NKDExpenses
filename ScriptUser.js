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
    $("#userMenuPopup").hide();    
    $("#raiseNewRequisitionId").css("display", "flex");
});

$(document).on("click", "#addRequisitionFromViewBttn", function () {
    $("#userMenuPopup").hide();
    $("#viewRequisitionsData").hide();
    $("#raiseNewRequisitionId").css("display", "flex");
});


$(document).on("click", "#requisitionBackBttn", function () {
    $("#raiseNewRequisitionId").hide();
    $("#userMenuPopup").css("display", "flex");    
});

$(document).on("click", "#submitRequisition", function () {
     if (!validateRequisitionData()) { 
            return; 
        }
        // All validation passed
        submitRequisitionApi();
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


async function submitRequisitionApi() {  

    const onlineRes = await IS_ONLINE();

    if (!onlineRes) {
        SHOW_ERROR_POPUP("No internet connection.");
        return;
    }

    const inputData = {
        date: $("#expenseDate").val(),
        description: $("#expenseDescription").val().trim(),
        amount: $("#expenseAmount").val().trim(),
        endDate: $("#expenseEndDate").val(),
        category: $("#expenseCategory").val(),
        subCategory: $("#expenseSubCategory").val(),

        requestor: loginData.name,
        status: "Submitted",
        createDate: new Date()
    };

    const request = {
        apiType: "INSERT_REQUISITION_BY_USER",
        inputData: inputData
    };

    console.log("Request:", JSON.stringify(request));
    try {
        const response = await API_HANDLER_AXIOS(request);
        if (response) {
            if (response.status === "success" && response.data) {
                SHOW_SUCCESS_POPUP("Requisition data saved successfully.");
                // Clear form after successful save
                resetRequisitionData();
            } else {
                SHOW_ERROR_POPUP(
                    response.message || "Data could not be saved. Please contact the admin."
                );
            }
        } else {
            SHOW_ERROR_POPUP("Something Went Wrong");
        }
    } catch (ex) {
        console.error("submitRequisition error:", ex);
        SHOW_ERROR_POPUP("Error :- " + ex);
    }
}

function resetRequisitionData() {

    // Clear text and date inputs
    $("#expenseDate").val("");
    $("#expenseDescription").val("");
    $("#expenseAmount").val("");
    $("#expenseEndDate").val("");

    // Reset dropdowns to first/default option
    $("#expenseCategory").val("");
    $("#expenseSubCategory").val("");
}


function validateRequisitionData() {

    // Get values
    const date = $("#expenseDate").val().trim();
    const description = $("#expenseDescription").val().trim();
    const amount = $("#expenseAmount").val().trim();
    const endDate = $("#expenseEndDate").val().trim();
    const category = $("#expenseCategory").val();
    const subCategory = $("#expenseSubCategory").val();

    // Validate Date
    if (!date) {
        SHOW_ERROR_POPUP("Please select Date.");
        $("#expenseDate").focus();
        return false;
    }

    // Validate Description
    if (!description) {
        SHOW_ERROR_POPUP("Please enter Description.");
        $("#expenseDescription").focus();
        return false;
    }

    // Validate Amount
    if (!amount) {
        SHOW_ERROR_POPUP("Please enter Amount.");
        $("#expenseAmount").focus();
        return false;
    }

    // Validate Amount is numeric
    if (isNaN(amount) || Number(amount) <= 0) {
        SHOW_ERROR_POPUP("Please enter a valid Amount.");
        $("#expenseAmount").focus();
        return false;
    }

    // Validate Expiry Date
    if (!endDate) {
        SHOW_ERROR_POPUP("Please select Expiry Date.");
        $("#expenseEndDate").focus();
        return false;
    }

    // Validate Category
    if (!category) {
        SHOW_ERROR_POPUP("Please select Category.");
        $("#expenseCategory").focus();
        return false;
    }

    // Validate Sub Category
    if (!subCategory) {
        SHOW_ERROR_POPUP("Please select Sub Category.");
        $("#expenseSubCategory").focus();
        return false;
    }

    return true;
}

async function loadRequisitionList() {
    
    const onlineRes = await IS_ONLINE();

    if (!onlineRes) {
        SHOW_ERROR_POPUP("No internet connection.");
        return;
    }

    const inputData = {    
        requestor: loginData.name        
    };

    const request = {
        apiType: "GET_REQUISITIONS_BY_USER",
        inputData: inputData
    };

    console.log("Request:", JSON.stringify(request));

    try {
        const response = await API_HANDLER_AXIOS(request);
        if (response && response.status === "success" && response.data ) {
            populateRequisitionTable(response.data);
             $("#requisitionTableContainer").css("display", "flex");
        } else {
            SHOW_ERROR_POPUP(response?.message || "Unable to load requisition list." );
        }
    } catch (ex) {
        console.error("loadRequisitionList error:", ex);
        SHOW_ERROR_POPUP("Error loading requisition list.");
    }
}

function populateRequisitionTable(data) {
    console.log("Response:", JSON.stringify(data));
    console.log("IS ARRAY:", Array.isArray(data));
    console.log("tbody count:", $("#requisitionTableBody").length);

    const tbody = $("#requisitionTableBody");
    console.log("tbody count:", tbody.length);
    console.log("tbody before:", tbody.html());
    tbody.empty();
    if (!data || data.length === 0) {
        tbody.append(`
            <tr>
                <td colspan="9" style="text-align:center;">
                    No requisitions found.
                </td>
            </tr>
        `);
        return;
    }

   data.forEach(function (item, index) { 
    console.log("Adding row:", index, item);
    const row = ` <tr> <td>${item.date || ""}
                    </td> <td>${item.description || ""}
                    </td> <td>${item.amount || ""}
                    </td> <td>${item.endDate || ""}
                    </td> <td>${item.category || ""}
                    </td> <td>${item.subCategory || ""}
                    </td> <td>${item.requestor || ""}
                    </td> <td>${item.status || ""}
                    </td> <td>${item.createDate || ""}
                    </td> </tr> `;
    tbody.append(row); });
    console.log("tbody after:", tbody.html());
    console.log("row count:", $("#requisitionTableBody tr").length);
}
