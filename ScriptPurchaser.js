$(document).on("click", "#purchaserDropdown .accordion-header", function () {
  const header = $(this);
  const content = header.next(".accordion-content");
  header.toggleClass("active");
  content.toggleClass("show");
});
  


function processRequisitionPurchaser(rowId) {
    console.log("Selected Row ID:", rowId);
    const requisition = requisitionData.find(
      item => item.rowNumber == rowId
    );
    $("#actionRequisitionDate").text(requisition.date);
    $("#actionRequisitionDescription").text(requisition.description);
    $("#actionRequisitionAmount").text(requisition.amount);
    $("#actionRequisitionDescription")
    .text(requisition.description)
    .attr("title", requisition.description);

    $("#userMenuPopup").hide();
    $("#viewRequisitionsData").hide();
    $("#requisitionTableContainer").hide();
    $("#actionOnRequisitionId").css("display", "flex");
}

$(document).on("click", "#approvedBackBttn", function () {
  $("#actionOnRequisitionId").hide();
  $("#viewRequisitionsData").css("display", "flex"); 
  $("#requisitionTableContainer").css("display", "flex");   
});

$(document).on("click", "#approvedResetDataBttn", function () {
  $("#approvedAmount").val("");
  $("#approvedVendor").val("");
  $("#approvedType").val("");
  $("#approvedComment").val("");
});

