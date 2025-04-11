const canvas = document.getElementById("photoCanvas");
const ctx = canvas.getContext("2d");
const fileInput = document.getElementById("fileInput");

let image = new Image();
let imageLoaded = false;

canvas.width = 1000;
canvas.height = 700;

let isDragging = false;
let startX = 0;
let startY = 0;
let endX = 0;
let endY = 0;

let history = [];
let redoStack = [];

function saveState(force = false) {
  const data = canvas.toDataURL();
  if (force || history.length === 0 || history[history.length - 1] !== data) {
    history.push(data);
    redoStack = [];
  }
}

function restoreState(state, skipSave = false) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = state;
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      image = img;
      imageLoaded = true;

      if (!skipSave) {
        saveState();
      }

      resolve();
    };
  });
}

// 이미지 불러오기
document.getElementById("loadImage").addEventListener("click", () => {
  const file = fileInput.files[0];
  if (!file) return alert("이미지를 선택하세요!");

  const reader = new FileReader();
  reader.onload = (e) => {
    image = new Image();
    image.src = e.target.result;
    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
      imageLoaded = true;
      saveState(true);
    };
  };
  reader.readAsDataURL(file);
});

// 드래그 시작
canvas.addEventListener("mousedown", (e) => {
  if (!imageLoaded) return alert("이미지를 선택하세요!");
  isDragging = true;
  const rect = canvas.getBoundingClientRect();
  startX = e.clientX - rect.left;
  startY = e.clientY - rect.top;
});

// 드래그 중
canvas.addEventListener("mousemove", (e) => {
  if (isDragging && imageLoaded) {
    const rect = canvas.getBoundingClientRect();
    endX = e.clientX - rect.left;
    endY = e.clientY - rect.top;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0);

    const width = endX - startX;
    const height = endY - startY;
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.strokeRect(startX, startY, width, height);
  }
});

// 드래그 종료 (0.5초 후 테두리 제거)
canvas.addEventListener("mouseup", () => {
  isDragging = false;

  if (imageLoaded) {
    setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0);
    }, 500); // 0.5초 유지
  }
});

// 이미지 자르기
document.getElementById("cropImage").addEventListener("click", () => {
  if (!imageLoaded) return alert("이미지를 먼저 불러오세요!");

  const x = Math.min(startX, endX);
  const y = Math.min(startY, endY);
  const width = Math.abs(endX - startX);
  const height = Math.abs(endY - startY);

  if (width < 1 || height < 1) return alert("유효한 영역을 드래그하세요.");

  saveState();

  const cropped = ctx.getImageData(x, y, width, height);
  canvas.width = width;
  canvas.height = height;
  ctx.putImageData(cropped, 0, 0);

  image = new Image();
  image.src = canvas.toDataURL();
  image.onload = () => {
    ctx.drawImage(image, 0, 0);
    imageLoaded = true;
    saveState();
  };
});

// 크기 조절
document.getElementById("resizeImage").addEventListener("click", () => {
  if (!imageLoaded) return alert("이미지를 먼저 불러오세요!");

  const newWidth = parseInt(prompt("새 너비(px)", canvas.width));
  const newHeight = parseInt(prompt("새 높이(px)", canvas.height));

  if (
    newWidth &&
    newHeight &&
    (newWidth !== canvas.width || newHeight !== canvas.height)
  ) {
    saveState();

    const tempCanvas = document.createElement("canvas");
    const tempCtx = tempCanvas.getContext("2d");

    tempCanvas.width = newWidth;
    tempCanvas.height = newHeight;
    tempCtx.drawImage(canvas, 0, 0, newWidth, newHeight);

    canvas.width = newWidth;
    canvas.height = newHeight;
    ctx.drawImage(tempCanvas, 0, 0);

    image = new Image();
    image.src = canvas.toDataURL();
    image.onload = () => {
      imageLoaded = true;
      saveState();
    };
  }
});

// 회전
document.getElementById("rotateImage").addEventListener("click", () => {
  if (!imageLoaded) return alert("이미지를 먼저 불러오세요!");

  saveState();

  const tempCanvas = document.createElement("canvas");
  const tempCtx = tempCanvas.getContext("2d");

  tempCanvas.width = canvas.height;
  tempCanvas.height = canvas.width;

  tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
  tempCtx.rotate(Math.PI / 2);
  tempCtx.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);

  canvas.width = tempCanvas.width;
  canvas.height = tempCanvas.height;
  ctx.drawImage(tempCanvas, 0, 0);

  image = new Image();
  image.src = canvas.toDataURL();
  image.onload = () => {
    imageLoaded = true;
    saveState();
  };
});

// 저장
document.getElementById("saveImage").addEventListener("click", () => {
  const filename = prompt("저장할 파일 이름 (확장자 제외)", "edited-image");
  if (!filename) return;

  const link = document.createElement("a");
  link.download = `${filename}.png`;
  link.href = canvas.toDataURL();
  link.click();
});

// 실행 취소
document.getElementById("undo").addEventListener("click", async () => {
  if (history.length > 1) {
    const lastState = history.pop();
    redoStack.push(lastState);
    const prevState = history[history.length - 1];
    await restoreState(prevState, true);
  } else {
    alert("되돌릴 수 있는 작업이 없습니다.");
  }
});

// 다시 실행
document.getElementById("redo").addEventListener("click", async () => {
  if (redoStack.length > 0) {
    const nextState = redoStack.pop();
    await restoreState(nextState, true);
    history.push(nextState);
  } else {
    alert("다시 실행할 작업이 없습니다.");
  }
});
