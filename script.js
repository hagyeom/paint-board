const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const colors = [
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "purple",
  "black",
  "gray",
  "white",
];
const colorContainer = document.getElementById("colors");

let drawing = false;
let currentColor = "black";
let lineWidth = 1;
let history = [];
let redoStack = [];
let isErasing = false;

// 캔버스 초기 설정
function initializeCanvas() {
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  ctx.fillStyle = "#eef5ff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  saveState(true); // 초기 상태 저장
}

// 상태 저장
function saveState(force = false) {
  if (
    force ||
    history.length === 0 ||
    history[history.length - 1] !== canvas.toDataURL()
  ) {
    history.push(canvas.toDataURL());
    redoStack = []; // 새로운 그림을 그리면 redoStack 초기화
  }
}

// 상태 복원
function restoreState(state) {
  let img = new Image();
  img.src = state;
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };
}

// 실행 취소 (Undo)
document.getElementById("undo").addEventListener("click", () => {
  if (history.length > 1) {
    redoStack.push(history.pop()); // 현재 상태를 redoStack에 저장
    restoreState(history[history.length - 1]); // 이전 상태로 복원
  }
});

// 다시 실행 (Redo)
document.getElementById("redo").addEventListener("click", () => {
  if (redoStack.length > 0) {
    let redoState = redoStack.pop();
    history.push(redoState);
    restoreState(redoState);
  }
});

// 색상 선택
colors.forEach((color) => {
  const div = document.createElement("div");
  div.style.backgroundColor = color;
  div.classList.add("border");
  div.addEventListener("click", () => {
    document
      .querySelectorAll("#colors div")
      .forEach((el) => el.classList.remove("selected"));
    div.classList.add("selected");
    currentColor = color;
    isErasing = false;
  });
  colorContainer.appendChild(div);
});
document.querySelector("#colors div").classList.add("selected");

// 선 굵기 설정
document.getElementById("lineWidth").addEventListener("input", (e) => {
  lineWidth = e.target.value;
});

// 지우개 모드
document.getElementById("eraser").addEventListener("click", () => {
  isErasing = true;
});

// 그림 저장
document.getElementById("save").addEventListener("click", () => {
  const link = document.createElement("a");
  link.download = "drawing.png";
  link.href = canvas.toDataURL();
  link.click();
});

// 그리기 이벤트 핸들러
canvas.addEventListener("mousedown", () => {
  drawing = true;
  ctx.beginPath();
});

canvas.addEventListener("mousemove", (e) => {
  if (drawing) {
    ctx.strokeStyle = isErasing ? "#eef5ff" : currentColor;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = "round";
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
  }
});

canvas.addEventListener("mouseup", () => {
  drawing = false;
  saveState(); // 선을 그린 후 상태 저장
});

// 초기화
window.addEventListener("load", initializeCanvas);
window.addEventListener("resize", initializeCanvas);
