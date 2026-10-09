const requisitionActionConfigs = {

    Admin: {
        fields: [
            { id: "approvedAmount", label: "Approved Amount", type: "text" },
            { id: "approvedComment", label: "Comment", type: "text" }
        ]
    },

    Purchaser: {
        fields: [
            { id: "approvedAmount", label: "Amount", type: "text" },
            { id: "approvedVendor", label: "Vendor", type: "text" },
            { id: "approvedType", label: "Type", type: "text" },
            { id: "approvedComment", label: "Comment", type: "text" }
        ]
    },

    Financer: {
        fields: [
            {
                id: "financeCategory",label: "Category",type: "select",valueKey: "requestCategory",
                options: [
                    { value: "", text: "-- Select Category --" },
                    { value: "Congregation", text: "Congregation" },
                    { value: "Gurukul", text: "Gurukul" }
                ]
            },
            {
                id: "financeSubCategory",label: "Sub Category",type: "select",valueKey: "requestSubCategory",
                options: [
                    { value: "", text: "-- Select Sub Category --" },
                    { value: "Printing", text: "Printing" },
                    { value: "Stationary", text: "Stationary" },
                    { value: "Other", text: "Other" }
                ]
            },
            { id: "financeAmount", label: "Amount", type: "text" },
            { id: "financeComment", label: "Comment", type: "text" }
        ]
    }

};

$(document).on("click", ".processRequisitionPurchaserBttn", function () {    
    const requisitionId = $(this).closest("tr").data("row-id"); 
    console.log("requisitionId"+requisitionId);   
    openRequisitionAction(requisitionId);
});

$(document).on("click", ".cancelRequisitionBttn", function () {    
    const requisitionId = $(this).closest("tr").data("row-id"); 
    SHOW_CONFIRMATION_POPUP(
        "Are you sure you want to cancel this requisition?",
        async () => {
            await cancelRequisitionAction(requisitionId);
        }
    );
});

$(document).on("click", "#approvedBackBttn", function () {
    $("#actionOnRequisitionId").hide();
    $("#viewRequisitionsData").css("display", "flex");
});

$(document).on("click", "#approvedResetDataBttn", function () {
    resetRequisitionActionData();
});

$(document).on("click", "#rejectRequisitionBttn", function () {
    updateRequisition("Hold");
});

$(document).on("click", "#approveRequisitionBttn", function () {
    updateRequisition("Processed");
});


function renderRequisitionActionFields(requisition) {

    const role = loginData.role;    
    console.log("Role:", role);
    const container = $("#requisitionActionFields");
    container.empty();
    const config = requisitionActionConfigs[role];
    if (!config || !config.fields?.length) {
        console.log("No data for role");
        return;
    }

    const fieldsHtml = config.fields.map(field => {
        let fieldHtml = "";
        if (field.type === "select") {
            const selectedValue = field.valueKey
                ? String(requisition?.[field.valueKey] || "")
                : "";

            const optionsHtml = (field.options || [])
                .map(option => `
                    <option
                        value="${option.value}"
                        ${String(option.value) === selectedValue ? "selected" : ""}>
                        ${option.text}
                    </option>
                `)
                .join("");

            fieldHtml = `
                <select
                    class="width70"
                    id="${field.id}">
                    ${optionsHtml}
                </select>
            `;

        } else {

            const fieldValue = field.valueKey
                ? requisition?.[field.valueKey] || ""
                : "";

            fieldHtml = `
                <input
                    type="${field.type}"
                    class="width70"
                    id="${field.id}"
                    value="${fieldValue}"
                />
            `;
        }

        return `
            <div class="controlRow">
                <label class="width30" for="${field.id}">
                    ${field.label}:
                </label>

                ${fieldHtml}
            </div>
        `;

    }).join("");

    container.html(fieldsHtml);
}


function openRequisitionAction(requisitionId) {

    const requisition = requisitionData.find(
        item => item.requisitionId === requisitionId
    );
    console.log(":::"+requisition)
    if (!requisition) {
        SHOW_ERROR_POPUP("Requisition data not found.");
        return;
    }

    $("#actionOnRequisitionId")
        .attr("data-row-number", requisition.rowNumber)
        .attr("data-requisition-id", requisition.requisitionId);

    $("#actionRequisitionDate")
        .text(requisition.date || "");

    $("#actionRequisitionDescription")
        .text(requisition.description || "")
        .attr("title", requisition.description || "");

    $("#actionRequisitionAmount")
        .text(requisition.requestAmount ?? "");

    // Render role-specific fields and pre-populate values
    renderRequisitionActionFields(requisition);

    $("#viewRequisitionsData").hide();

    $("#actionOnRequisitionId").css("display", "flex");
}

async function cancelRequisitionAction(requisitionId) {

    const requisition = requisitionData.find(
        item => item.requisitionId === requisitionId
    );
    console.log(":::"+requisition)
    if (!requisition) {
        SHOW_ERROR_POPUP("Requisition data not found.");
        return;
    }

     const request = {
        apiType: "CANCEL_REQUISITION_BY_USER",
        inputData: {
            user: loginData.name,
            requisitionId: requisitionId
        }
    };

    try {
        const response = await API_HANDLER_AXIOS(request);
        if (response?.status === "success") {
            SHOW_SUCCESS_POPUP("Requisition cancelled successfully.");
            loadRequisitionList();
        } else {
            SHOW_ERROR_POPUP(response?.message || "Unable to cancel requisition.");
        }
    } catch (ex) {
        console.error("cancelRequisition error:", ex);
        SHOW_ERROR_POPUP("Error :- " + ex);
    }
}

  



function resetRequisitionActionData() {
    const role = loginData.role;   
    const config = requisitionActionConfigs[role];
    if (!config || !config.fields?.length) {
        return;
    }
    config.fields.forEach(field => {
        $(`#${field.id}`).val("");
    });
}

async function updateRequisition(action) {

    const role = loginData.role;
    const requisitionId = $("#actionOnRequisitionId").attr("data-requisition-id");
    if (!requisitionId) {
        SHOW_ERROR_POPUP("Requisition not selected.");
        return;
    }
    console.log("requisitionId ::"+ requisitionId);
    if (!requisitionData || !requisitionData.length) {
        SHOW_ERROR_POPUP("RequisitionData not found.");
        return;
    }

    const requisition = requisitionData.find(item => item.requisitionId === requisitionId);
    console.log("requisitionId ::"+ requisitionId);
    if (!requisition) {
        SHOW_ERROR_POPUP("Requisition record not found.");
        return;
    }
    
    if (!validateRequisitionAction(role)) {
        return;
    }

    const onlineRes = await IS_ONLINE();

    if (!onlineRes) {
        SHOW_ERROR_POPUP("No internet connection.");
        return;
    }

    const inputData = {
        requisitionId: requisition.requisitionId,
        rowNumber: requisition.rowNumber,
        role: role,
        action: role+"_"+action,
        actionBy: loginData.name,

        approvedAmount: "",
        approvedComment: "",

        approvedVendor: "",
        approvedType: "",

        financeCategory: "",
        financeSubCategory: "",
        financeAmount: "",
        financeComment: ""
    };

    /*
     * Read fields according to logged-in role
     */
    if (role === "Admin") {
        inputData.approvedAmount = $("#approvedAmount").val().trim();
        inputData.approvedComment = $("#approvedComment").val().trim();
    } else if (role === "Purchaser") {
        inputData.approvedAmount = $("#approvedAmount").val().trim();
        inputData.approvedVendor = $("#approvedVendor").val().trim();
        inputData.approvedType = $("#approvedType").val().trim();
        inputData.approvedComment = $("#approvedComment").val().trim();
    } else if (role === "Financer") {
        inputData.financeCategory = $("#financeCategory").val();
        inputData.financeSubCategory = $("#financeSubCategory").val();
        inputData.financeAmount = $("#financeAmount").val().trim();
        inputData.financeComment = $("#financeComment").val().trim();
    }

    const request = {
        apiType: "UPDATE_REQUISITION_BY_USER",
        inputData: inputData
    };

    console.log("Update Request:", JSON.stringify(request));
    try {
        const response = await API_HANDLER_AXIOS(request);
        if (response?.status === "success" && response.data) {
            SHOW_SUCCESS_POPUP(
                action === "Processed"
                    ? "Requisition Processed successfully."
                    : "Requisition Hold successfully."
            );
            resetRequisitionActionData();
            $("#actionOnRequisitionId").hide();
            $("#viewRequisitionsData").css("display", "flex");
            loadRequisitionList();
        } else {
            SHOW_ERROR_POPUP(
                response?.message ||
                "Requisition could not be updated. Please contact the admin."
            );
        }
    } catch (ex) {
        console.error("updateRequisition error:", ex);
        SHOW_ERROR_POPUP("Error :- " + ex);
    }
}


function validateRequisitionAction(role) {

    let amountSelector = "";
    let commentSelector = "";
    if (role === "Admin" || role === "Purchaser") {
        amountSelector = "#approvedAmount";
        commentSelector = "#approvedComment";
    } else if (role === "Financer") {
        amountSelector = "#financeAmount";
        commentSelector = "#financeComment";
    } else {
        return false;
    }

    const amount = $(amountSelector).val()?.trim() || "";
    const comment = $(commentSelector).val()?.trim() || "";

    if (!amount) {
        SHOW_ERROR_POPUP("Please enter Approved Amount.");
        $(amountSelector).focus();
        return false;
    }

    if (isNaN(amount) || Number(amount) <= 0) {
        SHOW_ERROR_POPUP("Please enter a valid Approved Amount.");
        $(amountSelector).focus();
        return false;
    }

    if (!comment) {
        SHOW_ERROR_POPUP("Please enter Comment.");
        $(commentSelector).focus();
        return false;
    }
    return true;
}