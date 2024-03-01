import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class GnomeRectanglePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window: Adw.PreferencesWindow) {
        const settings = this.getSettings();

        window.add(this.generalPage(settings));
        window.add(this.shortcutsPage(settings))
    }

    generalPage(settings?: Gio.Settings) {
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

        const marginGroup = new Adw.PreferencesGroup({
            title: _('Margins'),
            description: _('Finer control of the workspace margins (to account for docks)'),
        });
        page.add(marginGroup);

        const marginTop = new Adw.SpinRow({
            title: _('Top'),
            subtitle: _('Top margin between screen and windows'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 1000,
                step_increment: 1
            })
        });
        marginGroup.add(marginTop);

        const marginRight = new Adw.SpinRow({
            title: _('Right'),
            subtitle: _('Right margin between screen and windows'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 1000,
                step_increment: 1
            })
        });
        marginGroup.add(marginRight);

        const marginBottom = new Adw.SpinRow({
            title: _('Bottom'),
            subtitle: _('Bottom margin between screen and windows'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 1000,
                step_increment: 1
            })
        });
        marginGroup.add(marginBottom);

        const marginLeft = new Adw.SpinRow({
            title: _('Left'),
            subtitle: _('Left margin between screen and windows'),
            adjustment: new Gtk.Adjustment({
                lower: 0,
                upper: 1000,
                step_increment: 1
            })
        });
        marginGroup.add(marginLeft);

        settings!.bind('animate-movement', animationEnabled, 'active', Gio.SettingsBindFlags.DEFAULT);
        settings!.bind('animation-duration', animationDuration, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings!.bind('padding-inner', paddingInner, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings!.bind('padding-outer', paddingOuter, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings!.bind('margin-top', marginTop, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings!.bind('margin-right', marginRight, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings!.bind('margin-bottom', marginBottom, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings!.bind('margin-left', marginLeft, 'value', Gio.SettingsBindFlags.DEFAULT);

        return page;
    }

    shortcutsPage(settings: Gio.Settings) {
        const page = new Adw.PreferencesPage({
            title: _('Shortcuts'),
            icon_name: 'input-keyboard',
        });

        const actionsGroup = new Adw.PreferencesGroup({
            title: _('Keyboard Shortcuts'),
            description: _('Affects all shortcuts at once'),
        });
        page.add(actionsGroup);

        const restoreDefaults = new Adw.ActionRow({
            title: _('Restore'),
            subtitle: _('Restore the default values of all accelerators'),
            activatable: true,
        });
        const restoreDefaultsButton = new Gtk.Button({
            label: _('Restore'),
            valign: Gtk.Align.CENTER,
            hexpand: false,
            vexpand: false
        });
        restoreDefaults.add_suffix(restoreDefaultsButton);
        restoreDefaultsButton.connect('clicked', () => { this.restoreDefaults(settings) });
        actionsGroup.add(restoreDefaults);

        const clearAll = new Adw.ActionRow({
            title: _('Clear All'),
            subtitle: _('Clear the values of all accelerators'),
            activatable: true,
        });
        const clearAllButton = new Gtk.Button({
            label: _('Clear'),
            valign: Gtk.Align.CENTER,
            hexpand: false,
            vexpand: false
        });
        clearAll.add_suffix(clearAllButton)
        clearAllButton.connect('clicked', () => { this.clearAll(settings) });
        actionsGroup.add(clearAll);

        const maximizeGroup = new Adw.PreferencesGroup({
            title: _('Maximize'),
        });
        page.add(maximizeGroup);

        this.shortcutRow(settings, maximizeGroup, 'tile-maximize', 'Maximize');
        this.shortcutRow(settings, maximizeGroup, 'tile-maximize-almost', 'Almost');
        this.shortcutRow(settings, maximizeGroup, 'tile-maximize-height', 'Maximize Height');
        this.shortcutRow(settings, maximizeGroup, 'tile-maximize-width', 'Maximize Width');

        const quarterGroup = new Adw.PreferencesGroup({
            title: _('Quarter Grid'),
        });
        page.add(quarterGroup);

        this.shortcutRow(settings, quarterGroup, 'tile-quarter-top-left', 'Top Left');
        this.shortcutRow(settings, quarterGroup, 'tile-quarter-top-right', 'Top Right');
        this.shortcutRow(settings, quarterGroup, 'tile-quarter-bottom-left', 'Bottom Left');
        this.shortcutRow(settings, quarterGroup, 'tile-quarter-bottom-right', 'Bottom Right');
        this.shortcutRow(settings, quarterGroup, 'tile-quarter-centered', 'Centered');

        const sixthsGroup = new Adw.PreferencesGroup({
            title: _('Sixth Grid'),
        });
        page.add(sixthsGroup);

        this.shortcutRow(settings, sixthsGroup, 'tile-sixth-top-left', 'Top Left');
        this.shortcutRow(settings, sixthsGroup, 'tile-sixth-top-center', 'Top Center');
        this.shortcutRow(settings, sixthsGroup, 'tile-sixth-top-right', 'Top Right');
        this.shortcutRow(settings, sixthsGroup, 'tile-sixth-bottom-left', 'Bottom Left');
        this.shortcutRow(settings, sixthsGroup, 'tile-sixth-bottom-center', 'Bottom Center');
        this.shortcutRow(settings, sixthsGroup, 'tile-sixth-bottom-right', 'Bottom Right');

        const ninthsGroup = new Adw.PreferencesGroup({
            title: _('Nineth Grid'),
        });
        page.add(ninthsGroup);

        this.shortcutRow(settings, ninthsGroup, 'tile-ninth-top-left', 'Top Left');
        this.shortcutRow(settings, ninthsGroup, 'tile-ninth-top-center', 'Top Center');
        this.shortcutRow(settings, ninthsGroup, 'tile-ninth-top-right', 'Top Right');
        this.shortcutRow(settings, ninthsGroup, 'tile-ninth-middle-left', 'Middle Left');
        this.shortcutRow(settings, ninthsGroup, 'tile-ninth-middle-center', 'Middle Center');
        this.shortcutRow(settings, ninthsGroup, 'tile-ninth-middle-right', 'Middle Right');
        this.shortcutRow(settings, ninthsGroup, 'tile-ninth-bottom-left', 'Bottom Left');
        this.shortcutRow(settings, ninthsGroup, 'tile-ninth-bottom-center', 'Bottom Center');
        this.shortcutRow(settings, ninthsGroup, 'tile-ninth-bottom-right', 'Bottom Right');

        const halvesGroup = new Adw.PreferencesGroup({
            title: _('Halves'),
        });
        page.add(halvesGroup);

        this.shortcutRow(settings, halvesGroup, 'tile-half-top', 'Top');
        this.shortcutRow(settings, halvesGroup, 'tile-half-bottom', 'Bottom');
        this.shortcutRow(settings, halvesGroup, 'tile-half-center-horizontal', 'Center (Horizontal)');
        this.shortcutRow(settings, halvesGroup, 'tile-half-center-vertical', 'Center (Vertical)');
        this.shortcutRow(settings, halvesGroup, 'tile-half-left', 'Left');
        this.shortcutRow(settings, halvesGroup, 'tile-half-right', 'Right');

        const thirdsGroup = new Adw.PreferencesGroup({
            title: _('Thirds'),
        });
        page.add(thirdsGroup);

        this.shortcutRow(settings, thirdsGroup, 'tile-third-first', 'First');
        this.shortcutRow(settings, thirdsGroup, 'tile-third-second', 'Second');
        this.shortcutRow(settings, thirdsGroup, 'tile-third-third', 'Third');
        this.shortcutRow(settings, thirdsGroup, 'tile-two-thirds-left', 'Left Two Thirds');
        this.shortcutRow(settings, thirdsGroup, 'tile-two-thirds-center', 'Center Two Thirds');
        this.shortcutRow(settings, thirdsGroup, 'tile-two-thirds-right', 'Right Two Thirds');

        const fourthsGroup = new Adw.PreferencesGroup({
            title: _('Fourths'),
        });
        page.add(fourthsGroup);

        this.shortcutRow(settings, fourthsGroup, 'tile-fourth-first', 'First');
        this.shortcutRow(settings, fourthsGroup, 'tile-fourth-second', 'Second');
        this.shortcutRow(settings, fourthsGroup, 'tile-fourth-third', 'Third');
        this.shortcutRow(settings, fourthsGroup, 'tile-fourth-fourth', 'Fourth');
        this.shortcutRow(settings, fourthsGroup, 'tile-three-fourths-left', 'Left Three Fourth');
        this.shortcutRow(settings, fourthsGroup, 'tile-three-fourths-right', 'Right Three Fourth');

        const moveGroup = new Adw.PreferencesGroup({
            title: _('Move Tiles'),
        });
        page.add(moveGroup);

        this.shortcutRow(settings, moveGroup, 'tile-center', 'Center');
        this.shortcutRow(settings, moveGroup, 'tile-move-left', 'Left');
        this.shortcutRow(settings, moveGroup, 'tile-move-right', 'Right');
        this.shortcutRow(settings, moveGroup, 'tile-move-top-left', 'Top Left');
        this.shortcutRow(settings, moveGroup, 'tile-move-top', 'Top');
        this.shortcutRow(settings, moveGroup, 'tile-move-top-right', 'Top Right');
        this.shortcutRow(settings, moveGroup, 'tile-move-bottom-left', 'Bottom Left');
        this.shortcutRow(settings, moveGroup, 'tile-move-bottom', 'Bottom');
        this.shortcutRow(settings, moveGroup, 'tile-move-bottom-right', 'Bottom Right');
        this.shortcutRow(settings, moveGroup, 'tile-move-to-monitor-left', 'Move To Left Monitor');
        this.shortcutRow(settings, moveGroup, 'tile-move-to-monitor-right', 'Move To Right Monitor');
        this.shortcutRow(settings, moveGroup, 'tile-move-to-monitor-top', 'Move To Top Monitor');
        this.shortcutRow(settings, moveGroup, 'tile-move-to-monitor-bottom', 'Move To Bottom Monitor');

        const stretchGroup = new Adw.PreferencesGroup({
            title: _('Stretch Tiles'),
        });
        page.add(stretchGroup);

        this.shortcutRow(settings, stretchGroup, 'tile-stretch-left', 'Left');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-right', 'Right');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-top', 'Top');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-bottom', 'Bottom');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-step-left', 'Step: Left');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-step-right', 'Step: Right');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-step-top-left', 'Step: Top Left');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-step-top', 'Step: Top');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-step-top-right', 'Step: Top Right');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-step-bottom-left', 'Step: Bottom Left');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-step-bottom', 'Step: Bottom');
        this.shortcutRow(settings, stretchGroup, 'tile-stretch-step-bottom-right', 'Step: Bottom Right');

        return page;
    }

    restoreDefaults(settings: Gio.Settings) {
        for (const key of this.acceleratorKeys) {
            settings.reset(key);
        }
    }

    clearAll(settings: Gio.Settings) {
        for (const key of this.acceleratorKeys) {
            settings.set_strv(key, null);
        }
    }

    shortcutRow(settings: Gio.Settings, shortcutsGroup: Adw.PreferencesGroup, key: string, name: string) {
        const actionRow = new ShortcutSettingWidget(settings, key, name, '');
        shortcutsGroup.add(actionRow);
    }

    acceleratorKeys = [
        "tile-center",
        "tile-fourth-first",
        "tile-fourth-fourth",
        "tile-fourth-second",
        "tile-fourth-third",
        "tile-half-bottom",
        "tile-half-center-horizontal",
        "tile-half-center-vertical",
        "tile-half-left",
        "tile-half-right",
        "tile-half-top",
        "tile-maximize",
        "tile-maximize-almost",
        "tile-maximize-height",
        "tile-maximize-width",
        "tile-move-bottom",
        "tile-move-bottom-left",
        "tile-move-bottom-right",
        "tile-move-left",
        "tile-move-right",
        "tile-move-to-monitor-bottom",
        "tile-move-to-monitor-left",
        "tile-move-to-monitor-right",
        "tile-move-to-monitor-top",
        "tile-move-top",
        "tile-move-top-left",
        "tile-move-top-right",
        "tile-ninth-bottom-center",
        "tile-ninth-bottom-left",
        "tile-ninth-bottom-right",
        "tile-ninth-middle-center",
        "tile-ninth-middle-left",
        "tile-ninth-middle-right",
        "tile-ninth-top-center",
        "tile-ninth-top-left",
        "tile-ninth-top-right",
        "tile-quarter-bottom-left",
        "tile-quarter-bottom-right",
        "tile-quarter-centered",
        "tile-quarter-top-left",
        "tile-quarter-top-right",
        "tile-sixth-bottom-center",
        "tile-sixth-bottom-left",
        "tile-sixth-bottom-right",
        "tile-sixth-top-center",
        "tile-sixth-top-left",
        "tile-sixth-top-right",
        "tile-stretch-bottom",
        "tile-stretch-left",
        "tile-stretch-right",
        "tile-stretch-step-bottom",
        "tile-stretch-step-bottom-left",
        "tile-stretch-step-bottom-right",
        "tile-stretch-step-left",
        "tile-stretch-step-right",
        "tile-stretch-step-top",
        "tile-stretch-step-top-left",
        "tile-stretch-step-top-right",
        "tile-stretch-top",
        "tile-third-first",
        "tile-third-second",
        "tile-third-third",
        "tile-three-fourths-left",
        "tile-three-fourths-right",
        "tile-two-thirds-center",
        "tile-two-thirds-left",
        "tile-two-thirds-right",
    ];
}

/*
* Shortcut Widget (https://github.com/eonpatapon/gnome-shell-extension-caffeine/blob/master/caffeine%40patapon.info/preferences/generalPage.js#L227)
*/
const genParam = (name: string, ...dflt: [string]) => GObject.ParamSpec.string(name, name, name, GObject.ParamFlags.READWRITE, ...dflt);
class ShortcutSettingWidget extends Adw.ActionRow {
    static {
        GObject.registerClass({
            Properties: {
                shortcut: genParam('shortcut', '')
            },
            Signals: {
                changed: { param_types: [GObject.TYPE_STRING] }
            }
        }, this);
    }

    _editor?: Adw.Window;
    _description: string;
    _key: string;
    _settings: Gio.Settings;
    shortLabel: Gtk.ShortcutLabel;
    shortcutBox: Gtk.Box;

    constructor(settings: Gio.Settings, key: string, label: string, sublabel: string) {
        super({
            title: label,
            subtitle: sublabel,
            activatable: true
        });

        this.shortcutBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            halign: Gtk.Align.CENTER,
            spacing: 5,
            hexpand: false,
            vexpand: false
        });

        this._key = key;
        this._settings = settings;
        this._description = sublabel;

        this.shortLabel = new Gtk.ShortcutLabel({
            disabled_text: _('New accelerator…'),
            valign: Gtk.Align.CENTER,
            hexpand: false,
            vexpand: false
        });

        this.shortcutBox.append(this.shortLabel);

        // Bind signals
        this.connect('activated', this._onActivated.bind(this));
        this.bind_property('shortcut', this.shortLabel, 'accelerator', GObject.BindingFlags.DEFAULT);
        [(this as any).shortcut] = this._settings.get_strv(this._key) ?? [''];

        this._settings.connect('changed', this.settingsChangedCallback.bind(this));

        this.add_suffix(this.shortcutBox);
    }

    settingsChangedCallback(_obj: Gio.Settings, key: string) {
        if (key == this._key) {
            [(this as any).shortcut] = this._settings.get_strv(this._key) ?? [''];
        }
    }

    isAcceleratorSet() {
        if (this.shortLabel.get_accelerator()) {
            return true;
        } else {
            return false;
        }
    }

    resetAccelerator() {
        this.saveShortcut();
    }

    _onActivated(widget: any) {
        let ctl = new Gtk.EventControllerKey();

        let content = new Adw.StatusPage({
            title: _('New accelerator…'),
            description: this._description,
            icon_name: 'preferences-desktop-keyboard-shortcuts-symbolic'
        });

        this._editor = new Adw.Window({
            modal: true,
            hide_on_close: true,
            transient_for: widget.get_root(),
            width_request: 480,
            height_request: 320,
            content
        });

        this._editor.add_controller(ctl);
        ctl.connect('key-pressed', this._onKeyPressed.bind(this));
        this._editor.present();
    }

    _onKeyPressed(_widget: any, keyval: number, keycode: number, state: Gdk.ModifierType) {
        let mask = state & Gtk.accelerator_get_default_mod_mask();
        mask &= ~Gdk.ModifierType.LOCK_MASK;

        if (!mask && keyval === Gdk.KEY_Escape) {
            this._editor?.close();
            return Gdk.EVENT_STOP;
        }

        if (keyval === Gdk.KEY_BackSpace) {
            this.saveShortcut();
            return Gdk.EVENT_STOP;
        }

        if (!this.isValidBinding(mask, keycode, keyval) || !this.isValidAccel(mask, keyval)) {
            return Gdk.EVENT_STOP;
        }

        this.saveShortcut(keyval, keycode, mask);
        return Gdk.EVENT_STOP;
    }

    saveShortcut(keyval?: number, keycode?: number, mask?: Gdk.ModifierType) {
        if (!keyval && !keycode) {
            (this as any).shortcut = '';
        } else {
            (this as any).shortcut = Gtk.accelerator_name_with_keycode(null, keyval!, keycode!, mask!) ?? '';
        }

        this.emit('changed', (this as any).shortcut);
        this._settings.set_strv(this._key, [(this as any).shortcut]);
        this._editor?.destroy();
        this._editor = undefined;
    }

    // Functions from https://gitlab.gnome.org/GNOME/gnome-control-center/-/blob/main/panels/keyboard/keyboard-shortcuts.c

    keyvalIsForbidden(keyval: number) {
        return [Gdk.KEY_Mode_switch].includes(keyval);
    }

    isValidBinding(mask: Gdk.ModifierType, keycode: number, keyval: number) {
        return !(mask === 0 || mask === Gdk.ModifierType.SHIFT_MASK && keycode !== 0 &&
            ((keyval >= Gdk.KEY_a && keyval <= Gdk.KEY_z) ||
                (keyval >= Gdk.KEY_A && keyval <= Gdk.KEY_Z) ||
                (keyval >= Gdk.KEY_0 && keyval <= Gdk.KEY_9) ||
                (keyval >= Gdk.KEY_kana_fullstop && keyval <= Gdk.KEY_semivoicedsound) ||
                (keyval >= Gdk.KEY_Arabic_comma && keyval <= Gdk.KEY_Arabic_sukun) ||
                (keyval >= Gdk.KEY_Serbian_dje && keyval <= Gdk.KEY_Cyrillic_HARDSIGN) ||
                (keyval >= Gdk.KEY_Greek_ALPHAaccent && keyval <= Gdk.KEY_Greek_omega) ||
                (keyval >= Gdk.KEY_hebrew_doublelowline && keyval <= Gdk.KEY_hebrew_taf) ||
                (keyval >= Gdk.KEY_Thai_kokai && keyval <= Gdk.KEY_Thai_lekkao) ||
                (keyval >= Gdk.KEY_Hangul_Kiyeog && keyval <= Gdk.KEY_Hangul_J_YeorinHieuh) ||
                ([
                    Gdk.KEY_Home,
                    Gdk.KEY_Left,
                    Gdk.KEY_Up,
                    Gdk.KEY_Right,
                    Gdk.KEY_Down,
                    Gdk.KEY_Page_Up,
                    Gdk.KEY_Page_Down,
                    Gdk.KEY_End,
                    Gdk.KEY_Tab,
                    Gdk.KEY_KP_Enter,
                    Gdk.KEY_Return,
                ].includes(keyval)) ||
                (keyval === Gdk.KEY_space && mask === 0) || this.keyvalIsForbidden(keyval))
        );
    }

    isValidAccel(mask: Gdk.ModifierType, keyval: number) {
        return Gtk.accelerator_valid(keyval, mask) || (keyval === Gdk.KEY_Tab && mask !== 0);
    }
};
