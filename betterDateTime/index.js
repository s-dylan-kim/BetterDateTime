/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

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