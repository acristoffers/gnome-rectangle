'use strict';

const Adw = imports.gi.Adw;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext;
const _ = Gettext.domain('rectangle').gettext;

function init() {
}

function fillPreferencesWindow(window) {
    window._settings = ExtensionUtils.getSettings();

    window.add(this.generalPage(window));
    window.add(this.shortcutsPage())
}

function generalPage(window) {
    const page = new Adw.PreferencesPage({
        title: _('General'),
        icon_name: 'dialog-information-symbolic',
    });

    const animationGroup = new Adw.PreferencesGroup({
        title: _('Animation'),
        description: _('Configure move/resize animation'),
    });
    page.add(animationGroup);

    const animationEnabled = new Adw.ActionRow({
        title: _('Enabled'),
        subtitle: _('Wether to animate windows'),
    });
    animationGroup.add(animationEnabled);

    const animationEnabledWidget = new Gtk.Switch({ valign: Gtk.Align.CENTER });
    animationEnabled.add_suffix(animationEnabledWidget);
    animationEnabled.set_activatable_widget(animationEnabledWidget);

    const animationDuration = new Adw.ActionRow({
        title: _('Duration'),
        subtitle: _('Duration of animations in milliseconds'),
    });
    animationGroup.add(animationDuration);

    const animationDurationWidget = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 10000,
            step_increment: 10
        }),
        valign: Gtk.Align.CENTER,
        snap_to_ticks: true,
        visible: true,
    });
    animationDuration.add_suffix(animationDurationWidget);
    animationDuration.set_activatable_widget(animationDurationWidget);

    const paddingGroup = new Adw.PreferencesGroup({
        title: _('Paddings'),
        description: _('Configure the padding between windows'),
    });
    page.add(paddingGroup);

    const paddingInner = new Adw.ActionRow({
        title: _('Inner'),
        subtitle: _('Padding between windows'),
    });
    paddingGroup.add(paddingInner);

    const paddingInnerWidget = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1000,
            step_increment: 1
        }),
        valign: Gtk.Align.CENTER,
        snap_to_ticks: true,
        visible: true,
    });
    paddingInner.add_suffix(paddingInnerWidget);
    paddingInner.set_activatable_widget(paddingInnerWidget);

    const paddingOuter = new Adw.ActionRow({
        title: _('Outer'),
        subtitle: _('Padding between windows and the screen'),
    });
    paddingGroup.add(paddingOuter);

    const paddingOuterWidget = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1000,
            step_increment: 1
        }),
        valign: Gtk.Align.CENTER,
        snap_to_ticks: true,
        visible: true,
    });
    paddingOuter.add_suffix(paddingOuterWidget);
    paddingOuter.set_activatable_widget(paddingOuterWidget);

    const marginsGroup = new Adw.PreferencesGroup({
        title: _('Margins'),
        description: _('Finer control of the workspace margins (to account for docks)'),
    });
    page.add(marginsGroup);

    const marginTop = new Adw.ActionRow({
        title: _('Top'),
        subtitle: _('Top margin between windows and the screen'),
    });
    marginsGroup.add(marginTop);

    const marginTopWidget = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1000,
            step_increment: 1,
        }),
        valign: Gtk.Align.CENTER,
        snap_to_ticks: true,
        visible: true,
    });
    marginTop.add_suffix(marginTopWidget);
    marginTop.set_activatable_widget(marginTopWidget);

    const marginRight = new Adw.ActionRow({
        title: _('Right'),
        subtitle: _('Right margin between windows and the screen'),
    });
    marginsGroup.add(marginRight);

    const marginRightWidget = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1000,
            step_increment: 1,
        }),
        valign: Gtk.Align.CENTER,
        snap_to_ticks: true,
        visible: true,
    });
    marginRight.add_suffix(marginRightWidget);
    marginRight.set_activatable_widget(marginRightWidget);

    const marginBottom = new Adw.ActionRow({
        title: _('Bottom'),
        subtitle: _('Bottom margin between windows and the screen'),
    });
    marginsGroup.add(marginBottom);

    const marginBottomWidget = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1000,
            step_increment: 1,
        }),
        valign: Gtk.Align.CENTER,
        snap_to_ticks: true,
        visible: true,
    });
    marginBottom.add_suffix(marginBottomWidget);
    marginBottom.set_activatable_widget(marginBottomWidget);

    const marginLeft = new Adw.ActionRow({
        title: _('Left'),
        subtitle: _('Left margin between windows and the screen'),
    });
    marginsGroup.add(marginLeft);

    const marginLeftWidget = new Gtk.SpinButton({
        adjustment: new Gtk.Adjustment({
            lower: 0,
            upper: 1000,
            step_increment: 1,
        }),
        valign: Gtk.Align.CENTER,
        snap_to_ticks: true,
        visible: true,
    });
    marginLeft.add_suffix(marginLeftWidget);
    marginLeft.set_activatable_widget(marginLeftWidget);

    window._settings.bind('animate-movement', animationEnabledWidget, 'active', Gio.SettingsBindFlags.DEFAULT);
    window._settings.bind('animation-duration', animationDurationWidget, 'value', Gio.SettingsBindFlags.DEFAULT);
    window._settings.bind('padding-inner', paddingInnerWidget, 'value', Gio.SettingsBindFlags.DEFAULT);
    window._settings.bind('padding-outer', paddingOuterWidget, 'value', Gio.SettingsBindFlags.DEFAULT);
    window._settings.bind('margin-top', marginTopWidget, 'value', Gio.SettingsBindFlags.DEFAULT);
    window._settings.bind('margin-right', marginRightWidget, 'value', Gio.SettingsBindFlags.DEFAULT);
    window._settings.bind('margin-bottom', marginBottomWidget, 'value', Gio.SettingsBindFlags.DEFAULT);
    window._settings.bind('margin-left', marginLeftWidget, 'value', Gio.SettingsBindFlags.DEFAULT);

    return page;
}

function shortcutsPage() {
    const page = new Adw.PreferencesPage({
        title: _('Shortcuts'),
        icon_name: 'input-keyboard',
    });

    const shortcutsGroup = new Adw.PreferencesGroup({
        title: _('Keyboard Shortcuts'),
        description: _('List of hardcoded keyboard shortcuts'),
    });
    page.add(shortcutsGroup);

    this.shortcutRow(shortcutsGroup, 'Quarter: Top Left', 'U');
    this.shortcutRow(shortcutsGroup, 'Quarter: Top Right', 'I');
    this.shortcutRow(shortcutsGroup, 'Quarter: Bottom Left', 'J');
    this.shortcutRow(shortcutsGroup, 'Quarter: Bottom Right', 'K');
    this.shortcutRow(shortcutsGroup, 'Quarter: Centered', 'Alt+C');
    this.shortcutRow(shortcutsGroup, 'Fourth: First', 'V');
    this.shortcutRow(shortcutsGroup, 'Fourth: Second', 'B');
    this.shortcutRow(shortcutsGroup, 'Fourth: Third', 'N');
    this.shortcutRow(shortcutsGroup, 'Fourth: Fourth', 'M');
    this.shortcutRow(shortcutsGroup, 'Third: First', 'D');
    this.shortcutRow(shortcutsGroup, 'Third: Second', 'F');
    this.shortcutRow(shortcutsGroup, 'Third: Third', 'G');
    this.shortcutRow(shortcutsGroup, 'Sixth: Top Left', 'Shift+U');
    this.shortcutRow(shortcutsGroup, 'Sixth: Top Center', 'Shift+I');
    this.shortcutRow(shortcutsGroup, 'Sixth: Top Right', 'Shift+O');
    this.shortcutRow(shortcutsGroup, 'Sixth: Bottom Left', 'Shift+J');
    this.shortcutRow(shortcutsGroup, 'Sixth: Bottom Center', 'Shift+K');
    this.shortcutRow(shortcutsGroup, 'Sixth: Bottom Right', 'Shift+L');
    this.shortcutRow(shortcutsGroup, 'Ninth: Top Left', 'Alt+U');
    this.shortcutRow(shortcutsGroup, 'Ninth: Top Center', 'Alt+I');
    this.shortcutRow(shortcutsGroup, 'Ninth: Top Right', 'Alt+O');
    this.shortcutRow(shortcutsGroup, 'Ninth: Middle Left', 'Alt+J');
    this.shortcutRow(shortcutsGroup, 'Ninth: Middle Center', 'Alt+K');
    this.shortcutRow(shortcutsGroup, 'Ninth: Middle Right', 'Alt+L');
    this.shortcutRow(shortcutsGroup, 'Ninth: Bottom Left', 'Alt+N');
    this.shortcutRow(shortcutsGroup, 'Ninth: Bottom Center', 'Alt+M');
    this.shortcutRow(shortcutsGroup, 'Ninth: Bottom Right', 'Alt+comma');
    this.shortcutRow(shortcutsGroup, 'Half: Center (Vertical)', 'Shift+C');
    this.shortcutRow(shortcutsGroup, 'Half: Center (Horizontal)', 'Shift+V');
    this.shortcutRow(shortcutsGroup, 'Half: Left', 'Left');
    this.shortcutRow(shortcutsGroup, 'Half: Right', 'Right');
    this.shortcutRow(shortcutsGroup, 'Half: Top', 'Up');
    this.shortcutRow(shortcutsGroup, 'Half: Bottom', 'Down');
    this.shortcutRow(shortcutsGroup, 'Two Thirds: Left', 'E');
    this.shortcutRow(shortcutsGroup, 'Two Thirds: Center', 'R');
    this.shortcutRow(shortcutsGroup, 'Two Thirds: Right', 'T');
    this.shortcutRow(shortcutsGroup, 'Three Fourths: Left', 'N');
    this.shortcutRow(shortcutsGroup, 'Three Fourths: Right', 'M');
    this.shortcutRow(shortcutsGroup, 'Center', 'C');
    this.shortcutRow(shortcutsGroup, 'Maximize', 'Return');
    this.shortcutRow(shortcutsGroup, 'Maximize: Almost', 'Shift+Return');
    this.shortcutRow(shortcutsGroup, 'Maximize: Height', 'Shift+Alt+Up');
    this.shortcutRow(shortcutsGroup, 'Maximize: Width', 'Shift+Alt+Right');
    this.shortcutRow(shortcutsGroup, 'Stretch: Top', 'Alt+Up');
    this.shortcutRow(shortcutsGroup, 'Stretch: Bottom', 'Alt+Down');
    this.shortcutRow(shortcutsGroup, 'Stretch: Left', 'Alt+Left');
    this.shortcutRow(shortcutsGroup, 'Stretch: Right', 'Alt+Right');
    this.shortcutRow(shortcutsGroup, 'Stretch: Step: Bottom Left', '1');
    this.shortcutRow(shortcutsGroup, 'Stretch: Step: Bottom', '2');
    this.shortcutRow(shortcutsGroup, 'Stretch: Step: Bottom Right', '3');
    this.shortcutRow(shortcutsGroup, 'Stretch: Step: Left', '4');
    this.shortcutRow(shortcutsGroup, 'Stretch: Step: Right', '6');
    this.shortcutRow(shortcutsGroup, 'Stretch: Step: Top Left', '7');
    this.shortcutRow(shortcutsGroup, 'Stretch: Step: Top', '8');
    this.shortcutRow(shortcutsGroup, 'Stretch: Step: Top Right', '9');
    this.shortcutRow(shortcutsGroup, 'Move: Bottom Left', 'Alt+1');
    this.shortcutRow(shortcutsGroup, 'Move: Bottom', 'Alt+2');
    this.shortcutRow(shortcutsGroup, 'Move: Bottom Right', 'Alt+3');
    this.shortcutRow(shortcutsGroup, 'Move: Left', 'Alt+4');
    this.shortcutRow(shortcutsGroup, 'Move: Right', 'Alt+6');
    this.shortcutRow(shortcutsGroup, 'Move: Top Left', 'Alt+7');
    this.shortcutRow(shortcutsGroup, 'Move: Top', 'Alt+8');
    this.shortcutRow(shortcutsGroup, 'Move: Top Right', 'Alt+9');
    this.shortcutRow(shortcutsGroup, 'Move To Monitor: (1) Top', 'Shift+Up');
    this.shortcutRow(shortcutsGroup, 'Move To Monitor: (2) Bottom', 'Shift+Down');
    this.shortcutRow(shortcutsGroup, 'Move To Monitor: (3) Left', 'Shift+Left');
    this.shortcutRow(shortcutsGroup, 'Move To Monitor: (4) Right', 'Shift+Right');

    return page;
}

function shortcutRow(shortcutsGroup, name, shortcut) {
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
    const shortcutRow = new Adw.ActionRow({
        title: _(name),
    });
    shortcutsGroup.add(shortcutRow);

    const shortcutLabel = new Gtk.Label({ label: shortcut });
    shortcutRow.add_suffix(shortcutLabel);
    shortcutRow.set_activatable_widget(shortcutLabel);
}

