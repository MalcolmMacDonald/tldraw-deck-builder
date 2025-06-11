function filterCards(from, to) {
    let cards = from.m.cards;

    let filterRegex = new RegExp(from.m.filter.join(' |'), '');

    return cards.map(card => {
        let foundMatch = card.oracle_text.match(filterRegex);
        if (!foundMatch) {
            return {...card, match: null};
        }
        return {...card, match: foundMatch[0]};
    });
}