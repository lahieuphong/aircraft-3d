param(
  [switch]$WebP
)

$ErrorActionPreference = "Stop"
$ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$SourceModel = Join-Path $ProjectRoot "aircraft.glb"
$OutputDirectory = Join-Path $ProjectRoot "public\models"
$TempDirectory = Join-Path $ProjectRoot ".model-build"

if (-not (Test-Path -LiteralPath $SourceModel)) {
  throw "Khong tim thay aircraft.glb o thu muc goc du an."
}

if (-not $TempDirectory.StartsWith($ProjectRoot, [StringComparison]::OrdinalIgnoreCase)) {
  throw "Thu muc tam phai nam ben trong du an."
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
New-Item -ItemType Directory -Force -Path $TempDirectory | Out-Null

function Invoke-Checked {
  param(
    [scriptblock]$Command,
    [string]$ErrorMessage
  )

  & $Command
  if ($LASTEXITCODE -ne 0) { throw $ErrorMessage }
}

function Build-ModelVariant {
  param(
    [string]$Profile,
    [string]$OutputFileName,
    [int]$TextureSize,
    [int]$WebPQuality
  )

  $ResizedModel = Join-Path $TempDirectory "aircraft-$Profile-resized.glb"
  $TextureModel = Join-Path $TempDirectory "aircraft-$Profile-textures.glb"
  $SimplifiedModel = Join-Path $TempDirectory "aircraft-$Profile-simplified.glb"
  $JoinedModel = Join-Path $TempDirectory "aircraft-$Profile-joined.glb"
  $OutputModel = Join-Path $OutputDirectory $OutputFileName

  Write-Host "[$Profile] Resize textures to max $TextureSize px..." -ForegroundColor Cyan
  Invoke-Checked {
    & npx gltf-transform resize $PreparedModel $ResizedModel --width $TextureSize --height $TextureSize
  } "Resize $Profile failed."

  if ($WebP) {
    Write-Host "[$Profile] Encode WebP fallback..." -ForegroundColor Cyan
    Invoke-Checked {
      & npx gltf-transform webp $ResizedModel $TextureModel --quality $WebPQuality --effort 5
    } "WebP compression $Profile failed."
  }
  else {
    Write-Host "[$Profile] Encode ETC1S KTX2 with mipmaps..." -ForegroundColor Cyan
    Invoke-Checked {
      & node (Join-Path $ProjectRoot "scripts\encode-ktx2.mjs") $ResizedModel $TextureModel
    } "KTX2 compression $Profile failed."
  }

  Write-Host "[$Profile] Reduce opaque geometry; preserve glass..." -ForegroundColor Cyan
  Invoke-Checked {
    & node (Join-Path $ProjectRoot "scripts\optimize-geometry.mjs") $TextureModel $SimplifiedModel
  } "Geometry optimization $Profile failed."

  Write-Host "[$Profile] Merge compatible primitives to reduce draw calls..." -ForegroundColor Cyan
  Invoke-Checked {
    & npx gltf-transform join $SimplifiedModel $JoinedModel --keepMeshes false --keepNamed false
  } "Primitive join $Profile failed."

  Write-Host "[$Profile] Encode geometry with Meshopt..." -ForegroundColor Cyan
  Invoke-Checked {
    & npx gltf-transform meshopt $JoinedModel $OutputModel --level high
  } "Meshopt $Profile failed."
}

try {
  $PreparedModel = Join-Path $TempDirectory "aircraft-prepared.glb"
  Write-Host "Normalize transparent glass and remove unused glass maps..." -ForegroundColor Cyan
  Invoke-Checked {
    & node (Join-Path $ProjectRoot "scripts\prepare-model.mjs") $SourceModel $PreparedModel
  } "Model preparation failed."

  Build-ModelVariant -Profile "pc" -OutputFileName "aircraft-pc.glb" -TextureSize 1024 -WebPQuality 82
  Build-ModelVariant -Profile "mobile" -OutputFileName "aircraft-mobile.glb" -TextureSize 512 -WebPQuality 80

  $TextureFormat = if ($WebP) { "WebP" } else { "ETC1S KTX2" }
  Write-Host "Done: $TextureFormat + Meshopt assets are in public\models." -ForegroundColor Green
}
finally {
  if (Test-Path -LiteralPath $TempDirectory) {
    Remove-Item -LiteralPath $TempDirectory -Recurse -Force
  }
}
