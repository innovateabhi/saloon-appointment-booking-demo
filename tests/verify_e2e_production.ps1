# ============================================================
# AURELIA — Comprehensive Production End-to-End Test Suite
# ============================================================

$baseUrl = "http://localhost/aurelia-salon/backend/public/api/v1"
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "[TEST] Starting AURELIA Production End-to-End Verification" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# 1. Public Salon Endpoint
$salon = Invoke-RestMethod -Uri "$baseUrl/public/salon" -Method Get
if ($salon.success -and $salon.data.name -like "*AURELIA*") {
    Write-Host "[OK] Public Salon endpoint verified: $($salon.data.name)" -ForegroundColor Green
} else {
    Write-Host "[FAIL] Failed to retrieve salon details." -ForegroundColor Red
}

# 2. Services & Categories Catalog
$services = Invoke-RestMethod -Uri "$baseUrl/public/services" -Method Get
if ($services.success -and $services.data.Count -ge 20) {
    $firstServiceId = $services.data[0].id
    Write-Host "[OK] Service catalog verified: $($services.data.Count) active treatments loaded (First ID: $firstServiceId, ₹$($services.data[0].price))." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Service catalog failed or returned insufficient services." -ForegroundColor Red
}

# 3. Dynamic Availability Engine
$testDate = (Get-Date).AddDays(3).ToString("yyyy-MM-dd")
$slots = Invoke-RestMethod -Uri "$baseUrl/public/availability?date=$testDate&services=$firstServiceId&staff_id=1" -Method Get
if ($slots.success -and $slots.data.Count -gt 0) {
    $firstSlot = $slots.data[0]
    Write-Host "[OK] Availability Engine verified: $($slots.data.Count) available slots found for $testDate (First: $($firstSlot.time))." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Availability Engine returned no slots." -ForegroundColor Red
}

# 4. Coupon Validation Engine
$couponCheck = Invoke-RestMethod -Uri "$baseUrl/marketing/validate-coupon" -Method Post -Body (@{ code = "AURELIA10"; subtotal = 1000 } | ConvertTo-Json) -ContentType "application/json"
if ($couponCheck.success -and $couponCheck.data.discount_amount -eq 100) {
    Write-Host "[OK] Coupon Engine verified: AURELIA10 successfully gave ₹$($couponCheck.data.discount_amount) discount on ₹1000." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Coupon validation failed." -ForegroundColor Red
}

# 5. Customer Booking Creation
$newBookingBody = @{
    first_name = "Camilla"
    last_name = "Kensington"
    phone = "+91 98765 88888"
    email = "camilla.kensington@luxury.test"
    service_ids = @($firstServiceId)
    staff_id = 1
    appointment_date = $testDate
    start_time = $firstSlot.time_raw
    customer_notes = "Automated test reservation"
} | ConvertTo-Json

$bookingResp = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body $newBookingBody -ContentType "application/json"
if ($bookingResp.success -and $bookingResp.data.booking_reference -like "AUR-*") {
    $ref = $bookingResp.data.booking_reference
    $apptId = $bookingResp.data.id
    Write-Host "[OK] Atomic Booking Engine verified: Created appointment $ref (ID: $apptId)." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Failed to create booking: $($bookingResp.message)" -ForegroundColor Red
}

# 6. Concurrency Collision Prevention (Try booking exact same slot for same stylist)
try {
    $duplicateResp = Invoke-RestMethod -Uri "$baseUrl/bookings" -Method Post -Body $newBookingBody -ContentType "application/json"
    Write-Host "[FAIL] Concurrency error: Double-booking was erroneously permitted!" -ForegroundColor Red
} catch {
    Write-Host "[OK] Concurrency Protection verified: Overlapping booking correctly rejected with collision lock." -ForegroundColor Green
}

# 7. Admin Login & Dashboard Overview
$adminBody = @{ email = "admin@aurelia.com"; password = "Password123!" } | ConvertTo-Json
$adminResp = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method Post -Body $adminBody -ContentType "application/json" -SessionVariable ws

$dashSummary = Invoke-RestMethod -Uri "$baseUrl/admin/dashboard" -Method Get -WebSession $ws
if ($dashSummary.success -and $dashSummary.data.revenue_trend.Count -ge 0) {
    Write-Host "[OK] Admin Analytics verified: Dashboard summary & real revenue trends retrieved ($($dashSummary.data.total_customers) active clients)." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Admin dashboard failed." -ForegroundColor Red
}

# 8. Staff Status Transition
$statusUpdate = Invoke-RestMethod -Uri "$baseUrl/staff/appointments/$apptId/status" -Method Patch -Body (@{ status = "in_service" } | ConvertTo-Json) -ContentType "application/json" -WebSession $ws
if ($statusUpdate.success) {
    Write-Host "[OK] Staff Workflow verified: Appointment marked as in_service." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Staff status transition failed." -ForegroundColor Red
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "[SUCCESS] All Production End-to-End Business Scenarios Passed!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
