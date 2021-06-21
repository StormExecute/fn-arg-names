//only strings and recursive arrays with strings

module.exports = (arr1, arr2) => {
	
	if(!Array.isArray(arr1) || !Array.isArray(arr2)) return false;
	
	if(arr1.length != arr2.length) return false;
	
	for(let i = 0; i < arr1.length; ++i) {
		
		if(Array.isArray(arr1[i])) {
			
			if(Array.isArray(arr2[i])) {
				
				if(!module.exports(arr1[i], arr2[i])) {
					
					return false;
					
				}
				
			} else {
				
				return false;
				
			}
			
		} else if(arr1[i] !== arr2[i]) {
			
			return false;
			
		}
		
	}
	
	return true;
	
};