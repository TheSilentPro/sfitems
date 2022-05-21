const toTitleCase = (string) => {
    return string.trim().toLowerCase().replaceAll(/\w\S*/g, (w) => (w.replace(/^\w/g, (c) => c.toUpperCase())));
}

const removeColorSymbols = (string) => {
    return string.replaceAll(/§[0-9a-f]/g, "");
}

const getIngredientName = (ingredient) => {
    // Prerequisite: 'item' is not null
    let name = "";
    if (!("meta" in ingredient)) {
        return `[${toTitleCase(ingredient.type.replaceAll("_", " "))}]`;
    } else {
        return removeColorSymbols(ingredient.meta.display_name);
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

const itemCardKeyValuePair = (key, value, isLink) => {
    let _valueElement = ""
    if (!isLink) {
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

const itemCardResearchGroup = (item) => {
    if ("research" in item) {
        return `
            ${itemCardKeyValuePair("Key:", item.research.key)}
            ${itemCardKeyValuePair("ID:", item.research.id)}
            ${itemCardKeyValuePair("Name:", item.research.name)}
            ${itemCardKeyValuePair("Cost:", item.research.cost)}
        `
    } else {
        return `
            <p>Couldn't find research for this item.</p>
        `
    }
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
        <div>
            <div class="item-card__property-group__recipe-grid">
                ${recipeGridItems}
            </div>
            <div class="item-card__property-group__recipe-key">
                ${keyStrings}
            </div>
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
        for (let i = 0; i < maxItems; i++) {
            const item = json[i];
            itemsList.push(removeColorSymbols(item.name).toLowerCase())

            document.getElementById("body").insertAdjacentHTML("beforeend", `
                <div class="item-card" id="${removeColorSymbols(item.name).toLowerCase()}">
                    <h2 class="item-card__title">${removeColorSymbols(item.name)}</h2>
                    <div class="item-card__property-group">
                        <h3 class="item-card__property-group__title">[ Information ]</h3>
                        ${itemCardKeyValuePair("ID:", item.id)}
                        ${itemCardKeyValuePair("Name:", item.name)}
                        ${itemCardKeyValuePair("Wiki:", item.wiki, true)}
                        ${itemCardKeyValuePair("Enchantable:", item.enchantable)}
                        ${itemCardKeyValuePair("Disenchantable:", item.disenchantable)}
                        ${itemCardKeyValuePair("Workbench:", item.workbench)}
                        ${itemCardKeyValuePair("Placeable:", item.placeable)}
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
                    <div class="item-card__property-group">
                        <h3 class="item-card__property-group__title">[ Recipe ]</h3>
                        ${itemCardRecipeGrid(item.recipe.ingredients)}
                        ${itemCardKeyValuePair("Type:", item.recipe_type.key)}
                        ${itemCardKeyValuePair("Produces:", item.recipe.output.amount)}
                    </div>
                </div>
            `)
        }
    }));

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
