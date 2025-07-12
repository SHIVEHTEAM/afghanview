import { useToast } from "../components/ui/Toast";

// Custom hook for easy toast usage
export function useToastNotifications() {
  const { showSuccess, showError, showWarning, showInfo } = useToast();

  return {
    // Success notifications
    showSuccess: (message: string) => showSuccess(message),

    // Error notifications
    showError: (message: string) => showError(message),

    // Warning notifications
    showWarning: (message: string) => showWarning(message),

    // Info notifications
    showInfo: (message: string) => showInfo(message),

    // Common success messages
    saved: () => showSuccess("Settings saved successfully!"),
    created: (item: string) => showSuccess(`${item} created successfully!`),
    updated: (item: string) => showSuccess(`${item} updated successfully!`),
    deleted: (item: string) => showSuccess(`${item} deleted successfully!`),
    uploaded: (item: string) => showSuccess(`${item} uploaded successfully!`),
    copied: () => showSuccess("Copied to clipboard!"),
    imported: () => showSuccess("Data imported successfully!"),
    exported: () => showSuccess("Data exported successfully!"),
    cleared: () => showSuccess("Data cleared successfully!"),

    // Common error messages
    failedToLoad: (item: string) => showError(`Failed to load ${item}`),
    failedToSave: (item: string) => showError(`Failed to save ${item}`),
    failedToCreate: (item: string) => showError(`Failed to create ${item}`),
    failedToUpdate: (item: string) => showError(`Failed to update ${item}`),
    failedToDelete: (item: string) => showError(`Failed to delete ${item}`),
    failedToUpload: (item: string) => showError(`Failed to upload ${item}`),
    networkError: () =>
      showError("Network error. Please check your connection."),
    serverError: () => showError("Server error. Please try again later."),
    validationError: (message: string) => showError(message),

    // Common warning messages
    fileTooLarge: (maxSize: string) =>
      showWarning(`File is too large. Maximum size is ${maxSize}`),
    invalidFileType: () =>
      showWarning("Invalid file type. Please select a valid file."),
    incompleteForm: () => showWarning("Please fill in all required fields."),
    unsavedChanges: () => showWarning("You have unsaved changes."),
  };
}

// Global toast functions for use outside of React components
let globalToast: any = null;

export function setGlobalToast(toastInstance: any) {
  globalToast = toastInstance;
}

export function showGlobalSuccess(message: string) {
  if (globalToast) {
    globalToast.showSuccess(message);
  } else {
    console.log("Toast not available:", message);
  }
}

export function showGlobalError(message: string) {
  if (globalToast) {
    globalToast.showError(message);
  } else {
    console.error("Toast not available:", message);
  }
}

export function showGlobalWarning(message: string) {
  if (globalToast) {
    globalToast.showWarning(message);
  } else {
    console.warn("Toast not available:", message);
  }
}

export function showGlobalInfo(message: string) {
  if (globalToast) {
    globalToast.showInfo(message);
  } else {
    console.log("Toast not available:", message);
  }
}
