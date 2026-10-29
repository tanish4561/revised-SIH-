/**
 * API Test Script for NDRF Admin Dashboard
 * Tests GET and POST endpoints with mock Flask backend
 */

// Import API functions
import { getDashboardOverview } from "./dashboard"
import { getPersonnel, createPersonnel } from "./personnel"
import { getReports, getSessionDetail } from "./reports"
import { getAnalyticsAggregate } from "./analytics"

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

function log(message: string, color: keyof typeof colors = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

async function testGetDashboardOverview() {
  log("\n📊 Testing GET /api/dashboard/overview", "cyan")
  try {
    const data = await getDashboardOverview()
    log("✅ Success!", "green")
    console.log("Response:", JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log("❌ Failed!", "red")
    console.error(error)
    return false
  }
}

async function testGetPersonnel() {
  log("\n👥 Testing GET /api/personnel?page=1&limit=10", "cyan")
  try {
    const data = await getPersonnel(1, 10)
    log("✅ Success!", "green")
    console.log("Response:", JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log("❌ Failed!", "red")
    console.error(error)
    return false
  }
}

async function testGetPersonnelWithSearch() {
  log("\n🔍 Testing GET /api/personnel?search=Kumar", "cyan")
  try {
    const data = await getPersonnel(1, 10, "Kumar")
    log("✅ Success!", "green")
    console.log("Response:", JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log("❌ Failed!", "red")
    console.error(error)
    return false
  }
}

async function testCreatePersonnel() {
  log("\n➕ Testing POST /api/personnel", "cyan")
  try {
    const newPersonnel = {
      name: "Test Officer Sharma",
      rank: "Squad Leader",
      total_sessions: 0,
      last_trained_date: new Date().toISOString().split("T")[0],
      status: "ACTIVE" as const,
    }
    log("Request Body:", "yellow")
    console.log(JSON.stringify(newPersonnel, null, 2))
    
    const data = await createPersonnel(newPersonnel)
    log("✅ Success!", "green")
    console.log("Response:", JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log("❌ Failed!", "red")
    console.error(error)
    return false
  }
}

async function testGetReports() {
  log("\n📋 Testing GET /api/reports?page=1&limit=10", "cyan")
  try {
    const data = await getReports({ page: 1, limit: 10 })
    log("✅ Success!", "green")
    console.log("Response:", JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log("❌ Failed!", "red")
    console.error(error)
    return false
  }
}

async function testGetReportsWithFilters() {
  log("\n🔍 Testing GET /api/reports with filters (status=PASSED, search=Kumar)", "cyan")
  try {
    const data = await getReports({
      page: 1,
      limit: 10,
      status: "PASSED",
      search: "Kumar",
    })
    log("✅ Success!", "green")
    console.log("Response:", JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log("❌ Failed!", "red")
    console.error(error)
    return false
  }
}

async function testGetSessionDetail() {
  log("\n📄 Testing GET /api/reports/SESS_402", "cyan")
  try {
    const data = await getSessionDetail("SESS_402")
    log("✅ Success!", "green")
    console.log("Response:", JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log("❌ Failed!", "red")
    console.error(error)
    return false
  }
}

async function testGetAnalytics() {
  log("\n📈 Testing GET /api/analytics/aggregate", "cyan")
  try {
    const data = await getAnalyticsAggregate()
    log("✅ Success!", "green")
    console.log("Response:", JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    log("❌ Failed!", "red")
    console.error(error)
    return false
  }
}

// Main test runner
async function runAllTests() {
  log("=".repeat(60), "blue")
  log("🧪 NDRF Admin Dashboard - API Test Suite", "blue")
  log("=".repeat(60), "blue")
  log(`Backend URL: ${process.env.NEXT_PUBLIC_API_URL || "http://0.0.0.0:5000"}`, "yellow")
  log("Note: Tests will use mock data if backend is unavailable\n", "yellow")

  const results = {
    passed: 0,
    failed: 0,
  }

  // Run all tests
  const tests = [
    testGetDashboardOverview,
    testGetPersonnel,
    testGetPersonnelWithSearch,
    testCreatePersonnel,
    testGetReports,
    testGetReportsWithFilters,
    testGetSessionDetail,
    testGetAnalytics,
  ]

  for (const test of tests) {
    const success = await test()
    if (success) results.passed++
    else results.failed++
  }

  // Print summary
  log("\n" + "=".repeat(60), "blue")
  log("📊 Test Results Summary", "blue")
  log("=".repeat(60), "blue")
  log(`✅ Passed: ${results.passed}`, "green")
  log(`❌ Failed: ${results.failed}`, "red")
  log(`Total: ${results.passed + results.failed}`, "blue")
  log("=".repeat(60), "blue")
}

// Run tests
runAllTests().catch(console.error)
