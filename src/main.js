const isFunctionRegexp = /^async\s+?function[\s*]*?(?:(?:[a-zA-Z$_]|[a-zA-Z$_][a-zA-Z$_0-9]+?))?(?:\s+?)?\(|^function[\s*]*?(?:(?:[a-zA-Z$_]|[a-zA-Z$_][a-zA-Z$_0-9]+?))?(?:\s+?)?\(|^(?:async[\s]+)?\(/;

const fnArgNames = fn => {

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
					
					const recResult = fnArgNames("(" + templ + ")");
					
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
			
		} else if(inDefaultValue && thSym == ")") {
			
			--inDefaultValue;
			
			if(!inDefaultValue) return result;
			
		} else if(thSym == ")") {
			
			return result;
			
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
			
			inDefaultValue = 0;
			
			ODPointer = 0;
			inObjectDestructuring = 0;

		} else if(thSym == "[" && !inDefaultValue) {
			
			if(!inArrayDestructuring) {
				
				inArrayDestructuring = 1;
				
			} else {
				
				recordOOAStartPosition = i;
				recordArrayDestructuringObjectOrArrayToRecursiveParse = 1;
				recordOOAType = 2;
				
			}
			
		} else if(thSym == "]" && inDefaultValue < 2) {
			
			inDefaultValue = 0;
			
			ADPointer = 0;
			inArrayDestructuring = 0;
			
		} else if(thSym == "=" || ((inObjectDestructuring || inArrayDestructuring) && thSym == ":")) {
			
			if(!inDefaultValue) inDefaultValue = 1;
			
		} else if(thSym == "," && inDefaultValue < 2) {
			
			inDefaultValue = 0;
			
			if(inObjectDestructuring) {
				
				++ODPointer;
				
			} else if(inArrayDestructuring) {
				
				++ADPointer;
				
			} else {
			
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

module.exports = fnArgNames;