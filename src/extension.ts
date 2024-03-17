import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Meta from 'gi://Meta';
import Shell from 'gi://Shell';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';

class Geometry {
  x: number = 0
  y: number = 0
  width: number = 0
  height: number = 0
}

class Paddings {
  inner: number = 0
  outer: number = 0
}

class Margins {
  bottom: number = 0
  left: number = 0
  right: number = 0
  top: number = 0
}

class AnimationState {
  id?: number
  start: Geometry = new Geometry()
  end: Geometry = new Geometry()
  time: number = 0
}

class Binding {
  name: string = ""
  callback: Function = function() { }
}

class Window extends Meta.Window {
  rectangleArgs?: [number, number, number, number, number]
}

export default class GnomeRectangle extends Extension {
  animationState?: AnimationState
  keyManager?: ShortcutsManager
  gsettings?: Gio.Settings
  shortcuts = new Map<string, number>()

  enable() {
    this.animationState = new AnimationState();
    this.keyManager = new ShortcutsManager();
    this.gsettings = this.getSettings();
    this.gsettings.connect('changed', this.settingsChanged.bind(this));
    this.registerShortcuts();
  }

  disable() {
    this.shortcuts.clear();
    this.keyManager?.removeAll();
    this.keyManager?.destroy();
    this.keyManager = undefined;
    this.gsettings = undefined;
    if (this.animationState?.id !== undefined) {
      GLib.Source.remove(this.animationState.id);
    }
    this.animationState = undefined;
  }

  focusedWindow() {
    return global.display.focus_window;
  }

  windowActor(app: Meta.Window) {
    return app.get_compositor_private();
  }

  screenSize() {
    let workarea = this.focusedWindow().get_work_area_current_monitor();
    const margins = this.margins();
    workarea.x += margins.left;
    workarea.y += margins.top;
    workarea.width -= margins.left + margins.right;
    workarea.height -= margins.top + margins.bottom;
    return workarea;
  }

  paddings(): Paddings {
    return {
      inner: this.gsettings?.get_value('padding-inner').deepUnpack() ?? 8,
      outer: this.gsettings?.get_value('padding-outer').deepUnpack() ?? 8,
    };
  }

  margins(): Margins {
    return {
      bottom: this.gsettings?.get_value('margin-bottom').deepUnpack() ?? 0,
      left: this.gsettings?.get_value('margin-left').deepUnpack() ?? 0,
      right: this.gsettings?.get_value('margin-right').deepUnpack() ?? 0,
      top: this.gsettings?.get_value('margin-top').deepUnpack() ?? 0,
    };
  }

  geometryForGrid(geo: Geometry, index: number, rowSpan: number, colSpan: number, rows: number, cols: number) {
    if (index >= rows * cols || index < 0)
      return { x: geo.x, y: geo.y, width: geo.width, height: geo.height };


    const screen = this.screenSize();
    const pad = this.paddings();

    const availW = screen.width - (cols - 1) * pad.inner - 2 * pad.outer;
    const availH = screen.height - (rows - 1) * pad.inner - 2 * pad.outer;
    const singleWinW = availW / cols;
    const singleWinH = availH / rows;
    const winW = colSpan * singleWinW + (colSpan - 1) * pad.inner;
    const winH = rowSpan * singleWinH + (rowSpan - 1) * pad.inner;

    const winJ = index % cols;
    const winI = (index - winJ) / cols;
    const winX = screen.x + pad.outer + winJ * (singleWinW + pad.inner);
    const winY = screen.y + pad.outer + winI * (singleWinH + pad.inner);

    return {
      width: Math.round(winW),
      height: Math.round(winH),
      x: Math.round(winX),
      y: Math.round(winY),
    };
  }

  center(geometry: Geometry) {
    const screen = this.screenSize();
    return {
      width: geometry.width,
      height: geometry.height,
      x: screen.x + Math.round((screen.width - geometry.width) / 2),
      y: screen.y + Math.round((screen.height - geometry.height) / 2),
    };
  }

  /* 
   * - rs and cs are row and col span, how many cells in the grid will be
   * taken by the window.
   * - r and c are the size of the grid.
   * - Index is the zero-index of the square in the grid.
   * For example, if index=2, rs=1, cs=1, r=2, c=2, then
   * you get the first column and second row:
   * |--0--|--1--|
   * |##2##|--3--|
   * If index=2, rs=1, cs=2, r=2, c=2, then
   * you get the first column and second row and will occupy two cells:
   * |--0--|--1--|
   * |##2##|##3##|
   * Negative indexes have special meanings:
   * -1: Just center the window
   * -2: Resize and center
   * -3: Maximize window's width
   * -4: Maximize window's height
   * -5: Move window in rs,cs direction
   * -6: Stretch (resizes to make window touch screen side)
   * -7: Increases window span (rs and cs)
   * -8: Move window to another monitor
   */
  manage(index: number, rs: number, cs: number, r: number, c: number) {
    const app = this.focusedWindow() as Window;
    const win = app.get_frame_rect();
    let geometry = {
      width: win.width,
      height: win.height,
      x: win.x,
      y: win.y,
    };

    if (index >= 0) {
      geometry = this.geometryForGrid(win, index, rs, cs, r, c);
    } else if (index === -1) {
      geometry = this.center(geometry);
    } else if (index === -2) {
      geometry = this.geometryForGrid(win, 1, rs, cs, r, c);
      geometry = this.center(geometry);
    } else if (index === -3) {
      const full = this.geometryForGrid(win, 0, 1, 1, 1, 1);
      geometry.x = full.x;
      geometry.width = full.width;
    } else if (index === -4) {
      const full = this.geometryForGrid(win, 0, 1, 1, 1, 1);
      geometry.y = full.y;
      geometry.height = full.height;
    } else if (index === -5 && app.rectangleArgs != null) {
      let [idx, prs, pcs, pr, pc] = app.rectangleArgs;
      let j = idx % pc;
      let i = (idx - j) / pc;
      j = Math.min(pc - pcs, Math.max(0, j + rs));
      i = Math.min(pr - prs, Math.max(0, i + cs));
      idx = i * pc + j;
      geometry = this.geometryForGrid(win, idx, prs, pcs, pr, pc);
      app.rectangleArgs = [idx, prs, pcs, pr, pc];
    } else if (index === -6) {
      const screen = this.screenSize();
      const pad = this.paddings();
      switch (rs) {
        case 0:
          geometry.height += geometry.y - pad.outer;
          geometry.y = pad.outer;
          break;
        case 1:
          geometry.height = screen.height - pad.outer - geometry.y;
          break;
        case 2:
          geometry.width += geometry.x - pad.outer;
          geometry.x = pad.outer;
          break;
        case 3:
          geometry.width = screen.width - pad.outer - geometry.x;
          break;
      }
    } else if (index === -7 && app.rectangleArgs != null) {
      let [idx, prs, pcs, pr, pc] = app.rectangleArgs;
      let j = idx % pc;
      let i = (idx - j) / pc;
      let newj = Math.min(pc - pcs, Math.max(0, j + rs));
      let newi = Math.min(pr - prs, Math.max(0, i + cs));
      // Adds colum/row if necessary
      pcs += j !== newj ? 1 : 0;
      prs += i !== newi ? 1 : 0;
      // Moves only if newi/newj is smaller (only towards top-left)
      newj = j < newj ? j : newj;
      newi = i < newi ? i : newi;
      idx = newi * pc + newj;
      geometry = this.geometryForGrid(win, idx, prs, pcs, pr, pc);
      app.rectangleArgs = [idx, prs, pcs, pr, pc];
    } else if (index === -8) {
      const currentMonitor = app.get_monitor()
      const targetMonitor = global.display.get_monitor_neighbor_index(currentMonitor, rs)
      if (targetMonitor >= 0) {
        app.move_to_monitor(targetMonitor)
        if (app.rectangleArgs != null) {
          this.manage(...app.rectangleArgs)
        }
      }
      return
    }

    if (index >= 0) {
      app.rectangleArgs = [index, rs, cs, r, c];
    }

    if (app.fullscreen)
      app.unmake_fullscreen();
    if (app.maximized_horizontally || app.maximized_vertically)
      app.unmaximize(Meta.MaximizeFlags.BOTH);

    const animate = this.gsettings?.get_boolean('animate-movement') ?? true;
    const duration = this.gsettings?.get_int('animation-duration') ?? 150;

    this.animationState!.time = 0;
    this.animationState!.start = win;
    this.animationState!.end = geometry;

    if (animate) {
      if (this.animationState?.id != null) {
        GLib.Source.remove(this.animationState.id);
      }

      this.animationState!.id = GLib.timeout_add(GLib.PRIORITY_HIGH, 10, () => {
        this.animationState!.time += 10;
        const state = this.animationState!;
        let a = state.time / duration;
        if (a > 1)
          a = 1;
        const x = a * state.end.x + (1 - a) * state.start.x;
        const y = a * state.end.y + (1 - a) * state.start.y;
        const width = a * state.end.width + (1 - a) * state.start.width;
        const height = a * state.end.height + (1 - a) * state.start.height;
        app.move_frame(true, x, y);
        app.move_resize_frame(true, x, y, width, height);
        return a !== 1;
      });

    } else {
      app.move_frame(true, geometry.x, geometry.y);
      app.move_resize_frame(true, geometry.x, geometry.y, geometry.width, geometry.height);
    }
  }

  registerShortcut(key: string, i: number, rs: number, cs: number, r: number, c: number) {
    let action = this.shortcuts.get(key);
    if (action != null) {
      this.keyManager?.remove(action);
      this.shortcuts.delete(key);
    }

    const [shortcut] = this.gsettings?.get_strv(key) ?? [''];
    if (shortcut.length != 0) {
      action = this.keyManager?.add(shortcut, () => this.manage(i, rs, cs, r, c));
      if (action != null && action > 0) {
        this.shortcuts.set(key, action);
      }
    }
  }

  settingsChanged(_settings: Gio.Settings, key: string) {
    let action = this.shortcuts.get(key);
    if (action != null) {
      this.keyManager?.remove(action);
      this.shortcuts.delete(key);
    }
    if (this.tiles.hasOwnProperty(key)) {
      this.registerShortcut(key, ...this.tiles[key]);
    }
  }

  registerShortcuts() {
    for (const key in this.tiles) {
      if (this.tiles.hasOwnProperty(key)) {
        this.registerShortcut(key, ...this.tiles[key]);
      }
    }
  }

  tiles: { [key: string]: [number, number, number, number, number] } = {
    'tile-quarter-top-left': [0, 1, 1, 2, 2],
    'tile-quarter-top-right': [1, 1, 1, 2, 2],
    'tile-quarter-bottom-left': [2, 1, 1, 2, 2],
    'tile-quarter-bottom-right': [3, 1, 1, 2, 2],
    'tile-quarter-centered': [-2, 1, 1, 2, 2],
    'tile-fourth-first': [0, 1, 1, 1, 4],
    'tile-fourth-second': [1, 1, 1, 1, 4],
    'tile-fourth-third': [2, 1, 1, 1, 4],
    'tile-fourth-fourth': [3, 1, 1, 1, 4],
    'tile-third-first': [0, 1, 1, 1, 3],
    'tile-third-second': [1, 1, 1, 1, 3],
    'tile-third-third': [2, 1, 1, 1, 3],
    'tile-sixth-top-left': [0, 1, 1, 2, 3],
    'tile-sixth-top-center': [1, 1, 1, 2, 3],
    'tile-sixth-top-right': [2, 1, 1, 2, 3],
    'tile-sixth-bottom-left': [3, 1, 1, 2, 3],
    'tile-sixth-bottom-center': [4, 1, 1, 2, 3],
    'tile-sixth-bottom-right': [5, 1, 1, 2, 3],
    'tile-ninth-top-left': [0, 1, 1, 3, 3],
    'tile-ninth-top-center': [1, 1, 1, 3, 3],
    'tile-ninth-top-right': [2, 1, 1, 3, 3],
    'tile-ninth-middle-left': [3, 1, 1, 3, 3],
    'tile-ninth-middle-center': [4, 1, 1, 3, 3],
    'tile-ninth-middle-right': [5, 1, 1, 3, 3],
    'tile-ninth-bottom-left': [6, 1, 1, 3, 3],
    'tile-ninth-bottom-center': [7, 1, 1, 3, 3],
    'tile-ninth-bottom-right': [8, 1, 1, 3, 3],
    'tile-half-center-vertical': [-2, 1, 1, 1, 2],
    'tile-half-center-horizontal': [-2, 1, 1, 2, 1],
    'tile-half-left': [0, 1, 1, 1, 2],
    'tile-half-right': [1, 1, 1, 1, 2],
    'tile-half-top': [0, 1, 1, 2, 1],
    'tile-half-bottom': [1, 1, 1, 2, 1],
    'tile-two-thirds-left': [0, 1, 2, 1, 3],
    'tile-two-thirds-center': [-2, 1, 2, 1, 3],
    'tile-two-thirds-right': [1, 1, 2, 1, 3],
    'tile-three-fourths-left': [0, 1, 3, 1, 4],
    'tile-three-fourths-right': [1, 1, 3, 1, 4],
    'tile-center': [-1, 1, 1, 1, 1],
    'tile-maximize': [0, 1, 1, 1, 1],
    'tile-maximize-almost': [33, 30, 30, 32, 32],
    'tile-maximize-height': [-4, 0, 0, 0, 0],
    'tile-maximize-width': [-3, 0, 0, 0, 0],
    'tile-stretch-top': [-6, 0, 0, 0, 0],
    'tile-stretch-bottom': [-6, 1, 0, 0, 0],
    'tile-stretch-left': [-6, 2, 0, 0, 0],
    'tile-stretch-right': [-6, 3, 0, 0, 0],
    'tile-stretch-step-bottom-left': [-7, -1, 1, 1, 1],
    'tile-stretch-step-bottom': [-7, 0, 1, 1, 1],
    'tile-stretch-step-bottom-right': [-7, 1, 1, 1, 1],
    'tile-stretch-step-left': [-7, -1, 0, 1, 1],
    'tile-stretch-step-right': [-7, 1, 0, 1, 1],
    'tile-stretch-step-top-left': [-7, -1, -1, 1, 1],
    'tile-stretch-step-top': [-7, 0, -1, 1, 1],
    'tile-stretch-step-top-right': [-7, 1, -1, 1, 1],
    'tile-move-bottom-left': [-5, -1, 1, 1, 1],
    'tile-move-bottom': [-5, 0, 1, 1, 1],
    'tile-move-bottom-right': [-5, 1, 1, 1, 1],
    'tile-move-left': [-5, -1, 0, 1, 1],
    'tile-move-right': [-5, 1, 0, 1, 1],
    'tile-move-top-left': [-5, -1, -1, 1, 1],
    'tile-move-top': [-5, 0, -1, 1, 1],
    'tile-move-top-right': [-5, 1, -1, 1, 1],
    'tile-move-to-monitor-top': [-8, Meta.DisplayDirection.UP, 0, 0, 0],
    'tile-move-to-monitor-bottom': [-8, Meta.DisplayDirection.DOWN, 0, 0, 0],
    'tile-move-to-monitor-left': [-8, Meta.DisplayDirection.LEFT, 0, 0, 0],
    'tile-move-to-monitor-right': [-8, Meta.DisplayDirection.RIGHT, 0, 0, 0],
  };
}

/**
 * Keybindings.Manager is a simple convenience class for managing keyboard
 * shortcuts in GNOME Shell. You bind a shortcut using add(), which on success
 * will return a non-zero action id that can later be used with remove() to
 * unbind the shortcut.
 *
 * Accelerators are accepted in the form returned by Gtk.accelerator_name() and
 * callbacks are invoked directly, so should be complete closures.
 *
 * References:
 *     https://developer.gnome.org/gtk3/stable/gtk3-Keyboard-Accelerators.html
 *     https://developer.gnome.org/meta/stable/MetaDisplay.html
 *     https://developer.gnome.org/meta/stable/meta-MetaKeybinding.html
 *     https://gitlab.gnome.org/GNOME/gnome-shell/blob/master/js/ui/windowManager.js#L1093-1112
 */
class ShortcutsManager {
  _keybindings: Map<number, Binding>
  _acceleratorActivatedId: number

  constructor() {
    this._keybindings = new Map();

    this._acceleratorActivatedId = global.display.connect(
      'accelerator-activated',
      this._onAcceleratorActivated.bind(this)
    );
  }

  _onAcceleratorActivated(_display: any, action: number, _deviceId: number, _timestamp: number) {
    try {
      let binding = this._keybindings.get(action);
      binding?.callback();
    } catch (e) {
      logError(e);
    }
  }

  /**
   * Add a keybinding with callback
   *
   * @param {string} accelerator - An accelerator in the form '<Control>q'
   * @param {Function} callback - A callback for the accelerator
   * @returns {number} - A non-zero action id on success, or 0 on failure
   */
  add(accelerator: string, callback: Function): number {
    let action = Meta.KeyBindingAction.NONE;
    action = global.display.grab_accelerator(accelerator, 0);

    if (action !== Meta.KeyBindingAction.NONE) {
      let name = Meta.external_binding_name_for_action(action);
      if (name != null) {
        Main.wm.allowKeybinding(name, Shell.ActionMode.ALL);
        this._keybindings.set(action, { name, callback });
      }

      return action;
    }

    logError(new Error(`Failed to add keybinding: '${accelerator}'`));

    return action;
  }

  /**
   * Remove a keybinding
   *
   * @param {number} action - A non-zero action id returned by add()
   */
  remove(action: number) {
    try {
      let binding = this._keybindings.get(action);
      if (binding != null) {
        global.display.ungrab_accelerator(action);
        Main.wm.allowKeybinding(binding.name, Shell.ActionMode.NONE);
        this._keybindings.delete(action);
      }
    } catch (e: any) {
      logError(new Error(`Failed to remove keybinding: ${e.message}`));
    }
  }

  /**
   * Remove all keybindings
   */
  removeAll() {
    for (let action of this._keybindings.keys()) {
      this.remove(action);
    }
  }

  /**
   * Destroy the keybinding manager and remove all keybindings
   */
  destroy() {
    global.display.disconnect(this._acceleratorActivatedId);
    this.removeAll();
  }
}
