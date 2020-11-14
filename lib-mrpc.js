!function(e,t){"object"==typeof exports&&"object"==typeof module?module.exports=t():"function"==typeof define&&define.amd?define([],t):"object"==typeof exports?exports.lib_mrpc=t():e.lib_mrpc=t()}("undefined"!=typeof self?self:this,(function(){return function(e){var t={};function n(i){if(t[i])return t[i].exports;var s=t[i]={i:i,l:!1,exports:{}};return e[i].call(s.exports,s,s.exports,n),s.l=!0,s.exports}return n.m=e,n.c=t,n.d=function(e,t,i){n.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:i})},n.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},n.t=function(e,t){if(1&t&&(e=n(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var i=Object.create(null);if(n.r(i),Object.defineProperty(i,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var s in e)n.d(i,s,function(t){return e[t]}.bind(null,s));return i},n.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return n.d(t,"a",t),t},n.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},n.p="",n(n.s=1)}([function(e,t,n){"use strict";t.NewEndpoints=function(){return{Endpoints:{},EndpointExists:function(e){return void 0!==this.Endpoints[e]},AddEndpoint:function(e,t){let n={EndpointName:e,Handler:t};return this.Endpoints[e]=n,n},RemoveEndpoint:function(e){this.EndpointExists(e)&&delete this.Endpoints[e]},HandleEndpoint:async function(e,t){if(this.EndpointExists(e))return await this.Endpoints[e].Handler(t)}}}},function(e,t,n){"use strict";const i=n(2);t.ImmediateServiceProvider=i.ImmediateServiceProvider;const s=n(3);t.DeferredServiceProvider=s.DeferredServiceProvider;const o=n(4);t.WorkerThreadServiceProvider=o.WorkerThreadServiceProvider;const r=n(6);t.AmqpLibServiceProvider=r.AmqpLibServiceProvider,t.ServiceClient={Services:{},ConnectService:function(e){let t=e.ServiceName;if(void 0!==this.Services[t])throw new Error(`The service [${t}] already exists.`);this.Services[t]=e},DisconnectService:function(e){void 0!==this.Services[e]&&delete this.Services[e]},CallEndpoint:function(e,t,n,i){if(void 0===this.Services[e])throw new Error(`The service [${e}] does not exist.`);this.Services[e].CallEndpoint(t,n,i)}}},function(e,t,n){"use strict";const i=n(0);t.ImmediateServiceProvider=function(e,t){return{ServiceName:e,Options:t,Endpoints:i.NewEndpoints(),IsPortOpen:!1,OpenPort:async function(){this.IsPortOpen=!0},ClosePort:async function(){this.IsPortOpen=!1},AddEndpoint:async function(e,t){if(this.Endpoints.EndpointExists(e))throw new Error(`The endpoint [${e}] already exists within [${this.ServiceName}].`);this.Endpoints.AddEndpoint(e,t)},DestroyEndpoint:async function(e){this.Endpoints.RemoveEndpoint(e)},CallEndpoint:async function(e,t,n=null){if(!this.Endpoints.EndpointExists(e))throw new Error(`The endpoint [${e}] does not exist within [${this.ServiceName}].`);try{let i=await this.Endpoints.HandleEndpoint(e,t);n&&n(null,i)}catch(e){n&&n(e,null)}}}}},function(e,t,n){"use strict";const i=n(0);t.DeferredServiceProvider=function(e,t){return{ServiceName:e,Options:t,Endpoints:i.NewEndpoints(),IsPortOpen:!1,Messages:[],process_next_message:async function(){if(!this.Messages.length)return;let e=this.Messages[0];this.Messages=this.Messages.slice(1);try{let t=await this.Endpoints.HandleEndpoint(e.EndpointName,e.CommandParameters);e.ReplyCallback&&e.ReplyCallback(null,t)}catch(t){e.ReplyCallback&&e.ReplyCallback(t,null)}},OpenPort:async function(){for(this.IsPortOpen=!0;this.IsPortOpen;)setImmediate(()=>this.process_next_message()),await new Promise(e=>setTimeout(e,1))},ClosePort:async function(){this.IsPortOpen=!1;let e=this.Messages.length;e>0&&console.warn(`The port was closed but there are still [${e}] messages left in the queue.`)},AddEndpoint:async function(e,t){if(this.Endpoints.EndpointExists(e))throw new Error(`The endpoint [${e}] already exists within [${this.ServiceName}].`);this.Endpoints.AddEndpoint(e,t)},DestroyEndpoint:async function(e){this.Endpoints.RemoveEndpoint(e)},CallEndpoint:async function(e,t,n=null){if(!this.Endpoints.EndpointExists(e))throw new Error(`The endpoint [${e}] does not exist within [${this.ServiceName}].`);let i={EndpointName:e,CommandParameters:t,ReplyCallback:n};this.Messages.push(i)}}}},function(e,t,n){"use strict";const i=n(0),{Worker:s,isMainThread:o,parentPort:r,workerData:a}=n(5);t.WorkerThreadServiceProvider=function(e,t){return{ServiceName:e,Options:t,Endpoints:i.NewEndpoints(),IsPortOpen:!1,OpenPort:async function(){this.IsPortOpen=!0},ClosePort:async function(){this.IsPortOpen=!1},AddEndpoint:async function(e,t){if(this.Endpoints.EndpointExists(e))throw new Error(`The endpoint [${e}] already exists within [${this.ServiceName}].`);this.Endpoints.AddEndpoint(e,t)},DestroyEndpoint:async function(e){this.Endpoints.RemoveEndpoint(e)},CallEndpoint:async function(e,t,n=null){if(!this.Endpoints.EndpointExists(e))throw new Error(`The endpoint [${e}] does not exist within [${this.ServiceName}].`);try{let i=this.Endpoints.Endpoints[e].Handler.toString(),o=null;if(!i.startsWith("function "))throw new Error(`Unknown function signature in [${i}].`);o=`\n\t\t\t\t\t\t\t\tconst { parentPort, workerData } = require( 'worker_threads' );\n\t\t\t\t\t\t\t\tlet result =\n\t\t\t\t\t\t\t\t(\n\t\t\t\t\t\t\t\t\t${i}\n\t\t\t\t\t\t\t\t)( workerData );\n\t\t\t\t\t\t\t\tparentPort.postMessage( result );\n\t\t\t\t\t\t\t\t`;let r=new s(o,{eval:!0,workerData:t});n?(r.once("message",e=>n(null,e)),r.once("error",e=>n(e,null))):r.once("error",e=>{throw e})}catch(e){n&&n(e,null)}}}}},function(e,t){e.exports=require("worker_threads")},function(e,t,n){"use strict";const i=n(7),s=n(8),o=n(0);var r={exclusive:!1,durable:!1,autoDelete:!0},a={exclusive:!1,durable:!1,autoDelete:!0};t.AmqpLibServiceProvider=function(e,t){return{ServiceName:e,Options:t,Endpoints:o.NewEndpoints(),IsPortOpen:!1,QueueClient:null,QueueChannel:null,Messages:[],OpenPort:async function(){let e=null;this.QueueClient=await i.connect(this.Options.server),this.QueueChannel=await this.QueueClient.createChannel(),e=await this.QueueChannel.prefetch(1),this.IsPortOpen=!0},ClosePort:async function(){this.QueueChannel.close(),this.QueueClient.close(),this.IsPortOpen=!1;let e=this.Messages.length;e>0&&console.warn(`The port was closed but there are still [${e}] messages left in the queue.`)},AddEndpoint:async function(e,t){if(this.Endpoints.EndpointExists(e))throw new Error(`The endpoint [${e}] already exists within [${this.ServiceName}].`);let n=this,i=null,s=`${this.ServiceName}/${e}`;i=await this.QueueChannel.assertQueue(s,r),i=await this.QueueChannel.consume(s,(async function(e){if(e)try{let t=e.content.toString(),o=JSON.parse(t),r=o.ReplyCallback,u=await n.Endpoints.HandleEndpoint(o.EndpointName,o.CommandParameters);if(r){let e=s+"/"+r;i=n.QueueChannel.assertQueue(e,a),i=n.QueueChannel.sendToQueue(e,new Buffer(JSON.stringify(u)),{contentType:"text/plain",persistent:!1})}n.QueueChannel.ack(e)}catch(t){console.error(Error.message,t),n.QueueChannel.nack(e,!1,!1)}}));this.Endpoints.AddEndpoint(e,t)},DestroyEndpoint:async function(e){this.Endpoints.RemoveEndpoint(e)},CallEndpoint:async function(e,t,n=null){if(!this.Endpoints.EndpointExists(e))throw new Error(`The endpoint [${e}] does not exist within [${this.ServiceName}].`);let i=null;if(n){i=s();let t=this,o=null,r=`${this.ServiceName}/${e}/${i}`;o=await this.QueueChannel.assertQueue(r,a),o=await this.QueueChannel.consume(r,(function(e){if(e)try{let i=e.content.toString(),s=JSON.parse(i);n(null,s)}catch(e){console.error(Error.message,e),n(e,null)}finally{t.QueueChannel.deleteQueue(r)}}),{noAck:!0})}let o={EndpointName:e,CommandParameters:t,ReplyCallback:i},u=`${this.ServiceName}/${e}`;result_ok=await this.QueueChannel.assertQueue(u,r),result_ok=this.QueueChannel.sendToQueue(u,new Buffer(JSON.stringify(o)),{contentType:"text/plain",persistent:!1})}}}},function(e,t){e.exports=require("amqplib")},function(e,t){e.exports=require("uniqid")}])}));