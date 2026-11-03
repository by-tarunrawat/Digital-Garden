# =====================================================================
# SAFE VERSE WORKBENCH MIGRATION & DASHBOARD UPGRADE
# =====================================================================

$ErrorActionPreference = "Stop"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$storiesDir = "Fiction_Vault\Stories_In_Progress"
$verseDir   = Join-Path $storiesDir "Verse_and_Lyrics"
$coldDir    = "Fiction_Vault\Cold_Storage"

New-Item -ItemType Directory -Force -Path $verseDir | Out-Null
New-Item -ItemType Directory -Force -Path $coldDir | Out-Null

Write-Host "[+] Directories verified." -ForegroundColor Cyan

# 1. Move Kitni_Baatein if it exists in root stories
$kitniSrc = Join-Path $storiesDir "Kitni_Baatein_Shikayaten_Monologue.md"
$kitniDst = Join-Path $verseDir "Kitni_Baatein_Shikayaten_Monologue.md"
if (Test-Path $kitniSrc) {
    Move-Item -Path $kitniSrc -Destination $kitniDst -Force
    Write-Host "[✔] Moved Kitni_Baatein_Shikayaten_Monologue.md to Verse_and_Lyrics" -ForegroundColor Green
}

# 2. Simple file mover for the 3 poems into Verse_and_Lyrics
$poems = @("It_Was_Noon_and_Nothing_Is_Concluded.md", "In_The_Meantime_Poem.md", "By_The_Sea_Sagging_Moon_Whitman_Poem.md")
foreach ($poem in $poems) {
    $src = Join-Path $storiesDir $poem
    $dst = Join-Path $verseDir $poem
    if (Test-Path $src) {
        Move-Item -Path $src -Destination $dst -Force
        # Update location field in YAML
        $content = Get-Content -Path $dst -Raw -Encoding UTF8
        $content = $content -replace '(?m)^location:\s*".*?"', 'location: "Fiction_Vault/Stories_In_Progress/Verse_and_Lyrics"'
        Set-Content -Path $dst -Value $content -Encoding UTF8
        Write-Host "[✔] Moved and updated location for: $poem" -ForegroundColor Green
    }
}

# 3. Demote Harjo poem to Cold_Storage
$harjoSrc = Join-Path $storiesDir "The_Sky_You_Were_Born_Under_Harjo_Poem.md"
$harjoDst = Join-Path $coldDir "The_Sky_You_Were_Born_Under_Harjo_Poem.md"
if (Test-Path $harjoSrc) {
    Move-Item -Path $harjoSrc -Destination $harjoDst -Force
    $content = Get-Content -Path $harjoDst -Raw -Encoding UTF8
    $content = $content -replace '(?m)^location:\s*".*?"', 'location: "Fiction_Vault/Cold_Storage"'
    $content = $content -replace '(?m)^verdict:\s*".*?"', 'verdict: "Cold Storage"'
    $content = $content -replace '(?m)^stage:\s*.*$', 'stage: archived'
    Set-Content -Path $harjoDst -Value $content -Encoding UTF8
    Write-Host "[✔] Demoted Harjo poem to Cold_Storage" -ForegroundColor Green
}

Write-Host "[★] All verse files successfully routed!" -ForegroundColor Cyan