var requisitionData = [];
const requisitionColumns = [
    { header: "Date", key: "date" },
    { header: "Requisition ID", key: "requisitionId" },
    { header: "Description", key: "description" },
    { header: "Request Amount", key: "requestAmount" },
    { header: "Request Days", key: "requestDays" },
    { header: "Expected Date", key: "requestExpectedDate" },
    { header: "Request Category", key: "requestCategory" },
    { header: "Request Sub Category", key: "requestSubCategory" },
    { header: "Requestor", key: "requestor" },
    { header: "Status", key: "status" },
    { header: "Admin Approved Amount", key: "adminApprovedAmount" },
    { header: "Admin Comment", key: "adminComment" },
    { header: "Purchaser Amount", key: "purchaserAmount" },
    { header: "Purchaser Comment", key: "purchaserComment" },
    { header: "Vendor", key: "vendor" },
    { header: "Type", key: "type" },
    { header: "Financer Category", key: "financerCategory" },
    { header: "Financer Sub Category", key: "financerSubCategory" },
    { header: "Finance Amount", key: "financeAmount" },
    { header: "Finance Comment", key: "financeComment" }
];


const tableConfigs = {
    requisition: {
        tableId: "requisitionTable",
        actions: [
            {
                header: "Action",
                type: "button",
                text: "action",
                className: "green processRequisitionPurchaserBttn"
            }
        ],
        columns: requisitionColumns        
    }
};

function populateTable(config, data) {

    const table = $(`#${config.tableId}`);
    const tbody = table.find("tbody");

    tbody.empty();

    if (!data?.length) {
        tbody.html(`
            <tr>
                <td colspan="${config.columns.length + (config.actions?.length || 0)}"
                    style="text-align: center;">
                    No requisitions found.
                </td>
            </tr>
        `);

        table.hide();
        return;
    }

    const rows = data.map(item => {
        const dataColumns = config.columns
            .map(column => `
                <td>${item[column.key] ?? ""}</td>
            `)
            .join("");
        const actionColumns = (config.actions || [])
            .map(action => `
                <td>
                    <button
                        type="button"
                        class="${action.className}">
                        ${action.text}
                    </button>
                </td>
            `)
            .join("");
        return `
            <tr id="${item.requisitionId}"
                data-row-id="${item.requisitionId}">
                ${actionColumns}
                ${dataColumns}            
            </tr>
        `;
    }).join("");

    tbody.html(rows);
    table.show();
}

function initializeTable(config) {   
    const table = $(`#${config.tableId}`);

    const headerColumns = config.columns
        .map(column => `<th>${column.header}</th>`)
        .join("");

    const actionColumns = (config.actions || [])
        .map(action => `<th>${action.header}</th>`)
        .join("");

    table.find("thead tr").html(
        actionColumns + headerColumns
    );
}

function getTableConfig() {    
    return tableConfigs.requisition;
}