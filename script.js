// Mengambil referensi elemen DOM
const bgInput = document.getElementById("bgInput");
const background = document.getElementById("background");
const logo = document.getElementById("logo");
const originalBsa = document.getElementById("original-bsa");
const textInput = document.getElementById("textInput");
const text = document.getElementById("text");
const saveBtn = document.getElementById("saveBtn");
const cropModal = document.getElementById("cropModal");
const cropImage = document.getElementById("cropImage");
const cropBtn = document.getElementById("cropBtn");
const cancelCropBtn = document.getElementById("cancelCropBtn");
const previewModal = document.getElementById("previewModal");
const previewImage = document.getElementById("previewImage");
const downloadBtn = document.getElementById("downloadBtn");
const cancelPreviewBtn = document.getElementById("cancelPreviewBtn");
const previewBtn = document.getElementById("previewBtn");
let cropper = null;

// Event listener untuk input gambar
bgInput.addEventListener("change", function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            cropImage.src = e.target.result;
            cropModal.style.display = "block";
            if (cropper) {
                cropper.destroy();
            }
            cropper = new Cropper(cropImage, {
                aspectRatio: 1,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 1,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: false,
                cropBoxResizable: false,
                toggleDragModeOnDblclick: false,
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high'
            });
        }
        reader.readAsDataURL(file);
    }
});

cropBtn.addEventListener("click", function() {
    if (cropper) {
        const canvas = cropper.getCroppedCanvas({
            width: 1080,
            height: 1080,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });
        background.src = canvas.toDataURL('image/jpeg', 1.0);
        cropModal.style.display = "none";
        cropper.destroy();
        cropper = null;
        if (previewModal.style.display === "block") {
            generateImage((imageData) => {
                previewImage.src = imageData;
            });
        }
    }
});

cancelCropBtn.addEventListener("click", function() {
    cropModal.style.display = "none";
    if (cropper) {
        cropper.destroy();
        cropper = null;
    }
});

// Event listener untuk input teks
textInput.addEventListener("input", function(e) {
    text.textContent = e.target.value;
    if (previewModal.style.display === "block") {
        generateImage((imageData) => {
            previewImage.src = imageData;
        });
    }
});

function generateImage(callback) {
    document.fonts.ready.then(() => {
        const canvas = document.createElement("canvas");
        const hdSize = 1080;
        canvas.width = hdSize;
        canvas.height = hdSize;
        const ctx = canvas.getContext("2d", { alpha: false });

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        // Gunakan font yang sama persis dengan CSS
        const fontSize = Math.floor(hdSize * 0.055);
        ctx.font = `bold ${fontSize}px 'Amaranth', 'Inter', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "white";
        ctx.strokeStyle = "black";
        ctx.lineWidth = Math.ceil(hdSize * 0.005);

        const lineHeight = fontSize * 1.3;

        // Word wrap yang benar, pertahankan \n
        function smartWordWrap(text, maxWidth) {
            if (!text) return [''];
            const paragraphs = text.split('\n');
            const result = [];
            paragraphs.forEach(paragraph => {
                const words = paragraph.split(' ');
                let currentLine = '';
                words.forEach((word, i) => {
                    const testLine = currentLine ? currentLine + ' ' + word : word;
                    const testWidth = ctx.measureText(testLine).width;
                    if (testWidth > maxWidth && currentLine) {
                        result.push(currentLine);
                        currentLine = word;
                    } else {
                        currentLine = testLine;
                    }
                });
                if (currentLine) result.push(currentLine);
            });
            return result;
        }

        function drawElementsToCanvas() {
            if (background.src && background.src !== window.location.href) {
                const bgImg = new Image();
                bgImg.src = background.src;
                bgImg.onload = () => {
                    ctx.drawImage(bgImg, 0, 0, hdSize, hdSize);
                    drawOverlays();
                };
                bgImg.onerror = () => {
                    ctx.fillStyle = "black";
                    ctx.fillRect(0, 0, hdSize, hdSize);
                    drawOverlays();
                };
            } else {
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, hdSize, hdSize);
                drawOverlays();
            }
        }

        function drawOverlays() {
            const gradientHeight = hdSize * 0.22;
            const gradTop = ctx.createLinearGradient(0, 0, 0, gradientHeight);
            gradTop.addColorStop(0, "rgba(0, 0, 0, 0.8)");
            gradTop.addColorStop(1, "transparent");
            ctx.fillStyle = gradTop;
            ctx.fillRect(0, 0, hdSize, gradientHeight);
            const gradBottom = ctx.createLinearGradient(0, hdSize - gradientHeight, 0, hdSize);
            gradBottom.addColorStop(0, "transparent");
            gradBottom.addColorStop(1, "rgba(0, 0, 0, 0.8)");
            ctx.fillStyle = gradBottom;
            ctx.fillRect(0, hdSize - gradientHeight, hdSize, gradientHeight);

            // Gambar original-bsa
            const originalBsaImg = new Image();
            originalBsaImg.crossOrigin = "anonymous";
            originalBsaImg.src = "original-bsa.png";
            originalBsaImg.onload = () => {
                const originalBsaWidth = Math.floor(hdSize * 0.14);
                const originalBsaHeight = Math.floor(hdSize * 0.14);
                ctx.drawImage(originalBsaImg, 0, hdSize - originalBsaHeight, originalBsaWidth, originalBsaHeight);
            };

            const maxTextWidth = hdSize - (hdSize * 0.167);
            const wrappedLines = smartWordWrap(text.textContent, maxTextWidth);
            const totalTextHeight = wrappedLines.length * lineHeight;
            const startY = (hdSize / 2) - (totalTextHeight / 2) + (lineHeight / 2);

            // Ambil warna teks dari editor
            const computedColor = getComputedStyle(text).color;
            ctx.fillStyle = computedColor;
            ctx.strokeStyle = "black";

            wrappedLines.forEach((line, index) => {
                const y = startY + (index * lineHeight);
                ctx.globalAlpha = 0.6;
                ctx.strokeText(line, hdSize / 2, y);
                ctx.globalAlpha = 1;
                ctx.fillText(line, hdSize / 2, y);
            });

            const logoImg = new Image();
            logoImg.crossOrigin = "anonymous";
            logoImg.src = "logo-bsa.png";
            logoImg.onload = () => {
                const logoWidth = Math.floor(hdSize * 0.194);
                const aspectRatio = logoImg.height / logoImg.width;
                const logoHeight = logoWidth * aspectRatio;
                const x = hdSize / 2 - logoWidth / 2;
                const y = hdSize - logoHeight;
                ctx.globalAlpha = 0.6;
                ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
                ctx.globalAlpha = 1.0;
                callback(canvas.toDataURL("image/png", 1.0));
            };
            logoImg.onerror = () => {
                callback(canvas.toDataURL("image/png", 1.0));
            };
        }

        drawElementsToCanvas();
    });
}

previewBtn.addEventListener("click", () => {
    generateImage((imageData) => {
        previewImage.src = imageData;
        previewModal.style.display = "block";
    });
});

saveBtn.addEventListener("click", () => {
    generateImage((imageData) => {
        const link = document.createElement("a");
        link.download = "Gambar_BSA.png";
        link.href = imageData;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
});

downloadBtn.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = "Gambar_BSA.png";
    link.href = previewImage.src;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    previewModal.style.display = "none";
});

cancelPreviewBtn.addEventListener("click", () => {
    previewModal.style.display = "none";
});

previewModal.addEventListener("click", (e) => {
    if (e.target === previewModal) {
        previewModal.style.display = "none";
    }
});
