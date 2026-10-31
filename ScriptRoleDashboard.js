/**
 * Displays dashboard actions based on the logged-in user's role.
 * The Apps Script API must still enforce role-based data access.
 */
function showRoleDashboard(role) {
    debugger;
    const normalizedRole = String(role || "")
        .trim();

    const configByRole = {
        User: {
            badge: "User",
            title: "My Dashboard",
            description: "Create a request or check your existing requisitions.",
            canCreate: true,
            viewTitle: "My Requisitions",
            viewSubtitle: "View the status and details of your requests."
        },

        Admin: {
            badge: "Admin",
            title: "Admin Dashboard",
            description: "Review requests awaiting admin processing.",
            canCreate: false,
            viewTitle: "View Requisitions",
            viewSubtitle: "Review requests available in the admin queue."
        },

        Purchaser: {
            badge: "Purchaser",
            title: "Purchaser Dashboard",
            description: "Process requests awaiting purchaser action.",
            canCreate: false,
            viewTitle: "View Requisitions",
            viewSubtitle: "Open your purchaser queue and process eligible requests."
        },

        Financer: {
            badge: "Financer",
            title: "Financer Dashboard",
            description: "Process requests awaiting finance action.",
            canCreate: false,
            viewTitle: "View Requisitions",
            viewSubtitle: "Open your finance queue and process eligible requests."
        }
    };

    const config = configByRole[normalizedRole];

    const $createButton = $("#addRequisitionBttn");
    const $viewButton = $("#viewRequisitionBttn");

    // Hide all actions before applying the role-specific configuration.
    $createButton.prop("hidden", true);
    $viewButton.prop("hidden", true);

    // Handle missing or invalid roles.
    if (!config) {
        $("#dashboardTitle").text("Dashboard");
        $("#dashboardRoleBadge").text("");
        $("#dashboardDescription").text(
            "Your role could not be identified. Please sign in again."
        );
        return;
    }

    // Update dashboard headings and descriptions.
    $("#dashboardTitle").text(config.title);
    $("#dashboardRoleBadge").text(config.badge);
    $("#dashboardDescription").text(config.description);

    $("#viewRequisitionTitle").text(config.viewTitle);
    $("#viewRequisitionSubtitle").text(config.viewSubtitle);

    // Only User can create a requisition.
    if (config.canCreate) {
        $createButton.prop("hidden", false);
    }

    // Every valid role can view its permitted requisitions.
    $viewButton.prop("hidden", false);
}


// Initialize the dashboard when the document is ready.
$(document).ready(function () {

    // Apply the role immediately if login data already exists.
    if (
        typeof loginData !== "undefined" &&
        loginData &&
        loginData.role
    ) {
        showRoleDashboard(loginData.role);
    }

    // Reapply the dashboard configuration when its popup becomes visible.
    const dashboardElement = document.getElementById("userMenuPopup");

    if (dashboardElement && typeof MutationObserver !== "undefined") {

        const applyRoleIfVisible = function () {
            const isVisible =
                window.getComputedStyle(dashboardElement).display !== "none";

            if (
                isVisible &&
                typeof loginData !== "undefined" &&
                loginData &&
                loginData.role
            ) {
                showRoleDashboard(loginData.role);
            }
        };

        const observer = new MutationObserver(applyRoleIfVisible);

        observer.observe(dashboardElement, {
            attributes: true,
            attributeFilter: ["style", "class"]
        });

        applyRoleIfVisible();
    }
});