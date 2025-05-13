import {collapse, cageScales, rotate} from './spirit.js';

// Check if we should skip the animation
const urlParams = new URLSearchParams(window.location.search);
const skipAnimation = urlParams.get('skip_animation') === 'true';

// Make sure these functions are at the top of main.js
// function start() {
//   document.removeEventListener("keydown", handleEnter);
//   startBtn.classList.add("transparent");
//   hasCollapse = true;
//   cages.forEach(cage => cage.style.pointerEvents = "none");

//   // snapshot start positions
//   startPositions = cages.map(cage => {
//     const rect = cage.getBoundingClientRect();
//     const vw = window.innerWidth;
//     const vh = window.innerHeight;

//     return {
//       left: (rect.left / vw) * 100,
//       top: (rect.top / vh) * 100,
//     };
//   });

//   // kick off the animation
//   animationStartTime = null;
//   requestAnimationFrame(animateToCenter);
// }

// document.addEventListener("DOMContentLoaded", function() {
//   const startBtn = document.getElementById("start");
//   if (startBtn) {
//     startBtn.addEventListener("click", function() {
//       start();
//     });
//   }
// });


let offsetX, offsetY, draggedCage = null;

let cages = Array.from(document.getElementsByClassName("cage"));
let cageBackgrounds = Array.from(document.getElementsByClassName("cageBackground"));

const cageMap = new Map();

cages.forEach((cage, index) => {
  // Use the same index to access the corresponding cageBackground.
  const background = cageBackgrounds[index];
  cageMap.set(cage, background);
});

function updateCages(currCage){
    let i = cages.indexOf(currCage);
    if (i === -1) return; // Cage not found

    // Remove the current cage from its position
    cages.splice(i, 1);

    // Push it to the end (most recently used)
    cages.push(currCage);

    // Update z-indexes based on order in array
    for (let z = 0; z < cages.length; z++) {
        cages[z].style.zIndex = z+3;
        cageMap.get(cages[z]).style.zIndex = z;
    }
}

const cageOverlaps = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
    ]

function calcOverlap(cageA, cageB){
    const cageLength = cageA.clientHeight;
    const cageAX = cageA.getBoundingClientRect().left;
    const cageAY = cageA.getBoundingClientRect().top;
    const cageBX = cageB.getBoundingClientRect().left;
    const cageBY = cageB.getBoundingClientRect().top;
    const diffX = Math.abs(cageAX-cageBX)/cageLength;
    const diffY = Math.abs(cageAY-cageBY)/cageLength;

    return Math.max(1-Math.max(diffX,diffY), 0);
}


//pointer down
const cage1Bg = document.getElementById('cage1Background');
const startBtn = document.getElementById("start");

let hasCollapse = false;

setTimeout(() => {
    if(!hasCollapse){
        startBtn.classList.remove("transparent");
    }
}, 3000);

function removeWiggle(){
    cage1Bg.classList.remove('rotate-wiggle');
    for(const cage of cages){
        cage.removeEventListener("pointerdown", removeWiggle);
    }
}

for (const cage of cages) {
    cage.addEventListener("pointerdown", e => {
        e.preventDefault();
        draggedCage = cage;
        updateCages(cage);

        const rect = cage.getBoundingClientRect();
        const vw   = window.innerWidth;
        const vh   = window.innerHeight;

        // 1) Where the element really sits, in % of viewport:
        const startLeftPct = (rect.left / vw) * 100;
        const startTopPct  = (rect.top  / vh) * 100;

        // 2) Where the pointer is, in the same % units:
        const pointerPctX = (e.clientX / vw) * 100;
        const pointerPctY = (e.clientY / vh) * 100;
    ``
        // 3) Your drag‐offset, in percent:
        offsetX = pointerPctX - startLeftPct;
        offsetY = pointerPctY - startTopPct;

        cage.setPointerCapture(e.pointerId);
        cage.style.cursor = "grabbing";
    });
  
    cage.addEventListener("pointerdown", removeWiggle);
}
  
function moveDraggedCage(e){
    if (!draggedCage) return;
    e.preventDefault();

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // 4) Current pointer pos, in %:
    const pointerPctX = (e.clientX / vw) * 100;
    const pointerPctY = (e.clientY / vh) * 100;

    // 5) Subtract your percent‐offset to get the element’s new %‐pos:
    const leftPct = pointerPctX - offsetX;
    const topPct  = pointerPctY - offsetY;

    // 6) Write those same % values back in dvw/dvh
    draggedCage.style.left = `${leftPct}dvw`;
    draggedCage.style.top  = `${topPct}dvh`;
    const bg = cageMap.get(draggedCage);
    bg.style.left = `${leftPct}dvw`;
    bg.style.top  = `${topPct}dvh`;

    let draggedCageIdx = parseInt(draggedCage.id.slice(-1),10)-1;
    //Update Overlaps
    for (let cage of cages) {
        if (cage !== draggedCage) {
            const cageIdx = parseInt(cage.id.slice(-1),10)-1;
            cageOverlaps[draggedCageIdx][cageIdx] = cageOverlaps[cageIdx][draggedCageIdx] = calcOverlap(draggedCage, cage);
        }
    }

    //updateScales
    for(let i = 0; i <3 ;i++){
        cageScales[i] = 0;
        for(let j = 0; j < 3; j++){
            cageScales[i] += cageOverlaps[i][j]**2;
        }
        cageScales[i] = cageScales[i]**1.5;
    }
}
  
document.addEventListener("pointermove", moveDraggedCage);

// end dragging
function endDraggedCage(e){
    if (!draggedCage) return;
    draggedCage.releasePointerCapture(e.pointerId);
    draggedCage.style.cursor = "grab";
    draggedCage = null;
    let totalOverlap = 0;
    let closeCount = 0;
    for(let i = 0; i < 3; i++){
        for(let j = 0; j < 3; j++){
            totalOverlap += cageOverlaps[i][j];
            if(cageOverlaps[i][j] > 0.70) closeCount++;
        }
    }
    if(closeCount == 9){
        start();
    } 
}
document.addEventListener("pointerup", endDraggedCage);

let startPositions = [];
let animationStartTime = null;
const animationDuration = 700; // ms, how long the "fly to center" takes

// replace your click handler with this:
function start(){
    document.removeEventListener("keydown", handleEnter);
    startBtn.classList.add("transparent");
    removeWiggle();
    // remove the button and disable manual drag
    hasCollapse = true;
    cages.forEach(cage => cage.style.pointerEvents = "none");
``
    // snapshot start positions in percent-space
    startPositions = cages.map(cage => {
        const rect = cage.getBoundingClientRect();
        const vw   = window.innerWidth;
        const vh   = window.innerHeight;

        return {
            left: (rect.left  / vw) * 100,  // e.g. 37.5  means 37.5 dvw
            top:  (rect.top   / vh) * 100,  // e.g. 42.0  means 42 dvh
        };
    });

    // kick off the animation
    animationStartTime = null;
    requestAnimationFrame(animateToCenter);
}

// 1) Click handler
startBtn.addEventListener("click", ()=>{
    start();
});

function handleEnter(event) {
    if (event.key === "Enter") {
        start();
    }
}
  
document.addEventListener("keydown", handleEnter);

let spin = false;
let prevX, prevY;
function getClientCoords(e) {
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY
      };
    } else {
      return {
        x: e.clientX,
        y: e.clientY
      };
    }
  }

function handleMove(e) {
    if (!spin) return;
    e.preventDefault();

    const { x: X, y: Y } = getClientCoords(e);
    const length = Math.min(window.innerWidth,  window.innerHeight);
    const dY = (X - prevX) / length; 
    const dX = (Y - prevY) / length;

    rotate(dX, dY);

    prevX = X;
    prevY = Y;
}

function animateToCenter(timestamp) {
    if (!animationStartTime) animationStartTime = timestamp;
    const elapsed = timestamp - animationStartTime;
    const t       = Math.min(elapsed / animationDuration, 1); // 0→1

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // where its top-left corner should be, as a percent:
    const targetCageRect = document.getElementById("cage").getBoundingClientRect();

    const targetLeftPct = (targetCageRect.left / vw) * 100; // e.g. 50% - (w/vw)*50%
    const targetTopPct  = (targetCageRect.top / vh) * 100;
    cages.forEach((cage, i) => {
        const bg = cageMap.get(cage);
        // leap between startPositions[i] → target
        const start = startPositions[i];
        const newLeft = start.left + (targetLeftPct - start.left) * t;
        const newTop  = start.top  + (targetTopPct  - start.top ) * t;

        // write dynamic-viewport units
        cage.style.left = `${newLeft}dvw`;
        cage.style.top  = `${newTop}dvh`;
        bg.style.left   = `${newLeft}dvw`;
        bg.style.top    = `${newTop}dvh`;
    });

    // update overlap matrix & scales
    for (let i = 0; i < cages.length; i++) {
        for (let j = i + 1; j < cages.length; j++) {
            const ov = calcOverlap(cages[i], cages[j]);
            cageOverlaps[i][j] = cageOverlaps[j][i] = ov;
        }
    }
    for (let i = 0; i < 3; i++) {
        cageScales[i] = 0;
        for (let j = 0; j < 3; j++) {
            cageScales[i] += cageOverlaps[i][j] ** 2;
        }
        cageScales[i] = cageScales[i] ** 1.5;
    }

    // continue or finish
    if (t < 1) {
    requestAnimationFrame(animateToCenter);
    } else {
        collapse();
        //document.getElementById("cage").style.border = "1px solid black";

        cageBackgrounds.forEach(bg => bg.classList.add('transparent'));
        const FADE_DURATION = 500; // match your CSS transition duration in ms
        const cage = document.getElementById("cage");
        cage.style.cursor = "grab";
        cage.addEventListener("pointerdown", e =>{
            spin = true;
            cage.style.cursor = "grabbing";
            document.body.style.cursor = "grabbing";
            prevX = e.clientX;
            prevY = e.clientY;
        });

        document.removeEventListener("pointerup", endDraggedCage);
        document.removeEventListener("pointermove", moveDraggedCage);

        document.addEventListener("mousemove", handleMove);
        document.addEventListener("touchmove", handleMove, { passive: false });
        
        document.addEventListener("pointerup", (e) => {
            document.body.style.cursor = "auto";
            cage.style.cursor = "grab";
            spin = false;
        });
        
        setTimeout(() => {
            cages.forEach(cg => cg.remove());
            cageBackgrounds.forEach(bg => bg.remove());
            document.getElementById("intro").classList.remove("transparent");
            setTimeout(()=>{
                var sections = [... document.getElementsByTagName('section')];
                sections.forEach(section => section.classList.remove("hidden"));
            }, 500);
        }, FADE_DURATION);
    }
}

// If skipping animation, immediately show the final state
if (skipAnimation) {
    const startBtn = document.getElementById("start");
    const intro = document.getElementById("intro");
    const sections = document.getElementsByTagName('section');
    
    // Hide the start button
    if (startBtn) {
        startBtn.classList.add("transparent");
    }
    
    // Remove cage backgrounds
    cageBackgrounds.forEach(bg => bg.classList.add('transparent'));
    
    // Remove all cages except the main one
    cages.forEach(cage => {
        if (cage.id !== "cage") {
            cage.remove();
        }
    });
    
    // Show the intro content
    if (intro) {
        intro.classList.remove("transparent");
    }
    
    // Show all sections
    Array.from(sections).forEach(section => {
        section.classList.remove("hidden");
    });
    
    // Set up the final cage state
    const cage = document.getElementById("cage");
    if (cage) {
        cage.style.zIndex = "10";
        cage.style.cursor = "grab";
        
        // Add the event listeners for the final state
        cage.addEventListener("pointerdown", e => {
            spin = true;
            cage.style.cursor = "grabbing";
            document.body.style.cursor = "grabbing";
            prevX = e.clientX;
            prevY = e.clientY;
        });
        
        document.addEventListener("mousemove", handleMove);
        document.addEventListener("touchmove", handleMove, { passive: false });
        
        document.addEventListener("pointerup", (e) => {
            document.body.style.cursor = "auto";
            cage.style.cursor = "grab";
            spin = false;
        });
    }
    
    // Call collapse to ensure proper state
    collapse();
}