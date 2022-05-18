fetch("https://raw.githubusercontent.com/TheSilentPro/SlimefunScrapper/master/items.json")
    .then(response => response.text().then(text => document.write(text)));