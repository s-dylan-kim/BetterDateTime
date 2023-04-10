/**
 * @name BetterDateTime
 * @author Wak
 * @description An easier way to implement timestamps into discord messages=
 * @version 0.0.1
 */

module.exports = (Plugin, Library) => {
  const {Patcher} = Library;
  return class BetterDateTime extends Plugin {

      onStart() {
          Logger.log("Started");
          
          Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
              let content = a[1].content;
              // Markup format:
              // {{<o/b>,<r><rampEnd>,<startAmount>-<endAmount>:text}}
              // o: obscure
              // b: beneath (don't obscure)
              // r: enable ramping
              // rampEnd: normalized value (0.0-1.0) representing ramp length, requires <r>
              // startAmount: corruption amount at start of ramp; enables ramping even without <r>
              // endamount: corruption amount at end of ramp, or across whole string if no ramp
              // text: text to apply zalgo corruption to
              let regex = /\b(\d{4})(?:-?(\d{2}))?(?:-?(\d{2}))?(?:[T ](\d{2}):?(\d{2})(?::?(\d{2}))?(?:\.(\d{3})))?(Z|(?:[+-]\d{2}):?(?:\d{2}))?\b/g;
              if (regex.test(content)) {
                  content = content.replace(regex, this.replaceDateTime.bind(this));
                  if (content.length > 2000) {
                      PluginUtilities.showToast("This message would exceed the 2000-character limit.\nReduce corruption amount or shorten text.\n\nLength including corruption: " + value.length, {type: 'error'});
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
        Logger.log("Stopped");
      }

      replaceDateTime(match, p1, p2, p3, p4, p5, p6, p7, p8, offset, string) {
        // add unix timetstamp library
      }
  };
};