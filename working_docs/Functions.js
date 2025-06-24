﻿function filterCards(from, to) {
    const url = "https://api.academyruins.com/cr/205.3i";

    return fetch(url)
        .then((response) => {
            return response.json();
        })
        .then((json) => {
            var ruleText = json.ruleText;
            const ruleStart = "The land types are";
            const ruleEnd = ".";
            const rule = ruleText.split(ruleStart)[1].split(ruleEnd)[0].trim();
            let landTypes = rule.split(",").map(type => type.trim());
            if (landTypes.length > 1) {
                let lastType = landTypes.at(-1).substring(4);
                landTypes = landTypes.slice(0, -1).concat(lastType);
            }
            return landTypes;
        });
}
