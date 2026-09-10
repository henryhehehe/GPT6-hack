/** Scene units are metres. Apply scale to furniture before placing tabletop props. */
export const HUMAN_SCALE={eyeHeight:1.62,walkSpeed:2.1,jogSpeed:4.6,marketVertical:.8,deskVertical:.72,stoolVertical:.68,benchVertical:.67} as const;
export const MARKET_COUNTER_Y=1+1.01*HUMAN_SCALE.marketVertical;
export const LIBRARY_DESK_Y=4+1.09*HUMAN_SCALE.deskVertical;
export const TEACHING_HEIGHTS={harbor:1.78,market:1.64,library:1.71} as const;
