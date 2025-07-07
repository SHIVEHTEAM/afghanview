export function getContrastColor(backgroundColor: string): string {
  // Convert hex to RGB
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // Return black or white based on luminance
  return luminance > 0.5 ? "#000000" : "#ffffff";
}

export async function generateFact(
  prompt: string
): Promise<{ fact: string; backgroundColor: string }> {
  const response = await fetch("/api/facts/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.error || `Failed to generate fact: ${response.statusText}`
    );
    // Add status code to error for better handling
    (error as any).status = response.status;
    (error as any).isApologetic = errorData.isApologetic;
    throw error;
  }

  return await response.json();
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error("Failed to copy text:", error);
    return false;
  }
}
