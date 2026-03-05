const fs = require('fs');
const path = require('path');
const os = require('os');

const dataPath = path.join(os.homedir(), '.term_invader_scores.json');

const getHighScore = () => {
  try {
    if (!fs.existsSync(dataPath)) return 0;
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    return data.highScore || 0;
  } catch (e) {
    return 0; 
  }
};

const saveHighScore = (score) => {
  const current = getHighScore();
  if (score > current) {
    try {
      fs.writeFileSync(dataPath, JSON.stringify({ highScore: score }));
      return true;
    } catch (e) {
      return false;
    }
  }
  return false;
};

module.exports = { getHighScore, saveHighScore };
