const isFunctionRegexp = /^async\s+?function[\s*]*?(?:(?:[a-zA-Z$_]|[a-zA-Z$_][a-zA-Z$_0-9]+?))?(?:\s+?)?\(|^function[\s*]*?(?:(?:[a-zA-Z$_]|[a-zA-Z$_][a-zA-Z$_0-9]+?))?(?:\s+?)?\(|^(?:async[\s]+)?\(/;

const variableRegexp = /^(?:[a-zA-Z$_]+|[a-zA-Z$_][a-zA-Z$_0-9]+)$/;

//like Array.prototype.flat
const collectParams = result => {
	
	let tempResultAllParams = [];

	for(let i = 0; i < result.length; ++i) {
		
		const thP = result[i];
		
		if(typeof thP == "string") {
			
			tempResultAllParams.push(thP);
			
		} else if(Array.isArray(thP)) {
			
			tempResultAllParams = tempResultAllParams.concat(collectParams(thP));
			
		}
		
	}
	
	return tempResultAllParams;

};

const haveDuplicates = (sourceArray, possibleDuplicateStr) => {
	
	const tempStore = {};
	
	for(let i = 0; i < sourceArray.length; ++i) {
		
		const thisEl = sourceArray[i];
		
		if(!tempStore[thisEl]) {
			
			tempStore[thisEl] = 1;
			
		} else {
			
			return thisEl;
			
		}
		
	}
	
	return false;
	
}

const fnArgNamesStrict = fn => {

	//convert to string
	let fnStr = fn + "";
	
	const firstFnPart = fnStr.match(isFunctionRegexp);
	
	if(!firstFnPart) {
		
		const secondTest = fnStr.match(/(^[a-zA-Z_$]+? )=>/);
		
		if(!secondTest) return { error: "TypeError: given argument is not a function" };
			
		fnStr = secondTest[1] + ")=>" + fnStr.substr(secondTest[0].length);
		
	} else {
		
		fnStr = fnStr.slice(firstFnPart[0].length);
		
	}
	
	const result = [];
	
	let resultI = 0;
	
	let inComment = 0;
	
	let inObjectDestructuring = 0;
	let ODPointer = 0;
	
	let inArrayDestructuring = 0;
	let ADPointer = 0;
	
	let recordArrayDestructuringObjectOrArrayToRecursiveParse = 0;
	let recordOOAStartPosition = 0;
	let recordOOAType = 0;
	
	let inDefaultValue = 0;
	
	let foundRest = false;
	
	let skip = 0;
	
	for(let i = 0; i < fnStr.length; i++) {
		
		if(skip) {
			
			skip -= 1;
			
			continue;
			
		}
		
		const thSym = fnStr[i];
		
		if(recordArrayDestructuringObjectOrArrayToRecursiveParse) {
			
			if((recordOOAType == 1 && thSym == "{") || (recordOOAType == 2 && thSym == "[")) {
				
				++recordArrayDestructuringObjectOrArrayToRecursiveParse;
				
			} else if((recordOOAType == 1 && thSym == "}") || (recordOOAType == 2 && thSym == "]")) {
				
				if(recordArrayDestructuringObjectOrArrayToRecursiveParse < 2) {
					
					const templ = fnStr.substr(recordOOAStartPosition, i - recordOOAStartPosition + 1);
					
					const recResult = fnArgNamesStrict("(" + templ + ")");
					
					if(recResult.error) return { error: recResult.error, result, recResult, resultI };
					
					if(!result[resultI]) result[resultI] = [];
					result[resultI][ADPointer] = recResult[0];
					
					recordOOAStartPosition = 0;
					recordArrayDestructuringObjectOrArrayToRecursiveParse = 0;
					recordOOAType = 0;
					
				} else {
					
					--recordArrayDestructuringObjectOrArrayToRecursiveParse;
					
				}
				
			}
			
			continue;
			
		}
		
		if(inDefaultValue && thSym == "(") {
			
			++inDefaultValue;
			
		} else if(thSym == ")") {
			
			if(inDefaultValue) {
				
				--inDefaultValue;
				
			}
			
			if(!inDefaultValue) {
				
				const hd = haveDuplicates(collectParams(result));
						
				if(hd) {
					
					return { error: "SyntaxError: duplicate argument names not allowed in this context", errorValue: hd, result, resultI };
					
				}
				
				if(foundRest) {
					
					return { error: "SyntaxError: expected closing parenthesis, got ','", result, resultI };
					
				}
				
				if(typeof result[resultI] == "string" && result[resultI].length > 3 && result[resultI][0] == "." && result[resultI][1] == "." && result[resultI][2] == ".") {
					
					if(!result[resultI].substr(3).match(variableRegexp)) {
					
						return { error: "SyntaxError: expected rest argument name", result, resultI };
						
					}
					
					foundRest = true;
					
				} else if(typeof result[resultI] == "string" && !result[resultI].match(variableRegexp)) {
					
					return { error: "SyntaxError: missing formal parameter", result, resultI };
					
				}
			
				return result;
				
			}
			
		} else if(inComment == 1) {
			
			if((i + 1) < fnStr.length && thSym == "*" && fnStr[i + 1] == "/") {
				
				inComment = 0;
				
				skip = 1;
				
			}

		} else if(inComment == 2) {
			
			if(thSym.match(/\r/)) {
				
				if((i + 1) < fnStr.length && fnStr[i + 1].match(/\n/)) {
					
					skip = 1;
					
				}
				
				inComment = 0;
				
			} else if(thSym.match(/\n/)) {
				
				inComment = 0;
				
			}
			
		} else if((i + 1) < fnStr.length && thSym == "/") {
			
			if(fnStr[i + 1] == "*") {
				
				inComment = 1;
				
			} else if(fnStr[i + 1] == "/") {
				
				inComment = 2;
				
			}
			
		} else if(thSym == "{") {
			
			if(foundRest) {
			
				return { error: "SyntaxError: parameter after rest parameter", result, resultI };
			
			}
			
			if(!inDefaultValue && inObjectDestructuring) {
				
				return { error: "SyntaxError: expected property name, got '{'", result, resultI };
				
			}
			
			if(!inDefaultValue && !inObjectDestructuring) {
				
				if(inArrayDestructuring) {
					
					recordOOAStartPosition = i;
					recordArrayDestructuringObjectOrArrayToRecursiveParse = 1;
					recordOOAType = 1;
					
				} else {
				
					inObjectDestructuring = 1;
					
				}
				
			}
			
		} else if(thSym == "}" && inDefaultValue < 2) {
			
			const hd = haveDuplicates(collectParams(result));
						
			if(hd) {
				
				return { error: "SyntaxError: duplicate argument names not allowed in this context", errorValue: hd, result, resultI };
				
			}
			
			if(foundRest) {
				
				return { error: "SyntaxError: rest element may not have a trailing comma", result, resultI };
				
			}
			
			if(result[resultI] === undefined || result[resultI] == "" || result[resultI][ODPointer] === undefined || result[resultI][ODPointer] == "") {
			
				return { error: "SyntaxError: expected property name, got ','", result, resultI };
			
			}
			
			if(Array.isArray(result[resultI])) {
				
				const isStringRP = typeof result[resultI][ODPointer] == "string";
				
				if(isStringRP && result[resultI][ODPointer].length > 3 && result[resultI][ODPointer][0] == "." && result[resultI][ODPointer][1] == "." && result[resultI][ODPointer][2] == ".") {
					
					if(!result[resultI][ODPointer].substr(3).match(variableRegexp)) {
					
						return { error: "SyntaxError: missing variable name", errorValue: result[resultI][ODPointer], result, resultI };
						
					}
					
					foundRest = true;
					
				} else if(isStringRP && !result[resultI][ODPointer].match(variableRegexp)) {
					
					return { 
					
						error: "SyntaxError: missing : after property id",
						errorValue: result[resultI][ODPointer],
						result,
						resultI,

					};
					
				}
				
			}
			
			inDefaultValue = 0;
			
			ODPointer = 0;
			inObjectDestructuring = 0;

		} else if(thSym == "[" && !inDefaultValue) {
			
			if(foundRest) {
			
				return { error: "SyntaxError: parameter after rest parameter", result, resultI };
			
			}
			
			if(!inArrayDestructuring) {
				
				inArrayDestructuring = 1;
				
			} else {
				
				recordOOAStartPosition = i;
				recordArrayDestructuringObjectOrArrayToRecursiveParse = 1;
				recordOOAType = 2;
				
			}
			
		} else if(thSym == "]" && inDefaultValue < 2) {
			
			const hd = haveDuplicates(collectParams(result));
						
			if(hd) {
				
				return { error: "SyntaxError: duplicate argument names not allowed in this context", errorValue: hd, result, resultI };
				
			}
			
			if(foundRest) {
				
				return { error: "SyntaxError: rest element may not have a trailing comma", result, resultI };
				
			}
			
			if(Array.isArray(result[resultI])) {
				
				const isStringRP = typeof result[resultI][ADPointer] == "string";
				
				if(isStringRP && result[resultI][ADPointer].length > 3 && result[resultI][ADPointer][0] == "." && result[resultI][ADPointer][1] == "." && result[resultI][ADPointer][2] == ".") {
					
					if(!result[resultI][ADPointer].substr(3).match(variableRegexp)) {
					
						return { error: "SyntaxError: missing variable name", errorValue: result[resultI][ADPointer], result, resultI };
						
					}
					
					foundRest = true;
					
				} else if(isStringRP && !result[resultI][ADPointer].match(variableRegexp)) {
					
					return { 
					
						error: "SyntaxError: missing variable name",
						errorValue: result[resultI][ADPointer],
						result,
						resultI,

					};
					
				}
				
			}
			
			inDefaultValue = 0;
			
			ADPointer = 0;
			inArrayDestructuring = 0;
			
		} else if(thSym == "=" || (inObjectDestructuring && thSym == ":")) {
			
			if(!inDefaultValue) inDefaultValue = 1;
			
		} else if(thSym == "," && inDefaultValue < 2) {
			
			inDefaultValue = 0;
			
			const hd = haveDuplicates(collectParams(result));
						
			if(hd) {
				
				return { error: "SyntaxError: duplicate argument names not allowed in this context", errorValue: hd, result, resultI };
				
			}
			
			if(inObjectDestructuring || inArrayDestructuring) {
				
				if(foundRest) {
					
					return { error: "SyntaxError: rest element may not have a trailing comma", result, resultI };
					
				}
				
				const pointer = inObjectDestructuring ? ODPointer : ADPointer;
				
				if(inObjectDestructuring && (result[resultI] === undefined || result[resultI] == "" || result[resultI][pointer] === undefined || result[resultI][pointer] == "")) {
				
					return { error: "SyntaxError: expected property name, got ','", result, resultI };
				
				}
				
				if(Array.isArray(result[resultI])) {
					
					const isStringRP = typeof result[resultI][pointer] == "string";
					
					if(isStringRP && result[resultI][pointer].length > 3 && result[resultI][pointer][0] == "." && result[resultI][pointer][1] == "." && result[resultI][pointer][2] == ".") {
						
						if(!result[resultI][pointer].substr(3).match(variableRegexp)) {
						
							return { error: "SyntaxError: missing variable name", errorValue: result[resultI][pointer], result, resultI };
							
						}
						
						foundRest = true;
						
					} else if(isStringRP && !result[resultI][pointer].match(variableRegexp)) {
						
						return { 
						
							error: inObjectDestructuring ? "SyntaxError: missing : after property id" : "SyntaxError: missing variable name",
							errorValue: result[resultI][pointer],
							result,
							resultI,

						};
						
					}
					
				}
				
			}
			
			if(inObjectDestructuring) {
				
				++ODPointer;
				
			} else if(inArrayDestructuring) {
				
				++ADPointer;
				
			} else {
				
				if(foundRest) {
					
					return { error: "SyntaxError: expected closing parenthesis, got ','", result, resultI };
					
				}
				
				if(result[resultI] === undefined || result[resultI] == "") {
				
					return { error: "SyntaxError: expected expression, got ','", result, resultI };
				
				}
				
				if(typeof result[resultI] == "string" && result[resultI].length > 3 && result[resultI][0] == "." && result[resultI][1] == "." && result[resultI][2] == ".") {
					
					if(!result[resultI].substr(3).match(variableRegexp)) {
					
						return { error: "SyntaxError: expected rest argument name", result, resultI };
						
					}
					
					foundRest = true;
					
				} else if(typeof result[resultI] == "string" && !result[resultI].match(variableRegexp)) {
					
					return { error: "SyntaxError: missing formal parameter", result, resultI };
					
				}
			
				++resultI;
				
			}
			
		} else if(thSym != " " && !inDefaultValue) {
			
			if(inObjectDestructuring || inArrayDestructuring) {
				
				const pointer = inObjectDestructuring ? ODPointer : ADPointer;
				
				if(!result[resultI]) {
					
					result[resultI] = [];
					result[resultI][pointer] = thSym;
					result[resultI].origin = inObjectDestructuring ? "object" : "array";
					
				} else {
					
					if(!result[resultI][pointer]) {
						
						result[resultI][pointer] = thSym;
						
					} else {
						
						result[resultI][pointer] += thSym;
						
					}
					
				}
				
			} else {
			
				if(result[resultI]) {
					
					result[resultI] += thSym;
					
				} else {
					
					result[resultI] = thSym;
					
				}
			
			}
			
		}

	}

	return { error: "cant parse this function", result, resultI };

}

module.exports = fnArgNamesStrict;