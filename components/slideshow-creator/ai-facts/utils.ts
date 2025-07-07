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

const GRADIENT_OPTIONS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
];

const EMOJI_OPTIONS = [
  "💡",
  "🌟",
  "💫",
  "✨",
  "🎉",
  "🔥",
  "💎",
  "🌺",
  "🌸",
  "🌼",
  "🍃",
  "🌿",
  "🌱",
  "🌳",
  "🌲",
  "🌴",
  "🌵",
  "🌾",
  "🌷",
  "🌹",
  "🏛️",
  "🏰",
  "🕌",
  "🕍",
  "⛪",
  "🛕",
  "🏯",
  "🏛️",
  "🗽",
  "🗼",
  "🎊",
  "🎈",
  "🎁",
  "🎀",
  "🎪",
  "🎭",
  "🎨",
  "🎬",
  "🎤",
  "🎧",
];

function getRandomGradient(): string {
  return GRADIENT_OPTIONS[Math.floor(Math.random() * GRADIENT_OPTIONS.length)];
}

function getRandomEmoji(): string {
  return EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)];
}

export async function generateFact(
  prompt: string
): Promise<{ fact: string; backgroundColor: string; emoji: string }> {
  // Add instruction to the prompt for emoji and gradient
  const enhancedPrompt = `${prompt}\n\nIMPORTANT: For this fact, also suggest a suitable emoji and a beautiful background gradient (as a CSS linear-gradient string). Return the fact, emoji, and gradient.`;

  const response = await fetch("/api/facts/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ prompt: enhancedPrompt }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.error || `Failed to generate fact: ${response.statusText}`
    );
    (error as any).status = response.status;
    (error as any).isApologetic = errorData.isApologetic;
    throw error;
  }

  const data = await response.json();
  return {
    fact: data.fact,
    backgroundColor: data.backgroundColor, // must be provided by AI
    emoji: data.emoji, // must be provided by AI
  };
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
