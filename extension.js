const Clutter = imports.gi.Clutter;
const ExtensionUtils = imports.misc.extensionUtils;
const Main = imports.ui.main;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;

class Extension {
    enable() {
        this.keyManager = new Manager();
        this.gsettings = ExtensionUtils.getSettings();
        this.registerShortcuts();
    }

    disable() {
        this.keyManager.removeAll();
        this.keyManager.destroy();
        this.keyManager = null;
        this.gsettings = null;
    }

    screenSize() {
        const app = global.display.focus_window;
        return app.get_work_area_current_monitor();
    }

    paddings() {
        return {
            inner: this.gsettings.get_value('padding-inner').deep_unpack(),
            outer: this.gsettings.get_value('padding-outer').deep_unpack(),
        };
    }

    geometryForGrid(win, index, rowSpan, colSpan, rows, cols) {
        if (index >= rows * cols || index < 0)
            return { x: win.x, y: win.y, width: win.width, height: win.height };


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

    center(geometry) {
        const screen = this.screenSize();
        return {
            width: geometry.width,
            height: geometry.height,
            x: screen.x + Math.round((screen.width - geometry.width) / 2),
            y: screen.y + Math.round((screen.height - geometry.height) / 2),
        };
    }

    manage(index, rs, cs, r, c) {
        /*
         * Index is the zero-index of the square in the grid.
         * For example, if index=2, r=2, c=2, then
         * you get the first column and second row:
         * |--0--|--1--|
         * |##2##|--3--|
         * Negative indexes have special meanings:
         * -1: Just center the window
         * -2: Resize and center
         * -3: Maximize window's width
         * -4: Maximize window's height
         * -5: Move window in rs,cs direction
         * -6: Stretch (resizes to make window touch screen side)
         * -7: Increases window span (rs and cs)
         */

        const app = global.display.focus_window;
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
        } else if (index === -5 && app.rectangleArgs !== null) {
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
        } else if (index === -7 && app.rectangleArgs !== null) {
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
        }

        app.move_frame(true, geometry.x, geometry.y);
        app.move_resize_frame(true, geometry.x, geometry.y, geometry.width, geometry.height);
    }

    shortcut(_text, shortcut, i, rs, cs, r, c) {
        shortcut = `Ctrl+Meta+${shortcut}`;
        shortcut = shortcut
            .replaceAll('Ctrl', '<Control>')
            .replaceAll('Meta', '<Super>')
            .replaceAll('Alt', '<Alt>')
            .replaceAll('Shift', '<Shift>')
            .replaceAll('+', '');
        this.keyManager.add(shortcut, () => this.manage(i, rs, cs, r, c));
    }

    registerShortcuts() {
        this.shortcut('Quarter: (1) Top Left', 'U', 0, 1, 1, 2, 2);
        this.shortcut('Quarter: (2) Top Right', 'I', 1, 1, 1, 2, 2);
        this.shortcut('Quarter: (3) Bottom Left', 'J', 2, 1, 1, 2, 2);
        this.shortcut('Quarter: (4) Bottom Right', 'K', 3, 1, 1, 2, 2);
        this.shortcut('Quarter: (5) Centered', 'Alt+C', -2, 1, 1, 2, 2);

        this.shortcut('Fourth: (1) First', 'V', 0, 1, 1, 1, 4);
        this.shortcut('Fourth: (2) Second', 'B', 1, 1, 1, 1, 4);
        this.shortcut('Fourth: (3) Third', 'N', 2, 1, 1, 1, 4);
        this.shortcut('Fourth: (4) Fourth', 'M', 3, 1, 1, 1, 4);

        this.shortcut('Third: (1) First', 'D', 0, 1, 1, 1, 3);
        this.shortcut('Third: (2) Second', 'F', 1, 1, 1, 1, 3);
        this.shortcut('Third: (3) Third', 'G', 2, 1, 1, 1, 3);

        this.shortcut('Sixth: (1) Top Left', 'Shift+U', 0, 1, 1, 2, 3);
        this.shortcut('Sixth: (2) Top Center', 'Shift+I', 1, 1, 1, 2, 3);
        this.shortcut('Sixth: (3) Top Right', 'Shift+O', 2, 1, 1, 2, 3);
        this.shortcut('Sixth: (4) Bottom Left', 'Shift+J', 3, 1, 1, 2, 3);
        this.shortcut('Sixth: (5) Bottom Center', 'Shift+K', 4, 1, 1, 2, 3);
        this.shortcut('Sixth: (6) Bottom Right', 'Shift+L', 5, 1, 1, 2, 3);

        this.shortcut('Ninth: (1) Top Left', 'Alt+U', 0, 1, 1, 3, 3);
        this.shortcut('Ninth: (2) Top Center', 'Alt+I', 1, 1, 1, 3, 3);
        this.shortcut('Ninth: (3) Top Right', 'Alt+O', 2, 1, 1, 3, 3);
        this.shortcut('Ninth: (4) Middle Left', 'Alt+J', 3, 1, 1, 3, 3);
        this.shortcut('Ninth: (5) Middle Center', 'Alt+K', 4, 1, 1, 3, 3);
        this.shortcut('Ninth: (6) Middle Right', 'Alt+L', 5, 1, 1, 3, 3);
        this.shortcut('Ninth: (7) Bottom Left', 'Alt+N', 6, 1, 1, 3, 3);
        this.shortcut('Ninth: (8) Bottom Center', 'Alt+M', 7, 1, 1, 3, 3);
        this.shortcut('Ninth: (9) Bottom Right', 'Alt+comma', 8, 1, 1, 3, 3);

        this.shortcut('Half: (1) Center (Vertical)', 'Shift+C', -2, 1, 1, 1, 2);
        this.shortcut('Half: (1) Center (Horizontal)', 'Shift+V', -2, 1, 1, 2, 1);
        this.shortcut('Half: (2) Left', 'Left', 0, 1, 1, 1, 2);
        this.shortcut('Half: (2) Right', 'Right', 1, 1, 1, 1, 2);
        this.shortcut('Half: (3) Top', 'Up', 0, 1, 1, 2, 1);
        this.shortcut('Half: (3) Bottom', 'Down', 1, 1, 1, 2, 1);

        this.shortcut('Two Thirds: (1) Left', 'E', 0, 1, 2, 1, 3);
        this.shortcut('Two Thirds: (2) Center', 'R', -2, 1, 2, 1, 3);
        this.shortcut('Two Thirds: (3) Right', 'T', 1, 1, 2, 1, 3);

        this.shortcut('Center', 'C', -1, 1, 1, 1, 1);
        this.shortcut('Maximize', 'Return', 0, 1, 1, 1, 1);
        this.shortcut('Maximize: Almost', 'Shift+Return', 33, 30, 30, 32, 32);
        this.shortcut('Maximize: Height', 'Shift+Alt+Up', -4, 0, 0, 0, 0);
        this.shortcut('Maximize: Width', 'Shift+Alt+Right', -3, 0, 0, 0, 0);

        this.shortcut('Stretch: (1) Top', 'Alt+Up', -6, 0, 0, 0, 0);
        this.shortcut('Stretch: (1) Bottom', 'Alt+Down', -6, 1, 0, 0, 0);
        this.shortcut('Stretch: (2) Left', 'Alt+Left', -6, 2, 0, 0, 0);
        this.shortcut('Stretch: (2) Right', 'Alt+Right', -6, 3, 0, 0, 0);
        this.shortcut('Stretch: Step: (1) Bottom Left', '1', -7, -1, 1, 1, 1);
        this.shortcut('Stretch: Step: (2) Bottom', '2', -7, 0, 1, 1, 1);
        this.shortcut('Stretch: Step: (3) Bottom Right', '3', -7, 1, 1, 1, 1);
        this.shortcut('Stretch: Step: (4) Left', '4', -7, -1, 0, 1, 1);
        this.shortcut('Stretch: Step: (5) Right', '6', -7, 1, 0, 1, 1);
        this.shortcut('Stretch: Step: (6) Top Left', '7', -7, -1, -1, 1, 1);
        this.shortcut('Stretch: Step: (7) Top', '8', -7, 0, -1, 1, 1);
        this.shortcut('Stretch: Step: (8) Top Right', '9', -7, 1, -1, 1, 1);

        this.shortcut('Move: (1) Bottom Left', 'Alt+1', -5, -1, 1, 1, 1);
        this.shortcut('Move: (2) Bottom', 'Alt+2', -5, 0, 1, 1, 1);
        this.shortcut('Move: (3) Bottom Right', 'Alt+3', -5, 1, 1, 1, 1);
        this.shortcut('Move: (4) Left', 'Alt+4', -5, -1, 0, 1, 1);
        this.shortcut('Move: (5) Right', 'Alt+6', -5, 1, 0, 1, 1);
        this.shortcut('Move: (6) Top Left', 'Alt+7', -5, -1, -1, 1, 1);
        this.shortcut('Move: (7) Top', 'Alt+8', -5, 0, -1, 1, 1);
        this.shortcut('Move: (8) Top Right', 'Alt+9', -5, 1, -1, 1, 1);
    }
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
class Manager {
    constructor() {
        this._keybindings = new Map();

        this._acceleratorActivatedId = global.display.connect(
            'accelerator-activated',
            this._onAcceleratorActivated.bind(this)
        );
    }

    _onAcceleratorActivated(display, action, _deviceId, _timestamp) {
        try {
            let binding = this._keybindings.get(action);

            if (binding !== undefined)
                binding.callback();
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
    add(accelerator, callback) {
        let action = Meta.KeyBindingAction.NONE;
        action = global.display.grab_accelerator(accelerator, 0);

        if (action !== Meta.KeyBindingAction.NONE) {
            let name = Meta.external_binding_name_for_action(action);
            Main.wm.allowKeybinding(name, Shell.ActionMode.ALL);
            this._keybindings.set(action, { name, callback });
        } else {
            logError(new Error(`Failed to add keybinding: '${accelerator}'`));
        }

        return action;
    }

    /**
     * Remove a keybinding
     *
     * @param {number} action - A non-zero action id returned by add()
     */
    remove(action) {
        try {
            let binding = this._keybindings.get(action);
            global.display.ungrab_accelerator(action);
            Main.wm.allowKeybinding(binding.name, Shell.ActionMode.NONE);
            this._keybindings.delete(action);
        } catch (e) {
            logError(new Error(`Failed to remove keybinding: ${e.message}`));
        }
    }

    /**
     * Remove all keybindings
     */
    removeAll() {
        for (let action of this._keybindings.keys())
            this.remove(action);
    }

    /**
     * Destroy the keybinding manager and remove all keybindings
     */
    destroy() {
        global.display.disconnect(this._acceleratorActivatedId);
        this.removeAll();
    }
}

/**
 *
 */
function init() {
    return new Extension();
}
