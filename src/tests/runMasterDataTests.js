/**
 * TEST RUNNER - Master Data Lifecycle Tests
 * Phase 4.4E - Canonical Master Data Lifecycle Implementation
 * 
 * This script runs all master data lifecycle tests and reports results.
 * Run this from browser console or integrate into app initialization.
 */

import { runMasterDataLifecycleTests } from "./masterDataLifecycle.test";

// Run tests and expose results globally for inspection
window.__MASTER_DATA_TESTS__ = {
    run: async () => {
        console.log("\n🚀 Starting Master Data Lifecycle Tests...\n");
        
        try {
            const results = await runMasterDataLifecycleTests();
            
            // Expose results globally
            window.__TEST_RESULTS__ = results;
            
            // Log summary
            console.log("\n" + "=".repeat(80));
            console.log("TEST EXECUTION COMPLETE");
            console.log("=".repeat(80));
            console.log("View detailed results: window.__TEST_RESULTS__");
            console.log("Run again: window.__MASTER_DATA_TESTS__.run()");
            console.log("=".repeat(80));
            
            if (results.failed === 0) {
                console.log("\n✅ ALL TESTS PASSED - Master Data Lifecycle is production-ready!\n");
            } else {
                console.log(`\n⚠️ ${results.failed} test(s) failed. Review logs above.\n`);
            }
            
            return results;
        } catch (error) {
            console.error("[TEST RUNNER] Fatal error:", error);
            return {
                passed: 0,
                failed: 1,
                tests: [{ status: "FAIL", message: `Test runner error: ${error.message}` }],
            };
        }
    },
    
    getResults: () => window.__TEST_RESULTS__ || null,
    
    clearResults: () => {
        window.__TEST_RESULTS__ = null;
        console.log("[TEST RUNNER] Results cleared");
    },
};

// Auto-run if in development mode
if (process.env.NODE_ENV === "development") {
    console.log("\n[TEST RUNNER] Master Data Lifecycle Tests available at: window.__MASTER_DATA_TESTS__");
    console.log("[TEST RUNNER] Run tests: window.__MASTER_DATA_TESTS__.run()");
}

export default window.__MASTER_DATA_TESTS__;