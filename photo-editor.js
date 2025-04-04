const canvas = document.getElementById("photoCanvas");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById("fileInput");
let image = new Image();
let imageLoaded = false;

// 기본 캔버스 크기 설정
canvas.width = 1000;
canvas.height = 700;

// 드래그용 변수
let isDragging = false;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

// 이미지 불러오기
document.getElementById("loadImage").addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) {
    return alert("이미지를 선택하세요!");
  }
  const reader = new FileReader();
  reader.onload = (e) => {
    image.src = e.target.result;
  };
  reader.readAsDataURL(file);
});

image.onload = () => {
  canvas.width = image.width;
  canvas.height = image.height;
  ctx.drawImage(image, 0, 0);
  imageLoaded = true;
};

// 드래그 이벤트 처리
canvas.addEventListener("mousedown", (e) => {
  if (!imageLoaded) {
    return alert("이미지를 선택하세요!");
  }
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
});

canvas.addEventListener("mousemove", (e) => {
  if (isDragging && imageLoaded) {
    const rect = canvas.getBoundingClientRect();
    endX = e.clientX - rect.left;
    endY = e.clientY - rect.top;

    // 원본 이미지 다시 그리기
    ctx.drawImage(image, 0, 0);

    // 드래그 테두리 그리기
    const width = endX - startX;
    const height = endY - startY;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, width, height);
  }
});

canvas.addEventListener("mouseup", () => {
  isDragging = false;
});

// 이미지 자르기
document.getElementById("cropImage").addEventListener("click", () => {
  if (!imageLoaded) {
    return alert("이미지를 먼저 불러오세요!");
  }

  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  if (width < 1 || height < 1) {
    return alert("유효한 영역을 드래그하세요.");
  }

  const croppedData = ctx.getImageData(x, y, width, height);
  canvas.width = width;
  canvas.height = height;
  ctx.putImageData(croppedData, 0, 0);

  // 자른 이미지를 현재 이미지로 설정
  image = new Image();
  image.src = canvas.toDataURL();
  image.onload = () => {
    ctx.drawImage(image, 0, 0);
  };
});

// 이미지 크기 조절
document.getElementById("resizeImage").addEventListener("click", () => {
  if (!imageLoaded) {
    return alert("이미지를 먼저 불러오세요!");
  }

  const newWidth = prompt("새로운 너비(px)를 입력하세요", canvas.width);
  const newHeight = prompt("새로운 높이(px)를 입력하세요", canvas.height);

  if (newWidth && newHeight) {
    const resizedCanvas = document.createElement("canvas");
    const resizedCtx = resizedCanvas.getContext("2d");
    resizedCanvas.width = newWidth;
    resizedCanvas.height = newHeight;
    resizedCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(resizedCanvas, 0, 0);
  }
});

// 이미지 회전
document.getElementById("rotateImage").addEventListener("click", () => {
  if (!imageLoaded) {
    return alert("이미지를 먼저 불러오세요!");
  }
  const rotatedCanvas = document.createElement("canvas");
  const rotatedCtx = rotatedCanvas.getContext("2d");

  rotatedCanvas.width = canvas.height;
  rotatedCanvas.height = canvas.width;

  rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
  rotatedCtx.rotate(Math.PI / 2);
  rotatedCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  canvas.width = rotatedCanvas.width;
  canvas.height = rotatedCanvas.height;
  ctx.drawImage(rotatedCanvas, 0, 0);
});

// 이미지 저장
document.getElementById("saveImage").addEventListener("click", () => {
  const filename = prompt(
    "저장할 파일 이름을 입력하세요 (확장자 제외)",
    "edited-image"
  );
  if (!filename) {
    return;
  }

  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL();
  link.click();
});
