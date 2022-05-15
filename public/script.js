function write(text) {
    document.writeln("<p>" + text + "</p>");
}

fetch("https://raw.githubusercontent.com/TheSilentPro/SlimefunScrapper/master/items.json")
.then((response) => {
    return response.json();
})
.then((json => {
    for (var i = 0; i < json.length; i++) {
        var obj = json[i];

        write(" [ Information ]");
        write("ID: " + obj.id);
        write("Name: " + obj.name);
        write("Wiki: <a href=\"" + obj.wiki + "\">" + obj.wiki + "</a>")
        write("Enchantable: " + obj.enchantable);
        write("Disenchantable: "+ obj.disenchantable);
        write("Workbench: " + obj.workbench);
        write("Placeable: " + obj.placeable);

        write(" [ Research ]");
        write(" Key: " + obj.research.key);
        write(" ID: " + obj.research.id);
        write(" Name: " + obj.research.name);
        write(" Cost: " + obj.research.cost);

        write(" [ Group (Category) ]");
        write(" Key: " + obj.group.key);
        write(" Name: " + obj.group.name);
        write(" Tier: " + obj.group.tier);

        write(" [ Addon ]");
        write(" Name: " + obj.addon.name);
        write(" Version: " + obj.addon.version);
        write(" Bug Tracker: " + obj.addon.bug_tracker);
        
        write(" [ Recipe ]");
        write(" Type: " + obj.recipe_type.key);
        // TODO: Finish ingredients
        write("=========================")
    }
}));