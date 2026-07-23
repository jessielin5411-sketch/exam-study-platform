# ExamMate English listening audio generator.
# Uses the built-in Microsoft Zira voice. No API or network service is needed.

$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$outputDirectory = Join-Path $projectRoot "assets\audio\english"
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

Push-Location $projectRoot
try {
  $questionJson = & node -e "global.window={};require('./question-bank.js');require('./exam-question-bank.js');require('./english-expansion-bank.js');require('./english-question-bank-100.js');console.log(JSON.stringify(window.examMateQuestionBank.english.questions.filter(q=>q.audioText).map(q=>({id:q.id,text:q.audioText}))));"
  if ($LASTEXITCODE -ne 0) { throw "Unable to read English listening questions." }
  $questions = $questionJson | ConvertFrom-Json
}
finally {
  Pop-Location
}

Add-Type -AssemblyName System.Speech
$synthesizer = New-Object System.Speech.Synthesis.SpeechSynthesizer

try {
  try {
    $synthesizer.SelectVoice("Microsoft Zira Desktop")
  }
  catch {
    # Some Windows installations list Zira but do not allow selecting it.
    # In that case, keep the available default voice so audio remains usable.
  }
  $synthesizer.Rate = -1
  $synthesizer.Volume = 100
  $selectedVoice = $synthesizer.Voice.Name

  foreach ($question in $questions) {
    $audioPath = Join-Path $outputDirectory "$($question.id).wav"
    $synthesizer.SetOutputToWaveFile($audioPath)
    $synthesizer.Speak([string]$question.text)
    $synthesizer.SetOutputToNull()
  }
}
finally {
  $synthesizer.Dispose()
}

Write-Output "Voice: $selectedVoice"
Write-Output "Generated $($questions.Count) English listening audio files."
