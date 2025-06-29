const fs = require("fs");
const path = require("path");

console.log("🔍 Environment Variables Check:");
console.log("");

// Check if .env.local exists
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  console.log("✅ .env.local file exists");

  const envContent = fs.readFileSync(envPath, "utf8");

  const requiredVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXTAUTH_SECRET",
  ];

  let allGood = true;

  requiredVars.forEach((varName) => {
    if (envContent.includes(varName + "=")) {
      console.log(`✅ ${varName}: SET`);
    } else {
      console.log(`❌ ${varName}: NOT SET`);
      allGood = false;
    }
  });

  console.log("");

  if (allGood) {
    console.log("🎉 All required environment variables are set!");
    console.log("You can now restart your development server.");
  } else {
    console.log("⚠️  Please add the missing variables to .env.local");
    console.log("");
    console.log("Add this line to your .env.local file:");
    console.log(
      "NEXTAUTH_SECRET=cd5d6293ddb08176f2b085a2f3056c891b605134d6a2ec695e01c9e2658cc8ac"
    );
  }
} else {
  console.log("❌ .env.local file not found");
  console.log("");
  console.log("Please create .env.local file with:");
  console.log("NEXT_PUBLIC_SUPABASE_URL=your_supabase_url");
  console.log("SUPABASE_SERVICE_ROLE_KEY=your_service_role_key");
  console.log(
    "NEXTAUTH_SECRET=cd5d6293ddb08176f2b085a2f3056c891b605134d6a2ec695e01c9e2658cc8ac"
  );
}
