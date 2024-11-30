import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class GnomeRectanglePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window: Adw.PreferencesWindow) {
        const builder = Gtk.Builder.new_from_file(this.path + "/prefs.ui");

        const generalPage = builder.get_object("general-page") as Adw.PreferencesPage;
        const shortcutsPage = builder.get_object("shortcuts-page") as Adw.PreferencesPage;

        window.add(generalPage);
        window.add(shortcutsPage);

        const settings = this.getSettings();

        this.generalPage(builder, settings);
        this.shortcutsPage(builder, settings);
    }

    generalPage(builder: Gtk.Builder, settings: Gio.Settings) {
        const animationEnabled = builder.get_object("animation-enabled") as Gtk.Widget;
        const animationDuration = builder.get_object("animation-duration") as Gtk.Widget;
        const paddingInner = builder.get_object("padding-inner") as Gtk.Widget;
        const paddingOuter = builder.get_object("padding-outer") as Gtk.Widget;
        const marginTop = builder.get_object("margins-top") as Gtk.Widget;
        const marginRight = builder.get_object("margins-right") as Gtk.Widget;
        const marginBottom = builder.get_object("margins-bottom") as Gtk.Widget;
        const marginLeft = builder.get_object("margins-left") as Gtk.Widget;
        const shrinkStep = builder.get_object("shrink-step") as Gtk.Widget;

        settings.bind('animate-movement', animationEnabled, 'active', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('animation-duration', animationDuration, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('padding-inner', paddingInner, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('padding-outer', paddingOuter, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('margin-top', marginTop, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('margin-right', marginRight, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('margin-bottom', marginBottom, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('margin-left', marginLeft, 'value', Gio.SettingsBindFlags.DEFAULT);
        settings.bind('shrink-step', shrinkStep, 'value', Gio.SettingsBindFlags.DEFAULT);
    }

    shortcutsPage(builder: Gtk.Builder, settings: Gio.Settings) {
        const restore = builder.get_object("restore-defaults-button") as Gtk.Button;
        const clear = builder.get_object("clear-all-button") as Gtk.Button;

        restore.connect('clicked', () => { this.restoreDefaults(settings) });
        clear.connect('clicked', () => { this.clearAll(settings) });

        for (const shortcut of this.acceleratorKeys) {
            const w = builder.get_object(shortcut) as ShortcutSettingWidget;
            if (w != null) {
                w.setSettings(settings);
            }
        }
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
        "tile-shrink",
        "tile-expand",
    ];
}

/*
* Shortcut Widget (https://github.com/eonpatapon/gnome-shell-extension-caffeine/blob/master/caffeine%40patapon.info/preferences/generalPage.js#L227)
*/
const genParam = (name: string, ...dflt: [string]) => GObject.ParamSpec.string(name, name, name, GObject.ParamFlags.READWRITE, ...dflt);
class ShortcutSettingWidget extends Adw.ActionRow {
    static {
        GObject.registerClass({
            GTypeName: "ShortcutSettingWidget",
            Properties: {
                key: genParam("key", ""),
                shortcut: genParam("shortcut", ""),
            },
            Signals: {
                changed: { param_types: [GObject.TYPE_STRING] }
            }
        }, this);
    }

    _editor?: Adw.Window;
    _settings?: Gio.Settings;
    _shortLabel?: Gtk.ShortcutLabel;
    _shortcutBox?: Gtk.Box;

    setSettings(settings: Gio.Settings) {
        this._shortcutBox = new Gtk.Box({
            orientation: Gtk.Orientation.HORIZONTAL,
            halign: Gtk.Align.CENTER,
            spacing: 5,
            hexpand: false,
            vexpand: false
        });

        this._settings = settings;

        this._shortLabel = new Gtk.ShortcutLabel({
            disabledText: _('New accelerator…'),
            valign: Gtk.Align.CENTER,
            hexpand: false,
            vexpand: false
        });

        this._shortcutBox.append(this._shortLabel);

        // Bind signals
        this.connect('activated', this._onActivated.bind(this));
        this.bind_property('shortcut', this._shortLabel, 'accelerator', GObject.BindingFlags.DEFAULT);
        [(this as any).shortcut] = this._settings.get_strv((this as any).key) ?? [''];

        this._settings.connect('changed', this.settingsChangedCallback.bind(this));

        this.add_suffix(this._shortcutBox);
    }

    settingsChangedCallback(_obj: Gio.Settings, key: string) {
        if (key == (this as any).key) {
            [(this as any).shortcut] = this._settings?.get_strv((this as any).key) ?? [''];
        }
    }

    isAcceleratorSet() {
        if (this._shortLabel?.get_accelerator()) {
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
            description: this.subtitle,
            iconName: 'preferences-desktop-keyboard-shortcuts-symbolic'
        });

        this._editor = new Adw.Window({
            modal: true,
            hideOnClose: true,
            transientFor: widget.get_root(),
            widthRequest: 480,
            heightRequest: 320,
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
        this._settings?.set_strv((this as any).key, [(this as any).shortcut]);
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
