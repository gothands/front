"use strict";(self["webpackChunkHandsy_io"]=self["webpackChunkHandsy_io"]||[]).push([[550],{87423:(t,n,i)=>{i.d(n,{v:()=>a});var e=i(31267),s=i(67575),o=i.n(s);class a extends e.J5{async init(t){this.chainConfig||(this.chainConfig=(0,e.h2)(e.EN.SOLANA,1))}async authenticateUser(){if(!this.provider||this.status!==e.MP.CONNECTED)throw e.RM.notConnectedError();const{chainNamespace:t,chainId:n}=this.chainConfig,i=await this.provider.request({method:"getAccounts"});if(i&&i.length>0){const s=(0,e.Cb)(i[0],this.name);if(s){const t=(0,e.$E)(s);if(!t)return{idToken:s}}const a={domain:window.location.origin,uri:window.location.href,address:i[0],chainId:parseInt(n,16),version:"1",nonce:Math.random().toString(36).slice(2),issuedAt:(new Date).toISOString()},r=await(0,e.tV)(a,t),h=(new TextEncoder).encode(r),c=await this.provider.request({method:"signMessage",params:{message:h,display:"utf8"}}),l=await(0,e.rn)(t,o().encode(c),r,this.name,this.sessionTime,this.clientId,this.web3AuthNetwork);return(0,e.Fr)(i[0],this.name,l),{idToken:l}}throw e.RM.notConnectedError("Not connected with wallet, Please login/connect first")}async disconnectSession(){super.checkDisconnectionRequirements();const t=await this.provider.request({method:"getAccounts"});t&&t.length>0&&(0,e.qz)(t[0],this.name)}async disconnect(){this.rehydrated=!1,this.emit(e.n2.DISCONNECTED)}}},74550:(t,n,i)=>{i.d(n,{PhantomAdapter:()=>c});i(21703);var e=i(82482),s=i(31267),o=i(87423),a=i(18845);function r(t,n,i){return new Promise(((e,s)=>{i>0?setTimeout((async()=>{const o=await t();o&&e(o),o||r(t,n,i-1).then((t=>(e(t),t))).catch((t=>s(t)))}),n):e(!1)}))}const h=async function(){var t;let n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{interval:1e3,count:3};const i="undefined"!==typeof window&&!(null===(t=window.solana)||void 0===t||!t.isPhantom);if(i)return window.solana;const e=await r((()=>{var t;return null===(t=window.solana)||void 0===t?void 0:t.isPhantom}),n.interval,n.count);return e?window.solana:null};class c extends o.v{constructor(){super(...arguments),(0,e.Z)(this,"name",s.rW.PHANTOM),(0,e.Z)(this,"adapterNamespace",s.yk.SOLANA),(0,e.Z)(this,"currentChainNamespace",s.EN.SOLANA),(0,e.Z)(this,"type",s.hN.EXTERNAL),(0,e.Z)(this,"status",s.MP.NOT_READY),(0,e.Z)(this,"_wallet",null),(0,e.Z)(this,"phantomProvider",null),(0,e.Z)(this,"_onDisconnect",(()=>{this._wallet&&(this._wallet.off("disconnect",this._onDisconnect),this.rehydrated=!1,this.status=this.status===s.MP.CONNECTED?s.MP.READY:s.MP.NOT_READY,this.emit(s.n2.DISCONNECTED))}))}get isWalletConnected(){var t;return!(null===(t=this._wallet)||void 0===t||!t.isConnected||this.status!==s.MP.CONNECTED)}get provider(){var t;return(null===(t=this.phantomProvider)||void 0===t?void 0:t.provider)||null}set provider(t){throw new Error("Not implemented")}async init(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};if(await super.init(t),super.checkInitializationRequirements(),this._wallet=await h({interval:500,count:3}),!this._wallet)throw s.Ty.notInstalled();this.phantomProvider=new a.kL({config:{chainConfig:this.chainConfig}}),this.status=s.MP.READY,this.emit(s.n2.READY,s.rW.PHANTOM);try{s.cM.debug("initializing phantom adapter"),t.autoConnect&&(this.rehydrated=!0,await this.connect())}catch(n){s.cM.error("Failed to connect with cached phantom provider",n),this.emit("ERRORED",n)}}async connect(){var t=this;try{if(super.checkConnectionRequirements(),this.status=s.MP.CONNECTING,this.emit(s.n2.CONNECTING,{adapter:s.rW.PHANTOM}),!this._wallet)throw s.Ty.notInstalled();if(this._wallet.isConnected)await this.connectWithProvider(this._wallet);else{const i=this._wallet._handleDisconnect;try{await new Promise(((n,e)=>{const o=async()=>{await this.connectWithProvider(this._wallet),n(this.provider)};this._wallet?(this._wallet.once("connect",o),this._wallet._handleDisconnect=function(){e(s.Ty.windowClosed());for(var n=arguments.length,o=new Array(n),a=0;a<n;a++)o[a]=arguments[a];return i.apply(t._wallet,o)},this._wallet.connect().catch((t=>{e(t)}))):e(s.Ty.notInstalled())}))}catch(n){if(n instanceof s.up)throw n;throw s.RM.connectionError(null===n||void 0===n?void 0:n.message)}finally{this._wallet._handleDisconnect=i}}if(!this._wallet.publicKey)throw s.RM.connectionError();return this._wallet.on("disconnect",this._onDisconnect),this.provider}catch(n){throw this.status=s.MP.READY,this.rehydrated=!1,this.emit(s.n2.ERRORED,n),n}}async disconnect(){let t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{cleanup:!1};await super.disconnectSession();try{var n;await(null===(n=this._wallet)||void 0===n?void 0:n.disconnect()),t.cleanup&&(this.status=s.MP.NOT_READY,this.phantomProvider=null,this._wallet=null),await super.disconnect()}catch(i){this.emit(s.n2.ERRORED,s.RM.disconnectionError(null===i||void 0===i?void 0:i.message))}}async getUserInfo(){if(!this.isWalletConnected)throw s.RM.notConnectedError("Not connected with wallet, Please login/connect first");return{}}async addChain(t){var n;let i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];super.checkAddChainRequirements(i),null===(n=this.phantomProvider)||void 0===n||n.addChain(t),this.addChainConfig(t)}async switchChain(t){var n;let i=arguments.length>1&&void 0!==arguments[1]&&arguments[1];super.checkSwitchChainRequirements(t,i),await(null===(n=this.phantomProvider)||void 0===n?void 0:n.switchChain(t)),this.setAdapterSettings({chainConfig:this.getChainConfig(t.chainId)})}async connectWithProvider(t){if(!this.phantomProvider)throw s.RM.connectionError("No phantom provider");return await this.phantomProvider.setupProvider(t),this.status=s.MP.CONNECTED,this.emit(s.n2.CONNECTED,{adapter:s.rW.PHANTOM,reconnected:this.rehydrated}),this.provider}}}}]);
//# sourceMappingURL=550.c683c210.js.map