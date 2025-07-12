// Quick utility to replace alert() calls with toast notifications
// This can be used as a temporary solution while we gradually replace all alerts

import {
  showGlobalSuccess,
  showGlobalError,
  showGlobalWarning,
  showGlobalInfo,
} from "./toast-utils";

// Global alert replacement functions
export const showAlert = {
  success: (message: string) => {
    if (typeof window !== "undefined") {
      showGlobalSuccess(message);
    } else {
      console.log("Success:", message);
    }
  },

  error: (message: string) => {
    if (typeof window !== "undefined") {
      showGlobalError(message);
    } else {
      console.error("Error:", message);
    }
  },

  warning: (message: string) => {
    if (typeof window !== "undefined") {
      showGlobalWarning(message);
    } else {
      console.warn("Warning:", message);
    }
  },

  info: (message: string) => {
    if (typeof window !== "undefined") {
      showGlobalInfo(message);
    } else {
      console.log("Info:", message);
    }
  },
};

// Replace global alert function
if (typeof window !== "undefined") {
  // @ts-ignore
  window.alert = (message: string) => {
    showAlert.info(message);
  };
}

// Common alert replacements
export const commonAlerts = {
  saved: () => showAlert.success("Settings saved successfully!"),
  created: (item: string) => showAlert.success(`${item} created successfully!`),
  updated: (item: string) => showAlert.success(`${item} updated successfully!`),
  deleted: (item: string) => showAlert.success(`${item} deleted successfully!`),
  uploaded: (item: string) =>
    showAlert.success(`${item} uploaded successfully!`),
  copied: () => showAlert.success("Copied to clipboard!"),
  failedToLoad: (item: string) => showAlert.error(`Failed to load ${item}`),
  failedToSave: (item: string) => showAlert.error(`Failed to save ${item}`),
  failedToCreate: (item: string) => showAlert.error(`Failed to create ${item}`),
  failedToUpdate: (item: string) => showAlert.error(`Failed to update ${item}`),
  failedToDelete: (item: string) => showAlert.error(`Failed to delete ${item}`),
  failedToUpload: (item: string) => showAlert.error(`Failed to upload ${item}`),
  fileTooLarge: (maxSize: string) =>
    showAlert.warning(`File is too large. Maximum size is ${maxSize}`),
  invalidFileType: () =>
    showAlert.warning("Invalid file type. Please select a valid file."),
  incompleteForm: () =>
    showAlert.warning("Please fill in all required fields."),
};
