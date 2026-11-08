param(
  [string]$RepositoryRoot = (Split-Path -Parent $PSScriptRoot)
)

$ErrorActionPreference = 'Stop'
$failures = [System.Collections.Generic.List[string]]::new()
$checks = 0

function Test-Expectation {
  param([bool]$Condition, [string]$Message)
  $script:checks += 1
  if (-not $Condition) { $script:failures.Add($Message) }
}

function Read-Utf8 {
  param([string]$RelativePath)
  $path = Join-Path $RepositoryRoot $RelativePath
  if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
    Test-Expectation $false "missing file: $RelativePath"
    return $null
  }
  return [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
}

function Test-Near {
  param([double]$Actual, [double]$Expected, [double]$Tolerance, [string]$Label)
  Test-Expectation ([Math]::Abs($Actual - $Expected) -le $Tolerance) "$Label expected $Expected, got $Actual"
}

$course = '机器学习与深度学习基础'
$lessons = [ordered]@{
  '03b' = '03b-损失函数与输出层进阶.html'
  '03c' = '03c-回归输出层.html'
  '03d' = '03d-概率回归与目标变换.html'
}
$requiredIds = @{
  '03b' = @('delivery-case','residual','mse','mae','huber','gradient','chain-rule','parameter-update','outlier-experiment','mean-median','checkpoint')
  '03c' = @('raw-output','identity','softplus','sigmoid','mapping-comparison','mapping-loss','clip-clamp','classification-link','checkpoint')
  '03d' = @('prerequisites','distribution-basics','gaussian','gaussian-nll','poisson','poisson-nll','log-target','checkpoint')
}

$markdownSources = @{
  '03b' = '_src/机器学习与深度学习基础_md/03b-回归损失函数.md'
  '03c' = '_src/机器学习与深度学习基础_md/03c-回归输出层.md'
  '03d' = '_src/机器学习与深度学习基础_md/03d-概率回归与目标变换.md'
}
$sourceHtml = @{}
foreach ($entry in $lessons.GetEnumerator()) {
  $relative = $markdownSources[$entry.Key]
  $html = Read-Utf8 $relative
  $sourceHtml[$entry.Key] = $html
  if ($null -eq $html) { continue }

  foreach ($id in $requiredIds[$entry.Key]) {
    $idPattern = '(?:id=["'']' + [Regex]::Escape($id) + '["'']|\{#' + [Regex]::Escape($id) + '(?:\s|\}))'
    Test-Expectation ($html -match $idPattern) "$($entry.Key) missing required section id '$id'"
  }

  $ids = @([Regex]::Matches($html, 'id=["'']([^"'']+)["'']') | ForEach-Object { $_.Groups[1].Value }) + @([Regex]::Matches($html, '\{#([^}\s]+)(?:\s[^}]*)?\}') | ForEach-Object { $_.Groups[1].Value })
  $duplicates = $ids | Group-Object | Where-Object Count -gt 1
  Test-Expectation ($duplicates.Count -eq 0) "$($entry.Key) duplicate ids: $(($duplicates.Name -join ', '))"
  Test-Expectation ($html -notmatch '--cr-[a-z-]+\s*:') "$($entry.Key) must not define code-reader palette tokens"

  # Markdown links are written output-relative, so resolve them from the published course directory.
  $sourceDirectory = Join-Path $RepositoryRoot $course
  $localHrefs = @([Regex]::Matches($html, 'href=["'']([^"''#][^"'']*)["'']') | ForEach-Object { $_.Groups[1].Value.Split('#')[0].Split('?')[0] }) + @([Regex]::Matches($html, '\[[^\]]+\]\(([^)#][^)]*)\)') | ForEach-Object { $_.Groups[1].Value.Split('#')[0].Split('?')[0] }) | Where-Object { $_ -and $_ -notmatch '^(?:https?:|mailto:|javascript:)' }
  foreach ($href in $localHrefs) {
    $target = [System.IO.Path]::GetFullPath((Join-Path $sourceDirectory $href))
    Test-Expectation (Test-Path -LiteralPath $target) "$($entry.Key) broken local href: $href"
  }
}

if ($sourceHtml['03b']) {
  foreach ($needle in @('r = y -','reduction','∂L','∂w','∂b','w_new','7.29','83.33%','24.4','16','MSE：`2|r|/5`','自动微分实现')) {
    Test-Expectation ($sourceHtml['03b'].Contains($needle)) "03b missing mathematical teaching marker: $needle"
  }
}
if ($sourceHtml['03c']) {
  foreach ($needle in @('log(1+e','0.1269','0.6931','3.0486','a+(b-a)','开区间','计算图','03a')) {
    Test-Expectation ($sourceHtml['03c'].Contains($needle)) "03c missing output-mapping marker: $needle"
  }
}
if ($sourceHtml['03d']) {
  foreach ($needle in @('方差，不是标准差','var` 参数','log_input=True','exp(E[log Y|X])','条件中位数','log(2π)','log(y!)')) {
    Test-Expectation ($sourceHtml['03d'].Contains($needle)) "03d missing probability qualification: $needle"
  }
}

# Hand-derived numeric fixtures. These checks are intentionally independent of lesson markup.
$residuals = @(2.0, -2.0, 5.0, 2.0)
$mse = (($residuals | ForEach-Object { $_ * $_ } | Measure-Object -Sum).Sum) / $residuals.Count
$mae = (($residuals | ForEach-Object { [Math]::Abs($_) } | Measure-Object -Sum).Sum) / $residuals.Count
Test-Near $mse 9.25 1e-12 'delivery-case MSE'
Test-Near $mae 2.75 1e-12 'delivery-case MAE'

$huberExpected = @{ 1.0 = 0.5; 2.0 = 2.0; 3.0 = 4.0; 10.0 = 18.0 }
foreach ($key in $huberExpected.Keys) {
  $r = [double]$key
  $delta = 2.0
  $loss = if ([Math]::Abs($r) -le $delta) { 0.5 * $r * $r } else { $delta * ([Math]::Abs($r) - 0.5 * $delta) }
  Test-Near $loss $huberExpected[$key] 1e-12 "Huber delta=2 r=$key"
}
$huberQuadraticAtBoundary = 0.5 * 2.0 * 2.0
$huberLinearAtBoundary = 2.0 * (2.0 - 0.5 * 2.0)
Test-Near $huberQuadraticAtBoundary $huberLinearAtBoundary 1e-12 'Huber continuity at delta=2'

$x = 2.0; $y = 10.0; $w = 3.0; $b = 1.0; $eta = 0.01
$prediction = $w * $x + $b
$dPrediction = -2.0 * ($y - $prediction)
$wNew = $w - $eta * ($dPrediction * $x)
$bNew = $b - $eta * $dPrediction
$predictionNew = $wNew * $x + $bNew
$lossNew = [Math]::Pow($y - $predictionNew, 2)
Test-Near $prediction 7.0 1e-12 'update initial prediction'
Test-Near $dPrediction -6.0 1e-12 'update prediction gradient'
Test-Near $wNew 3.12 1e-12 'updated weight'
Test-Near $bNew 1.06 1e-12 'updated bias'
Test-Near $predictionNew 7.30 1e-12 'updated prediction'
Test-Near $lossNew 7.29 1e-12 'updated loss'

$outliers = @(1.0, -1.0, 2.0, -2.0, 30.0)
$mseMagnitudes = $outliers | ForEach-Object { 2.0 * [Math]::Abs($_) / $outliers.Count }
$maeMagnitudes = $outliers | ForEach-Object { 1.0 / $outliers.Count }
$huberMagnitudes = $outliers | ForEach-Object { [Math]::Min([Math]::Abs($_), 2.0) / $outliers.Count }
Test-Near ($mseMagnitudes[-1] / (($mseMagnitudes | Measure-Object -Sum).Sum)) (5.0/6.0) 1e-12 'MSE outlier share'
@([double[]](0.4, 0.4, 0.8, 0.8, 12.0)) | ForEach-Object -Begin { $i = 0 } -Process {
  Test-Near $mseMagnitudes[$i] $_ 1e-12 "mean-MSE prediction-gradient magnitude index=$i"
  $i += 1
}
@([double[]](0.2, 0.2, 0.2, 0.2, 0.2)) | ForEach-Object -Begin { $i = 0 } -Process {
  Test-Near $maeMagnitudes[$i] $_ 1e-12 "mean-MAE prediction-gradient magnitude index=$i"
  $i += 1
}
@([double[]](0.2, 0.2, 0.4, 0.4, 0.4)) | ForEach-Object -Begin { $i = 0 } -Process {
  Test-Near $huberMagnitudes[$i] $_ 1e-12 "mean-Huber prediction-gradient magnitude index=$i"
  $i += 1
}
Test-Near ($maeMagnitudes[-1] / (($maeMagnitudes | Measure-Object -Sum).Sum)) 0.2 1e-12 'MAE outlier share'
Test-Near ($huberMagnitudes[-1] / (($huberMagnitudes | Measure-Object -Sum).Sum)) 0.25 1e-12 'Huber outlier share'

$fixedOrders = @(14.0, 15.0, 16.0, 17.0, 60.0)
$fixedMean = (($fixedOrders | Measure-Object -Sum).Sum) / $fixedOrders.Count
$fixedMedian = ($fixedOrders | Sort-Object)[[int][Math]::Floor($fixedOrders.Count / 2)]
Test-Near $fixedMean 24.4 1e-12 'fixed-order mean'
Test-Near $fixedMedian 16.0 1e-12 'fixed-order median'
$mseAtMedian = (($fixedOrders | ForEach-Object { [Math]::Pow($_ - $fixedMedian, 2) } | Measure-Object -Sum).Sum) / $fixedOrders.Count
$mseAtMean = (($fixedOrders | ForEach-Object { [Math]::Pow($_ - $fixedMean, 2) } | Measure-Object -Sum).Sum) / $fixedOrders.Count
$maeAtMedian = (($fixedOrders | ForEach-Object { [Math]::Abs($_ - $fixedMedian) } | Measure-Object -Sum).Sum) / $fixedOrders.Count
$maeAtMean = (($fixedOrders | ForEach-Object { [Math]::Abs($_ - $fixedMean) } | Measure-Object -Sum).Sum) / $fixedOrders.Count
Test-Near $mseAtMedian 388.4 1e-12 'fixed-order MSE at median'
Test-Near $mseAtMean 317.84 1e-12 'fixed-order MSE at mean'
Test-Near $maeAtMedian 9.6 1e-12 'fixed-order MAE at median'
Test-Near $maeAtMean 14.24 1e-12 'fixed-order MAE at mean'
Test-Expectation ($mseAtMean -lt $mseAtMedian) 'mean must beat median for MSE fixture'
Test-Expectation ($maeAtMedian -lt $maeAtMean) 'median must beat mean for MAE fixture'

$softplusExpected = @{-2.0 = 0.126928011; 0.0 = 0.693147181; 3.0 = 3.048587352}
foreach ($key in $softplusExpected.Keys) {
  $z = [double]$key
  Test-Near ([Math]::Log(1.0 + [Math]::Exp($z))) $softplusExpected[$key] 1e-8 "Softplus z=$key"
}
$sigmoidExpected = @{-2.0 = 0.119202922; 0.0 = 0.5; 3.0 = 0.952574127}
foreach ($key in $sigmoidExpected.Keys) {
  $z = [double]$key
  $sigmoid = 1.0 / (1.0 + [Math]::Exp(-$z))
  Test-Near $sigmoid $sigmoidExpected[$key] 1e-8 "Sigmoid z=$key"
  Test-Near (100.0 * $sigmoid) (100.0 * $sigmoidExpected[$key]) 1e-6 "scaled Sigmoid z=$key"
}
$clampedPrediction = [Math]::Min(1.0, [Math]::Max(0.0, 2.0))
Test-Near ([Math]::Pow(0.8 - $clampedPrediction, 2)) 0.04 1e-12 'training clamp loss outside range'
Test-Near ([Math]::Pow(0.8 - 2.0, 2)) 1.44 1e-12 'unclamped loss outside range'
Test-Near (2.0 * (2.0 - 0.8)) 2.4 1e-12 'unclamped correction gradient'

$gaussianFull = 0.5 * ([Math]::Log(2.0 * [Math]::PI) + [Math]::Log(4.0) + 1.0)
Test-Near $gaussianFull 2.112085714 1e-8 'Gaussian full NLL y=30 mu=28 variance=4'
$poissonFull = 2.0 - 3.0 * [Math]::Log(2.0) + [Math]::Log(6.0)
Test-Near $poissonFull 1.712317928 1e-8 'Poisson full NLL y=3 lambda=2'

$map = Read-Utf8 'maintenance/polished-pages.json'
$index = Read-Utf8 "_src/recovered_html/$course/index.html"
foreach ($entry in $lessons.GetEnumerator()) {
  if ($map) {
    Test-Expectation ($map.Contains($markdownSources[$entry.Key])) "maintenance map missing $($entry.Value) Markdown source"
    Test-Expectation ($map.Contains("$course/$($entry.Value)")) "maintenance map missing $($entry.Value) output"
  }
  if ($index) {
    Test-Expectation ($index.Contains($entry.Value)) "course index missing $($entry.Value)"
    $progressName = [System.IO.Path]::ChangeExtension($entry.Value, '.md')
    Test-Expectation ($index.Contains($progressName)) "course progress map missing $progressName"
  }

  $sourceRelative = $markdownSources[$entry.Key]
  $outputRelative = "$course/$($entry.Value)"
  $sourcePath = Join-Path $RepositoryRoot $sourceRelative
  $outputPath = Join-Path $RepositoryRoot $outputRelative
  if ((Test-Path -LiteralPath $sourcePath) -and (Test-Path -LiteralPath $outputPath)) {
    $outputHtml = [System.IO.File]::ReadAllText($outputPath, [System.Text.Encoding]::UTF8)
    Test-Expectation ($outputHtml.Contains('id="ml-main"')) "$($entry.Key) output missing guided main target"
    Test-Expectation ($outputHtml.Contains("data-magazine-page=`"$($entry.Key)`"")) "$($entry.Key) output has wrong magazine page identity"
    Test-Expectation ($outputHtml -match '<section[^>]+class="[^"]*lesson-full[^"]*"') "$($entry.Key) output missing lesson-full script target"
    Test-Expectation ($outputHtml -match '<nav[^>]+class="lesson-route-links"[^>]*></nav>') "$($entry.Key) generated lesson route is malformed"
    Test-Expectation ($outputHtml -notmatch '</aside>\s*</div>\s*<nav[^>]+lesson-route-links') "$($entry.Key) lesson route escaped its aside"

    $outputIds = @([Regex]::Matches($outputHtml, 'id=["'']([^"'']+)["'']') | ForEach-Object { $_.Groups[1].Value })
    $outputDuplicates = $outputIds | Group-Object | Where-Object Count -gt 1
    Test-Expectation ($outputDuplicates.Count -eq 0) "$($entry.Key) generated duplicate ids: $(($outputDuplicates.Name -join ', '))"

    $outputDirectory = Split-Path -Parent $outputPath
    $outputLocalHrefs = @([Regex]::Matches($outputHtml, 'href=["'']([^"''#][^"'']*)["'']') | ForEach-Object { $_.Groups[1].Value.Split('#')[0].Split('?')[0] }) | Where-Object { $_ -and $_ -notmatch '^(?:https?:|mailto:|javascript:|data:)' }
    foreach ($href in $outputLocalHrefs) {
      $target = [System.IO.Path]::GetFullPath((Join-Path $outputDirectory $href))
      Test-Expectation (Test-Path -LiteralPath $target) "$($entry.Key) generated broken local href: $href"
    }
  } else {
    Test-Expectation $false "$($entry.Key) source/output pair is incomplete"
  }
}

$navExpectations = @(
  @('_src/recovered_html/机器学习与深度学习基础/03a-逻辑回归与分类.html','03b-损失函数与输出层进阶.html'),
  @('机器学习与深度学习基础/03b-损失函数与输出层进阶.html','03c-回归输出层.html'),
  @('机器学习与深度学习基础/03c-回归输出层.html','03b-损失函数与输出层进阶.html','03d-概率回归与目标变换.html'),
  @('机器学习与深度学习基础/03d-概率回归与目标变换.html','03c-回归输出层.html','04-决策树与集成学习.html'),
  @('_src/recovered_html/机器学习与深度学习基础/04-决策树与集成学习.html','03d-概率回归与目标变换.html')
)
foreach ($expectation in $navExpectations) {
  $html = Read-Utf8 $expectation[0]
  if ($null -eq $html) { continue }
  foreach ($href in $expectation[1..($expectation.Count - 1)]) {
    Test-Expectation ($html.Contains("href=`"$href`"")) "$($expectation[0]) missing navigation href $href"
  }
}

$result = [ordered]@{
  checks = $checks
  failures = $failures.Count
  details = @($failures)
}
$result | ConvertTo-Json -Depth 4
if ($failures.Count -gt 0) { exit 1 }
