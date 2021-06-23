const fnArgNames = require("../src");

const tests = require("./testsArgs");
const results = require("./results");

const checkArrIdentify = require("./checkArrIdentify");
const checkObjIdentify = require("./checkObjIdentify");

const {
	
	redLog,
	blueLog,
	
	passTest,
	throwTest,
	
} = require("./logs");

for(let i = 0; i < tests.length; ++i) {
	
	const test = tests[i];
	let result = null;
	
	if(test[1] == "strict") {
		
		result = fnArgNames.strict(test[0]);
		
	} else {
		
		result = fnArgNames.default(test[0]);
		
	}
	
	if(Array.isArray(result)) {
		
		//console.log(result);
	
		if(checkArrIdentify(result, results[i])) {
			
			passTest(i);
			
		} else {
			
			throwTest(i);
			
		}
	
	} else if(result.constructor.name == "Object") {
		
		//console.log(result);
		
		if(checkObjIdentify(result, results[i])) {
			
			passTest(i);
			
		} else {
			
			throwTest(i);
			
		}
		
	}
	
}