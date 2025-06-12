document.addEventListener("DOMContentLoaded", function () {
    const rows = 27;
    const cols = 163;
    const matrix = document.getElementById("dotMatrix");
    let waitingForA = true;
    let loading = false;
    let skipLoading = true;
    let stickFigureX = 10;
    let stickFigureY = 15;
    let viewX = 0; // how far the viewport has scrolled
    let viewY = 0;
    const viewportWidth = cols;
    const viewportHeight = rows;


    const STICK_FIGURE = [
        0b00100,
        0b01110,
        0b01110,
        0b00100,
        0b00100,
        0b11111,
        0b00100,
        0b00100,
        0b01010,
        0b01010 
    ];

    const TILE_MAP = [
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    "........................................................................................................................................................................................############################################################################################",
    ".........................##########.....................................................................................................................................................############################################################################################",
    "####################################################################################################################################################################################################################################################################################",
    "####################################################################################################################################################################################################################################################################################"
    ];

    const TILE_DRAW = {
        '#': 1,
        '.': 0,
        '@': 1, // or 2 for a different style
    };



    // Create 8x8 grid
    const dots = [];
    for (let i = 0; i < rows * cols; i++) {
        const dot = document.createElement("div");
        dot.classList.add("dot");
        matrix.appendChild(dot);
        dots.push(dot);
    }

    function drawText(text, startX = 0, startY = 0, scale = 1) {
        let x = startX;
        for (const char of text) {
            const upperChar = char.toUpperCase();
            const glyph = CHARSET[upperChar];
            if (!glyph) {
                x += 4 * scale;
                continue;
            }
            drawChar(upperChar, x, startY, scale);
            x += (5 + 1) * scale; // 5 width + 1 spacing
        }
    }


    function drawChar(char, xOffset, yOffset, scale = 1) {
        const glyph = CHARSET[char.toUpperCase()];
        if (!glyph) return;

        for (let row = 0; row < glyph.length; row++) {
            for (let col = 0; col < 5; col++) {
                const bit = (glyph[row] >> (4 - col)) & 1;

                for (let dy = 0; dy < scale; dy++) {
                    for (let dx = 0; dx < scale; dx++) {
                        const matrixRow = yOffset + row * scale + dy;
                        const matrixCol = xOffset + col * scale + dx;

                        if (matrixRow < rows && matrixCol < cols) {
                            const index = matrixRow * cols + matrixCol;
                            dots[index].classList.toggle("on", bit === 1);
                        }
                    }
                }
            }
        }
    }

    function drawStickFigure(xOffset, yOffset, scale = 1) {
        for (let row = 0; row < STICK_FIGURE.length; row++) {
            for (let col = 0; col < 6; col++) {
                const bit = (STICK_FIGURE[row] >> (5 - col)) & 1;

                for (let dy = 0; dy < scale; dy++) {
                    for (let dx = 0; dx < scale; dx++) {
                        const matrixRow = yOffset + row * scale + dy;
                        const matrixCol = xOffset + col * scale + dx;

                        if (matrixRow < rows && matrixCol < cols) {
                            const index = matrixRow * cols + matrixCol;
                            dots[index].classList.toggle("on", bit === 1);
                        }
                    }
                }
            }
        }
    }


    function clearMatrix() {
        dots.forEach(dot => dot.classList.remove("on"));
    }

     function getTextWidth(text, scale = 1) {
        // Each character is 5px wide + 1px space = 6px per char, scaled
        return text.length * 6 * scale;
    }

    function centerX(text, scale = 1) {
        const charWidthNormal = 5; // Width for normal chars
        const charWidthSmall = 4;  // Width for space, period, comma, etc.
        const spacing = 1;

        let totalWidth = 0;

        for (const char of text) {
            let width = charWidthNormal;
            if (char === ' ' || char === '.' || char === ',') {
                width = charWidthSmall;
            }
            totalWidth += (width + spacing) * scale;
        }

        // Subtract last spacing since no spacing after last char
        totalWidth -= spacing * scale;

        return Math.floor((cols - totalWidth) / 2);
    }


    function drawCenteredText(text, y, scale) {
        const x = centerX(text, scale);  // Calculate center X based on text and scale
        drawText(text, x, y, scale); 
    }


    //Animation
    function loopPressA() {
        if (!waitingForA) return;

        clearMatrix();

        setTimeout(() => {
            if (!waitingForA) return;

            clearMatrix();

            const scale = 1;
            const y = 8;
            const x = centerX("Press A To Start", scale);
            
            drawText("Press A To Start", x, y, scale);  // ✅ Fix: correct order

            // Loop again after 1 second
            setTimeout(loopPressA, 1000);
        }, 1000);
    }

    function drawViewport(map, viewX, viewY, width, height) {
        clearMatrix();
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const mapY = viewY + y;
                const mapX = viewX + x;

                if (mapY < map.length && mapX < map[0].length) {
                    const tile = map[mapY][mapX];
                    const on = TILE_DRAW[tile] || 0;
                    const index = y * cols + x;
                    dots[index].classList.toggle("on", on === 1);
                }
            }
        }
    }


    function loadLevel() {
        drawViewport(TILE_MAP, 0, 0, cols, rows); // ✅ Pass full viewport info
        drawCurrentPosition();
    }

    function loadingLoop(times = 1) {
        if (times <= 0) {
            clearMatrix();
            console.log("Done");
            loadLevel();
            return;
        }

        clearMatrix();

        const baseText = "Loading";
        const y = 8;
        const scale = 1;
        const x = centerX("Loading...", scale);

        drawText(baseText, x, y, scale);

        setTimeout(() => {
            drawText("Loading.", x, y, scale);
        }, 500);

        setTimeout(() => {
            drawText("Loading..", x, y, scale);
        }, 1000);

        setTimeout(() => {
            drawText("Loading...", x, y, scale);
        }, 1500);

        setTimeout(() => {
            loadingLoop(times - 1);
        }, 2000);
    }

    function startScreen() {
        clearMatrix();
        drawCenteredText("Welcome", 3, 3)

        setTimeout(() => {

            clearMatrix();
            drawCenteredText("TO", 3, 3)

            setTimeout(() => {
                clearMatrix();
                drawCenteredText("Game Name", 3, 3)
                setTimeout(() => {
                    loopPressA()
                }, 1000);
            }, 1000);
        }, 1000);
    }

    function drawCurrentPosition() {
        drawViewport(TILE_MAP, viewX, viewY, viewportWidth, viewportHeight);
        drawStickFigure(stickFigureX, stickFigureY, 1);
    }


    let moveCooldown = false;

    function right() {
        if (moveCooldown) return;

        const scale = 1;
        const figureWidth = 10 * scale;

        // Always move the character
        stickFigureX += 1;

        // If character reaches threshold, scroll map instead
        if (stickFigureX > 50) {
            viewX += 1;
            viewX = Math.max(0, Math.min(viewX, TILE_MAP[0].length - viewportWidth));
            stickFigureX = 100; // keep figure fixed in screen
        }

        drawCurrentPosition();
        moveCooldown = true;
        setTimeout(() => moveCooldown = false, 50);
    }
    
    function up() {
        if (moveCooldown) return;

        const scale = 1;
        const figureWidth = 10 * scale;

        // Always move the character
        stickFigureY -= 2;

        drawCurrentPosition();

        stickFigureY += 2;

        setTimeout(() => {
            drawCurrentPosition();
        }, 250);

        moveCooldown = true;
        setTimeout(() => moveCooldown = false, 50);
    }

    function left() {
        if (moveCooldown) return;

        if (viewX > 0 && stickFigureX <= 0) {
            viewX -= 1;
        } else if (stickFigureX > 0) {
            stickFigureX -= 1;
        }

        drawCurrentPosition();
        moveCooldown = true;
        setTimeout(() => moveCooldown = false, 50);
    }

    document.addEventListener("keydown", (e) => {
        const key = e.key.toLowerCase();

        if (key === 'a') {
            waitingForA = false;
            if (!loading) {
                loading = true;
                loadingLoop();
            }
        }

        if (key === 'arrowright') {
            right();
        }

        if (key === 'arrowup') {
            up();
        }

        if (key === 'arrowleft') {
            left();
        }
    });


    if (skipLoading) {
        loadLevel();
    } else {
        startScreen();
    }

    window.left = left;
    window.right = right;
    window.up = up;
});