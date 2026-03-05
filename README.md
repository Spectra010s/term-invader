# TERM-INVADER 

A terminal-based space shooter built with Node.js. Optimized for Termux, Linux, macOS, and Windows.

## Installation

Run directly without installing:
```bash
npx term-invader
```

Or install globally:
```bash
npm install -g term-invader
term-invader
```

## Controls
- Movement: `A` / `D` or Arrow Keys
- Fire: `W`, `Space`, or Up Arrow
- Quit: `Ctrl + C`

## Features​🔥 
- **Dynamic Boss Fights:** Massive alien ships with real-time HP bars spawn every 1000 points 🛸
- **Persistent High Scores:** Records are saved locally at `~/.term_invader_scores.json` 🏆
- **Health System:** Start with 3 HP and collect repairs to stay in the fight [✚]
- **Cross-Platform:** Native support for Termux (Android) and desktop environments

## Game Mechanics
- **Scoring:** Destroy enemies to increase your points.
- **Boss Logic:** Bosses move horizontally and require multiple hits to defeat.
- **Recovery:** Grab the [✚] icons to repair your hull.
- **Persistence:** Your best score is tracked across sessions.

## Tech Stack
- **Runtime:** Node.js 
- **Interface:** Readline & ANSI Escape Codes
- **Storage:** Local JSON persistence

## Technical Details

- Uses Node.js readline for raw input handling.
- Render loop runs at 80ms intervals to balance performance and flicker-reduction.
- Logic includes collision detection for multi-character entities (Boss).

## Contributing
Got a cool idea or suggestion for an enemy pattern or a new power-up or themes?
- Fork the repo.
- Create your feature branch.
- Open a Pull Request.


​Built with ❤️ by Spectra010s
