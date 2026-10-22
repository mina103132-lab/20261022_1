// 定義六個生活常識題目、答案與動畫 GIF 圖像來源。
const quizItems = [ // 建立六題資料，索引同時作為正確配對依據。
  { icon: "🧼", prompt: "吃東西前", answer: "先把雙手洗乾淨", gif: "https://media.giphy.com/media/ICOgUNjpvO0PC/giphy.gif" }, // 設定洗手題。
  { icon: "🪥", prompt: "早晚都要", answer: "認真刷牙保護牙齒", gif: "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif" }, // 設定刷牙題。
  { icon: "🥦", prompt: "想要健康長大", answer: "多吃蔬菜和水果", gif: "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif" }, // 設定飲食題。
  { icon: "🛏️", prompt: "晚上睡覺前", answer: "早點上床好好睡覺", gif: "https://media.giphy.com/media/26BRv0ThflsHCqDrG/giphy.gif" }, // 設定睡眠題。
  { icon: "🚲", prompt: "騎腳踏車時", answer: "戴好安全帽再出發", gif: "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif" }, // 設定交通安全題。
  { icon: "🗑️", prompt: "手上有垃圾時", answer: "找到垃圾桶再丟", gif: "https://media.giphy.com/media/3o7aD2saalBwwftBIY/giphy.gif" } // 設定環境整潔題。
]; // 結束題目資料。
const placedAnswers = Array(6).fill(-1); // 記錄六個題目目前放入的答案索引。
const gifImages = []; // 保存 GIF 圖像元素，讓動畫可在畫布上方播放。
let draggedAnswer = -1; // 記錄目前正在拖曳的答案索引。
let draggedFrom = -1; // 記錄被拖曳答案原本所在的題目位置。
let pointerX = 0; // 保存目前指標的水平位置。
let pointerY = 0; // 保存目前指標的垂直位置。
let submitted = false; // 記錄是否已經交卷。
let confetti = []; // 保存高分時播放的彩帶粒子。
let layout = {}; // 保存每次繪圖時計算出的響應式版面座標。
let pageFont = "Trebuchet MS, Arial, sans-serif"; // 設定易讀的介面字型。

// 初始化全螢幕畫布、頁面樣式與六張動畫 GIF。
function setup() { // 定義 p5.js 初始化函式。
  createCanvas(windowWidth, windowHeight); // 讓畫布填滿目前瀏覽器視窗。
  pixelDensity(1); // 控制高解析度螢幕的畫布尺寸與效能。
  textFont(pageFont); // 將介面文字套用統一字型。
  document.documentElement.lang = "zh-Hant"; // 將網頁語系設為繁體中文。
  document.title = "生活小達人｜拖曳配對挑戰"; // 設定瀏覽器分頁標題。
  document.body.style.cssText = "margin:0;overflow:hidden;background:#f5f8ee;touch-action:none;"; // 移除頁面留白並避免觸控拖曳時捲動。
  document.documentElement.style.cssText = "margin:0;overflow:hidden;"; // 避免根元素產生捲軸。
  for (let index = 0; index < quizItems.length; index += 1) { // 逐一載入六張動畫 GIF。
    const gif = createImg(quizItems[index].gif, "生活常識動畫提示"); // 建立 GIF 圖像元素並設定替代文字。
    gif.attribute("aria-hidden", "true"); // 將純裝飾 GIF 隱藏於輔助科技的閱讀順序。
    gif.style("position", "absolute"); // 讓 GIF 可依畫布座標定位。
    gif.style("z-index", "1"); // 讓 GIF 顯示在 p5 畫布的題目卡片上方。
    gif.style("pointer-events", "none"); // 避免 GIF 擋住滑鼠與觸控操作。
    gif.style("object-fit", "contain"); // 保持 GIF 原始比例完整顯示。
    gif.style("border-radius", "14px"); // 讓 GIF 邊角與題目卡片一致。
    gif.style("mix-blend-mode", "multiply"); // 混合白底 GIF，減少白色方框感。
    gifImages.push(gif); // 保存圖像元素供每一幀更新位置。
  } // 結束 GIF 載入迴圈。
  calculateLayout(); // 首次計算畫布上的響應式元件位置。
} // 結束初始化函式。

// 根據視窗寬高重新配置題目卡片與答案卡片。
function calculateLayout() { // 定義響應式版面計算函式。
  const narrow = width < 760; // 判斷目前是否使用窄螢幕版面。
  const columns = narrow ? 3 : 6; // 窄螢幕分三欄，寬螢幕分六欄。
  const gap = narrow ? 9 : 14; // 依螢幕大小調整題目卡片間距。
  const side = narrow ? 16 : min(44, width * 0.045); // 設定左右留白。
  const cardWidth = (width - side * 2 - gap * (columns - 1)) / columns; // 計算每張題目卡片寬度。
  const top = narrow ? max(116, height * 0.18) : max(150, height * 0.23); // 設定題目卡片起始高度。
  const cardHeight = narrow ? min(132, max(112, (height - top - 300) / 2)) : min(220, height * 0.29); // 依可用高度保留題目、圖片與答案的閱讀空間。
  const rowGap = narrow ? 9 : 0; // 窄螢幕兩列題目增加垂直間距。
  const targetsBottom = top + cardHeight * (narrow ? 2 : 1) + rowGap; // 計算最後一列題目卡片底部。
  const bankLabelY = targetsBottom + (narrow ? 34 : 53); // 設定答案區標題位置。
  const optionTop = bankLabelY + (narrow ? 22 : 28); // 設定答案卡片起始高度。
  const optionColumns = narrow ? 2 : 3; // 窄螢幕兩欄，寬螢幕三欄排列答案。
  const optionGap = narrow ? 8 : 12; // 設定答案卡片間距。
  const optionWidth = (width - side * 2 - optionGap * (optionColumns - 1)) / optionColumns; // 計算答案卡片寬度。
  const submitY = height - (narrow ? 67 : 76); // 將交卷按鈕固定在畫布底部。
  const optionRows = quizItems.length / optionColumns; // 計算答案卡片總列數。
  const optionHeight = min(narrow ? 66 : 72, max(30, (submitY - optionTop - optionGap * (optionRows - 1) - 24) / optionRows)); // 依實際列距計算答案卡高度並避開交卷按鈕。
  const gifSize = min(narrow ? 60 : 96, cardHeight * 0.4, cardWidth * 0.68); // 放大左上角 GIF 並保留題目與答案空間。
  layout = { narrow, columns, gap, side, cardWidth, cardHeight, top, rowGap, bankLabelY, optionTop, optionColumns, optionGap, optionWidth, optionHeight, submitY, gifSize }; // 保存版面計算結果供繪圖與拖曳判定使用。
  for (let index = 0; index < gifImages.length; index += 1) { // 更新每張 GIF 的畫面位置與尺寸。
    const row = floor(index / columns); // 計算目前題目所在列。
    const column = index % columns; // 計算目前題目所在欄。
    const cardX = side + column * (cardWidth + gap); // 計算題目卡片水平座標。
    const cardY = top + row * (cardHeight + rowGap); // 計算題目卡片垂直座標。
    const floatOffset = sin(frameCount * 0.08 + index) * 3; // 計算每張圖片不同步的輕柔浮動位置。
    const tiltAngle = sin(frameCount * 0.06 + index) * 4; // 計算 GIF 輕輕搖擺的角度。
    gifImages[index].position(cardX + (cardWidth - layout.gifSize) / 2, cardY + 6 + floatOffset); // 將放大的 GIF 放在題卡中央並上下浮動。
    gifImages[index].size(layout.gifSize, layout.gifSize); // 設定動畫 GIF 顯示尺寸。
    gifImages[index].style("transform", `rotate(${tiltAngle}deg)`); // 讓 GIF 持續輕輕搖擺。
  } // 結束 GIF 版面更新迴圈。
} // 結束響應式版面計算函式。

// 每一幀繪製題目、可拖曳答案、交卷結果與彩帶。
function draw() { // 定義 p5.js 每幀繪圖函式。
  calculateLayout(); // 持續同步版面，確保視窗尺寸變化時立即響應。
  drawBackground(); // 繪製柔和明亮的全螢幕背景。
  drawHeader(); // 繪製標題、說明與答題進度。
  drawTargets(); // 繪製六個固定的 GIF 題目提示與作答位置。
  drawAnswerBank(); // 繪製尚未使用的六張文字答案卡。
  drawSubmitButton(); // 繪製交卷按鈕與完成狀態。
  if (draggedAnswer >= 0) { // 檢查是否有答案正在拖曳。
    drawDraggedAnswer(); // 將正在拖曳的文字卡跟隨指標顯示。
  } // 結束拖曳狀態判斷。
  if (submitted) { // 檢查是否已經交卷。
    drawResult(); // 顯示得分結果與重新挑戰按鈕。
  } // 結束交卷狀態判斷。
  updateConfetti(); // 更新並繪製高分彩帶效果。
} // 結束每幀繪圖函式。

// 繪製淡綠背景、柔和色塊與底部裝飾。
function drawBackground() { // 定義背景繪圖函式。
  background("#f5f8ee"); // 使用淡綠色作為頁面底色。
  noStroke(); // 關閉背景裝飾的外框。
  fill("#e5f2de"); // 設定薄荷綠裝飾色。
  circle(width - 25, 52, 150); // 在右上角繪製柔和的圓形點綴。
  fill("#fff0c9"); // 設定溫暖淡黃色裝飾色。
  circle(18, height - 12, 120); // 在左下角繪製柔和的圓形點綴。
} // 結束背景繪圖函式。

// 繪製測驗標題、說明文字與作答進度。
function drawHeader() { // 定義頁首繪圖函式。
  textAlign(LEFT, CENTER); // 將標題文字設定為靠左並垂直置中。
  fill("#213d36"); // 設定標題的深綠色。
  textStyle(BOLD); // 將標題設定為粗體。
  textSize(layout.narrow ? 28 : 36); // 依螢幕大小放大測驗標題字級。
  text("🌈 生活小達人", layout.side, 42); // 顯示可愛的測驗主標題。
  fill("#64766b"); // 設定說明文字的柔和綠灰色。
  textStyle(NORMAL); // 將說明文字恢復為一般字重。
  textSize(layout.narrow ? 15 : 17); // 依螢幕大小放大作答說明字級。
  text("一起找出生活中的好習慣吧！", layout.side, 75); // 顯示親切活潑的作答提示。
  const completedCount = placedAnswers.filter((answer) => answer >= 0).length; // 計算已經放入答案的題目數量。
  textAlign(RIGHT, CENTER); // 將進度文字設定為靠右顯示。
  fill("#47765e"); // 設定進度文字的綠色。
  textStyle(BOLD); // 將進度設定為粗體。
  textSize(layout.narrow ? 13 : 15); // 依螢幕大小調整進度字級。
  text(`${completedCount} / 6 題完成`, width - layout.side, 43); // 顯示目前完成題數。
  textStyle(NORMAL); // 將後續文字恢復為一般字重。
} // 結束頁首繪圖函式。

// 繪製六個固定題目提示卡與可放置答案的區域。
function drawTargets() { // 定義題目卡片繪圖函式。
  const cardColors = ["#fff4d8", "#ffe9e5", "#e8f5e9", "#e9efff", "#fff0dc", "#e8f5f4"]; // 為六張題卡準備柔和的糖果色。
  const borderColors = ["#ead69a", "#edc1b8", "#b8d8bc", "#c3cfee", "#ead0ac", "#b9d8d3"]; // 為每張題卡準備相襯的外框色。
  for (let index = 0; index < quizItems.length; index += 1) { // 逐一繪製六個配對題目。
    const box = getTargetBox(index); // 取得目前題目卡片的版面座標。
    const isFilled = placedAnswers[index] >= 0; // 判斷此題是否已經放入文字答案。
    drawRoundedCard(box.x, box.y, box.w, box.h, cardColors[index], isFilled ? "#79ae81" : borderColors[index]); // 繪製柔和糖果色題卡與外框。
    const promptHeight = layout.narrow ? 25 : 38; // 依題目卡大小設定情境文字區高度。
    const promptY = box.y + 6 + layout.gifSize + (layout.narrow ? 6 : 10); // 將情境文字安排在 GIF 下方。
    const promptWidth = box.w - 14; // 讓題目文字區完整使用卡片寬度。
    const promptLeft = box.x + 7; // 將題目文字區左緣對齊卡片留白。
    const promptRight = box.x + box.w - 7; // 將題目文字區右緣對齊卡片留白。
    const promptText = quizItems[index].prompt; // 使用題目文字本身作為 GIF 下方標籤。
    const answerY = promptY + promptHeight + (layout.narrow ? 3 : 7); // 將答案槽安排在情境文字下方。
    const answerHeight = box.y + box.h - 6 - answerY; // 計算答案槽可使用的剩餘高度。
    noStroke(); // 移除情境標籤的外框。
    fill("#fffaf0"); // 設定溫暖明亮的題目文字底色。
    rect(promptLeft, promptY, promptWidth, promptHeight, 9); // 將題目文字區放在 GIF 下方。
    fill("#315447"); // 設定情境文字顏色。
    textAlign(CENTER, CENTER); // 將題目文字水平與垂直置中。
    textStyle(BOLD); // 將題目文字設定為粗體。
    textSize(layout.narrow ? min(17, max(12, (promptWidth - 12) / promptText.length)) : min(18, (promptWidth - 12) / promptText.length)); // 依卡片寬度調整含圖示題目的字級。
    text(promptText, promptLeft + 6, promptY + 1, promptWidth - 12, promptHeight - 2); // 將題目限制在卡片內的文字框並水平垂直置中。
    fill(isFilled ? "#e5f2de" : "#f4f7f1"); // 以不同底色清楚標示已作答或空白答案槽。
    rect(box.x + 7, answerY, box.w - 14, answerHeight, 9); // 在題目下方繪製獨立的答案放置區。
    if (isFilled) { // 檢查目前題目是否已放入答案。
      fill("#3b634e"); // 設定已放入答案的文字顏色。
      textStyle(NORMAL); // 將答案文字設定為一般字重。
      textSize(layout.narrow ? 14 : 16); // 放大已放置答案的字級。
      textAlign(CENTER, CENTER); // 將已放置答案水平與垂直置中。
      text(wrapAnswer(quizItems[placedAnswers[index]].answer, box.w - 20), box.x + 10, answerY + 1, box.w - 20, answerHeight - 2); // 將答案限制在卡片內的放置框並水平垂直置中。
    } else { // 處理尚未填答的題目卡片。
      fill("#9aae9e"); // 設定空白提示文字顏色。
      textStyle(NORMAL); // 將空白提示設定為一般字重。
      textSize(layout.narrow ? 12 : 14); // 放大空白答案槽的拖曳提示字級。
      textAlign(CENTER, CENTER); // 將拖曳提示水平與垂直置中。
      text("拖到這裡", box.x + box.w / 2, answerY + answerHeight / 2); // 在專屬答案槽顯示簡短提示。
    } // 結束題目填答狀態判斷。
  } // 結束題目卡片繪製迴圈。
} // 結束題目卡片繪圖函式。

// 繪製答案區標題與尚未放入題目的文字卡片。
function drawAnswerBank() { // 定義答案區繪圖函式。
  textAlign(LEFT, CENTER); // 將區域標題設定為靠左對齊。
  fill("#213d36"); // 設定區域標題顏色。
  textStyle(BOLD); // 將區域標題設定為粗體。
  textSize(layout.narrow ? 15 : 18); // 依螢幕大小調整區域標題字級。
  text("好習慣答案", layout.side, layout.bankLabelY); // 顯示答案區標題。
  textAlign(RIGHT, CENTER); // 將右側提示設定為靠右對齊。
  fill("#829187"); // 設定右側操作提示顏色。
  textStyle(NORMAL); // 將操作提示設定為一般字重。
  textSize(layout.narrow ? 10 : 12); // 依螢幕大小調整操作提示字級。
  text("答案可以再次拖曳更換", width - layout.side, layout.bankLabelY); // 提醒使用者可以修改已放置的答案。
  for (let answerIndex = 0; answerIndex < quizItems.length; answerIndex += 1) { // 逐一檢查六個文字答案。
    if (placedAnswers.includes(answerIndex) || answerIndex === draggedAnswer) { // 略過已放入題目或正在拖曳的答案。
      continue; // 不在答案區重複繪製同一個答案。
    } // 結束答案是否可見的判斷。
    const box = getOptionBox(answerIndex); // 取得目前答案卡片的版面座標。
    const hovering = isInside(pointerX, pointerY, box); // 判斷指標是否停留在目前答案卡上。
    drawRoundedCard(box.x, box.y, box.w, box.h, hovering && draggedAnswer < 0 ? "#eff8df" : "#ffffff", hovering && draggedAnswer < 0 ? "#a2bf74" : "#dce7d9"); // 繪製答案卡片與懸停狀態。
    fill("#375448"); // 設定答案文字顏色。
    textAlign(CENTER, CENTER); // 將答案文字置中。
    textStyle(BOLD); // 將答案文字設定為粗體。
    textSize(layout.narrow ? 14 : 17); // 放大可拖曳答案的字級。
    textAlign(CENTER, CENTER); // 再次明確設定答案文字水平與垂直置中。
    text(quizItems[answerIndex].answer, box.x + box.w / 2, box.y + box.h / 2); // 將答案文字錨定在卡片正中央。
  } // 結束答案卡片繪製迴圈。
} // 結束答案區繪圖函式。

// 繪製交卷按鈕，並依是否完成六題切換狀態。
function drawSubmitButton() { // 定義交卷按鈕繪圖函式。
  const ready = placedAnswers.every((answer) => answer >= 0); // 檢查六題是否都已經放入答案。
  const buttonWidth = layout.narrow ? min(270, width - 32) : 300; // 計算適合目前螢幕的按鈕寬度。
  const buttonBox = { x: (width - buttonWidth) / 2, y: layout.submitY, w: buttonWidth, h: layout.narrow ? 49 : 54 }; // 建立置中的交卷按鈕座標。
  layout.submitBox = buttonBox; // 保存按鈕座標供滑鼠與觸控操作使用。
  const hovering = isInside(pointerX, pointerY, buttonBox); // 判斷指標是否停留在交卷按鈕上。
  drawRoundedCard(buttonBox.x, buttonBox.y, buttonBox.w, buttonBox.h, ready ? (hovering ? "#e4774f" : "#ed8158") : "#cbd5cb", ready ? "#ed8158" : "#cbd5cb"); // 繪製啟用或停用的交卷按鈕。
  fill("#ffffff"); // 設定按鈕文字顏色。
  textAlign(CENTER, CENTER); // 將按鈕文字置中。
  textStyle(BOLD); // 將按鈕文字設定為粗體。
  textSize(layout.narrow ? 16 : 18); // 依螢幕大小調整按鈕文字。
  text(submitted ? "再玩一次" : ready ? "交卷看成績" : "完成六題後即可交卷", width / 2, buttonBox.y + buttonBox.h / 2); // 顯示交卷或重新挑戰按鈕文字。
} // 結束交卷按鈕繪圖函式。

// 交卷後顯示分數、鼓勵訊息與重新挑戰功能。
function drawResult() { // 定義成績結果繪圖函式。
  const correctCount = placedAnswers.filter((answer, index) => answer === index).length; // 計算配對正確的題目數量。
  const score = round((correctCount / quizItems.length) * 100); // 將正確題數換算成百分制分數。
  noStroke(); // 移除成績遮罩的外框。
  fill(28, 46, 38, 145); // 設定半透明深色背景遮罩。
  rect(0, 0, width, height); // 覆蓋全畫布以聚焦成績結果。
  const panelWidth = min(width - 36, 430); // 計算成績面板寬度。
  const panelHeight = layout.narrow ? 270 : 300; // 依螢幕大小計算成績面板高度。
  const panelX = (width - panelWidth) / 2; // 計算成績面板水平置中位置。
  const panelY = (height - panelHeight) / 2; // 計算成績面板垂直置中位置。
  drawRoundedCard(panelX, panelY, panelWidth, panelHeight, "#fffdf5", "#fffdf5"); // 繪製成績結果白色面板。
  fill("#315447"); // 設定結果標題顏色。
  textAlign(CENTER, CENTER); // 將結果文字置中。
  textStyle(BOLD); // 將結果標題設定為粗體。
  textSize(layout.narrow ? 23 : 28); // 依螢幕大小調整結果標題字級。
  text(score > 80 ? "太棒了！生活小達人" : "完成挑戰！", width / 2, panelY + 48); // 依分數顯示鼓勵標題。
  fill("#ed8158"); // 設定分數的珊瑚橘色。
  textSize(layout.narrow ? 54 : 64); // 依螢幕大小調整分數字級。
  text(`${score}%`, width / 2, panelY + 125); // 顯示百分制成績。
  fill("#617368"); // 設定答對題數文字顏色。
  textStyle(NORMAL); // 將答對題數文字設定為一般字重。
  textSize(layout.narrow ? 15 : 17); // 依螢幕大小調整答對題數文字。
  text(`答對 ${correctCount} 題，共 ${quizItems.length} 題`, width / 2, panelY + 174); // 顯示實際答對題數。
  fill("#47765e"); // 設定鼓勵訊息文字顏色。
  textSize(layout.narrow ? 13 : 15); // 依螢幕大小調整鼓勵訊息字級。
  text(score > 80 ? "你知道好多照顧自己的好方法！" : "再試一次，找出更多好習慣！", width / 2, panelY + 205); // 顯示依成績變化的鼓勵訊息。
  const replayBox = { x: panelX + 42, y: panelY + panelHeight - 55, w: panelWidth - 84, h: 42 }; // 建立重新挑戰按鈕座標。
  layout.replayBox = replayBox; // 保存重新挑戰按鈕座標供點擊判斷。
  drawRoundedCard(replayBox.x, replayBox.y, replayBox.w, replayBox.h, "#47765e", "#47765e"); // 繪製重新挑戰按鈕。
  fill("#ffffff"); // 設定重新挑戰按鈕文字顏色。
  textStyle(BOLD); // 將重新挑戰文字設定為粗體。
  textSize(15); // 設定重新挑戰按鈕字級。
  text("再玩一次", width / 2, replayBox.y + replayBox.h / 2); // 顯示重新挑戰按鈕文字。
} // 結束成績結果繪圖函式。

// 繪製目前正在拖曳中的答案卡片。
function drawDraggedAnswer() { // 定義拖曳中的答案繪圖函式。
  const boxWidth = min(layout.optionWidth, width - 28); // 限制拖曳卡片寬度不超出畫布。
  const boxHeight = layout.optionHeight; // 沿用答案卡片高度。
  drawRoundedCard(pointerX - boxWidth / 2, pointerY - boxHeight / 2, boxWidth, boxHeight, "#fff4d8", "#eaa96c"); // 在指標下方繪製拖曳卡片。
  fill("#375448"); // 設定拖曳答案文字顏色。
  textAlign(CENTER, CENTER); // 將拖曳答案文字置中。
  textStyle(BOLD); // 將拖曳答案文字設定為粗體。
  textSize(layout.narrow ? 14 : 17); // 放大拖曳中答案的字級。
  textAlign(CENTER, CENTER); // 明確將拖曳文字水平與垂直置中。
  text(quizItems[draggedAnswer].answer, pointerX, pointerY); // 將拖曳答案錨定在卡片正中央。
} // 結束拖曳答案繪圖函式。

// 持續更新高分彩帶的位置並移除畫面外的粒子。
function updateConfetti() { // 定義彩帶更新函式。
  for (let index = confetti.length - 1; index >= 0; index -= 1) { // 從陣列尾端開始更新彩帶粒子。
    const piece = confetti[index]; // 取得目前要更新的彩帶粒子。
    piece.x += piece.speedX; // 更新彩帶的水平位置。
    piece.y += piece.speedY; // 更新彩帶的垂直位置。
    piece.speedY += 0.08; // 模擬重力使彩帶逐漸下墜。
    piece.rotation += piece.spin; // 更新彩帶的旋轉角度。
    push(); // 保存目前繪圖狀態。
    translate(piece.x, piece.y); // 將彩帶座標移至粒子位置。
    rotate(piece.rotation); // 旋轉彩帶呈現飄落效果。
    noStroke(); // 移除彩帶的外框。
    fill(piece.color); // 設定彩帶的隨機明亮色彩。
    rectMode(CENTER); // 將彩帶矩形中心作為繪製基準。
    rect(0, 0, piece.size, piece.size * 0.58, 2); // 繪製一小片旋轉彩帶。
    rectMode(CORNER); // 將矩形繪圖基準恢復為左上角。
    pop(); // 還原繪圖狀態。
    if (piece.y > height + 24) { // 檢查彩帶是否已落出畫面。
      confetti.splice(index, 1); // 移除已離開畫面的彩帶粒子。
    } // 結束彩帶移除判斷。
  } // 結束彩帶更新迴圈。
} // 結束彩帶更新函式。

// 建立高分時的彩帶爆發效果。
function launchConfetti() { // 定義彩帶生成函式。
  const colors = ["#ed8158", "#f2c45d", "#74a982", "#63a9a1", "#e58aa2", "#8b9cc8"]; // 設定活潑明亮的彩帶顏色。
  for (let index = 0; index < 150; index += 1) { // 一次建立一百五十片彩帶。
    confetti.push({ x: random(width), y: random(-height * 0.8, -20), speedX: random(-1.8, 1.8), speedY: random(1.4, 5.2), rotation: random(TWO_PI), spin: random(-0.12, 0.12), size: random(6, 12), color: random(colors) }); // 為每片彩帶設定位置、速度、角度與色彩。
  } // 結束彩帶生成迴圈。
} // 結束彩帶生成函式。

// 依索引取得題目卡片在目前版面中的座標。
function getTargetBox(index) { // 定義題目卡片座標計算函式。
  const row = floor(index / layout.columns); // 計算題目所在列。
  const column = index % layout.columns; // 計算題目所在欄。
  return { x: layout.side + column * (layout.cardWidth + layout.gap), y: layout.top + row * (layout.cardHeight + layout.rowGap), w: layout.cardWidth, h: layout.cardHeight }; // 回傳題目卡片完整範圍。
} // 結束題目卡片座標函式。

// 依答案索引取得文字卡片在目前版面中的座標。
function getOptionBox(index) { // 定義答案卡片座標計算函式。
  const row = floor(index / layout.optionColumns); // 計算答案所在列。
  const column = index % layout.optionColumns; // 計算答案所在欄。
  return { x: layout.side + column * (layout.optionWidth + layout.optionGap), y: layout.optionTop + row * (layout.optionHeight + layout.optionGap), w: layout.optionWidth, h: layout.optionHeight }; // 回傳答案卡片完整範圍。
} // 結束答案卡片座標函式。

// 繪製帶有柔和陰影與圓角的卡片外觀。
function drawRoundedCard(x, y, boxWidth, boxHeight, cardColor, borderColor) { // 定義共用卡片繪製函式。
  noStroke(); // 移除卡片陰影的外框。
  fill(44, 69, 55, 18); // 設定淡淡的卡片陰影顏色。
  rect(x, y + 3, boxWidth, boxHeight, 14); // 繪製向下偏移的柔和陰影。
  stroke(borderColor); // 設定卡片外框顏色。
  strokeWeight(1.4); // 設定卡片外框粗細。
  fill(cardColor); // 設定卡片底色。
  rect(x, y, boxWidth, boxHeight, 14); // 繪製圓角卡片。
  noStroke(); // 關閉外框以免影響後續文字。
} // 結束共用卡片繪製函式。

// 依可用寬度將答案文字分行顯示。
function wrapAnswer(answer, maxWidth) { // 定義答案文字換行函式。
  textSize(layout.narrow ? 14 : 16); // 以放大後的卡片答案字級量測文字寬度。
  if (textWidth(answer) <= maxWidth) { // 檢查答案是否能放在單行內。
    return answer; // 回傳不需要換行的答案內容。
  } // 結束單行寬度判斷。
  const splitAt = ceil(answer.length / 2); // 以字數中點切分較長的中文答案。
  return `${answer.slice(0, splitAt)}\n${answer.slice(splitAt)}`; // 回傳分成兩行的答案文字。
} // 結束答案文字換行函式。

// 判斷指標座標是否位於指定矩形範圍內。
function isInside(x, y, box) { // 定義矩形碰撞判定函式。
  return Boolean(box && x >= box.x && x <= box.x + box.w && y >= box.y && y <= box.y + box.h); // 回傳指標是否落在矩形內。
} // 結束矩形碰撞判定函式。

// 按下滑鼠或觸控時，開始拖曳答案或操作按鈕。
function mousePressed() { // 定義滑鼠與觸控共用的按下事件。
  pointerX = mouseX; // 更新指標水平座標。
  pointerY = mouseY; // 更新指標垂直座標。
  if (submitted) { // 檢查目前是否正在顯示成績。
    if (isInside(pointerX, pointerY, layout.replayBox)) { // 判斷是否按下重新挑戰按鈕。
      restartQuiz(); // 清除成績並重新開始測驗。
    } // 結束重新挑戰按鈕判斷。
    return false; // 避免成績畫面接收其他拖曳操作。
  } // 結束成績狀態判斷。
  if (isInside(pointerX, pointerY, layout.submitBox)) { // 判斷是否按下交卷按鈕。
    if (placedAnswers.every((answer) => answer >= 0)) { // 確認六題都已完成才允許交卷。
      submitted = true; // 設定測驗進入成績結果畫面。
      const correctCount = placedAnswers.filter((answer, index) => answer === index).length; // 計算交卷時的正確題數。
      if ((correctCount / quizItems.length) * 100 > 80) { // 判斷成績是否高於百分之八十。
        launchConfetti(); // 高分時啟動全螢幕彩帶效果。
      } // 結束高分彩帶判斷。
    } // 結束交卷完成度判斷。
    return false; // 避免按鈕操作被誤判成拖曳。
  } // 結束交卷按鈕判斷。
  for (let index = 0; index < quizItems.length; index += 1) { // 檢查指標是否點擊六張題目圖片。
    const imageBox = getTargetBox(index); // 取得目前圖片所在題卡的位置。
    const imageArea = { x: imageBox.x, y: imageBox.y, w: imageBox.w, h: layout.gifSize + 12 }; // 建立包含 GIF 的可點擊區域。
    if (isInside(pointerX, pointerY, imageArea)) { // 判斷是否點擊或觸碰到題目圖片。
      speakQuestion(index); // 用親切的繁體中文語音唸出這一題。
      return false; // 避免點圖時誤啟動答案拖曳。
    } // 結束圖片點擊判斷。
  } // 結束題目圖片檢查迴圈。
  for (let index = 0; index < placedAnswers.length; index += 1) { // 檢查是否從已放入答案的題目開始拖曳。
    if (isInside(pointerX, pointerY, getTargetBox(index)) && placedAnswers[index] >= 0) { // 判斷指標是否位於已有答案的題目卡。
      draggedAnswer = placedAnswers[index]; // 設定目前拖曳的答案索引。
      draggedFrom = index; // 記錄答案原本所在題目位置。
      placedAnswers[index] = -1; // 暫時清空原本位置以便重新放置。
      return false; // 完成從題目卡開始拖曳的操作。
    } // 結束已填題目拖曳判斷。
  } // 結束已填題目檢查迴圈。
  for (let index = 0; index < quizItems.length; index += 1) { // 檢查是否從答案區開始拖曳。
    if (!placedAnswers.includes(index) && isInside(pointerX, pointerY, getOptionBox(index))) { // 判斷答案是否尚未使用且指標位於答案卡內。
      draggedAnswer = index; // 設定目前拖曳的答案索引。
      draggedFrom = -1; // 設定答案原本位於下方答案區。
      return false; // 完成從答案區開始拖曳的操作。
    } // 結束答案卡拖曳判斷。
  } // 結束答案區檢查迴圈。
  return false; // 阻止瀏覽器預設的選取與觸控行為。
} // 結束滑鼠與觸控按下事件。

// 使用瀏覽器語音，以親切活潑的繁體中文唸出題目。
function speakQuestion(index) { // 定義題目語音播放函式。
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") { // 檢查瀏覽器是否支援語音合成。
    return; // 不支援語音時安靜結束，測驗仍可正常操作。
  } // 結束語音支援判斷。
  window.speechSynthesis.cancel(); // 停止上一題尚未唸完的語音。
  const prompt = quizItems[index].prompt; // 取得目前題目的文字內容。
  const utterance = new SpeechSynthesisUtterance(`小朋友，聽聽看喔！${prompt}，我們要怎麼做呢？`); // 加上親切引導語並建立語音內容。
  utterance.lang = "zh-TW"; // 指定使用繁體中文語音。
  utterance.rate = 0.88; // 稍微放慢語速，方便幼兒聽清楚。
  utterance.pitch = 1.15; // 稍微提高音調，營造活潑親切的感覺。
  utterance.volume = 1; // 將語音音量設為最大值。
  const chineseVoice = window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("zh-tw")) || window.speechSynthesis.getVoices().find((voice) => voice.lang.toLowerCase().startsWith("zh")); // 優先尋找繁體中文語音。
  if (chineseVoice) { // 檢查是否找到合適的中文語音。
    utterance.voice = chineseVoice; // 使用找到的中文語音朗讀題目。
  } // 結束中文語音設定。
  window.speechSynthesis.speak(utterance); // 播放親切有趣的題目語音。
} // 結束題目語音播放函式。

// 拖曳時持續更新指標位置以移動答案卡片。
function mouseDragged() { // 定義滑鼠與觸控共用的拖曳事件。
  pointerX = mouseX; // 更新拖曳中的水平位置。
  pointerY = mouseY; // 更新拖曳中的垂直位置。
  return false; // 阻止瀏覽器預設拖曳行為。
} // 結束拖曳事件。

// 放開滑鼠或觸控時，將答案放入題目或送回答案區。
function mouseReleased() { // 定義滑鼠與觸控共用的放開事件。
  pointerX = mouseX; // 更新放開時的水平位置。
  pointerY = mouseY; // 更新放開時的垂直位置。
  if (draggedAnswer < 0) { // 檢查是否沒有正在拖曳的答案。
    return false; // 沒有拖曳時直接結束操作。
  } // 結束拖曳答案存在判斷。
  let droppedOnTarget = false; // 記錄答案是否已放入某一個題目。
  for (let index = 0; index < quizItems.length; index += 1) { // 逐一檢查答案是否放在題目卡片上。
    if (isInside(pointerX, pointerY, getTargetBox(index))) { // 判斷放開位置是否位於某道題目卡內。
      if (placedAnswers[index] >= 0) { // 檢查目標題目是否已經有答案。
        if (draggedFrom >= 0) { // 檢查拖曳答案是否來自另一道已填題目。
          placedAnswers[draggedFrom] = placedAnswers[index]; // 將目標題目原有答案移回來源題目。
        } // 結束來源題目交換判斷。
      } // 結束目標題目原有答案判斷。
      placedAnswers[index] = draggedAnswer; // 將目前拖曳的答案放入目標題目。
      droppedOnTarget = true; // 記錄答案已經放入題目卡。
      break; // 停止檢查其他題目卡。
    } // 結束放入題目判斷。
  } // 結束題目卡檢查迴圈。
  if (!droppedOnTarget && draggedFrom >= 0 && pointerY > layout.bankLabelY - 16) { // 檢查答案是否被拖回下方答案區。
    placedAnswers[draggedFrom] = -1; // 將答案從題目移回尚未作答狀態。
  } else if (!droppedOnTarget && draggedFrom >= 0) { // 處理拖曳答案放在其他空白區域的情況。
    placedAnswers[draggedFrom] = draggedAnswer; // 將答案放回拖曳前的原位置。
  } // 結束答案未放入題目時的復原處理。
  draggedAnswer = -1; // 清除目前拖曳中的答案索引。
  draggedFrom = -1; // 清除答案原本所在位置。
  return false; // 阻止瀏覽器預設放開行為。
} // 結束滑鼠與觸控放開事件。

// 重新開始測驗並清空答題、成績與彩帶狀態。
function restartQuiz() { // 定義重新挑戰函式。
  placedAnswers.fill(-1); // 清空六題已放置的答案。
  submitted = false; // 關閉成績結果畫面。
  confetti = []; // 清除上一輪的彩帶粒子。
  draggedAnswer = -1; // 清除目前拖曳中的答案。
  draggedFrom = -1; // 清除答案原本的位置。
} // 結束重新挑戰函式。

// 視窗尺寸改變時重新調整全螢幕畫布與版面。
function windowResized() { // 定義視窗尺寸變更事件。
  resizeCanvas(windowWidth, windowHeight); // 將畫布調整為最新視窗尺寸。
  calculateLayout(); // 重新計算題目與答案卡片位置。
} // 結束視窗尺寸變更事件。
