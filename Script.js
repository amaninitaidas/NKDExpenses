let selectedFacilitator = {};

document.querySelectorAll(".accordion-header").forEach((header) => {
  header.addEventListener("click", () => {
    const content = header.nextElementSibling;

    content.classList.toggle("show");

    header.classList.toggle("active");
  });
});

document.getElementById("passworTxtBox").addEventListener("input", function () {
  let password_input = this.value;
  let error_div = document.getElementById("passworTxtBoxError");
  error_div.innerHTML = "";

  let submitButton = document.getElementById("submitPassBtn");

  submitButton.disabled = true;

  if (password_input.length < 6) {
    return;
  }

  submitButton.disabled = false;
});

function proceedStdLogin() {
  console.log(selectedFacilitator);
  if (selectedFacilitator?.role) {
    SHOW_SPECIFIC_DIV("userMenuPopup");
    document.querySelectorAll(".user-info-block").forEach((element) => {
      element.innerText = selectedFacilitator.name;
    });

    const popup = document.getElementById("userMenuPopup");
    if (!popup) return;

    let admin_div = document.getElementById("adminDropdown");
    if (selectedFacilitator.role.includes("admin")) {
      admin_div.hidden = false;
    } else {
      admin_div.hidden = true;
    }
  } else {
    document.getElementById("passworTxtBox").value = "";
    document.getElementById("passworTxtBoxError").innerHTML = "";
    SHOW_SPECIFIC_DIV("passwordPopup");
  }
}

async function submitPass() {
  const now = new Date();

  let password = GetControlValue("passworTxtBox");
  let error_div = document.getElementById("passworTxtBoxError");
  error_div.innerHTML = "";

  if (password) {
    password = password.trim();
    inputPassword = password;
    const response = await CALL_API("CHECK_PASSWORD", {
      password: inputPassword,
    });

    if (response?.status == "success" && response.data) {
      await DB_SET(
        INDEX_DB.storeKey,
        response.data,
        INDEX_DB.dbName,
        INDEX_DB.storeName,
      );

      selectedFacilitator = response.data;

      proceedStdLogin();
    } else {
      error_div.innerHTML = "Please enter correct password!!";
      return;
    }
  } else {
    error_div.innerHTML = "Please enter correct password!!";
    return;
  }
}

async function onLogoutClick() {
  selectedFacilitator = {};
  await DB_DELETE(INDEX_DB.storeKey, INDEX_DB.dbName, INDEX_DB.storeName);
  document.getElementById("passworTxtBox").value = "";
  document.getElementById("passworTxtBoxError").innerHTML = "";
  SHOW_SPECIFIC_DIV("mainMenuPopup");
}
