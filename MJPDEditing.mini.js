"use strict";function MJPD(){this.Editing=function(){function n(n,e,r){var t=u.slice(n,e+1).join("").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");for(v.Browser.isMSIE&&(t=t.replace(/(%[^\n]*)\n/g,"$1<br/>\n"));e>n;)u[e]="",e--;u[n]="@@"+p.length+"@@",r&&(t=r(t)),p.push(t),o=l=i=null}function e(e){o=l=i=null,p=[];var r,t=/`/.test(e);t?(e=e.replace(/~/g,"~T").replace(/(^|[^\\`])(`+)(?!`)([^\n]*?[^`\n])\2(?!`)/gm,function(n){return n.replace(/\$/g,"~D")}),r=function(n){return n.replace(/~([TD])/g,function(n,e){return{T:"~",D:"$"}[e]})}):r=function(n){return n},u=x(e.replace(/\r\n?/g,"\n"),C);for(var a=1,c=u.length;c>a;a+=2){var f=u[a];"@"===f.charAt(0)?(u[a]="@@"+p.length+"@@",p.push(f)):o?f===l?s?i=a:n(o,a,r):f.match(/\n.*\n/)?(i&&(a=i,n(o,a,r)),o=l=i=null,s=0):"{"===f?s++:"}"===f&&s&&s--:f===T||"$$"===f?(o=a,l=f,s=0):"begin"===f.substr(1,5)&&(o=a,l="\\end"+f.substr(6),s=0)}return i&&n(o,i,r),r(u.join(""))}function r(n){return n=n.replace(/@@(\d+)@@/g,function(n,e){return p[e]}),p=null,n}function t(){g=!1,v.cancelTypeset=!1,v.Queue(["Typeset",v,h])}function a(){!g&&f&&(g=!0,v.Cancel(),v.Queue(t))}function c(n,t,c){h=document.getElementById("wmd-preview"+t),T=c[0][0];var u=n.getConverter();u.hooks.chain("preConversion",e),u.hooks.chain("postConversion",r),n.hooks.chain("onPreviewRefresh",a)}var u,o,l,i,s,p,f=!1,g=!1,h=null,T="$",v=MathJax.Hub;v.Queue(function(){f=!0,v.processUpdateTime=50,v.Config({"HTML-CSS":{EqnChunk:10,EqnChunkFactor:1},SVG:{EqnChunk:10,EqnChunkFactor:1}})});var x,C=/(\$\$?|\\(?:begin|end)\{[a-z]*\*?\}|\\[\\{}$]|[{}]|(?:\n\s*)+|@@\d+@@)/i;return x=3==="aba".split(/(b)/).length?function(n,e){return n.split(e)}:function(n,e){var r,t=[];if(!e.global){var a=e.toString(),c="";a=a.replace(/^\/(.*)\/([im]*)$/,function(n,e,r){return c=r,e}),e=new RegExp(a,c+"g")}e.lastIndex=0;for(var u=0;r=e.exec(n);)t.push(n.substring(u,r.index)),t.push.apply(t,r.slice(1)),u=r.index+r[0].length;return t.push(n.substring(u)),t},{prepareWmdForMathJax:c}}(),function(){var n=MathJax.Hub;if(!n.Cancel){n.cancelTypeset=!1;var e="MathJax Canceled";n.Register.StartupHook("HTML-CSS Jax Config",function(){var r=MathJax.OutputJax["HTML-CSS"],t=r.Translate;r.Augment({Translate:function(a,c){if(n.cancelTypeset||c.cancelled)throw Error(e);return t.call(r,a,c)}})}),n.Register.StartupHook("SVG Jax Config",function(){var r=MathJax.OutputJax.SVG,t=r.Translate;r.Augment({Translate:function(a,c){if(n.cancelTypeset||c.cancelled)throw Error(e);return t.call(r,a,c)}})}),n.Register.StartupHook("TeX Jax Config",function(){var r=MathJax.InputJax.TeX,t=r.Translate;r.Augment({Translate:function(a,c){if(n.cancelTypeset||c.cancelled)throw Error(e);return t.call(r,a,c)}})});var r=n.processError;n.processError=function(t,a,c){return t.message!==e?r.call(n,t,a,c):(MathJax.Message.Clear(0,0),a.jaxIDs=[],a.jax={},a.scripts=[],a.i=a.j=0,a.cancelled=!0,null)},n.Cancel=function(){this.cancelTypeset=!0}}}()}