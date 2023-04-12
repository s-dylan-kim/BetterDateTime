/**
 * @name betterDateTime
 * @description An easier way to implement timestamps into discord messages
 * @version 1.0.0
 * @author Wak
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {
    main: "index.js",
    id: "",
    name: "betterDateTime",
    author: "Wak",
    authorId: "",
    authorLink: "",
    version: "1.0.0",
    description: "An easier way to implement timestamps into discord messages",
    website: "",
    source: "",
    patreon: "",
    donate: "",
    invite: "",
    changelog: [],
    defaultConfig: []
};
class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://betterdiscord.app/gh-redirect?id=9", async (err, resp, body) => {
                if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                if (resp.statusCode === 302) {
                    require("request").get(resp.headers.location, async (error, response, content) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), content, r));
                    });
                }
                else {
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                }
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
     const plugin = (Plugin, Library) => {

    const {Logger, Patcher, DiscordModules} = Library;

    return class extends Plugin {

        onStart() {
            Logger.info("Plugin enabled!");
            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                let content = a[1].content;
                let regex = /({(\d{4})((-?\d{2}){0,2}|\d{4})?)?(({|T)\d{2}(:?\d{2})?(:?\d{2}(.\d{3})?)?)?}/g; // (Z|[+-]\d{2}(:?\d{2})?)? timezone not needed
                if (regex.test(content)) {
                    content = content.replace(regex, this.replaceDateTime.bind(this));
                    if (content.length > 2000) {
                        PluginUtilities.showToast("This message will be longer than the 2000 character limit. Please shorten the message");
                        e.preventDefault();
                        return;
                    }
                    a[1].content = content;
                }
            });
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.info("Plugin disabled!");
        }

        replaceDateTime(match, date, year, month_day, month_day_hyphen, time, isCombined, minute, second_ms, ms, timezone, minute_off, string) {
            match = match.substring(1, match.length-1); //remove {}

            let flag = "";

            if (date == null) {
                let now = new Date();
                match = "T" + match;
                match = "-" + String(now.getDate()).padStart(2, '0') + match;
                match = "-" + String(now.getMonth()+1).padStart(2, '0') + match;
                match = now.getFullYear() + match;

                if (second_ms != null) {
                    flag = "T";
                } else {
                    flag = "t";
                }
            }
            else if (time == null) {
                match += "T00:00";
                flag = "d";
            }
            else if (second_ms != null) {
                flag = "F";
            }

            return "<t:" + Math.floor(new Date(match).getTime() / 1000) + (flag != "" ? ":" : "") + flag + ">";
        }
    };

};
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/