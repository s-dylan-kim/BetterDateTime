/**
 * 
 * @param {import("zerespluginlibrary").Plugin} Plugin 
 * @param {import("zerespluginlibrary").BoundAPI} Library 
 * @returns 
 */
module.exports = (Plugin, Library) => {

    const {Logger} = Library;
    
    return class extends Plugin {

        onStart() {
            Logger.info("Plugin enabled!");
            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                let content = a[1].content;
                let regex = /\b(\d{4})(?:-?(\d{2}))?(?:-?(\d{2}))?(?:[T ](\d{1,2}):?(\d{2})(?::?(\d{2}))?(?:\.(\d{3})))?(Z|(?:[+-]\d{2}):?(?:\d{2}))?\b/g;
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
  
            this.update();
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.info("Plugin disabled!");
        }

        replaceDateTime(match, year, month, day, hour, minute, second, millisecond, timezone, offset, string) {
            return "<t:" + Math.floor(new Date('2012.08.10').getTime() / 1000) + ">"
        }
    };

};