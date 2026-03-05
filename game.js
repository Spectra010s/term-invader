#!/usr/bin/env node

const readline = require('readline');
const { getHighScore, saveHighScore } = require('./engine');

const YELLOW = "\x1b[33m";
const RESET = "\x1b[0m";
const BOLD = "\x1b[1m";
const RED_BG = "\x1b[41m";
const GREEN = "\x1b[32m";
const CYAN = "\x1b[36m";

readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) process.stdin.setRawMode(true);

const WIDTH = (process.stdout.columns || 30) - 2; 
const HEIGHT = (process.stdout.rows - 5) || 15; 
let playerX = Math.floor(WIDTH / 2);
let bullets = [];
let enemies = [];
let items = [];
let score = 0;
let playerHP = 3;
let highScore = getHighScore();
let boss = null;
let gameOver = false;
let gameStarted = false;

process.stdin.on('data', (data) => {
  const key = data.toString();
  if (key === '\u0003') process.exit();
  
  if (!gameStarted) {
    gameStarted = true;
    return;
  }

  if (!gameOver) {
    if ((key === '\u001b[D' || key === 'a') && playerX > 2) playerX -= 2;
    if ((key === '\u001b[C' || key === 'd') && playerX < WIDTH - 3) playerX += 2;
    if (key === '\u001b[A' || key === ' ' || key === 'w') {
      bullets.push({ x: playerX, y: HEIGHT - 1, hit: false }); 
    }
  }
});


const gameLoop = setInterval(() => {
    // HELP
   if (!gameStarted) {
       let help = "\x1b[H\x1b[J";
       help += `${CYAN}${BOLD}  === TERM-INVADER ===  ${RESET}\n\n`;
       help += `${YELLOW}CONTROLS:${RESET}\n`;
       help += ` [▲] / W / Space : ${GREEN}Shoot${RESET}\n`;
       help += ` [◀] / A         : ${GREEN}Move Left${RESET}\n`;
       help += ` [▶] / D         : ${GREEN}Move Right${RESET}\n\n`;
       help += `Goal: Reach 1000 points for the ${RED_BG} BOSS ${RESET}\n`;
       help += `Grab [✚] for extra HP!\n\n`;
       help += `${BOLD}${CYAN}Press any key to START...${RESET}`;
       process.stdout.write(help);
       return;
  }
  
  if (gameOver) {
    clearInterval(gameLoop);
    const isNewRecord = saveHighScore(score);
    process.stdout.write("\x1b[2J\x1b[H"); 
    process.stdout.write(`\n${RED_BG}${BOLD}  GAME OVER  ${RESET}\nScore: ${score}\n`);
    if (isNewRecord) process.stdout.write(`${CYAN}🔥 NEW RECORD! 🔥${RESET}\n`);
    else process.stdout.write(`Best: ${highScore}\n`);
    process.exit();
  }

  // 1. BULLET LOGIC
  bullets.forEach(b => b.y--);
  bullets = bullets.filter(b => b.y >= 0 && !b.hit);

  // 2. ITEM LOGIC
  if (Math.random() < 0.01 && items.length < 1) items.push({ x: Math.floor(Math.random() * (WIDTH-2)), y: 0 });
  items.forEach((item, i) => {
    item.y += 0.2;
    if (Math.floor(item.y) === HEIGHT - 1 && Math.abs(item.x - playerX) <= 1) {
      playerHP++;
      items.splice(i, 1);
    }
  });

  // 3. BOSS LOGIC
  if (score > 0 && score % 1000 === 0 && !boss) {
    boss = { x: Math.floor(WIDTH/2), y: 1, hp: 20, maxHp: 20, dir: 1 };
    enemies = [];
  }
  if (boss) {
    boss.x += boss.dir;
    if (boss.x <= 1 || boss.x >= WIDTH - 4) boss.dir *= -1;
  }

  // 4. ENEMY SPAWNING: Slower during Boss
  const spawnChance = boss ? 0.99 : 0.94;
  const maxEnemies = boss ? 1 : 5;
  if (Math.random() > spawnChance && enemies.length < maxEnemies) {
    enemies.push({ x: Math.floor(Math.random() * (WIDTH-2))+1, y: 0, hp: 2, explode: false });
  }

  // 5. ENEMY MOVEMENT
  enemies.forEach((e, i) => {
    if (e.hp > 0) {
      e.y += 0.22;
      if (Math.floor(e.y) >= HEIGHT) {
        playerHP--;
        enemies.splice(i, 1);
        if (playerHP <= 0) gameOver = true;
      }
    } else {
      if (e.explode) enemies.splice(i, 1);
      else e.explode = true; 
    }
  });

  // 6. COLLISIONS
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

  // 7. RENDERING
  let frame = "\x1b[H\x1b[J"; 
  frame += `${BOLD}TERM-INVADER${RESET} | Score: ${YELLOW}${score}${RESET} | ${CYAN}Best: ${highScore}${RESET} | HP: ${GREEN}${'❤️'.repeat(playerHP)}${RESET}\n`;
  
  // BOSS HP BAR
  if (boss) {
    const barWidth = 20;
    const progress = Math.ceil((boss.hp / boss.maxHp) * barWidth);
    frame += `${RED_BG} BOSS ${RESET} [${YELLOW}${'#'.repeat(progress)}${RESET}${'.'.repeat(barWidth - progress)}]\n`;
  } else {
    frame += "—".repeat(WIDTH) + "\n";
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
  
  process.stdout.write(frame + "\n" + "—".repeat(WIDTH));

}, 80);
