const checkArrIdentify = require("./checkArrIdentify");

module.exports = (obj1, obj2) => {
	
	if(obj1.constructor.name != "Object" || obj2.constructor.name != "Object") return false;
	
	const k1 = Object.keys(obj1);
	const k2 = Object.keys(obj2);
	
	if(k1.length != k2.length) return false;
	
	for(let i = 0; i < k1.length; ++i) {
		
		if(k1[i] != k2[i]) return false;
		
		const v1 = obj1[k1[i]];
		const v2 = obj2[k2[i]];
		
		if(Array.isArray(v1)) {
			
			if(!checkArrIdentify(v1, v2)) return false;
			
		} else if(v1 && v1.constructor.name == "Object") {
			
			if(!module.exports(v1, v2)) return false;
			
		} else if(v1 !== v2) {
			
			return false;
			
		}
		
	}
	
	return true;
	
};