export enum EventTypes {
  ChiliCookOff = 'Chili Cook Off',
  GrammarRodeo = 'Grammar Rodeo',
  ItchyAndScratchyMovie = 'Itchy And Scratchy Movie',
}

export interface FetchPricePayload {
  event: EventTypes;
  qty: number;
}
