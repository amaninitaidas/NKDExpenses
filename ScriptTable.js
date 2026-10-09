var requisitionData = [];
const tableStates = {};
const requisitionColumns = [
    { header: "Date", key: "date", type: "date" },
    { header: "Requisition ID", key: "requisitionId" , type: "string"},
    { header: "Description", key: "description", type: "string" },
    { header: "Request Amount", key: "requestAmount", type: "string" },
    { header: "Request Days", key: "requestDays", type: "number"  },
    { header: "Expected Date", key: "requestExpectedDate" , type: "date"},
    { header: "Request Category", key: "requestCategory" , type: "string"},
    { header: "Request Sub Category", key: "requestSubCategory", type: "string" },
    { header: "Requestor", key: "requestor", type: "string" },
    { header: "Status", key: "status" , type: "string"},
    { header: "Admin Approved Amount", key: "adminApprovedAmount" , type: "number" },
    { header: "Admin Comment", key: "adminComment", type: "string" },
    { header: "Purchaser Amount", key: "purchaserAmount", type: "string" },
    { header: "Purchaser Comment", key: "purchaserComment", type: "string" },
    { header: "Vendor", key: "vendor" , type: "string"},
    { header: "Type", key: "type" , type: "string"},
    { header: "Financer Category", key: "financerCategory", type: "string" },
    { header: "Financer Sub Category", key: "financerSubCategory" , type: "string"},
    { header: "Finance Amount", key: "financeAmount", type: "number"  },
    { header: "Finance Comment", key: "financeComment" , type: "string"}
];


const tableConfigs = {
    requisition: {
        tableId: "requisitionTable",
        actions: [],
        columns: requisitionColumns        
    }
};

function getRequisitionActions(role) {

    if (String(role || "").trim().toLowerCase() === "user") {
        return [
            {
                header: "Cancel",
                type: "button",
                text: "cancel",                
                className: "table-process-btn cancelRequisitionBttn"
            }
        ];
    }

    return [
        {
            header: "Process",
            type: "button",
            text: "process",                
            className: "table-process-btn processRequisitionPurchaserBttn"
        }
    ];
}
function getTableConfig() {    
    var config = tableConfigs.requisition;
    config.actions =getRequisitionActions(loginData.role);
    return config;
}

function populateTable(config, data) {

    const table = $(`#${config.tableId}`);

    if (!table.length) {
        console.log("Table not found:", config.tableId);
        return;
    }

    const tableId = config.tableId;

    tableStates[tableId] = {
        data: data || [],
        searchText: "",
        sortKey: null,
        sortDirection: "asc"
    };

    renderTable(config);
}

function initializeTable(config) {

    const table = $(`#${config.tableId}`);

    if (!table.length) {
        console.log("Table not found:", config.tableId);
        return;
    }

    const tableId = config.tableId;

    tableStates[tableId] = {
        data: [],
        searchText: "",
        sortKey: null,
        sortDirection: "asc"
    };

    // Search box above table
    if ($(`#${tableId}Toolbar`).length === 0) {

        table.before(`
            <div id="${tableId}Toolbar" class="table-toolbar">
                <input
                    type="text"
                    class="table-search"
                    data-table-id="${tableId}"
                    placeholder="Search..."
                />
            </div>
        `);
    }

    // Create table headers
    const headerHtml = config.columns
        .map(column => `
            <th
                class="${column.sortable === false ? "" : "sortable"}"
                ${column.sortable === false
                    ? ""
                    : `data-sort-key="${column.key}" data-sort-type="${column.type || "string"}"`
                }>
                ${column.header}
                ${column.sortable === false ? "" : '<span class="sort-icon"></span>'}
            </th>
        `)
        .join("");

    // Action headers
    const actionHeaderHtml = (config.actions || [])
        .map(action => `
            <th class="action-column">
                ${action.header}
            </th>
        `)
        .join("");

    // Set headers
    table.find("thead tr").html(
        actionHeaderHtml + headerHtml 
    );

    // Make sure header is visible
    table.find("thead").show();
    table.find("thead th").show();
}


function renderTable(config) {

    const table = $(`#${config.tableId}`);
    const tbody = table.find("tbody");

    if (!table.length || !tbody.length) {
        console.log("Table/Tbody not found:", config.tableId);
        return;
    }

    const state = tableStates[config.tableId];

    let data = [...(state?.data || [])];

    // -----------------------------
    // SEARCH
    // -----------------------------
    if (state.searchText) {

        const searchText = state.searchText.toLowerCase();

        data = data.filter(item => {

            return config.columns.some(column => {

                const value = item[column.key] ?? "";

                return String(value)
                    .toLowerCase()
                    .includes(searchText);

            });

        });
    }

    // -----------------------------
    // SORT
    // -----------------------------
    if (state.sortKey) {

        const column = config.columns.find(
            column => column.key === state.sortKey
        );

        if (column) {

            data.sort((a, b) => {

                const valueA = getSortableValue(
                    a[column.key],
                    column.type
                );

                const valueB = getSortableValue(
                    b[column.key],
                    column.type
                );

                let result = 0;

                if (valueA < valueB) {
                    result = -1;
                } else if (valueA > valueB) {
                    result = 1;
                }

                return state.sortDirection === "asc"
                    ? result
                    : -result;
            });
        }
    }

    // -----------------------------
    // NO DATA
    // -----------------------------
    if (!data.length) {

        tbody.html(`
            <tr>
                <td
                    colspan="${config.columns.length + (config.actions?.length || 0)}"
                    style="text-align:center;">
                    No requisitions found.
                </td>
            </tr>
        `);

        table.show();

        updateSortIcons(config);

        return;
    }

    // -----------------------------
    // CREATE ROWS
    // -----------------------------
    const rows = data.map(item => {

        const dataColumns = config.columns
            .map(column => `
                <td>
                    ${escapeHtml(item[column.key] ?? "")}
                </td>
            `)
            .join("");

        const actionColumns = (config.actions || [])
            .map(action => `
                <td class="action-column">
                    <button
                        type="button"
                        class="${action.className}"                        
                        data-row-id="${item.requisitionId || ""}">
                        ${action.text}
                    </button>
                </td>
            `)
            .join("");

        return `
            <tr id="requisitionRow_${item.requisitionId || ""}"
                data-row-id="${item.requisitionId || ""}">
                ${actionColumns}
                ${dataColumns}                
            </tr>
        `;

    }).join("");

    tbody.html(rows);

    // IMPORTANT: show the table
    table.show();

    updateSortIcons(config);
}

function getSortableValue(value, type) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return type === "number" ||
               type === "date"
            ? 0
            : "";
    }

    if (type === "number") {

        const number =
            Number(String(value).replace(/,/g, ""));

        return isNaN(number)
            ? 0
            : number;
    }

    if (type === "date") {

        return parseDisplayDate(value);
    }

    return String(value)
        .toLowerCase();
}

function parseDisplayDate(value) {

    if (!value) {
        return 0;
    }

    const parts = String(value).trim().split(" ");

    if (parts.length !== 3) {
        return 0;
    }

    const day = Number(parts[0]);

    const months = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11
    };

    const month = months[parts[1]];
    const year = Number(parts[2]);

    if (
        isNaN(day) ||
        month === undefined ||
        isNaN(year)
    ) {
        return 0;
    }

    return new Date(
        year,
        month,
        day
    ).getTime();
}

$(document).on("input", ".table-search", function () {

    const tableId = $(this).data("table-id");

    if (!tableStates[tableId]) {
        return;
    }

    tableStates[tableId].searchText =
        $(this).val().trim();

    const config =
        Object.values(tableConfigs).find(
            item => item.tableId === tableId
        );

    if (config) {
        renderTable(config);
    }
});

$(document).on(
    "click",
    "table thead th.sortable",
    function () {

        const table = $(this).closest("table");

        const tableId = table.attr("id");

        const sortKey =
            $(this).attr("data-sort-key");

        if (!tableStates[tableId]) {
            return;
        }

        const state =
            tableStates[tableId];

        if (state.sortKey === sortKey) {

            state.sortDirection =
                state.sortDirection === "asc"
                    ? "desc"
                    : "asc";

        } else {

            state.sortKey = sortKey;
            state.sortDirection = "asc";
        }

        const config =
            Object.values(tableConfigs).find(
                item => item.tableId === tableId
            );

        if (config) {
            renderTable(config);
        }
    }
);

function updateSortIcons(config) {

    const table =
        $(`#${config.tableId}`);

    table.find("th.sortable .sort-icon")
        .text("");

    const state =
        tableStates[config.tableId];

    if (!state?.sortKey) {
        return;
    }

    const th = table
        .find(
            `th[data-sort-key="${state.sortKey}"]`
        );

    th.find(".sort-icon")
        .text(
            state.sortDirection === "asc"
                ? " ▲"
                : " ▼"
        );
}

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}