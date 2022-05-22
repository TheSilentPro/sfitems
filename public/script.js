const globalState = {}
const DEBUG_VERBOSE = false;

const formatCodeRegex = /§([0-9a-z])/g;

const insertAndReplaceAt = (string, replacement, startIndex, endIndex) => {
    return string.substring(0, startIndex) + replacement + string.substring(endIndex);
}

const toTitleCase = (string) => {
    return string.trim().toLowerCase().replaceAll(/\w\S*/g, (w) => (w.replace(/^\w/g, (c) => c.toUpperCase())));
}

const removeColorSymbols = (string) => {
    if ((string === undefined) || string === null) {
        console.warn("Tried to remove color symbols from an undefined or null string at " + removeColorSymbols(globalState.currentItem.name))
        return ""
    }
    return string.replaceAll(formatCodeRegex, "");
}

// Returns nested spans, with classes for styling
const parseColorSymbols = (string) => {
    let matchedCodeIndex = string.search(formatCodeRegex)
    // Base case: no codes left in the string
    if (matchedCodeIndex === -1) {
        return string
    } else {
        // A bit complicated, basically it searches for the first
        // format code, and puts the stuff after that into a span
        // with the corresponding classes, recursively
        const formatCode = string[matchedCodeIndex + 1];
        return `${string.substring(0, matchedCodeIndex)}<span class="color-code__${formatCode}">${parseColorSymbols(string.substring(matchedCodeIndex+2))}</span>`
    };
}

const getPotionName = (potion) => {
    let extendedOrUpgradedString = ""
    if (potion.meta.base_potion_data.extended === true) {
        extendedOrUpgradedString += " II"
    } else if (potion.meta.base_potion_data.extended === true) {
        extendedOrUpgradedString += "( Extended)"
    }
    return toTitleCase(`[${potion.type.replace("_", " ")} of ${potion.meta.base_potion_data.type}${extendedOrUpgradedString}]`)
}


const getIngredientName = (ingredient) => {
    // Prerequisite: 'ingredient' is not null
    if (!("meta" in ingredient)) {
        return `[${toTitleCase(ingredient.type.replaceAll("_", " "))}]`;
        // No display name in meta means vanilla item with NBT data
        // So far, only potions have them. If there are more to be
        // added int he future, this script will
        // log a message in console, but won't crash
    } else if (!("display_name" in ingredient.meta)) {
        if (ingredient.type === "POTION") {
            return getPotionName(ingredient);
        } else {
            return `[${toTitleCase(ingredient.type.replaceAll("_", " "))}]`;
        }
    } else {
        return parseColorSymbols(ingredient.meta.display_name);
    }
}

const recipeToKeys = (recipe) => {
    let ingredientsSet = new Object();
    let num = 1;

    recipe.forEach((ingredient) => {
        if (!((ingredient === null) || (getIngredientName(ingredient) in ingredientsSet))) {
            ingredientsSet[getIngredientName(ingredient)] = {
                "key": num,
                "amount": ingredient.amount
            };
            num++;
        }
    })
    return ingredientsSet
}


// "itemName" should only be passed for debugging purposes
const itemCardKeyValuePair = (key, value, isLink) => {
    const _nullValue = (value === undefined) || (value === null);
    if (_nullValue) {
        console.warn(`The value for "${key}" is "${value}" in ${removeColorSymbols(globalState.currentItem.name)}`, (DEBUG_VERBOSE ? globalState.currentItem : ""))
        value = "Unavailable"
    }
    let _valueElement = ""
    if (!isLink || _nullValue) {
        _valueElement = `<p class="item-card__property-group__value">${value}</p>`
    } else {
        _valueElement = `<a class="item-card__property-group__value" href="${value}">${value}</a>`
    }
    return `
        <div class="item-card__property-group__row">
            <p class="item-card__property-group__key">${key}</p>
            ${_valueElement}
        </div>
    `
}

const itemCardKeyValuePairNullable = (resource, key, onSuccess) => {
    if (!((resource === null) || (resource === undefined))) {
        return itemCardKeyValuePair(key, onSuccess(resource))
    } else {
        return ""
    }
}

const itemCardDescription = (output) => {
    if ("meta" in output) {
        if ("lore" in output.meta) {
            let valueLines = ""
            let _beginning = true;
            output.meta.lore.forEach(value => {
                // Trims off whitespace in the beginning of the lore
                valueLines += ((value !== "") || !_beginning) ? (function() {
                    _beginning = false;
                    return `<p>${parseColorSymbols(value)}</p>`
                })() : ""
            });
            return `
                <p class="item-card__property-group__multiline-key">Description:</p>
                <div class="item-card__property-group__multiline-value">
                    ${valueLines}
                </div>
            `
        }
    }
    return ""
}

const itemCardResearchGroup = (item) => {
    if ("research" in item) {
        return `
            ${itemCardKeyValuePair("Key:", item.research.key)}
            ${itemCardKeyValuePair("ID:", item.research.id)}
            ${itemCardKeyValuePair("Name:", item.research.name)}
            ${itemCardKeyValuePair("Cost:", item.research.cost + " Level" + (item.research.cost !== 1 ? "s" : ""))}
        `
    } else {
        return `
            <p>Couldn't find research for this item.</p>
        `
    }
}


// This is the catch-all for extra properties
const itemCardExtraGroup = (item) => {
    let extraPropertyGroupHTML = "";
    let groupName = []
    if ("energy" in item) {
        groupName = "Energy";
        extraPropertyGroupHTML += `
            ${itemCardKeyValuePair("Type:", toTitleCase(item.energy.type))}
            ${itemCardKeyValuePair("Capacity:", item.energy.capacity + " J")}
            ${itemCardKeyValuePair("Rechargeable:", item.energy.rechargeable)}
        `
    } else if ("protection" in item) {
        groupName = "Protections";
        extraPropertyGroupHTML += `
            ${itemCardKeyValuePair("Full set required:", item.protection.full_required)}
            ${itemCardKeyValuePair("Key:", item.protection.key)}
            ${itemCardKeyValuePair("Protects from:", toTitleCase(item.protection.protection_types.join(", ").replaceAll("_", " ")))}
        `
    } else {
        return ""
    }


    return `
        <div class="item-card__property-group">
            <h3 class="item-card__property-group__title">[ ${groupName} ]</h3>
            ${extraPropertyGroupHTML}
        </div>
    `
}

const itemCardRecipeGrid = (recipe) => {
    const recipeKeys = recipeToKeys(recipe);
    let recipeGridItems = "";

    for (let i = 0; i < 9; i++) {
        let ingredientName = ""
        if (recipe[i] !== null) {
            ingredientName = recipeKeys[getIngredientName(recipe[i])].key
        }
        recipeGridItems += `
            <div class="item-card__property-group__recipe-grid__item">
                <p>${ingredientName}</p>
            </div>
        `;
    }

    let keyStrings = `
        <p class="item-card__property-group__recipe-key__title">Recipe Key:</p>
    `;
    for (const ingredient in recipeKeys) {
        keyStrings += `
            <p>${recipeKeys[ingredient].key}: <span>${recipeKeys[ingredient].amount}x</span> ${ingredient}</p>
        `;
    }

    return `
        <div class="item-card__property-group__recipe-grid">
            ${recipeGridItems}
        </div>
        <div class="item-card__property-group__recipe-key">
            ${keyStrings}
        </div>
    `;
}


let itemsList = [];
fetch("https://raw.githubusercontent.com/TheSilentPro/SlimefunScrapper/master/items.json")
    .then((response) => {
        return response.json();
    })
    .then((json => {

        let maxItems = json.length;
        // maxItems = 10;
        for (let i = 0; i < maxItems; i++) {
            const item = json[i];
            globalState.currentItem = item;
            itemsList.push(removeColorSymbols(item.name).toLowerCase())

            document.getElementById("body").insertAdjacentHTML("beforeend", `
                <div class="item-card" id="${removeColorSymbols(item.name).toLowerCase()}">
                    <h2 class="item-card__title">${removeColorSymbols(item.name)}</h2>
                    <div class="item-card__property-group">
                        <h3 class="item-card__property-group__title">[ Information ]</h3>
                        ${itemCardKeyValuePair("ID:", item.id)}
                        ${itemCardKeyValuePair("Name:", parseColorSymbols(item.name))}
                        ${itemCardKeyValuePairNullable(item.radioactivity, "Radioactivity ☢️:", (radioactivity) => {
                            return radioactivity.level
                        })}
                        ${itemCardDescription(item.recipe.output)}
                        ${itemCardKeyValuePair("Wiki:", item.wiki, true)}
                        ${itemCardKeyValuePair("Enchantable:", item.enchantable)}
                        ${itemCardKeyValuePair("Disenchantable:", item.disenchantable)}
                        ${itemCardKeyValuePair("Workbench:", item.workbench)}
                        ${itemCardKeyValuePair("Placeable:", item.placeable)}
                    </div>
                    <div class="item-card__property-group">
                        <h3 class="item-card__property-group__title">[ Recipe ]</h3>
                        ${itemCardRecipeGrid(item.recipe.ingredients)}
                        ${itemCardKeyValuePair("Recipe Type:", item.recipe_type.name)}
                        ${itemCardKeyValuePair("Produces:", item.recipe.output.amount)}
                    </div>
                    <div class="item-card__property-group">
                        <h3 class="item-card__property-group__title">[ Research ]</h3>
                        ${itemCardResearchGroup(item)}
                    </div>
                    <div class="item-card__property-group">
                        <h3 class="item-card__property-group__title">[ Group ]</h3>
                        ${itemCardKeyValuePair("Key:", item.group.key)}
                        ${itemCardKeyValuePair("Name:", item.group.name)}
                        ${itemCardKeyValuePair("Tier:", item.group.tier)}
                    </div>
                    <div class="item-card__property-group">
                        <h3 class="item-card__property-group__title">[ Addon ]</h3>
                        ${itemCardKeyValuePair("Name:", item.addon.name)}
                        ${itemCardKeyValuePair("Version:", item.addon.version)}
                        ${itemCardKeyValuePair("Bug Tracker:", item.addon.bug_tracker, true)}
                    </div>
                    ${itemCardExtraGroup(item)}
                </div>
            `)
        }

        return maxItems;
    })).then(
        (totalItems) => {
            document.getElementById("total-items").textContent = totalItems;
            document.getElementById("body__loading-text").textContent = "";
        }, (error) => {
            document.getElementById("body__loading-text").textContent = "There was an error loading the items. Please see console for details";
            console.error(error)
        }
    );

document.getElementById("search-bar").addEventListener("submit", (event) => {
    event.preventDefault();
    const itemName = event.target.children[0].value.toLowerCase();
    console.log(itemName);
    if (itemsList.includes(itemName)) {
        document.getElementById(itemName).scrollIntoView();
    } else {
        alert(`Couldn't find a Slimefun item with the name "${event.target.children[0].value}"`)
    }
})

document.getElementById("back-to-top-button").addEventListener("click", () => {
    window.scrollTo(0, 0);
})