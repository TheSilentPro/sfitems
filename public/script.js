const formNode = (tagName, text = "", attributes = {}, childNodes = []) => {
    let node = document.createElement(tagName);
    if (text !== "") {
        node.appendChild(document.createTextNode(text));
    }
    for (const attribute in attributes) {
        node.setAttribute(attribute, attributes[attribute]);
    }
    for (const childNode of childNodes) {
        node.appendChild(childNode);
    }

    return node;
}

const formDiv = (attributes = {}, childNodes = []) => {
    let div = formNode("div", "", attributes, childNodes);

    return div;
}

const newChildToNode = (node, childName, text = "", attributes = {}) => {
    const child = formNode(childName, text, attributes)
    node.appendChild(child)
}

const newNodeToBody = (tagName, text = "", attributes = {}) => {
    newChildToNode(document.getElementById("body"), tagName, text, attributes);
}

const addChildToNode = (node, child) => {
    node.appendChild(child)
}

const addNodeToBody = (node) => {
    addChildToNode(document.getElementById("body"), node);
}

const formNode__propertyGroupRowKeyValue = (key, value) => {
    return formDiv({
            "class": "item-card__property-group__row"
        },
        [
            formNode(
                "p", key, {
                    "class": "item-card__property-group__key"
                }
            ),
            formNode(
                "p", value, {
                    "class": "item-card__property-group__value"
                }
            )
        ]
    );
}

const formNode__propertyGroupRowKeyValueLink = (key, value) => {
    return formDiv({
            "class": "item-card__property-group__row"
        },
        [
            formNode(
                "p", key, {
                    "class": "item-card__property-group__key"
                }
            ),
            formNode(
                "a", value ? value : "", {
                    "class": "item-card__property-group__value",
                    "href": value
                }
            )
        ]
    );
}


const formDiv__research = (item) => {
    if ("research" in item) {
        return formDiv({
                "class": "item-card__property-group"
            },
            [
                formNode(
                    "h3", "[ Research ]", {
                        "class": "item-card__property-group__title"
                    }
                ),
                formNode__propertyGroupRowKeyValue("Key:", item.research.key),
                formNode__propertyGroupRowKeyValue("ID:", item.research.id),
                formNode__propertyGroupRowKeyValue("Name:", item.research.name),
                formNode__propertyGroupRowKeyValue("Cost:", item.research.cost),
            ]
        )
    } else {
        return formDiv({
                "class": "item-card__property-group"
            },
            [
                formNode(
                    "h3", "[ Research ]", {
                        "class": "item-card__property-group__title"
                    }
                ),
                formNode(
                    "p", "Couldn't find research for this item."
                )
            ]
        )
    }
}

const recipeToKeys = (recipe) => {
    let ingredientsSet = {};

    recipe.forEach((ingredient) => {
        if (!((ingredient === null) || (ingredient.type in ingredientsSet))) {
            ingredientsSet[ingredient.type] = {
                "key": Object.keys(ingredientsSet).length + 1,
                "amount": ingredient.amount
            }
        }
    })
    return ingredientsSet
}

const formNode__propertyGroupRecipe = (recipe) => {
    const recipeKeys = recipeToKeys(recipe);
    let ingredients = [];

    for (let i = 0; i < 9; i++) {
        let ingredientName = ""
        if (recipe[i] !== null) {
            ingredientName = recipeKeys[recipe[i].type].key
        }
        ingredients.push(
            formDiv({
                    "class": "item-card__property-group__recipe-grid__item"
                },
                [
                    formNode(
                        "p", ingredientName
                    )
                ]
            )
        )
    }


    let keyStrings = [
        formNode(
            "p", "Recipe Key:", {
                "class": "item-card__property-group__recipe-key__title"
            }
        )
    ];
    const multipleItemInStackWarning = false;
    for (const ingredient in recipeKeys) {
        if (recipeKeys[ingredient].amonut > 1) {
            multipleItemInStackWarning = true;
        }
        keyStrings.push(
            formNode(
                "p", `${recipeKeys[ingredient].key}: ${ingredient}`
            )
        )
    }
    if (multipleItemInStackWarning) {
        keyStrings.push(
            formNode(
                "p", "Warning: some of the items in this recipe require more than one item per slot. This site doesn't take multiple items in a stack into account just yet.", {
                    "class": "item-card__property-group__recipe-key__warning"
                }
            )
        )
    }

    return formDiv({},
        [
            formDiv({
                    "class": "item-card__property-group__recipe-grid"
                },
                ingredients
            ),
            formDiv({
                    "class": "item-card__property-group__recipe-key"
                },
                keyStrings
            )
        ]
    )

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
            itemsList.push(item.id)

            let table = (
                formDiv({
                        "class": "item-card",
                        "id": item.id
                    },
                    [
                        formNode(
                            "h2", item.name.replace(/§[0-9a-f]/g, ""), {
                                "class": "item-card__title"
                            }
                        ),
                        formDiv({
                                "class": "item-card__property-group"
                            },
                            [
                                formNode(
                                    "h3", "[ Information ]", {
                                        "class": "item-card__property-group__title"
                                    }
                                ),
                                formNode__propertyGroupRowKeyValue("ID:", item.id),
                                formNode__propertyGroupRowKeyValue("Name:", item.name),
                                formNode__propertyGroupRowKeyValueLink("Wiki:", item.wiki),
                                formNode__propertyGroupRowKeyValue("Enchantable:", item.enchantable),
                                formNode__propertyGroupRowKeyValue("Disenchantable:", item.disenchantable),
                                formNode__propertyGroupRowKeyValue("Workbench:", item.workbench),
                                formNode__propertyGroupRowKeyValue("Placeable:", item.placeable)
                            ]
                        ),
                        formDiv__research(item),
                        formDiv({
                                "class": "item-card__property-group"
                            },
                            [
                                formNode(
                                    "h3", "[ Group ]", {
                                        "class": "item-card__property-group__title"
                                    }
                                ),
                                formNode__propertyGroupRowKeyValue("Key:", item.group.key),
                                formNode__propertyGroupRowKeyValue("Name:", item.group.name),
                                formNode__propertyGroupRowKeyValue("Tier:", item.group.tier)
                            ]
                        ),
                        formDiv({
                                "class": "item-card__property-group"
                            },
                            [
                                formNode(
                                    "h3", "[ Addon ]", {
                                        "class": "item-card__property-group__title"
                                    }
                                ),
                                formNode__propertyGroupRowKeyValue("Name:", item.addon.name),
                                formNode__propertyGroupRowKeyValue("Version:", item.addon.version),
                                formNode__propertyGroupRowKeyValueLink("Bug Tracker:", item.addon.bug_tracker),
                            ]
                        ),
                        formDiv({
                                "class": "item-card__property-group"
                            },
                            [
                                formNode(
                                    "h3", "[ Recipe ]", {
                                        "class": "item-card__property-group__title"
                                    }
                                ),
                                formNode__propertyGroupRecipe(item.recipe.ingredients),
                                formNode__propertyGroupRowKeyValue("Type:", item.recipe_type.key),
                                formNode__propertyGroupRowKeyValue("Produces:", item.recipe.output.amount),
                            ]
                        ),
                    ]
                )
            );

            addNodeToBody(table);
        }
    }));

document.getElementById("search-bar").addEventListener("submit", (event) => {
    event.preventDefault();
    const itemName = event.target.children[0].value.toUpperCase().replaceAll(" ", "_");
    console.log(itemName);
    if (itemsList.includes(itemName)) {
        document.getElementById(itemName).scrollIntoView();
    } else {
        alert(`Couldn't find a Slimefun item with the id "${event.target.children[0].value}"`)
    }
})

document.getElementById("back-to-top-button").addEventListener("click", () => {
    window.scrollTo(0, 0);
})