<#
Simple deploy script for Windows PowerShell.
Usage:
  .\deploy.ps1 -RepoUrl "https://github.com/USERNAME/REPO.git"

This script will:
- initialize git in the folder if needed
- add remote origin if missing
- add, commit, and push current files to `main` branch

Note: You must have `git` installed and be authenticated (e.g., via Git Credential Manager).
#>

param(
  [Parameter(Mandatory=$true)][string]$RepoUrl
)

Write-Host "Deploying folder: $(Get-Location) to $RepoUrl" -ForegroundColor Cyan

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
  Write-Error "git not found in PATH. Install git and retry."; exit 1
}

if (-not (Test-Path .git)) {
  git init
  Write-Host "Initialized git repository"
}

$currentRemote = git remote get-url origin 2>$null
if (-not $currentRemote) {
  git remote add origin $RepoUrl
  Write-Host "Added remote origin: $RepoUrl"
} else {
  Write-Host "Remote origin exists: $currentRemote"
}

git add .
git commit -m "Deploy: update site" 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Host "No changes to commit or commit failed (continuing)" -ForegroundColor Yellow
}

# Ensure branch main exists locally
git branch --show-current | Out-Null
try {
  git rev-parse --verify main > $null 2>&1
  git branch -M main
} catch {
  git branch -M main
}

Write-Host "Pushing to origin main..." -ForegroundColor Green
git push -u origin main

if ($LASTEXITCODE -eq 0) { Write-Host "Push complete." -ForegroundColor Green } else { Write-Error "Push failed. Check remote URL / authentication." }
