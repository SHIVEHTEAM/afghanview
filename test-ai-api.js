const fetch = require("node-fetch");

async function testAIAPI() {
  try {
    console.log("Testing AI All-in-One API...");

    const response = await fetch(
      "http://localhost:3000/api/slides/ai-all-in-one",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: "Create a simple restaurant menu slide",
        }),
      }
    );

    console.log("Response status:", response.status);
    console.log("Response headers:", response.headers.raw());

    const data = await response.text();
    console.log("Response body:", data);
  } catch (error) {
    console.error("Error testing API:", error);
  }
}

testAIAPI();
