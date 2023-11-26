'use strict';

import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class GnomeRectanglePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();

        window.add(this.generalPage(window));
        window.add(this.shortcutsPage(window))
    }

    generalPage(window) {
        const page = new Adw.PreferencesPage({
            title: _('General'),
            icon_name: 'dialog-information-symbolic',
        });

        const animationGroup = new Adw.PreferencesGroup({
            title: _('Animation'),
            description: _('Configure move/resize animation'),
        });
        page.add(animationGroup);

        const animationEnabled = new Adw.SwitchRow({
            title: _('Enabled'),
            subtitle: _('Wether to animate windows'),
        });
        animationGroup.add(animationEnabled);

        const animationDuration = new Adw.SpinRow({
            title: _('Duration'),
            subtitle: _('Duration of animations in milliseconds'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 10000,
                step_increment: 10
            })
        });
        animationGroup.add(animationDuration);

        const paddingGroup = new Adw.PreferencesGroup({
            title: _('Paddings'),
            description: _('Configure the padding between windows'),
        });
        page.add(paddingGroup);

        const paddingInner = new Adw.SpinRow({
            title: _('Inner'),
            subtitle: _('Padding between windows'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 1000,
                step_increment: 1
            })
        });
        paddingGroup.add(paddingInner);

        const paddingOuter = new Adw.SpinRow({
            title: _('Outer'),
            subtitle: _('Padding between windows and the screen'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 1000,
                step_increment: 1
            })
        });
        paddingGroup.add(paddingOuter);

        window._settings.bind('animate-movement', animationEnabled, 'active', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('animation-duration', animationDuration, 'value', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('padding-inner', paddingInner, 'value', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('padding-outer', paddingOuter, 'value', Gio.SettingsBindFlags.DEFAULT);

        return page;
    }

    shortcutsPage(window) {
        const page = new Adw.PreferencesPage({
            title: _('Shortcuts'),
            icon_name: 'input-keyboard',
        });

        const shortcutsGroup = new Adw.PreferencesGroup({
            title: _('Keyboard Shortcuts'),
            description: _('List of hardcoded keyboard shortcuts'),
        });
        page.add(shortcutsGroup);

        this.shortcutRow(shortcutsGroup, 'Quarter: (1) Top Left', 'U');
        this.shortcutRow(shortcutsGroup, 'Quarter: (2) Top Right', 'I');
        this.shortcutRow(shortcutsGroup, 'Quarter: (3) Bottom Left', 'J');
        this.shortcutRow(shortcutsGroup, 'Quarter: (4) Bottom Right', 'K');
        this.shortcutRow(shortcutsGroup, 'Quarter: (5) Centered', 'Alt+C');
        this.shortcutRow(shortcutsGroup, 'Fourth: (1) First', 'V');
        this.shortcutRow(shortcutsGroup, 'Fourth: (2) Second', 'B');
        this.shortcutRow(shortcutsGroup, 'Fourth: (3) Third', 'N');
        this.shortcutRow(shortcutsGroup, 'Fourth: (4) Fourth', 'M');
        this.shortcutRow(shortcutsGroup, 'Third: (1) First', 'D');
        this.shortcutRow(shortcutsGroup, 'Third: (2) Second', 'F');
        this.shortcutRow(shortcutsGroup, 'Third: (3) Third', 'G');
        this.shortcutRow(shortcutsGroup, 'Sixth: (1) Top Left', 'Shift+U');
        this.shortcutRow(shortcutsGroup, 'Sixth: (2) Top Center', 'Shift+I');
        this.shortcutRow(shortcutsGroup, 'Sixth: (3) Top Right', 'Shift+O');
        this.shortcutRow(shortcutsGroup, 'Sixth: (4) Bottom Left', 'Shift+J');
        this.shortcutRow(shortcutsGroup, 'Sixth: (5) Bottom Center', 'Shift+K');
        this.shortcutRow(shortcutsGroup, 'Sixth: (6) Bottom Right', 'Shift+L');
        this.shortcutRow(shortcutsGroup, 'Ninth: (1) Top Left', 'Alt+U');
        this.shortcutRow(shortcutsGroup, 'Ninth: (2) Top Center', 'Alt+I');
        this.shortcutRow(shortcutsGroup, 'Ninth: (3) Top Right', 'Alt+O');
        this.shortcutRow(shortcutsGroup, 'Ninth: (4) Middle Left', 'Alt+J');
        this.shortcutRow(shortcutsGroup, 'Ninth: (5) Middle Center', 'Alt+K');
        this.shortcutRow(shortcutsGroup, 'Ninth: (6) Middle Right', 'Alt+L');
        this.shortcutRow(shortcutsGroup, 'Ninth: (7) Bottom Left', 'Alt+N');
        this.shortcutRow(shortcutsGroup, 'Ninth: (8) Bottom Center', 'Alt+M');
        this.shortcutRow(shortcutsGroup, 'Ninth: (9) Bottom Right', 'Alt+comma');
        this.shortcutRow(shortcutsGroup, 'Half: (1) Center (Vertical)', 'Shift+C');
        this.shortcutRow(shortcutsGroup, 'Half: (1) Center (Horizontal)', 'Shift+V');
        this.shortcutRow(shortcutsGroup, 'Half: (2) Left', 'Left');
        this.shortcutRow(shortcutsGroup, 'Half: (2) Right', 'Right');
        this.shortcutRow(shortcutsGroup, 'Half: (3) Top', 'Up');
        this.shortcutRow(shortcutsGroup, 'Half: (3) Bottom', 'Down');
        this.shortcutRow(shortcutsGroup, 'Two Thirds: (1) Left', 'E');
        this.shortcutRow(shortcutsGroup, 'Two Thirds: (2) Center', 'R');
        this.shortcutRow(shortcutsGroup, 'Two Thirds: (3) Right', 'T');
        this.shortcutRow(shortcutsGroup, 'Center', 'C');
        this.shortcutRow(shortcutsGroup, 'Maximize', 'Return');
        this.shortcutRow(shortcutsGroup, 'Maximize: Almost', 'Shift+Return');
        this.shortcutRow(shortcutsGroup, 'Maximize: Height', 'Shift+Alt+Up');
        this.shortcutRow(shortcutsGroup, 'Maximize: Width', 'Shift+Alt+Right');
        this.shortcutRow(shortcutsGroup, 'Stretch: (1) Top', 'Alt+Up');
        this.shortcutRow(shortcutsGroup, 'Stretch: (1) Bottom', 'Alt+Down');
        this.shortcutRow(shortcutsGroup, 'Stretch: (2) Left', 'Alt+Left');
        this.shortcutRow(shortcutsGroup, 'Stretch: (2) Right', 'Alt+Right');
        this.shortcutRow(shortcutsGroup, 'Stretch: Step: (1) Bottom Left', '1');
        this.shortcutRow(shortcutsGroup, 'Stretch: Step: (2) Bottom', '2');
        this.shortcutRow(shortcutsGroup, 'Stretch: Step: (3) Bottom Right', '3');
        this.shortcutRow(shortcutsGroup, 'Stretch: Step: (4) Left', '4');
        this.shortcutRow(shortcutsGroup, 'Stretch: Step: (5) Right', '6');
        this.shortcutRow(shortcutsGroup, 'Stretch: Step: (6) Top Left', '7');
        this.shortcutRow(shortcutsGroup, 'Stretch: Step: (7) Top', '8');
        this.shortcutRow(shortcutsGroup, 'Stretch: Step: (8) Top Right', '9');
        this.shortcutRow(shortcutsGroup, 'Move: (1) Bottom Left', 'Alt+1');
        this.shortcutRow(shortcutsGroup, 'Move: (2) Bottom', 'Alt+2');
        this.shortcutRow(shortcutsGroup, 'Move: (3) Bottom Right', 'Alt+3');
        this.shortcutRow(shortcutsGroup, 'Move: (4) Left', 'Alt+4');
        this.shortcutRow(shortcutsGroup, 'Move: (5) Right', 'Alt+6');
        this.shortcutRow(shortcutsGroup, 'Move: (6) Top Left', 'Alt+7');
        this.shortcutRow(shortcutsGroup, 'Move: (7) Top', 'Alt+8');
        this.shortcutRow(shortcutsGroup, 'Move: (8) Top Right', 'Alt+9');

        return page;
    }

    shortcutRow(shortcutsGroup, name, shortcut) {
        shortcut = `Ctrl+Meta+${shortcut}`;
        shortcut = shortcut
            .replaceAll('Alt', '⌥')
            .replaceAll('Ctrl', '⌃')
            .replaceAll('Meta', '⌘')
            .replaceAll('Shift', '⇧')
            .replaceAll('Down', '↓')
            .replaceAll('Left', '←')
            .replaceAll('Right', '→')
            .replaceAll('Up', '↑')
            .replaceAll('Return', '↵')
            .replaceAll('comma', ',')
            .replaceAll('+', '')
        const comboRow = new Adw.ComboRow({
            title: _(name),
            model: Gtk.StringList.new([shortcut])
        });
        shortcutsGroup.add(comboRow);
    }
}

