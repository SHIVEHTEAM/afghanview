// Test script to verify SVG generation and base64 encoding
const testSvgGeneration = () => {
  console.log("Testing SVG generation...");

  // Test fact data
  const fact = {
    text: "In Tajik cuisine, the traditional dish of Qabili Palau is a fragrant rice dish flavored with raisins, carrots, and a special blend of spices. This cherished recipe has been passed down for generations.",
    category: "Afghan Food & Cuisine",
    backgroundColor: "#5e548e",
    fontColor: "#ffffff",
  };

  // Create wrapped text function
  const createWrappedText = (text, maxWidth, fontSize) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine ? currentLine + " " + word : word;
      const estimatedWidth = testLine.length * fontSize * 0.6;

      if (estimatedWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  };

  // Generate SVG
  const factText = fact.text || "No text available";
  const categoryText = fact.category || "Afghan Culture";
  const backgroundColor = fact.backgroundColor || "#5a4181";
  const fontColor = fact.fontColor || "#ffffff";

  const wrappedLines = createWrappedText(factText, 1600, 48);
  const startY = 400 - (wrappedLines.length - 1) * 30;

  let textElements = "";
  wrappedLines.forEach((line, index) => {
    const y = startY + index * 60;
    textElements += `<text x="960" y="${y}" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${fontColor}">${line}</text>`;
  });

  textElements += `<text x="960" y="${
    startY + wrappedLines.length * 60 + 40
  }" text-anchor="middle" dominant-baseline="middle" font-family="Arial, sans-serif" font-size="24" fill="${fontColor}" opacity="0.8">${categoryText}</text>`;

  const svgContent = `<svg width="1920" height="1080" viewBox="0 0 1920 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1920" height="1080" fill="${backgroundColor}"/>
    ${textElements}
  </svg>`;

  console.log("Generated SVG content:");
  console.log(svgContent);

  // Test base64 encoding
  const encodeSvgToBase64 = (svg) => {
    try {
      const bytes = new TextEncoder().encode(svg);
      const binary = Array.from(bytes, (byte) =>
        String.fromCharCode(byte)
      ).join("");
      const result = btoa(binary);
      console.log("Base64 encoding successful");
      return result;
    } catch (error) {
      console.error("Base64 encoding failed:", error);
      return null;
    }
  };

  const base64Result = encodeSvgToBase64(svgContent);
  if (base64Result) {
    const dataUrl = `data:image/svg+xml;base64,${base64Result}`;
    console.log("Data URL generated successfully");
    console.log("Data URL length:", dataUrl.length);
    console.log("Data URL preview:", dataUrl.substring(0, 100) + "...");

    // Test decoding
    try {
      const base64Data = dataUrl.split(",")[1];
      const decodedSvg = atob(base64Data);
      console.log("SVG decoded successfully");
      console.log("Decoded content matches:", decodedSvg === svgContent);
    } catch (error) {
      console.error("SVG decoding failed:", error);
    }
  }

  console.log("Test completed!");
};

// Run the test
testSvgGeneration();
