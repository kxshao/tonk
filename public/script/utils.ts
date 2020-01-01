export const EPS = 0.000001;

export interface Point{
	x:number;
	y:number;
}

export function clip(val:number,lower:number,upper:number){
	if(lower>upper){
		let tmp = lower;
		lower = upper;
		upper = tmp;
	}
	return Math.max(lower, Math.min(val, upper))
}
