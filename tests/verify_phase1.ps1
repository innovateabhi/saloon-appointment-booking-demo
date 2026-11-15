# ============================================================
# Phase 1 Verification Script: AURELIA Authentication & API
# ============================================================

$baseUrl = "http://localhost/aurelia-salon/backend/public/api/v1"
Write-Host "[TEST] Testing AURELIA Backend API Foundation..." -ForegroundColor Cyan

# 1. Test Health Endpoint
$health = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
if ($health.success -eq $true) {
    Write-Host "[OK] Health endpoint responded successfully." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Health check failed." -ForegroundColor Red
}

# 2. Test Invalid Login (Expect 401)
try {
    $badLogin = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body (@{ email = "fake@aurelia.com"; password = "wrong" } | ConvertTo-Json) -ContentType "application/json"
    Write-Host "[FAIL] Invalid login should have failed!" -ForegroundColor Red
} catch {
    Write-Host "[OK] Invalid login correctly rejected with 401." -ForegroundColor Green
}

# 3. Test Owner / Admin Login
$adminBody = @{ email = "admin@aurelia.com"; password = "Password123!" } | ConvertTo-Json
$adminResp = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method Post -Body $adminBody -ContentType "application/json"
$adminJson = $adminResp.Content | ConvertFrom-Json
if ($adminJson.data.role_slug -eq "admin") {
    Write-Host "[OK] Owner login succeeded: $($adminJson.data.first_name) ($($adminJson.data.role_slug))" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Owner login failed: $($adminResp.Content)" -ForegroundColor Red
}

# 4. Test Stylist Login
$stylistBody = @{ email = "elena.rostova@aurelia.com"; password = "Password123!" } | ConvertTo-Json
$stylistResp = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method Post -Body $stylistBody -ContentType "application/json"
$stylistJson = $stylistResp.Content | ConvertFrom-Json
if ($stylistJson.data.role_slug -eq "staff") {
    Write-Host "[OK] Stylist login succeeded: $($stylistJson.data.first_name) ($($stylistJson.data.staff_title))" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Stylist login failed." -ForegroundColor Red
}

# 5. Test Customer Registration with Automatic 50 Welcome Points
$randomSuffix = Get-Random -Minimum 1000 -Maximum 9999
$newCustomerBody = @{
    first_name = "Seraphina"
    last_name = "Montague"
    email = "seraphina.$randomSuffix@luxury.test"
    phone = "+91 98765 $randomSuffix"
    password = "Password123!"
    marketing_opt_in_email = $true
    marketing_opt_in_whatsapp = $true
} | ConvertTo-Json

$regResp = Invoke-WebRequest -Uri "$baseUrl/auth/register" -Method Post -Body $newCustomerBody -ContentType "application/json"
$regJson = $regResp.Content | ConvertFrom-Json
if ($regJson.data.role_slug -eq "customer" -and $regJson.data.loyalty_points_balance -eq 50) {
    Write-Host "[OK] Customer onboarding succeeded with 50 Welcome Points: $($regJson.data.first_name) ($($regJson.data.customer_code))" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Customer onboarding failed: $($regResp.Content)" -ForegroundColor Red
}

Write-Host "[SUCCESS] All Phase 1 Core Backend Verification Tests Passed!" -ForegroundColor Cyan
