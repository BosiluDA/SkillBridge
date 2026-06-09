$base = "http://127.0.0.1:5000"

Write-Host "`n--- REGISTER USER 1 (Sarah) ---" -ForegroundColor Cyan
$sarah = Invoke-RestMethod -Uri "$base/api/auth/register" `
  -Method POST -ContentType "application/json" `
  -Body '{"name":"Sarah Martinez","email":"sarah3@test.com","password":"password123"}'
$sarah
$sarahToken = $sarah.token
Write-Host "Sarah Token saved!" -ForegroundColor Green

Write-Host "`n--- REGISTER USER 2 (James) ---" -ForegroundColor Cyan
$james = Invoke-RestMethod -Uri "$base/api/auth/register" `
  -Method POST -ContentType "application/json" `
  -Body '{"name":"James Chen","email":"james3@test.com","password":"password123"}'
$james
$jamesId = $james.user.id
Write-Host "James ID: $jamesId" -ForegroundColor Green

Write-Host "`n--- UPDATE SARAH PROFILE ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/api/users/profile" `
  -Method PUT -ContentType "application/json" `
  -Headers @{Authorization="Bearer $sarahToken"} `
  -Body '{"name":"Sarah Martinez","bio":"Python teacher!","skillsOffered":["Python","Web Dev"],"skillsWanted":["Guitar","Spanish"]}'

Write-Host "`n--- BROWSE USERS ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/api/users" `
  -Method GET `
  -Headers @{Authorization="Bearer $sarahToken"}

Write-Host "`n--- SEND EXCHANGE REQUEST ---" -ForegroundColor Cyan
$exchangeBody = "{`"receiverId`":`"$jamesId`",`"skillWanted`":`"Guitar Lessons`",`"skillOffered`":`"Python Programming`",`"message`":`"Hi James!`"}"
$exchange = Invoke-RestMethod -Uri "$base/api/exchanges" `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $sarahToken"} `
  -Body $exchangeBody
$exchange
$exchangeId = $exchange.exchange._id
Write-Host "Exchange ID: $exchangeId" -ForegroundColor Green

Write-Host "`n--- JAMES ACCEPTS THE REQUEST ---" -ForegroundColor Cyan
$jamesToken = $james.token
Invoke-RestMethod -Uri "$base/api/exchanges/$exchangeId/status" `
  -Method PATCH -ContentType "application/json" `
  -Headers @{Authorization="Bearer $jamesToken"} `
  -Body '{"status":"accepted"}'

Write-Host "`n--- MARK EXCHANGE COMPLETE ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/api/exchanges/$exchangeId/status" `
  -Method PATCH -ContentType "application/json" `
  -Headers @{Authorization="Bearer $sarahToken"} `
  -Body '{"status":"completed"}'

Write-Host "`n--- SARAH REVIEWS JAMES ---" -ForegroundColor Cyan
$reviewBody = "{`"exchangeId`":`"$exchangeId`",`"rating`":5,`"comment`":`"James was amazing!`"}"
Invoke-RestMethod -Uri "$base/api/reviews" `
  -Method POST -ContentType "application/json" `
  -Headers @{Authorization="Bearer $sarahToken"} `
  -Body $reviewBody

Write-Host "`n--- GET JAMES REVIEWS ---" -ForegroundColor Cyan
Invoke-RestMethod -Uri "$base/api/reviews/user/$jamesId" `
  -Method GET `
  -Headers @{Authorization="Bearer $sarahToken"}

Write-Host "`n✅ ALL TESTS COMPLETE!" -ForegroundColor Green