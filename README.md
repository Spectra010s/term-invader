# TERM-INVADER 

A terminal-based space shooter built with Node.js. Optimized for Web, Termux, Linux, macOS, and Windows.

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

## Controls 🕹️
- **Movement:** `A` / `D` or Arrow Keys
- **Fire:** `W`, `Space`, or Up Arrow
- **Pause/Resume:** `P`
- **Retry (Game Over):** `R`
- **Quit:** `Q` or `Ctrl + C`

## Features 🔥 
- **Game State Management:** Now includes a Main Menu, Pause functionality, and an instant Retry system without restarting the process. 
- **Dynamic Boss Fights:** Massive alien ships with real-time HP bars spawn every 1000 points 🛸
- **Persistent High Scores:** Records are saved locally at `~/.term_invader_scores.json` and synced via WebContainer for browser play 🏆
- **Health System:** Start with 3 HP and collect repairs to stay in the fight [✚]
- **Cross-Platform:** Native support for Termux (Android) and desktop environments.

## Game Mechanics
- **Menu System:** Launch the game into a clean start menu to prepare for the fight.
- **Scoring:** Destroy enemies to increase your points.
- **Boss Logic:** Bosses move horizontally and require multiple hits to defeat.
- **Recovery:** Grab the [✚] icons to repair your hull.
- **Persistence:** Your best score is tracked across sessions using JSON storage.

## Tech Stack
- **Runtime:** Node.js 
- **Interface:** Readline & ANSI Escape Codes
- **State Engine:** Custom state-machine for Menu, Playing, and Paused logic.
- **Storage:** Local JSON persistence.

## Technical Details
- Uses Node.js `readline` for raw input handling across multiple states.
- Render loop runs at 80ms intervals to balance performance and flicker-reduction.
- Logic includes collision detection for multi-character entities (Boss).
- **V2 Update:** Decoupled engine logic to support state transitions and easier "Retry" execution.

## Contributing
Got a cool idea or suggestion for an enemy pattern, a new power-up, or themes?
- Fork the repo.
- Create your feature branch.
- Open a Pull Request.

## License
This project is licensed under the MIT License, see the [LICENSE](LICENSE) file for details.

Built with ❤️ by Spectra010s
