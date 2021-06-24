type answerWithoutError = (string | string[])[];
type answerWithError = { error: string, errorValue?: string, resultI?: number, result?: answerWithoutError };
type answerWithErrorRec = answerWithError & { recResult?: answerWithError };

type answer = answerWithoutError | answerWithErrorRec;

declare namespace fnArgNames {}

declare const fnArgNames: {

	(fn: string | Function): answer;
	
	default(fn: string | Function): answer;
	strict(fn: string | Function): answer;
	auto(fn: string | Function): answer;
	
}

export = fnArgNames;