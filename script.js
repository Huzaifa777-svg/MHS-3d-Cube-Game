document.addEventListener('DOMContentLoaded', () => {
    const cubeElement = document.querySelector('.cube');
    let rotationX = -30;
    let rotationY = 45;
    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    // Cube Data Structure: Each face (F, B, R, L, U, D) has 9 stickers.
    const colors = {
        'F': Array(9).fill('red'),
        'B': Array(9).fill('orange'),
        'R': Array(9).fill('blue'),
        'L': Array(9).fill('green'),
        'U': Array(9).fill('white'),
        'D': Array(9).fill('yellow')
    };

    // Mapping internal face keys to CSS class names for rendering
    const faceMap = {
        'F': 'front', 'B': 'back', 'R': 'right',
        'L': 'left', 'U': 'top', 'D': 'bottom'
    };

    // Renders (draws) the cube based on the current 'colors' state
    function renderCube() {
        for (const faceKey in colors) {
            const faceElement = document.querySelector(`.face.${faceMap[faceKey]}`);
            const stickers = faceElement.querySelectorAll('.sticker');
            colors[faceKey].forEach((color, index) => {
                stickers[index].className = `sticker ${color}`; // Apply the color class
            });
        }
    }

    // Helper to rotate a 3x3 array (representing a single face) clockwise or anti-clockwise
    function rotateFaceStickers(faceArray, clockwise) {
        const newFace = Array(9).fill(null);
        if (clockwise) {
            newFace[0] = faceArray[6]; newFace[1] = faceArray[3]; newFace[2] = faceArray[0];
            newFace[3] = faceArray[7]; newFace[4] = faceArray[4]; newFace[5] = faceArray[1];
            newFace[6] = faceArray[8]; newFace[7] = faceArray[5]; newFace[8] = faceArray[2];
        } else { // Anti-clockwise
            newFace[0] = faceArray[2]; newFace[1] = faceArray[5]; newFace[2] = faceArray[8];
            newFace[3] = faceArray[1]; newFace[4] = faceArray[4]; newFace[5] = faceArray[7];
            newFace[6] = faceArray[0]; newFace[7] = faceArray[3]; newFace[8] = faceArray[6];
        }
        return newFace;
    }

    // Core logic to apply a Rubik's Cube move (F, R, U, etc.)
    // This involves rotating the specific face and transferring colors between adjacent faces
    function applyMove(moveType) {
        const tempColors = JSON.parse(JSON.stringify(colors)); // Create a deep copy to manipulate

        switch (moveType) {
            case 'F': // Front Clockwise
                colors.F = rotateFaceStickers(tempColors.F, true);
                // Transfer colors from U -> R -> D -> L -> U edges
                colors.R[0] = tempColors.U[6]; colors.R[3] = tempColors.U[7]; colors.R[6] = tempColors.U[8];
                colors.D[2] = tempColors.R[0]; colors.D[1] = tempColors.R[3]; colors.D[0] = tempColors.R[6];
                colors.L[8] = tempColors.D[2]; colors.L[5] = tempColors.D[1]; colors.L[2] = tempColors.D[0];
                colors.U[6] = tempColors.L[8]; colors.U[7] = tempColors.L[5]; colors.U[8] = tempColors.L[2];
                break;
            case 'F_PRIME': // Front Anti-clockwise
                colors.F = rotateFaceStickers(tempColors.F, false);
                // Transfer colors from U -> L -> D -> R -> U edges (reverse)
                colors.L[8] = tempColors.U[6]; colors.L[5] = tempColors.U[7]; colors.L[2] = tempColors.U[8];
                colors.D[2] = tempColors.L[8]; colors.D[1] = tempColors.L[5]; colors.D[0] = tempColors.L[2];
                colors.R[0] = tempColors.D[2]; colors.R[3] = tempColors.D[1]; colors.R[6] = tempColors.D[0];
                colors.U[6] = tempColors.R[0]; colors.U[7] = tempColors.R[3]; colors.U[8] = tempColors.R[6];
                break;

            case 'R': // Right Clockwise
                colors.R = rotateFaceStickers(tempColors.R, true);
                // Edges: U (2,5,8) -> B (6,3,0) -> D (2,5,8) -> F (2,5,8) -> U (2,5,8)
                colors.B[6] = tempColors.U[2]; colors.B[3] = tempColors.U[5]; colors.B[0] = tempColors.U[8];
                colors.D[2] = tempColors.B[6]; colors.D[5] = tempColors.B[3]; colors.D[8] = tempColors.B[0];
                colors.F[2] = tempColors.D[2]; colors.F[5] = tempColors.D[5]; colors.F[8] = tempColors.D[8];
                colors.U[2] = tempColors.F[2]; colors.U[5] = tempColors.F[5]; colors.U[8] = tempColors.F[8];
                break;
            case 'R_PRIME': // Right Anti-clockwise
                colors.R = rotateFaceStickers(tempColors.R, false);
                // Edges: U (2,5,8) -> F (2,5,8) -> D (2,5,8) -> B (6,3,0) -> U (2,5,8)
                colors.F[2] = tempColors.U[2]; colors.F[5] = tempColors.U[5]; colors.F[8] = tempColors.U[8];
                colors.D[2] = tempColors.F[2]; colors.D[5] = tempColors.F[5]; colors.D[8] = tempColors.F[8];
                colors.B[6] = tempColors.D[2]; colors.B[3] = tempColors.D[5]; colors.B[0] = tempColors.D[8];
                colors.U[2] = tempColors.B[6]; colors.U[5] = tempColors.B[3]; colors.U[8] = tempColors.B[0];
                break;

            case 'U': // Up (Top) Clockwise
                colors.U = rotateFaceStickers(tempColors.U, true);
                // Edges: F (0,1,2) -> R (0,1,2) -> B (0,1,2) -> L (0,1,2) -> F (0,1,2)
                const tempRowU = [tempColors.F[0], tempColors.F[1], tempColors.F[2]];
                colors.F[0] = tempColors.R[0]; colors.F[1] = tempColors.R[1]; colors.F[2] = tempColors.R[2];
                colors.R[0] = tempColors.B[0]; colors.R[1] = tempColors.B[1]; colors.R[2] = tempColors.B[2];
                colors.B[0] = tempColors.L[0]; colors.B[1] = tempColors.L[1]; colors.B[2] = tempColors.L[2];
                colors.L[0] = tempRowU[0]; colors.L[1] = tempRowU[1]; colors.L[2] = tempRowU[2];
                break;
            case 'U_PRIME': // Up (Top) Anti-clockwise
                colors.U = rotateFaceStickers(tempColors.U, false);
                // Edges: F (0,1,2) -> L (0,1,2) -> B (0,1,2) -> R (0,1,2) -> F (0,1,2) (reverse of U)
                const tempRowUPrime = [tempColors.F[0], tempColors.F[1], tempColors.F[2]];
                colors.F[0] = tempColors.L[0]; colors.F[1] = tempColors.L[1]; colors.F[2] = tempColors.L[2];
                colors.L[0] = tempColors.B[0]; colors.L[1] = tempColors.B[1]; colors.L[2] = tempColors.B[2];
                colors.B[0] = tempColors.R[0]; colors.B[1] = tempColors.R[1]; colors.B[2] = tempColors.R[2];
                colors.R[0] = tempRowUPrime[0]; colors.R[1] = tempRowUPrime[1]; colors.R[2] = tempRowUPrime[2];
                break;

            case 'L': // Left Clockwise
                colors.L = rotateFaceStickers(tempColors.L, true);
                // Edges: U (0,3,6) -> F (0,3,6) -> D (0,3,6) -> B (8,5,2) -> U (0,3,6)
                colors.F[0] = tempColors.U[0]; colors.F[3] = tempColors.U[3]; colors.F[6] = tempColors.U[6];
                colors.D[0] = tempColors.F[0]; colors.D[3] = tempColors.F[3]; colors.D[6] = tempColors.F[6];
                colors.B[8] = tempColors.D[0]; colors.B[5] = tempColors.D[3]; colors.B[2] = tempColors.D[6];
                colors.U[0] = tempColors.B[8]; colors.U[3] = tempColors.B[5]; colors.U[6] = tempColors.B[2];
                break;
            case 'L_PRIME': // Left Anti-clockwise
                colors.L = rotateFaceStickers(tempColors.L, false);
                // Edges: U (0,3,6) -> B (8,5,2) -> D (0,3,6) -> F (0,3,6) -> U (0,3,6)
                colors.B[8] = tempColors.U[0]; colors.B[5] = tempColors.U[3]; colors.B[2] = tempColors.U[6];
                colors.D[0] = tempColors.B[8]; colors.D[3] = tempColors.B[5]; colors.D[6] = tempColors.B[2];
                colors.F[0] = tempColors.D[0]; colors.F[3] = tempColors.D[3]; colors.F[6] = tempColors.D[6];
                colors.U[0] = tempColors.F[0]; colors.U[3] = tempColors.F[3]; colors.U[6] = tempColors.F[6];
                break;

            case 'D': // Down (Bottom) Clockwise
                colors.D = rotateFaceStickers(tempColors.D, true);
                // Edges: F (6,7,8) -> L (6,7,8) -> B (6,7,8) -> R (6,7,8) -> F (6,7,8)
                const tempDRow = [tempColors.F[6], tempColors.F[7], tempColors.F[8]];
                colors.F[6] = tempColors.L[6]; colors.F[7] = tempColors.L[7]; colors.F[8] = tempColors.L[8];
                colors.L[6] = tempColors.B[6]; colors.L[7] = tempColors.B[7]; colors.L[8] = tempColors.B[8];
                colors.B[6] = tempColors.R[6]; colors.B[7] = tempColors.R[7]; colors.B[8] = tempColors.R[8];
                colors.R[6] = tempDRow[0]; colors.R[7] = tempDRow[1]; colors.R[8] = tempDRow[2];
                break;
            case 'D_PRIME': // Down (Bottom) Anti-clockwise
                colors.D = rotateFaceStickers(tempColors.D, false);
                // Edges: F (6,7,8) -> R (6,7,8) -> B (6,7,8) -> L (6,7,8) -> F (6,7,8)
                const tempDRowPrime = [tempColors.F[6], tempColors.F[7], tempColors.F[8]];
                colors.F[6] = tempColors.R[6]; colors.F[7] = tempColors.R[7]; colors.F[8] = tempColors.R[8];
                colors.R[6] = tempColors.B[6]; colors.R[7] = tempColors.B[7]; colors.R[8] = tempColors.B[8];
                colors.B[6] = tempColors.L[6]; colors.B[7] = tempColors.L[7]; colors.B[8] = tempColors.L[8];
                colors.L[6] = tempDRowPrime[0]; colors.L[7] = tempDRowPrime[1]; colors.L[8] = tempDRowPrime[2];
                break;

            case 'B': // Back Clockwise (viewed from Front, so reverse rotations)
                colors.B = rotateFaceStickers(tempColors.B, true);
                // Edges: U (0,1,2) -> L (0,3,6) reversed -> D (8,7,6) reversed -> R (2,5,8) reversed
                colors.L[0] = tempColors.U[2]; colors.L[3] = tempColors.U[1]; colors.L[6] = tempColors.U[0];
                colors.D[8] = tempColors.L[0]; colors.D[7] = tempColors.L[3]; colors.D[6] = tempColors.L[6];
                colors.R[2] = tempColors.D[8]; colors.R[5] = tempColors.D[7]; colors.R[8] = tempColors.D[6];
                colors.U[2] = tempColors.R[2]; colors.U[1] = tempColors.R[5]; colors.U[0] = tempColors.R[8];
                break;
            case 'B_PRIME': // Back Anti-clockwise
                colors.B = rotateFaceStickers(tempColors.B, false);
                // Edges: U (0,1,2) -> R (2,5,8) reversed -> D (8,7,6) reversed -> L (0,3,6) reversed
                colors.R[2] = tempColors.U[2]; colors.R[5] = tempColors.U[1]; colors.R[8] = tempColors.U[0];
                colors.D[8] = tempColors.R[2]; colors.D[7] = tempColors.R[5]; colors.D[6] = tempColors.R[8];
                colors.L[0] = tempColors.D[8]; colors.L[3] = tempColors.D[7]; colors.L[6] = tempColors.D[6];
                colors.U[2] = tempColors.L[0]; colors.U[1] = tempColors.L[3]; colors.U[0] = tempColors.L[6];
                break;
        }
        renderCube(); // Update the visual representation after move
    }

    // Functions to be called by HTML buttons
    window.makeMove = (moveType) => {
        applyMove(moveType);
    };

    // Scrambles the cube by applying a series of random moves
    window.scrambleCube = () => {
        const moves = ['F', 'F_PRIME', 'R', 'R_PRIME', 'U', 'U_PRIME', 'L', 'L_PRIME', 'D', 'D_PRIME', 'B', 'B_PRIME'];
        for (let i = 0; i < 20; i++) { // Apply 20 random moves
            const randomMove = moves[Math.floor(Math.random() * moves.length)];
            applyMove(randomMove);
        }
    };

    // Resets the cube to its initial solved state
    window.resetCube = () => {
        colors.F.fill('red');
        colors.B.fill('orange');
        colors.R.fill('blue');
        colors.L.fill('green');
        colors.U.fill('white');
        colors.D.fill('yellow');
        renderCube();
    };

    // Overall Cube Rotation (Mouse/Touch Drag)
    function updateCubeRotation() {
        cubeElement.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
    }

    document.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
        cubeElement.style.transition = 'none'; // Disable transition while dragging for smooth feel
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const deltaX = e.clientX - previousMouseX;
        const deltaY = e.clientY - previousMouseY;

        rotationY += deltaX * 0.5; // Adjust sensitivity for Y-axis rotation
        rotationX -= deltaY * 0.5; // Adjust sensitivity for X-axis rotation

        rotationX = Math.max(-90, Math.min(90, rotationX)); // Limit vertical rotation to prevent flipping

        updateCubeRotation();
        previousMouseX = e.clientX;
        previousMouseY = e.clientY;
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        cubeElement.style.transition = 'transform 0.3s ease-out'; // Re-enable transition after dragging
    });

    // Touch events for mobile devices
    document.addEventListener('touchstart', (e) => {
        isDragging = true;
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
        cubeElement.style.transition = 'none';
    });

    document.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        e.preventDefault(); // Prevent page scrolling while dragging
        const deltaX = e.touches[0].clientX - previousMouseX;
        const deltaY = e.touches[0].clientY - previousMouseY;

        rotationY += deltaX * 0.5;
        rotationX -= deltaY * 0.5;

        rotationX = Math.max(-90, Math.min(90, rotationX));

        updateCubeRotation();
        previousMouseX = e.touches[0].clientX;
        previousMouseY = e.touches[0].clientY;
    });

    document.addEventListener('touchend', () => {
        isDragging = false;
        cubeElement.style.transition = 'transform 0.3s ease-out';
    });

    // Initialize the cube when the page loads
    renderCube(); // Draws the cube with initial colors
    updateCubeRotation(); // Sets the initial 3D viewing angle
});