/**
 * Inline <script> that runs synchronously before React hydrates.
 * It overrides `document.cookie` setter so that non-essential cookies
 * are silently blocked until the user gives consent.
 *
 * Essential cookies (Clerk auth) are always allowed through.
 */
export default function CookieBlockerScript() {
  const code = `
(function(){
  var STORAGE_KEY = "realimob-cookie-consent";
  var CONSENT_VERSION = "1";

  function hasConsent(){
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if(!raw) return false;
      var parsed = JSON.parse(raw);
      return parsed.version === CONSENT_VERSION;
    } catch(e){ return false; }
  }

  if(hasConsent()) return;

  var essentialPrefixes = ["__clerk","__session","__client"];
  var desc = Object.getOwnPropertyDescriptor(Document.prototype, "cookie") ||
             Object.getOwnPropertyDescriptor(HTMLDocument.prototype, "cookie");
  if(!desc || !desc.set) return;

  var originalSet = desc.set;
  var originalGet = desc.get;

  Object.defineProperty(document, "cookie", {
    configurable: true,
    get: function(){ return originalGet.call(this); },
    set: function(val){
      var name = (val.split("=")[0] || "").trim();
      for(var i=0;i<essentialPrefixes.length;i++){
        if(name.indexOf(essentialPrefixes[i]) === 0){
          return originalSet.call(this, val);
        }
      }
      // Block non-essential cookie
    }
  });

  window.__realimobRestoreCookies = function(){
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: originalGet,
      set: originalSet
    });
  };
})();
`;

  return (
    <script
      dangerouslySetInnerHTML={{ __html: code }}
    />
  );
}
