const {Plugin, debounce, TFile, TFolder} = require ('obsidian');

module.exports = class TimeTrackerPlugin extends Plugin {
  async onload () {
    console.log ('⏱️ TimeTracker loaded');

    this.timePerNote = {};
    this.currentFile = null;
    this.startTime = 0;
    this.isUserActive = true;
    this.idleTimeout = 3 * 60 * 1000;
    this.statusBar = this.addStatusBarItem ();
    this.statusBar.setText ('⏱️ Ready');

    await this.loadData ();

    this.resetIdleTimer = debounce (() => {
      const wasInactive = !this.isUserActive;
      this.isUserActive = true;

      if (wasInactive && this.currentFile && this.startTime === 0) {
        this.startTime = Date.now ();
        console.log ('👤 User active again → timer resumed');
      }

      clearTimeout (this.idleTimer);
      this.idleTimer = window.setTimeout (() => {
        this.isUserActive = false;
        this.stopTimer ();
        this.statusBar.setText ('😴 Idle...');
        console.log ('💤 User inactive → timer paused');
      }, this.idleTimeout);
    }, 200);

    window.addEventListener ('mousemove', this.resetIdleTimer);
    window.addEventListener ('keydown', this.resetIdleTimer);
    window.addEventListener ('wheel', this.resetIdleTimer);

    this.registerEvent (
      this.app.workspace.on ('file-open', this.onFileOpen.bind (this))
    );

    this.timer = setInterval (() => this.updateTimer (), 1000);
    this.resetIdleTimer();
  }

  onunload () {
    this.stopTimer ();
    clearInterval (this.timer);
    window.removeEventListener ('mousemove', this.resetIdleTimer);
    window.removeEventListener ('keydown', this.resetIdleTimer);
    window.removeEventListener ('wheel', this.resetIdleTimer);
    console.log ('🛑 TimeTracker unloaded');
  }

  async onFileOpen (file) {
    this.stopTimer ();

    if (!file) {
      this.currentFile = null;
      this.statusBar.setText ('⏱️ No file');
      return;
    }

    this.currentFile = file;
    this.startTime = Date.now ();

    const time = this.timePerNote[file.path] || 0;
    this.statusBar.setText(`⏱️ ${this.formatTime(time)}`);
    this.setStatusBarTooltip ();
  }

  async stopTimer () {
    if (!this.currentFile || this.startTime === 0) return;

    const elapsed = Math.floor ((Date.now () - this.startTime) / 1000);
    const path = this.currentFile.path;
    this.timePerNote[path] = (this.timePerNote[path] || 0) + elapsed;

    this.startTime = 0;
    await this.saveData();
    this.setStatusBarTooltip ();

  }

  updateTimer () {
    if (!this.currentFile || !this.isUserActive || this.startTime === 0) return;

    const elapsed = Math.floor ((Date.now () - this.startTime) / 1000);
    const total = (this.timePerNote[this.currentFile.path] || 0) + elapsed;

    this.statusBar.setText(`⏱️ ${this.formatTime(total)}`);
    this.setStatusBarTooltip ();
  }


  setStatusBarTooltip() {
  if (!this.statusBar || !this.currentFile) return;

  const path = this.currentFile.path;
  const parts = path.split("/");

  const segments = ["Time spent:"];
  let currentPath = "";

  for (let i = 0; i < parts.length; i++) {
    currentPath += (i > 0 ? "/" : "") + parts[i];

    let time = 0;

    const file = this.app.vault.getAbstractFileByPath(currentPath);
if (file instanceof TFolder) {
      // Folder → We collect all files time.
      const collectTimes = (folder) => {
        for (const child of folder.children) {
          if (child instanceof TFile) {
            time += this.timePerNote[child.path] || 0;
          } else {
            collectTimes(child);
          }
        }
      };
      collectTimes(file);
    } else {
      // Note → We just collect the time of this note
      time = this.timePerNote[currentPath] || 0;
    }

    const indent = "→ ".repeat(i + 1);
    const label = indent + parts[i];
    const timeStr = this.formatTime(time);

    segments.push(`${label} : ${timeStr}`);
  }

  this.statusBar.setAttribute("title", segments.join("\n"));
}




formatTime(seconds){
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const parts = [
    d > 0 ? `${d}` : null,
    String(h).padStart(2, "0"),
    String(m).padStart(2, "0"),
    String(s).padStart(2, "0"),
  ].filter(p => p !== null);

  return parts.join(":");
}


  async saveData () {
    try {
      await this.app.vault.adapter.write (
        '.obsidian/time-tracker.json',
        JSON.stringify (this.timePerNote, null, 2)
      );
      console.log ('💾 Time data saved.');
    } catch (e) {
      console.error ('❌ Failed to save data', e);
    }
  }

  async loadData () {
    try {
      const data = await this.app.vault.adapter.read (
        '.obsidian/time-tracker.json'
      );
      this.timePerNote = JSON.parse (data);
      console.log ('📂 Time data loaded.');
    } catch (e) {
      this.timePerNote = {};
      console.log ('📂 No existing time-tracker data found.');
    }
  }
  patchFileExplorerTooltips() {
  const updateTooltip = async (el, path) => {
    let total = 0;

    const file = this.app.vault.getAbstractFileByPath(path);

  if (file instanceof TFolder) {
      const notes = [];
      const collectNotes = (folder) => {
        for (const child of folder.children) {
          if (child instanceof TFile) {
            notes.push(child.path);
          } else {
            collectNotes(child);
          }
        }
      };
      collectNotes(file);
      total = notes.reduce((sum, p) => sum + (this.timePerNote[p] || 0), 0);
    } else {
      total = this.timePerNote[path] || 0;
    }

    const timeStr = this.formatTime(total);
    el.setAttribute("title", `${el.getAttribute("title") || ""}\nTime spent: ${timeStr}`);
  };

  const refreshTooltips = () => {
    const fileEls = document.querySelectorAll(".nav-file-title, .nav-folder-title");

    fileEls.forEach(el => {
      el.addEventListener("mouseenter", () => {
        const path = el.dataset?.path || el.getAttribute("data-path");
        if (path) updateTooltip(el, path);
      }, { once: true }); // une seule fois par élément
    });
  };

  this.registerDomEvent(document, "mousemove", () => {
    refreshTooltips();
  });
}

};
