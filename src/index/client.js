function scrollFunction() {
    // Header starts at 6em height
    // Will decrease as user scrolls down
    // Stops at 4em height at a scroll of 4em
    // Adjust margin bottom so it takes up the same space
    // Font size starts at 2.5em and decreases to 2em
    // Title span::before's bottom goes from 0.5em to 0em

    var scroll = scrollY / 16; // Convert to em

    var header = document.getElementById("header"); // Get header element
    var height = 6 - scroll; // Calculate new height

    var title = document.getElementById("title").getElementsByTagName("h1")[0]; // Get h1 element under title
    var fontSize = 2.5 - (scroll / 4); // Calculate new font size

    var lineOffset = 0.5 - (scroll / 5); // Calculate new line offset

    if (height < 4) { // Make height stop at 4, font size stop at 2, and line offset stop at 0
        height = 4;
        fontSize = 2;
        lineOffset = 0;
    }

    // Set new height, marginBottom, font size, and line offset
    header.style.height = height + "em";
    header.style.marginBottom = 8 - height + "em";
    title.style.fontSize = fontSize + "em";
    document.documentElement.style.setProperty("--lineOffset", lineOffset);
}

window.onscroll = function() {scrollFunction()}; // Call scrollFunction when user scrolls
window.onload = function() {scrollFunction()}; // Call scrollFunction when page loads