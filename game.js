#!/usr/bin/env node

const readline = require('readline');
const { getHighScore, saveHighScore } = require('./engine');

// GAME THEME COLORS
const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const RED_BG = "\x1b[41m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";
const CYAN_BG = "\x1b[46m";

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

const WIDTH = (process.stdout.columns || 30) - 2; 
const HEIGHT = (process.stdout.rows - 5) || 15; 

// GAME VARIABLES
let playerX = Math.floor(WIDTH / 2);
let bullets = [];
let enemies = [];
let items = [];
let score = 0;
let playerHP = 3;
let highScore = getHighScore();
let boss = null;

let state = "MENU";
let prevState = null;

let currentMenu = null;
let selectedIndex = 0;
let menuHandler = null;
let menuTitle = "";

// STATE TRANSITION
function setState(newState) {
  state = newState;
  if (newState === "MENU") {
    openMenu("WELCOME TO TERM-INVADER!", ["Start Game", "Controls", "Quit"], menuActions.STARTUP);
  } else if (newState === "PAUSED") {
    openMenu("GAME PAUSED", ["Resume", "Restart", "Controls", "Quit"], menuActions.PAUSED);
  }
}

// SHOW MENU
function showMenu(title, options, selected = 0) {
  let screen = "\x1b[H\x1b[J";
  screen += `${CYAN}${BOLD}  ${title}  ${RESET}\n\n`;
  options.forEach((opt, i) => {
    if (i === selected) screen += `${BOLD}${GREEN}> ${opt}${RESET}\n`;
    else screen += `  ${opt}\n`;
  });
  screen += `\n${YELLOW}Use ↑/↓ to navigate, Enter to select${RESET}\n`;
  process.stdout.write(screen);
}

// OPEN MENU
function openMenu(title, options, handler) {
  menuTitle = title;
  currentMenu = options;
  selectedIndex = 0;
  menuHandler = handler;
  showMenu(menuTitle, currentMenu, selectedIndex);
}

// MENU INPUT HANDLER
function handleMenuInput(key) {
  if (!currentMenu || !menuHandler) return;

  let moved = false;
  if (key === '\u001b[A') { 
    selectedIndex = (selectedIndex - 1 + currentMenu.length) % currentMenu.length; 
    moved = true; 
  }
  if (key === '\u001b[B') { 
    selectedIndex = (selectedIndex + 1) % currentMenu.length; 
    moved = true; 
  }
  if (key === '\r') {
    menuHandler(selectedIndex + 1);
    return;
  }
  if (moved) showMenu(menuTitle, currentMenu, selectedIndex);
}

// STATE FUNCTIONS
function updateMenu() {
  showMenu(menuTitle, currentMenu, selectedIndex);
}

// GAME PAUSED
function updatePause() {
  let screen = "\x1b[H\x1b[J";
  screen += `${CYAN_BG}${BOLD}  ${menuTitle}  ${RESET}\n\n`;
  currentMenu.forEach((opt, i) => {
    if (i === selectedIndex) screen += `${BOLD}${GREEN}> ${opt}${RESET}\n`;
    else screen += `  ${opt}\n`;
  });
  screen += `\n${YELLOW}Use ↑/↓ to navigate, Enter to select${RESET}\n`;
  process.stdout.write(screen);
}

function updateHelp() {
  let help = "\x1b[H\x1b[J";
  help += `${CYAN}${BOLD}  CONTROLS  ${RESET}\n\n`;
  help += ` [▲] / W / Space : ${GREEN}Shoot${RESET}\n`;
  help += ` [◀] / A         : ${GREEN}Move Left${RESET}\n`;
  help += ` [▶] / D         : ${GREEN}Move Right${RESET}\n\n`;
  help += `Grab [✚] for extra HP!\n`;
  help += `Press any key to go back...`;
  process.stdout.write(help);
}

function updateGameOver() {
  const isNewRecord = saveHighScore(score);
  process.stdout.write("\x1b[2J\x1b[H"); 
  let over = `\n${RED_BG}${BOLD}  GAME OVER  ${RESET}\n`;
  over += `Score: ${score}\n`;
  over += isNewRecord ? `${CYAN}🔥 NEW RECORD! 🔥${RESET}\n` : `Best: ${highScore}\n`;
  over += `\n${YELLOW}Press R to Retry or Q to Quit${RESET}\n`;
  process.stdout.write(over);
}

// GAME LOGIC
function updateGame() {
  bullets.forEach(b => b.y--);
  bullets = bullets.filter(b => b.y >= 0 && !b.hit);

  if (Math.random() < 0.01 && items.length < 1) items.push({ x: Math.floor(Math.random() * (WIDTH-2)), y: 0 });
  items.forEach((item, i) => {
    item.y += 0.2;
    if (Math.floor(item.y) === HEIGHT - 1 && Math.abs(item.x - playerX) <= 1) {
      playerHP++;
      items.splice(i, 1);
    }
  });

  if (score > 0 && score % 1000 === 0 && !boss) {
    boss = { x: Math.floor(WIDTH/2), y: 1, hp: 20, maxHp: 20, dir: 1 };
    enemies = [];
  }
  if (boss) {
    boss.x += boss.dir;
    if (boss.x <= 1 || boss.x >= WIDTH - 4) boss.dir *= -1;
  }

  const spawnChance = boss ? 0.99 : 0.94;
  const maxEnemies = boss ? 1 : 5;
  if (Math.random() > spawnChance && enemies.length < maxEnemies) {
    enemies.push({ x: Math.floor(Math.random() * (WIDTH-2))+1, y: 0, hp: 2, explode: false });
  }

  enemies.forEach((e, i) => {
    if (e.hp > 0) {
      e.y += 0.22;
      if (Math.floor(e.y) >= HEIGHT) {
        playerHP--;
        enemies.splice(i, 1);
        if (playerHP <= 0) state = "GAME_OVER";
      }
    } else {
      if (e.explode) enemies.splice(i, 1);
      else e.explode = true;
    }
  });

  bullets.forEach((b) => {
    if (boss && b.x >= boss.x && b.x <= boss.x + 2) {
      if (Math.abs(b.y - boss.y) < 1.2) {
        boss.hp--; 
        b.hit = true;
        if (boss.hp <= 0) { boss = null; score += 1000; }
      }
    }
    enemies.forEach((e) => {
      if (e.hp > 0) {
        if (Math.abs(b.x - e.x) <= 1 && Math.abs(b.y - e.y) < 1.2) {
          e.hp--; 
          b.hit = true;
          if (e.hp === 0) score += 100;
        }
      }
    });
  });

  let frame = "\x1b[H\x1b[J"; 
  frame += `${BOLD}TERM-INVADER${RESET} | Score: ${YELLOW}${score}${RESET} | ${CYAN}Best: ${highScore}${RESET} | HP: ${GREEN}${'❤️'.repeat(playerHP)}${RESET}\n`;
  
  if (boss) {
    const barWidth = 20;
    const progress = Math.ceil((boss.hp / boss.maxHp) * barWidth);
    frame += `${RED_BG} BOSS ${RESET} [${YELLOW}${'#'.repeat(progress)}${RESET}${'.'.repeat(barWidth - progress)}]\n`;
  } else {
    frame += "\n";
  }

  for (let y = 0; y < HEIGHT; y++) {
    let line = Array(WIDTH).fill(' ');
    bullets.forEach(b => { if (Math.floor(b.y) === y) line[b.x] = '↑'; });
    items.forEach(item => { if (Math.floor(item.y) === y) line[item.x] = '[✚]'; });
    if (boss && y === boss.y) { line[boss.x] = '🛸'; line[boss.x+1] = '👽'; line[boss.x+2] = '🛸'; }

    enemies.forEach(e => {
      if (Math.floor(e.y) === y) {
        if (e.hp === 2) line[e.x] = '🛸';
        else if (e.hp === 1) line[e.x] = '👾';
        else line[e.x] = '💥';
      }
    });

    if (y === HEIGHT - 1) line[playerX] = '🚀';
    frame += line.join('') + "\n";
  }

  process.stdout.write(frame);
}

// STATE MAP
const states = {
  MENU: updateMenu,
  PLAYING: updateGame,
  PAUSED: updatePause,
  HELP: updateHelp,
  GAME_OVER: updateGameOver
};

// GAME LOOP
setInterval(() => states[state](), 80);

// RESET GAME
function resetGame() {
  playerX = Math.floor(WIDTH / 2);
  bullets = [];
  enemies = [];
  items = [];
  score = 0;
  playerHP = 3;
  boss = null;
  setState("MENU");
}

// MENU ACTIONS
const menuActions = {
  STARTUP: (choice) => {
    if (choice === 1) state = "PLAYING";
    if (choice === 2) { prevState = "MENU"; state = "HELP"; }
    if (choice === 3) process.exit();
  },
  PAUSED: (choice) => {
    if (choice === 1) state = "PLAYING";
    if (choice === 2) resetGame();
    if (choice === 3) { prevState = "PAUSED"; state = "HELP"; }
    if (choice === 4) process.exit();
  }
};

// INPUT HANDLERS
const inputHandlers = {
  MENU: (key) => handleMenuInput(key),
  PAUSED: (key) => handleMenuInput(key),
  HELP: () => { state = prevState; },
  PLAYING: (key) => {
    if (key.toLowerCase() === 'p') setState("PAUSED");
    if ((key === '\u001b[D' || key === 'a') && playerX > 2) playerX -= 2;
    if ((key === '\u001b[C' || key === 'd') && playerX < WIDTH - 3) playerX += 2;
    if (key === '\u001b[A' || key === ' ' || key === 'w') bullets.push({ x: playerX, y: HEIGHT - 1, hit: false });
  },
  GAME_OVER: (key) => {
    if (key.toLowerCase() === 'r') resetGame();
    if (key.toLowerCase() === 'q') process.exit();
  }
};

// INPUT LISTENER
process.stdin.on('data', (data) => {
  const key = data.toString();
  if (key === '\u0003') process.exit();
  inputHandlers[state](key);
});

// STARTUP
setState("MENU");
