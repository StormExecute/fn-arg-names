module.exports = [

	[function(a, b, c, d, e, f, g) {
	
	}],
	
	["(  a  , b=1, c = 2, d = function(){}, e = () => {})=>{}", "strict"],
	
	["async (,a,b)=>{}", "strict"],
	
	[(a, b, ...c) => {}],
	
	["function(a, {b}, [c], {d, e}, [f, g])=>{}"],
	
	["function a({a, b, c: d}, {t = {}}, [e, f, [g, h], {i}, [j, {k}, [l, m, n]], ...args], o, /*p,*/ ...q){}"],
	
	["func tion(){"],
	
	["function*(){}"],
	
	["function *a({...rest, a}){}", "strict"],
	
	["({,a})", "strict"],
	
	["({2})", "strict"],
	
	["([...#])", "strict"],
	
	["({a, { })", "strict"],
	
	["(a, a)", "strict"],
	
	["( [ [@] ] )", "strict"],

];