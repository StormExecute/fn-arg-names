module.exports = [

	["a", "b", "c", "d", "e", "f", "g"],
	
	["a", "b", "c", "d", "e"],
	
	{ error: "SyntaxError: expected expression, got ','", result: [], resultI: 0 },
	
	["a", "b", "...c"],
	
	["a", ["b"], ["c"], ["d", "e"], ["f", "g"]],
	
	[
	
		[ "a", "b", "c" ],
		
		["t"],
		
		[ 
		
			"e", "f", [ "g", "h" ], ["i"], [ "j", ["k"], ["l", "m", "n"] ], "...args"
			
		],
		
		"o", "...q"
		
	],
	
	{ error: "TypeError: given argument is not a function" },
	
	[],
	
	{ error: "SyntaxError: rest element may not have a trailing comma", result: [ ["...rest", "a"] ], resultI: 0 },
	
	{ error: "SyntaxError: expected property name, got ','", result: [], resultI: 0 },
	
	{ error: "SyntaxError: missing : after property id", errorValue: "2", result: [ [ "2" ] ], resultI: 0 },
	
	{ error: "SyntaxError: missing variable name", errorValue: "...#", result: [ [ "...#" ] ], resultI: 0 },
	
	{ error: "SyntaxError: expected property name, got '{'", result: [ [ "a" ] ], resultI: 0 },
	
	{ error: "SyntaxError: duplicate argument names not allowed in this context", errorValue: "a", result: [ "a", "a" ], resultI: 1 },
	
	{ error: "SyntaxError: missing variable name", result: [], recResult: { error: "SyntaxError: missing variable name", errorValue: "@", result: [["@"]], resultI: 0 }, resultI: 0 },
	
];