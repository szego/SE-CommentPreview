"use strict";function MJPD(){this.Editing=function(){function n(n,e){var t=o.slice(n,e+1).join("").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");for(T.Browser.isMSIE&&(t=t.replace(/(%[^\n]*)\n/g,"$1<br/>\n"));e>n;)o[e]="",e--;o[n]="@@"+p.length+"@@",p.push(t),u=l=i=null}function e(e){u=l=i=null,p=[],o=e.replace(/\r\n?/g,"\n").split(v);for(var t=1,r=o.length;r>t;t+=2){var a=o[t];"@"===a.charAt(0)?(o[t]="@@"+p.length+"@@",p.push(a)):u?a===l?s?i=t:n(u,t):a.match(/\n.*\n/)?(i&&(t=i,n(u,t)),u=l=i=null,s=0):"{"===a?s++:"}"===a&&s&&s--:a===C||"$$"===a?(u=t,l=a,s=0):"begin"===a.substr(1,5)&&(u=t,l="\\end"+a.substr(6),s=0)}return i&&n(u,i),o.join("")}function t(n){return n=n.replace(/@@(\d+)@@/g,function(n,e){return p[e]}),p=null,n}function r(){f=!1,T.cancelTypeset=!1,T.Queue(["Typeset",T,g])}function a(){!f&&h&&(f=!0,T.Cancel(),T.Queue(r))}function c(n,r,c){g=document.getElementById("wmd-preview"+r),C=c[0][0];var o=n.getConverter();o.hooks.chain("preConversion",e),o.hooks.chain("postConversion",t),n.hooks.chain("onPreviewRefresh",a)}var o,u,l,i,s,p,h=!1,f=!1,g=null,C="$",T=MathJax.Hub;T.Queue(function(){h=!0,T.processUpdateTime=50,T.Config({"HTML-CSS":{EqnChunk:10,EqnChunkFactor:1},SVG:{EqnChunk:10,EqnChunkFactor:1}})});var v=/(\$\$?|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;return{prepareWmdForMathJax:c}}(),function(){var n=MathJax.Hub;if(!n.Cancel){n.cancelTypeset=!1;var e="MathJax Canceled";n.Register.StartupHook("HTML-CSS Jax Config",function(){var t=MathJax.OutputJax["HTML-CSS"],r=t.Translate;t.Augment({Translate:function(a,c){if(n.cancelTypeset||c.cancelled)throw Error(e);return r.call(t,a,c)}})}),n.Register.StartupHook("SVG Jax Config",function(){var t=MathJax.OutputJax.SVG,r=t.Translate;t.Augment({Translate:function(a,c){if(n.cancelTypeset||c.cancelled)throw Error(e);return r.call(t,a,c)}})}),n.Register.StartupHook("TeX Jax Config",function(){var t=MathJax.InputJax.TeX,r=t.Translate;t.Augment({Translate:function(a,c){if(n.cancelTypeset||c.cancelled)throw Error(e);return r.call(t,a,c)}})});var t=n.processError;n.processError=function(r,a,c){return r.message!==e?t.call(n,r,a,c):(MathJax.Message.Clear(0,0),a.jaxIDs=[],a.jax={},a.scripts=[],a.i=a.j=0,a.cancelled=!0,null)},n.Cancel=function(){this.cancelTypeset=!0}}}()}