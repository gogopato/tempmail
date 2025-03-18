// DOM Elements
const emailDisplay = document.getElementById("email-address");
const generateBtn = document.getElementById("generate-btn");
const copyBtn = document.getElementById("copy-btn");
const emailInbox = document.getElementById("email-inbox");
const mailCounter = document.getElementById("mail-counter");
const refreshBtn = document.getElementById("refresh-btn");
const emailPreview = document.getElementById("email-preview");
const emailDetail = document.getElementById("email-detail");

// Predefined domains
const domains = [
   "marunouchi.top",
   "mail360.xyz",
   "rokisasaki.top",
   "onlytools.xyz",
   "tempmail007.com",
   "bomebarato.top",
];

let currentEmail = "";

// Constants
const REFRESH_INTERVAL = 30000; // 30 seconds
const API_BASE_URL = "https://tempmailnew.com";

// Function to generate a new random email
function generateEmail() {
  let randomString = Math.random().toString(36).substring(2, 10);
  let randomDomain = domains[Math.floor(Math.random() * domains.length)];
  currentEmail = `${randomString}@${randomDomain}`;

  emailDisplay.value = currentEmail;
  // Store the generated email in localStorage
  localStorage.setItem("email", currentEmail);

  // Clear the previous email preview and inbox
  emailPreview.style.display = "none";
  emailDetail.innerHTML = "";
  mailCounter.textContent = "0 messages"; // Reset message count

  fetchEmails();
}

// Copy Email to Clipboard Function
copyBtn.addEventListener("click", () => {
  const email = emailDisplay.value.trim();
  if (email) {
    navigator.clipboard.writeText(email)
      .then(() => {
        alert("Email copied to clipboard!");
      })
      .catch(err => {
        console.error("Error copying email: ", err);
      });
  } else {
    alert("No email to copy!");
  }
});

// Function to fetch emails
async function fetchEmails() {
  let email = emailDisplay.value.trim() || currentEmail;
  if (!email) {
    alert("Please enter or generate an email first.");
    return;
  }

  // Clear previous email preview
  emailPreview.style.display = "none";
  emailDetail.innerHTML = "";
  mailCounter.textContent = "Fetching emails..."; // Reset message count to "Fetching emails"

  emailInbox.innerHTML = "Fetching emails...";

  try {
    let response = await fetch(`${API_BASE_URL}/api/emails-list/${email.toLowerCase()}`)

    if (!response.ok) throw new Error("No messages yet");

    let data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error("No messages found.");
    }

    mailCounter.textContent = `${data.length} message${
      data.length !== 1 ? "s" : ""
    }`;
    emailInbox.innerHTML = "";

    data.forEach((emailData) => {
      let emailElement = document.createElement("div");
      emailElement.className = "email-item";
      emailElement.setAttribute("data-id", emailData._id); // Add the email ID as data attribute
      emailElement.innerHTML = ` 
        <strong>${emailData.subject || "No Subject"}</strong>
        <br>
        From: ${emailData.from?.text || "Unknown"} <br>
        Date: ${emailData.date ? new Date(emailData.date).toLocaleString() : "Unknown"}
        <span class="delete-icon" onclick="deleteEmail('${emailData._id}')">🗑️</span>
      `;

      // Pass the email address and email ID correctly
      emailElement.onclick = () => showEmailPreview(email, emailData._id);
      emailInbox.appendChild(emailElement);
    });
  } catch (error) {
    mailCounter.textContent = "0 messages"; // Reset message count on error
    emailInbox.innerHTML = "No Email Found";
    console.error("Error:", error);
  }
}

// Function to fetch and display full email details
async function showEmailPreview(email, emailId) {
  try {
    let apiUrl = `${API_BASE_URL}/api/email/${email}/${emailId}`;

    let response = await fetch(apiUrl);

    if (!response.ok) throw new Error("Failed to fetch email");

    let emailData = await response.json();
    let emailDetails = emailData[0]; // Assuming a single email response

    const subject = emailDetails.subject || "No Subject";
    const from = emailDetails.from.text || "Unknown Sender";
    const to = emailDetails.to?.text || "Unknown Recipient";
    const date = emailDetails.date
      ? new Date(emailDetails.date).toLocaleString()
      : "No Date";
    const body =
      emailDetails.html || emailDetails.text || "<p>No message body</p>";

    // Show Email Preview Section
    emailPreview.style.display = "block";
    emailDetail.innerHTML = `
      <h3>${subject}</h3>
      <p><strong>From:</strong> ${from}</p>
      <p><strong>To:</strong> ${to}</p>
      <p><strong>Date:</strong> ${date}</p>
      <hr>
      <div class="email-body">${body}</div>
    `;

    // Handle Attachments (if available)
    if (emailDetails.attachments && emailDetails.attachments.length > 0) {
      let attachmentsHTML = "<h4>Attachments:</h4><ul>";
      emailDetails.attachments.forEach((attachment) => {
        const attachmentUrl = `${API_BASE_URL}/mailserver/attachments/${attachment.directory}/${attachment.filename}`;
        attachmentsHTML += `<li><a href="${attachmentUrl}" target="_blank">${attachment.filename}</a></li>`;
      });
      attachmentsHTML += "</ul>";
      emailDetail.innerHTML += attachmentsHTML;
    }

  } catch (error) {
    console.error("Error fetching email details:", error);
    emailDetail.innerHTML = "<p>Error loading email</p>";
  }
}

// Debounce implementation: delay the fetchEmails function until user stops typing
let debounceTimer;
const DEBOUNCE_DELAY = 500; // Delay in milliseconds (500ms = 0.5 second)

emailDisplay.addEventListener("input", () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    fetchEmails();
  }, DEBOUNCE_DELAY);
});

// Auto-refresh
setInterval(fetchEmails, REFRESH_INTERVAL);

// Event Listeners
if (generateBtn) generateBtn.addEventListener("click", generateEmail);

copyBtn.addEventListener("click", () =>
  navigator.clipboard.writeText(emailDisplay.value)
);
refreshBtn.addEventListener("click", fetchEmails);

// Check for existing email in localStorage and use it if available
window.onload = () => {
  let storedEmail;
  try {
    storedEmail = localStorage.getItem("email");
  } catch (error) {
    console.error("LocalStorage access error:", error);
  }

  if (storedEmail) {
    currentEmail = storedEmail;
    emailDisplay.value = currentEmail;
    fetchEmails();
  } else {
    // If no email is stored, set 'mybea@marunouchi.top' as the default
    currentEmail = "mybest11@marunouchi.top";
    emailDisplay.value = currentEmail;
    localStorage.setItem("email", currentEmail);
    fetchEmails();
  }
};

// Function to delete an email
async function deleteEmail(emailId) {
  if (!emailId) {
    alert("No email ID provided!");
    return;
  }

  try {
    // Construct the delete API URL
    let deleteUrl = `${API_BASE_URL}/api/email/${email}/${emailId}`;

    // Send the DELETE request to the server
    let response = await fetch(deleteUrl, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error("Failed to delete email");

    // If deletion was successful, remove the email from the UI
    const emailElement = document.querySelector(`[data-id="${emailId}"]`);
    if (emailElement) {
      emailElement.remove();
    }

    alert("Email deleted successfully!");
  } catch (error) {
    console.error("Error deleting email:", error);
    alert("Error deleting email. Please try again.");
  }
}
