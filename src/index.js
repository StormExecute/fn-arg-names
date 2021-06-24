const _default = require("./main");
const strict = require("./mainStrict");

const auto = fn => {
	
	if(typeof fn == "function") { 
	
		return _default(fn);
		
	} else if(typeof fn == "string") {
		
		return strict(fn);
		
	} else {
		
		return false;
		
	}
	
};

const exportFunction = fn => _default(fn);

exportFunction.default = _default;
exportFunction.strict = strict;
exportFunction.auto = auto;

module.exports = exportFunction;

//console.log(module.exports("async function * a({a, b, c: d}, r = function(a,b) { return (a + b) }, {t = {}}, [e, f, [g, h], {i}, [j, {k}, [l, m, n]], ...args], o, /*p,*/ ...q){}"));