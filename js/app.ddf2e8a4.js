(function(){"use strict";var e={2946:function(e,t,n){var o=n(5130),r=n(6768),a=n(4232),l=n(4775),u=n(8088),i=n(2729),c=n(1606),s=n(697),f=n(3745),d=n(3833),p=n(3813),h=n(6756),m=n(5526),v=n(5126),b=n(9670),k=n(7254),g=n(7294),_=n(7505),y=n(400);const F=(0,r.Lk)("h1",null,"Gerador de Fichas Cadastrais",-1),C={key:0},O={key:1},w=(0,r.Lk)("strong",null,"Telefone:",-1),j=(0,r.Lk)("strong",null,"RG:",-1),E=(0,r.Lk)("strong",null,"Email:",-1);function W(e,t,n,o,W,P){const U=(0,r.g2)("v-list-item-content");return(0,r.uX)(),(0,r.Wv)(l.E,null,{default:(0,r.k6)((()=>[(0,r.bF)(p.I,null,{default:(0,r.k6)((()=>[F,W.autenticado?(0,r.Q3)("",!0):((0,r.uX)(),(0,r.CE)("div",C,[(0,r.bF)(y.W,{modelValue:W.senha,"onUpdate:modelValue":t[0]||(t[0]=e=>W.senha=e),label:"Digite a senha",type:"password"},null,8,["modelValue"]),(0,r.bF)(u.D,{onClick:P.verificarSenha},{default:(0,r.k6)((()=>[(0,r.eW)("Entrar")])),_:1},8,["onClick"])])),W.autenticado?((0,r.uX)(),(0,r.CE)("div",O,[(0,r.bF)(h.L,null,{default:(0,r.k6)((()=>[((0,r.uX)(!0),(0,r.CE)(r.FK,null,(0,r.pI)(W.users,(e=>((0,r.uX)(),(0,r.Wv)(m.B,{key:e["Nome Completo"],cols:"12",sm:"6",md:"4"},{default:(0,r.k6)((()=>[(0,r.bF)(i.J,{class:"mb-4"},{default:(0,r.k6)((()=>[(0,r.bF)(c.r,null,{default:(0,r.k6)((()=>[(0,r.eW)((0,a.v_)(e["Nome Completo"]),1)])),_:2},1024),(0,r.bF)(s.O,null,{default:(0,r.k6)((()=>[(0,r.Lk)("p",null,[w,(0,r.eW)(" "+(0,a.v_)(e["Numero de Telefone"]),1)]),(0,r.Lk)("p",null,[j,(0,r.eW)(" "+(0,a.v_)(e["RG"]),1)]),(0,r.Lk)("p",null,[E,(0,r.eW)(" "+(0,a.v_)(e["E-mail"]),1)]),e["Fotos"]?((0,r.uX)(),(0,r.Wv)(v.y,{key:0,src:P.getImageUrl(e["Fotos"]),"aspect-ratio":"1.75"},null,8,["src"])):(0,r.Q3)("",!0)])),_:2},1024),(0,r.bF)(f.S,null,{default:(0,r.k6)((()=>[(0,r.bF)(u.D,{onClick:t=>P.gerarPDF(e)},{default:(0,r.k6)((()=>[(0,r.eW)("Gerar PDF")])),_:2},1032,["onClick"]),(0,r.bF)(u.D,{onClick:t=>P.abrirModal(e)},{default:(0,r.k6)((()=>[(0,r.eW)("Ver Detalhes")])),_:2},1032,["onClick"])])),_:2},1024)])),_:2},1024)])),_:2},1024)))),128))])),_:1})])):(0,r.Q3)("",!0),(0,r.bF)(d.p,{modelValue:W.modal,"onUpdate:modelValue":t[2]||(t[2]=e=>W.modal=e),"max-width":"600px"},{default:(0,r.k6)((()=>[(0,r.bF)(i.J,null,{default:(0,r.k6)((()=>[(0,r.bF)(c.r,null,{default:(0,r.k6)((()=>[(0,r.eW)((0,a.v_)(W.selectedUser["Nome Completo"]),1)])),_:1}),(0,r.bF)(s.O,null,{default:(0,r.k6)((()=>[(0,r.bF)(b.x8,{dense:""},{default:(0,r.k6)((()=>[((0,r.uX)(!0),(0,r.CE)(r.FK,null,(0,r.pI)(W.selectedUser,((e,t)=>((0,r.uX)(),(0,r.Wv)(k.g,{key:t},{default:(0,r.k6)((()=>[(0,r.bF)(U,null,{default:(0,r.k6)((()=>[(0,r.bF)(g.U,null,{default:(0,r.k6)((()=>[(0,r.eW)((0,a.v_)(t),1)])),_:2},1024),(0,r.bF)(_.w,null,{default:(0,r.k6)((()=>[(0,r.eW)((0,a.v_)(e),1)])),_:2},1024)])),_:2},1024)])),_:2},1024)))),128))])),_:1})])),_:1}),(0,r.bF)(f.S,null,{default:(0,r.k6)((()=>[(0,r.bF)(u.D,{onClick:t[1]||(t[1]=e=>W.modal=!1)},{default:(0,r.k6)((()=>[(0,r.eW)("Fechar")])),_:1})])),_:1})])),_:1})])),_:1},8,["modelValue"])])),_:1})])),_:1})}var P=n(4373),U=n(1749),L={data(){return{senha:"",senhaCorreta:"rpromo@2024",autenticado:!1,users:[],selectedUser:null,modal:!1}},methods:{verificarSenha(){this.senha===this.senhaCorreta?(this.autenticado=!0,this.carregarUsuarios()):alert("Senha incorreta")},async carregarUsuarios(){const e="AIzaSyB3RRaj1LCm9UmopGi16QIJFJPkiOY99EU",t="17X58vl0e7lOGOTV5Mee6Ssunm7b4tcvBLpnaHB_GLSc",n="A:Z",o=`https://sheets.googleapis.com/v4/spreadsheets/${t}/values/${n}?key=${e}`;console.log("URL da API:",o);try{const e=await P.A.get(o);console.log("Resposta da API:",e);const t=e.data.values;if(console.log("Dados das linhas:",t),!t||0===t.length)return void console.error("Nenhum dado encontrado na planilha.");const n=t[0];console.log("Cabeçalhos:",n),this.users=t.slice(1).map((e=>{let t={};return n.forEach(((n,o)=>{t[n]=e[o]})),t})),console.log("Usuários processados:",this.users)}catch(r){console.error("Erro ao carregar usuários:",r)}},gerarPDF(e){const t=new U.Ay;t.text(`Ficha Cadastral de ${e["Nome Completo"]}`,10,10),Object.keys(e).forEach(((n,o)=>{t.text(`${n}: ${e[n]}`,10,20+10*o)})),t.save(`${e["Nome Completo"]}.pdf`)},abrirModal(e){this.selectedUser=e,this.modal=!0},getImageUrl(e){const t=/\/d\/(.*?)\//,n=e.match(t);return n&&n[1]?`https://drive.google.com/uc?export=view&id=${n[1]}`:e}}},S=n(1241);const x=(0,S.A)(L,[["render",W]]);var N=x,A=(n(5524),n(1036)),D=(0,A.$N)();async function T(){const e=await n.e(53).then(n.t.bind(n,8874,23));e.load({google:{families:["Roboto:100,300,400,500,700,900&display=swap"]}})}T(),(0,o.Ef)(N).use(D).mount("#app")}},t={};function n(o){var r=t[o];if(void 0!==r)return r.exports;var a=t[o]={exports:{}};return e[o].call(a.exports,a,a.exports,n),a.exports}n.m=e,function(){var e=[];n.O=function(t,o,r,a){if(!o){var l=1/0;for(s=0;s<e.length;s++){o=e[s][0],r=e[s][1],a=e[s][2];for(var u=!0,i=0;i<o.length;i++)(!1&a||l>=a)&&Object.keys(n.O).every((function(e){return n.O[e](o[i])}))?o.splice(i--,1):(u=!1,a<l&&(l=a));if(u){e.splice(s--,1);var c=r();void 0!==c&&(t=c)}}return t}a=a||0;for(var s=e.length;s>0&&e[s-1][2]>a;s--)e[s]=e[s-1];e[s]=[o,r,a]}}(),function(){n.n=function(e){var t=e&&e.__esModule?function(){return e["default"]}:function(){return e};return n.d(t,{a:t}),t}}(),function(){var e,t=Object.getPrototypeOf?function(e){return Object.getPrototypeOf(e)}:function(e){return e.__proto__};n.t=function(o,r){if(1&r&&(o=this(o)),8&r)return o;if("object"===typeof o&&o){if(4&r&&o.__esModule)return o;if(16&r&&"function"===typeof o.then)return o}var a=Object.create(null);n.r(a);var l={};e=e||[null,t({}),t([]),t(t)];for(var u=2&r&&o;"object"==typeof u&&!~e.indexOf(u);u=t(u))Object.getOwnPropertyNames(u).forEach((function(e){l[e]=function(){return o[e]}}));return l["default"]=function(){return o},n.d(a,l),a}}(),function(){n.d=function(e,t){for(var o in t)n.o(t,o)&&!n.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})}}(),function(){n.f={},n.e=function(e){return Promise.all(Object.keys(n.f).reduce((function(t,o){return n.f[o](e,t),t}),[]))}}(),function(){n.u=function(e){return"js/"+(53===e?"webfontloader":e)+"."+{53:"f9781f22",125:"83426a75",179:"130f90c6",427:"8ba4d6a6"}[e]+".js"}}(),function(){n.miniCssF=function(e){}}(),function(){n.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){var e={},t="ficha-cadastral:";n.l=function(o,r,a,l){if(e[o])e[o].push(r);else{var u,i;if(void 0!==a)for(var c=document.getElementsByTagName("script"),s=0;s<c.length;s++){var f=c[s];if(f.getAttribute("src")==o||f.getAttribute("data-webpack")==t+a){u=f;break}}u||(i=!0,u=document.createElement("script"),u.charset="utf-8",u.timeout=120,n.nc&&u.setAttribute("nonce",n.nc),u.setAttribute("data-webpack",t+a),u.src=o),e[o]=[r];var d=function(t,n){u.onerror=u.onload=null,clearTimeout(p);var r=e[o];if(delete e[o],u.parentNode&&u.parentNode.removeChild(u),r&&r.forEach((function(e){return e(n)})),t)return t(n)},p=setTimeout(d.bind(null,void 0,{type:"timeout",target:u}),12e4);u.onerror=d.bind(null,u.onerror),u.onload=d.bind(null,u.onload),i&&document.head.appendChild(u)}}}(),function(){n.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){n.p="/rpromo-app/"}(),function(){var e={524:0};n.f.j=function(t,o){var r=n.o(e,t)?e[t]:void 0;if(0!==r)if(r)o.push(r[2]);else{var a=new Promise((function(n,o){r=e[t]=[n,o]}));o.push(r[2]=a);var l=n.p+n.u(t),u=new Error,i=function(o){if(n.o(e,t)&&(r=e[t],0!==r&&(e[t]=void 0),r)){var a=o&&("load"===o.type?"missing":o.type),l=o&&o.target&&o.target.src;u.message="Loading chunk "+t+" failed.\n("+a+": "+l+")",u.name="ChunkLoadError",u.type=a,u.request=l,r[1](u)}};n.l(l,i,"chunk-"+t,t)}},n.O.j=function(t){return 0===e[t]};var t=function(t,o){var r,a,l=o[0],u=o[1],i=o[2],c=0;if(l.some((function(t){return 0!==e[t]}))){for(r in u)n.o(u,r)&&(n.m[r]=u[r]);if(i)var s=i(n)}for(t&&t(o);c<l.length;c++)a=l[c],n.o(e,a)&&e[a]&&e[a][0](),e[a]=0;return n.O(s)},o=self["webpackChunkficha_cadastral"]=self["webpackChunkficha_cadastral"]||[];o.forEach(t.bind(null,0)),o.push=t.bind(null,o.push.bind(o))}();var o=n.O(void 0,[504],(function(){return n(2946)}));o=n.O(o)})();
//# sourceMappingURL=app.ddf2e8a4.js.map