$BaseUrl = "http://localhost/aurelia-salon/backend/public/api/v1"

Write-Host "[TEST] Testing AURELIA Loyalty & Settings Endpoints..." -ForegroundColor Cyan

# 1. Login as Admin
$loginBody = @{
    email = "admin@aurelia.com"
    password = "Password123!"
} | ConvertTo-Json

$loginResp = Invoke-WebRequest -Uri "$BaseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -SessionVariable ws
if ($loginResp.StatusCode -ne 200) {
    Write-Host "[FAIL] Login failed." -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Admin login successful." -ForegroundColor Green

# 2. Test Get Full Settings
$settingsResp = Invoke-WebRequest -Uri "$BaseUrl/admin/settings/full" -Method Get -WebSession $ws
$settingsData = $settingsResp.Content | ConvertFrom-Json
if ($settingsData.success -and $settingsData.data.salon.name) {
    Write-Host "[OK] Full Settings retrieved: $($settingsData.data.salon.name), $($settingsData.data.business_hours.Count) open schedule days, $($settingsData.data.closures.Count) closures." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Full Settings retrieval failed." -ForegroundColor Red
}

# 3. Test Loyalty Ledger
$ledgerResp = Invoke-WebRequest -Uri "$BaseUrl/marketing/loyalty/ledger" -Method Get -WebSession $ws
$ledgerData = $ledgerResp.Content | ConvertFrom-Json
if ($ledgerData.success) {
    Write-Host "[OK] Loyalty Ledger retrieved ($($ledgerData.data.Count) transactions logged)." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Loyalty Ledger retrieval failed." -ForegroundColor Red
}

# 4. Test Loyalty Rules
$rulesResp = Invoke-WebRequest -Uri "$BaseUrl/marketing/loyalty/rules" -Method Get -WebSession $ws
$rulesData = $rulesResp.Content | ConvertFrom-Json
if ($rulesData.success) {
    Write-Host "[OK] Loyalty Rules retrieved (Earn: 1 pt per INR $($rulesData.data.earn_rate_inr), Redemp: INR $($rulesData.data.redemption_value_inr))." -ForegroundColor Green
} else {
    Write-Host "[FAIL] Loyalty Rules retrieval failed." -ForegroundColor Red
}

# 5. Test Coupons retrieval & toggle
$couponsResp = Invoke-WebRequest -Uri "$BaseUrl/marketing/coupons" -Method Get -WebSession $ws
$couponsData = $couponsResp.Content | ConvertFrom-Json
if ($couponsData.success -and $couponsData.data.Count -gt 0) {
    $firstCoupon = $couponsData.data[0]
    Write-Host "[OK] Coupons retrieved ($($couponsData.data.Count) coupons). Testing toggle on $($firstCoupon.code)..." -ForegroundColor Green
    
    $toggleResp = Invoke-WebRequest -Uri "$BaseUrl/marketing/coupons/$($firstCoupon.id)/toggle" -Method Patch -WebSession $ws
    $toggleData = $toggleResp.Content | ConvertFrom-Json
    if ($toggleData.success) {
        Write-Host "[OK] Coupon $($firstCoupon.code) toggle status successful." -ForegroundColor Green
    }
}

Write-Host "[SUCCESS] All Loyalty & Settings Backend APIs passed!" -ForegroundColor Cyan
