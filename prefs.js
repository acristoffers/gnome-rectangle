'use strict';

const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Gettext = imports.gettext;
const _ = Gettext.domain('gnome-rectangle').gettext;

const Config = imports.misc.config;
const SHELL_VERSION = parseFloat(Config.PACKAGE_VERSION);

/**
 *
 */
function init() {
}

/**
 *
 */
function buildPrefsWidget() {
    // Create a parent widget that we'll return from this function
    let layout = new Gtk.Grid({
        margin_bottom: 18,
        margin_end: 18,
        margin_start: 18,
        margin_top: 18,
        column_spacing: 12,
        row_spacing: 12,
        visible: true,
    });

    let gsettings;
    gsettings = ExtensionUtils.getSettings();
    layout._gsettings = gsettings;

    let row = 0;

    // Add a simple title and add it to the layout
    let title = new Gtk.Label({
        label: `<b>${Me.metadata.name} Extension Preferences</b>`,
        halign: Gtk.Align.CENTER,
        use_markup: true,
        visible: true,
    });
    layout.attach(title, 0, row++, 2, 1);

    let innerPaddingLabel = new Gtk.Label({
        label: _('Inner padding'),
        visible: true,
        hexpand: true,
        halign: Gtk.Align.START,
    });
    let outerPaddingLabel = new Gtk.Label({
        label: _('Outer padding'),
        visible: true,
        hexpand: true,
        halign: Gtk.Align.START,
    });
    let innerPaddingBox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        visible: true,
    });
    let outerPaddingBox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        visible: true,
    });
    let innerPaddingAdjustment = new Gtk.Adjustment({
        lower: 0,
        upper: 100,
        step_increment: 1,
    });
    let outerPaddingAdjustment = new Gtk.Adjustment({
        lower: 0,
        upper: 100,
        step_increment: 1,
    });
    let innerPaddingWidget = new Gtk.SpinButton({
        adjustment: innerPaddingAdjustment,
        snap_to_ticks: true,
        visible: true,
    });
    let outerPaddingWidget = new Gtk.SpinButton({
        adjustment: outerPaddingAdjustment,
        snap_to_ticks: true,
        visible: true,
    });
    innerPaddingWidget.set_value(gsettings.get_int('padding-inner'));
    outerPaddingWidget.set_value(gsettings.get_int('padding-outer'));
    innerPaddingBox.append(innerPaddingWidget);
    outerPaddingBox.append(outerPaddingWidget);
    layout.attach(innerPaddingLabel, 0, row, 1, 1);
    layout.attach(innerPaddingBox, 1, row++, 1, 1);
    layout.attach(outerPaddingLabel, 0, row, 1, 1);
    layout.attach(outerPaddingBox, 1, row++, 1, 1);

    let animateLabel = new Gtk.Label({
        label: _('Animate'),
        visible: true,
        hexpand: true,
        halign: Gtk.Align.START,
    });
    let animationDurationLabel = new Gtk.Label({
        label: _('Animation Duration'),
        visible: true,
        hexpand: true,
        halign: Gtk.Align.START,
    });
    let animationBox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        visible: true,
    });
    let animationDurationBox = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        visible: true,
    });
    let animationSwitch = new Gtk.Switch({
        halign: Gtk.Align.END,
    });
    let animationDurationAdjustment = new Gtk.Adjustment({
        lower: 0,
        upper: 10000,
        step_increment: 1,
    });
    let animationDurationSpin = new Gtk.SpinButton({
        adjustment: animationDurationAdjustment,
        snap_to_ticks: true,
        visible: true,
    });
    animationSwitch.set_active(gsettings.get_boolean('animate-movement'));
    animationDurationSpin.set_value(gsettings.get_int('animation-duration'));
    animationBox.append(animationSwitch);
    animationDurationBox.append(animationDurationSpin);
    layout.attach(animateLabel, 0, row, 1, 1);
    layout.attach(animationBox, 1, row++, 1, 1);
    layout.attach(animationDurationLabel, 0, row, 1, 1);
    layout.attach(animationDurationBox, 1, row++, 1, 1);

    const connectAndSetInt = (setting, key) => {
        setting.connect('value-changed', entry => {
            gsettings.set_int(key, entry.value);
        });
    };

    // settings that aren't toggles need a connect
    connectAndSetInt(innerPaddingWidget, 'padding-inner');
    connectAndSetInt(outerPaddingWidget, 'padding-outer');
    connectAndSetInt(animationDurationAdjustment, 'animation-duration');

    animationSwitch.connect('state-set', (_widget, state) => {
        gsettings.set_boolean('animate-movement', state);
    });

    // Return our widget which will be added to the window
    return layout;
}
