(function(){var c=function(a){if(arguments.length===2){if(!(this instanceof c))return new c(arguments[0],arguments[1]);var b=arguments[1];this._list=arguments[0];this._index=b}else{if(!(this instanceof c))return new c(a);this._list=a!==null?[a]:[];this._index=0}};c.VERSION="0.2.0";if(typeof module!=="undefined"&&module.exports)module.exports=c;else this.jDoc=c;var j=new c(null),k=function(a,b){var e;if(typeof b==="object"&&typeof b.length==="number")for(e=0;e<b.length;++e)a.push(b[e]);else a.push(b)},
i=function(a,b,e,d){a.each(function(g){g=g.json();for(var h in g){var f=g[h];if(typeof f!=="function"){b(h)&&k(d,f);if(e)if(typeof f==="object")typeof f.length==="number"?i(new c(f,0),b,e,d):i(new c(f),b,e,d)}}})},l=function(a){return typeof a==="function"?a:a instanceof RegExp?function(b){return a.test(b)}:function(b){return b===a}},m={};c.prototype.any=function(){return this._list.length>0};c.prototype.first=function(){return new c(this._list,0)};c.prototype.next=function(){if(!this.hasValue())return this;
var a=this._index+1;if(a<this._list.length)return new c(this._list,a);return j};c.prototype.each=function(a,b){var e,d;e=0;for(d=this._list[0];typeof d!=="undefined"&&a.call(b,new c(d))!==false;d=this._list[++e]);};c.prototype.count=function(){return this._list.length};c.prototype.get=function(a){if(a>=0&&a<this._list.length)return new c([this._list[a]],0);return j};c.prototype.where=function(a,b){var e=[];this.each(function(d){a.call(b,d)&&k(e,d.json())});return new c(e,0)};c.prototype.union=function(a){if(!this.any())return a;
if(!a.any())return this;return new c(this._list.concat(a._list),0)};c.prototype.select=function(a,b){var e=[];this.each(function(d){e.push(a.call(b,d))});return e};c.prototype.hasValue=function(a){var b=this;if(typeof a==="string")b=this.at(a);return b._index<b._list.length};c.prototype.json=function(a){var b=this;if(typeof a==="string")b=this.at(a);if(!b.hasValue())return null;return b._list[this._index]};c.prototype.text=function(a){for(a=this.json(a);a!==null;)switch(typeof a){case "boolean":case "number":return a.toString();
case "string":return a;case "object":if(typeof a.length==="undefined"){a=a["#text"];return typeof a!=="undefined"?a:null}else if(a.length>0)a=a[0];else return null;break;default:return null}return null};c.prototype.match=function(a){if(!this.hasValue())return this;var b=[];i(this,l(a),false,b);return new c(b,0)};c.prototype.deepMatch=function(a){if(!this.hasValue())return this;var b=[];i(this,l(a),true,b);return new c(b,0)};c.prototype.attributes=function(){return this.match(/^@.+$/)};c.prototype.elements=
function(){return this.match(/^[^@#].*$/)};c.prototype.$=c.prototype.at=function(a){var b;if(typeof(b=m[a])==="undefined"){b=Function;if(typeof a!=="string"||a==="")throw Error("invalid selector");var e=a.split("/"),d=false,g="this",h;for(h=0;h<e.length;++h){var f=e[h];switch(f){case "":if(h===0)continue;if(d)throw Error("invalid selector");d=true;continue;case ".":break;case "..":throw Error("unsupported .. operation in selector");case "*":g+=d?".deepMatch(/^[^@#].*$/)":".match(/^[^@#].*$/)";break;
case "@*":g+=d?".deepMatch(/^@.+$/)":".match(/^@.+$/)";break;default:g+=d?'.deepMatch("'+f.replace('"','\\"')+'")':'.match("'+f.replace('"','\\"')+'")'}d=false}if(d)throw Error("invalid selector");m[a]=b=new b("return "+g)}return b.call(this)}})();
