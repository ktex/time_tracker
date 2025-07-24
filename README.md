# ⏱️ Time Tracker – Obsidian Plugin

Track the time you spend on each note, folder, and even your entire vault — all from the status bar.

## 🚀 Features

- Displays the total time spent on the currently open note.
- Automatically calculates and aggregates time for **parent folders**, recursively.
- Shows a structured tooltip in the status bar when hovering, like this:


	Time spent:
	ProjectX : 01:12:45
	→ FolderA : 00:42:30
	→ → FolderB : 00:18:17
	→ → → Note.md : 00:07:58


- Detects user inactivity (no mouse, keyboard, or scroll activity) and pauses the timer after 3 minutes.
- Persists time data in `.obsidian/time-tracker.json` so your stats are saved between sessions.

## 📦 Installation

1. Download or clone this repository.
2. Copy the plugin folder into your `.obsidian/plugins/` directory inside your vault.
3. Enable the plugin from Obsidian’s **Settings → Community Plugins**.

## 🛠️ How It Works

- The plugin starts tracking time when a note is opened and stops when you switch files or go idle.
- Time spent is saved per note and aggregated per folder, with a live display in the status bar.
- Hovering the status bar shows a detailed breakdown of time spent, folder by folder, all the way down to the current file.

## 📝 Notes

- Currently supports `.md` files only.
- Does not include UI settings yet — everything works automatically.
- Data is stored locally and never leaves your vault.

## 💡 Credits

Developed by Kyxev with help from the Obsidian community.

---

If anywante want to contribute, suggest improvements, or report a bug? You're free to work on it!

