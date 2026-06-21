$ErrorActionPreference = "Stop"

$root = $PSScriptRoot
if ([string]::IsNullOrWhiteSpace($root)) {
  $root = (Get-Location).Path
}
$ffmpeg = "C:\Users\ghost\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
$font = "C\:/Windows/Fonts/msyh.ttc"

$narration = @"
人工智能的故事，并不是突然开始的。
1950年，图灵提出：机器能思考吗？
1956年，达特茅斯会议第一次把人工智能命名为一个研究领域。
之后几十年，专家系统兴起，又因为算力和数据不足，经历了几次寒冬。
2012年，深度学习在图像识别中爆发，AI开始真正进入产业。
2017年，Transformer出现，让模型理解语言、生成内容的能力迅速跃升。
到了2020年代，大模型把写作、编程、绘画、视频和智能体连接起来。
AI的发展史，其实是一条主线：更多数据，更强算力，更好的算法，以及人类不断提出的新问题。
"@

$scriptPath = Join-Path $root "narration.txt"
$wavPath = Join-Path $root "narration.wav"
$srtPath = Join-Path $root "captions.srt"
$outPath = Join-Path $root "ai-history-60s.mp4"
Write-Host "Root $root"
Write-Host "Audio $wavPath"
Write-Host "Output $outPath"

Set-Content -Path $scriptPath -Value $narration -Encoding UTF8

$srt = @"
1
00:00:00,000 --> 00:00:05,000
人工智能的故事，并不是突然开始的。

2
00:00:05,000 --> 00:00:10,000
1950年，图灵提出：机器能思考吗？

3
00:00:10,000 --> 00:00:16,000
1956年，达特茅斯会议第一次把人工智能命名为一个研究领域。

4
00:00:16,000 --> 00:00:24,000
之后几十年，专家系统兴起，又因为算力和数据不足，经历了几次寒冬。

5
00:00:24,000 --> 00:00:31,000
2012年，深度学习在图像识别中爆发，AI开始真正进入产业。

6
00:00:31,000 --> 00:00:38,000
2017年，Transformer出现，让模型理解语言、生成内容的能力迅速跃升。

7
00:00:38,000 --> 00:00:46,000
到了2020年代，大模型把写作、编程、绘画、视频和智能体连接起来。

8
00:00:46,000 --> 00:00:56,000
AI的发展史，其实是一条主线：更多数据，更强算力，更好的算法，以及人类不断提出的新问题。
"@
Set-Content -Path $srtPath -Value $srt -Encoding UTF8

Add-Type -AssemblyName System.Speech
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.SelectVoice("Microsoft Huihui Desktop")
$speaker.Rate = 1
$speaker.Volume = 100
$speaker.SetOutputToWaveFile($wavPath)
$speaker.Speak($narration)
$speaker.Dispose()

$escapedSrt = ($srtPath -replace "\\", "/") -replace ":", "\:"

$filter = @"
drawbox=x=0:y=0:w=1920:h=1080:color=0b0f14:t=fill,
drawbox=x=0:y=0:w=1920:h=1080:color=ffffff@0.02:t=fill,
drawtext=fontfile='$font':text='AI 发展史 / 60 秒速览':x=120:y=88:fontsize=56:fontcolor=f7f2df,
drawtext=fontfile='$font':text='从图灵测试到大模型时代':x=122:y=166:fontsize=30:fontcolor=a7f3d0,
drawbox=x=180:y=360:w=1560:h=6:color=ffffff@0.22:t=fill,
drawtext=fontfile='$font':text='1950':x=170:y=292:fontsize=42:fontcolor=f97316:enable='between(t,5,56)',
drawtext=fontfile='$font':text='图灵测试':x=142:y=410:fontsize=32:fontcolor=f7f2df:enable='between(t,5,56)',
drawbox=x=218:y=335:w=28:h=56:color=f97316:t=fill:enable='between(t,5,56)',
drawtext=fontfile='$font':text='1956':x=420:y=292:fontsize=42:fontcolor=22c55e:enable='between(t,10,56)',
drawtext=fontfile='$font':text='AI 命名':x=395:y=410:fontsize=32:fontcolor=f7f2df:enable='between(t,10,56)',
drawbox=x=468:y=335:w=28:h=56:color=22c55e:t=fill:enable='between(t,10,56)',
drawtext=fontfile='$font':text='1980s':x=668:y=292:fontsize=42:fontcolor=eab308:enable='between(t,16,56)',
drawtext=fontfile='$font':text='专家系统':x=650:y=410:fontsize=32:fontcolor=f7f2df:enable='between(t,16,56)',
drawbox=x=718:y=335:w=28:h=56:color=eab308:t=fill:enable='between(t,16,56)',
drawtext=fontfile='$font':text='2012':x=925:y=292:fontsize=42:fontcolor=38bdf8:enable='between(t,24,56)',
drawtext=fontfile='$font':text='深度学习爆发':x=880:y=410:fontsize=32:fontcolor=f7f2df:enable='between(t,24,56)',
drawbox=x=968:y=335:w=28:h=56:color=38bdf8:t=fill:enable='between(t,24,56)',
drawtext=fontfile='$font':text='2017':x=1178:y=292:fontsize=42:fontcolor=f472b6:enable='between(t,31,56)',
drawtext=fontfile='$font':text='Transformer':x=1138:y=410:fontsize=32:fontcolor=f7f2df:enable='between(t,31,56)',
drawbox=x=1218:y=335:w=28:h=56:color=f472b6:t=fill:enable='between(t,31,56)',
drawtext=fontfile='$font':text='2020s':x=1420:y=292:fontsize=42:fontcolor=c4b5fd:enable='between(t,38,56)',
drawtext=fontfile='$font':text='大模型与智能体':x=1370:y=410:fontsize=32:fontcolor=f7f2df:enable='between(t,38,56)',
drawbox=x=1468:y=335:w=28:h=56:color=c4b5fd:t=fill:enable='between(t,38,56)',
drawtext=fontfile='$font':text='数据 × 算力 × 算法 × 新问题':x=420:y=610:fontsize=64:fontcolor=f7f2df:enable='between(t,46,56)',
drawtext=fontfile='$font':text='这就是 AI 一路向前的发动机':x=590:y=700:fontsize=38:fontcolor=a7f3d0:enable='between(t,46,56)',
subtitles='$escapedSrt':force_style='FontName=Microsoft YaHei,FontSize=24,PrimaryColour=&H00FFFFFF,OutlineColour=&HAA000000,BorderStyle=1,Outline=2,Shadow=0,Alignment=2,MarginV=72'
"@ -replace "`r?`n", ""

$ffmpegArgs = @(
  "-y",
  "-f", "lavfi",
  "-i", "color=c=0b0f14:s=1920x1080:r=30:d=56",
  "-i", $wavPath,
  "-filter:v", $filter,
  "-map", "0:v",
  "-map", "1:a",
  "-c:v", "libx264",
  "-pix_fmt", "yuv420p",
  "-c:a", "aac",
  "-shortest",
  $outPath
)
& $ffmpeg @ffmpegArgs
Write-Host "Rendered $outPath"
