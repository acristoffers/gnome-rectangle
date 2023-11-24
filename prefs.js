'use strict';

import Gtk from 'gi://Gtk';
import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class GnomeRectanglePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page, with a single group
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

        // Create a settings object and bind the row to the `show-indicator` key
        window._settings = this.getSettings();
        window._settings.bind('animate-movement', animationEnabled, 'active', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('animation-duration', animationDuration, 'value', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('padding-inner', paddingInner, 'value', Gio.SettingsBindFlags.DEFAULT);
        window._settings.bind('padding-outer', paddingOuter, 'value', Gio.SettingsBindFlags.DEFAULT);

        window.add(page);
    }
}

