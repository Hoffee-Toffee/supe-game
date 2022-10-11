var settings = { // The default game settings
    userName: "Guest",
    oppoName: "Computer",
    controlType: "Team", // How the moves are controlled (Team, Character or Player)
                         // Team - Each team makes one move per turn, the turn is controlled by one player
                         // Character - Each character in the team makes one move per turn, the turn is controlled by one player
                         // Player - Each player controls one character in the team and each makes one move per turn

    sessionCode: generateCode() // The invite code for the game, can share this with other players to join the game
}

function generateCode() { // Generates a random code for the game
    var code = "";
    var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (var i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
}

// Import the module from data.js
import { characters } from "./data.js";

var appdata = {
    el: '#app',
    data: {
        settings: settings, // The game settings
        userTeam: [characters[1]], // The characters in the user's team
        oppoTeam: [characters[0]], // The characters in the opponent's team
        userChar: characters[1], // The active character in the user's team
        oppoChar: characters[0], // The active character in the opponent's team
        menu: 0, // The current menu
        page: 0, // The current page in the menu
        buttons: [], // The buttons in the current menu
        log: [],

        fightOn: false, // Will be replaced later
        optionsOn: true, // Will be replaced later
        endOn: false, // Will be replaced later
    },
    methods: {
        addToLog: function(text) { // Adds text to the log (e.g. "Amplex trys Mega Punch on Traveller...")
            this.log.push(text);

            setTimeout(function() {
                // Scroll to bottom of log so the latest text is visible
                document.getElementById("log").scrollTop = document.getElementById("log").scrollHeight;
            }, 100);
        },
        updateButtons: function() { // Updates the buttons in the current menu
            var menus = [ // Contains an array of buttons for each menu
                [ // Main Menu | 0
                    "Move",
                    "Switch Character",
                    "Item",
                    "Run"
                ],
                this.userChar.allMoves(), // Moves Menu | 1
                this.userTeam, // Switch Character Menu | 2
                this.userChar.items, // Item Menu | 3
                [ // Run Menu | 4
                    "Yes",
                    "No"
                ]
            ];

            var menu = menus[this.menu];

            // <h4 v-on:click="processOption(MENU ID/BUTTON ID)" class="menu-button DISABLED">
            //     NAME
            // </h4>

            if (this.menu == 1) { // Formats buttons for the moves menu
                menu = menu.map( option => { // Disables moves that are not charged
                    var i = menu.indexOf(option);
                    var newOpt = {
                        onClick: function() {
                            this.processOption(this.menu + "/" + i)
                        }.bind(this, menu, option),
                        class: option.charge == 0 ? "" : "disabled",
                        name: option.name
                    }
                    return newOpt;
                });
            }
            else if (this.menu == 2) { // Format buttons for the switch character and item menus
                menu = menu.map(option => { // Disables characters that are not alive / items that are broken
                    var i = menu.indexOf(option);
                    var newOpt = {
                        onClick: function() {
                            this.processOption(this.menu + "/" + i)
                        }.bind(this, menu, option),
                        class: option.health == 0 ? "disabled" : "",
                        name: option.name
                    }
                    return newOpt;
                })
            }
            else { // Basic Text Menus
                menu = menu.map( option => {
                    var i = menu.indexOf(option);
                    var newOpt = {
                        onClick: function() {
                            this.processOption(this.menu + "/" + i)
                        }.bind(this, menu, option),
                        class: "",
                        name: option
                    }
                    return newOpt;
                })
            }

            if (window.matchMedia("(min-width: 1100px)").matches) { // If the screen is wide enough, show buttons in a 3x3 grid
                // 3x3
                // X | X | X
                // X | X | X
                // < | X | >

                var size = 9;
                var prev = -1;
            }
            else if (window.matchMedia("(min-width: 750px) and (max-width: 1100px)").matches) { // If the screen is medium width, show buttons in a 2x3 grid
                // 2x3
                // X | X | X
                // < | X | >

                var size = 6;
                var prev = -1;
            }
            else { // If the screen is too small, show buttons in a 2x2 grid
                // 2x2
                // X | X
                // < | >

                var size = 4;
                var prev = 0;
            }

            // Get the index of where the "Prev" button should be on the page (taking into account the "Prev" and "Next" buttons in previous pages)
            prev += size - 1 + (size - 2) * this.page
            var next = this.page * size + size - 1;

            // If there are less than a page items, fill the remaining with disabled blank spaces
            if (menu.length <= size) {
                for (var i = menu.length; i < size; i++) {
                    menu.push(
                        {
                            onClick: null,
                            class: "disabled",
                            name: ""
                        }
                    );
                }
                this.buttons = menu;
                return;
            }

            // If there are more than a page of items and you're on the first page, return all but one page of items and a ">" button
            if (this.page == 0) {
                menu = menu.slice(0, size - 1);
                menu.push(
                    {
                        onClick: function() {
                            this.page += 1;
                            this.updateButtons();
                        }.bind(this),
                        class: "navigate",
                        name: ">"
                    }
                );
                this.buttons = menu;
                return;
            }

            // Get the index of the first item on the page using mod (taking into account the "<" and ">" buttons)
            var firstIndex = (this.page * (size - 2) + 1) % menu.length;
            var lastIndex = menu.length - 1;

            // Make an array with a length of 'size' (each item starts as just the index)
            var buttons = Array(size).fill().map((_, i) => i);

            buttons = buttons.map( button => { // Disables moves that are not charged
                var i = buttons.indexOf(button) + firstIndex;

                if (i == prev) { // Add prev button
                    var newButton = {
                        onClick: function() {
                            this.page -= 1;
                            this.updateButtons();
                        }.bind(this),
                        class: "navigate",
                        name: "<"
                    }
                    return newButton;
                }
                else if (i == firstIndex + size - 1 && lastIndex > firstIndex + size - 1) { // If it's the last button and more buttons exist after this page, add a ">" button
                    var newButton = {
                        onClick: function() {
                            this.page += 1;
                            this.updateButtons();
                        }.bind(this),
                        class: "navigate",
                        name: ">"
                    }
                    return newButton;
                }
                else if (menu[i] == undefined) { // Display a disabled blank space if there is no button
                    var newButton = {
                        onClick: null,
                        class: "disabled",
                        name: ""
                    }
                    return newButton;
                }
                else if (i < prev) { // Display all buttons before the prev button
                    var newButton = {
                        onClick: function() {
                            this.processOption(this.menu + "/" + i)
                        }.bind(this),
                        class: menu[i].class,
                        name: menu[i].name
                    }
                    return newButton;
                }
                else if (i > prev && i < next) { // Display all buttons after the prev button
                    var newButton = {
                        onClick: function() {
                            this.processOption(this.menu + "/" + (i - 1))
                        }.bind(this),
                        class: menu[i - 1].class,
                        name: menu[i - 1].name
                    }
                    return newButton;
                }
                else { // Add disabled blank spaces for all other buttons
                    var newButton = {
                        onClick: null,
                        class: "disabled",
                        name: ""
                    }
                    return newButton;
                }
            });

            this.buttons = buttons; // The new set of buttons will now be updated and displayed
        },
        useMove: function(move, user, target, computer = false) { // Use a move on a target
            var applied = false; // Whether the move was applied or not
        
            this.addToLog(user.name + " tries " + move.name + " on " + target.name + "...");
        
            // Loop through all the effects of the move
            for (var i = 0; i < move.effects.length; i++) {
                // Apply the effects to the target
                applied = this.applyEffect(move.effects[i], user, target);
                // If the effect was not applied, and that effect is required, break out of the loop
                if (!applied && move.effects[i].required) break;
            }
        
            move.charge = move.recharge;
            // log an invisable character to force a new line
            this.addToLog("\u200B");

            // If the user is a member of the user's team, run prebattle for the enemy team
            if (this.userTeam.includes(user)) {
                this.preBattle(this.oppoTeam);
            }
            // If the user is a member of the opponent's team, run prebattle for the user's team
            else if (this.oppoTeam.includes(user)) {
                this.preBattle(this.userTeam);
            }

            if (!computer) { // A user just completed their turn, so it's now the computer's turn (the computer will now pick a move and use it instantly)
                // Now it's the opponent's turn (computer)
                // Need to generate a random charged move
                var moves = this.oppoChar.allMoves().filter(move => move.charge == 0);
                var move = moves[Math.floor(Math.random() * moves.length)];

                // Use the move on whoever it targets
                var target = move.target[0]
                if (move.target == "enemy") {
                    
                }
                var target = (move.target.includes("self")) ? this.oppoChar : this.userChar;
                this.useMove(move, this.oppoChar, target, true);
            }
            else { // The computer just completed their turn, so it's now the user's turn
            }
        },
        processOption: function (option) { // Process button clicks for the menu
            if (option == "0/0") { // Menu -> Move
                this.optionsOn = false
                this.fightOn = true
                this.menu = "1";
            }
            else if (option.split("/")[0] == "1") { // Move -> Use Move
                this.useMove(this.userChar.allMoves()[option.split("/")[1]], this.userChar, this.oppoChar);
            }
            else if (option == "0/1") { // Menu -> Switch Character
                setTimeout(() => {
                    this.addToLog("What will " + this.userChar.name + " do?")
                }, 2000);

                this.addToLog("You're our only hope " + this.userChar.name + "!")
            }
            else if (option == "0/2") { // Menu -> Item
                setTimeout(() => {
                    this.addToLog("What will " + this.userChar.name + " do?")
                }, 2000);
                this.addToLog("Coming soon!")
            }
            else if (option == "0/3") { // Menu -> Run
                setTimeout(() => {
                    this.addToLog("What will " + this.userChar.name + " do?")
                }, 2000);
                this.addToLog("You can't escape!")
            }
            this.updateButtons(); // Update the buttons for the new menu that you just entered (if applicable)
        },
        randRange: function(range) { // Generate a random number within a range (e.g. entering 1 will return a number from -1 to 1)
            return Math.random() * range * 2 - range;
        },
        randChance: function(chance) { // Generate a random number between 0 and 1 and return whether it's less than the chance
            return Math.random() < chance;
        },
        decToPer: function(decimal) { // Convert a decimal to a percentage rounded to 2 decimal points e.g (0.5 -> 50.00%)
            return Math.round(decimal * 10000) / 100 + "%";
        },
        applyEffect: function(effect, user, target) { // Apply an effect to a target
            var targetArr = []

            // Get the target(s) of the effect and add them to the target array
            if (effect.target === "user") {
                targetArr.push(user);
            }
            else if (effect.target === "target") {
                targetArr.push(target);
            }
            else if (effect.target === "all") {
                targetArr = this.userTeam.concat(this.oppoTeam);
            }
            else if (effect.target === "all but user") {
                targetArr = this.userTeam.concat(this.oppoTeam).filter(char => char != user);
            }
            else if (effect.target === "all but target") {
                targetArr = this.userTeam.concat(this.oppoTeam).filter(char => char != target);
            }
            else if (effect.target === "all allies") {
                targetArr = this.userTeam;
            }
            else if (effect.target === "all allies but user") {
                targetArr = this.userTeam.filter(char => char != user);
            }
            else if (effect.target === "all enemies") {
                targetArr = this.oppoTeam;
            }

            //loop through all targets to apply the effects
            for (var i = 0; i < targetArr.length; i++) {
                var targetChar = targetArr[i];
                var targetStats = this.statChanges(targetChar, "sum"); // The stats of the target
        
                // First calculates if the user misses the target
                var hitChance = effect.effectiveness + this.randRange(effect.effectivenessVar); // Calculates the chance that the user would hit the target
                var dodgeChance = targetStats[effect.type].dodge + this.randRange(targetStats[effect.type].dodgeVar); // Calculates the chance that the target would dodge the user's attack

                if (!this.randChance(hitChance)) { // If the user misses the target, then the effect is not applied
                    this.addToLog("... but " + user.name + " missed!");
                    return false;
                }
                else if (this.randChance(dodgeChance)) { // If the target dodges/resists the attack, then the effect is not applied
                    this.addToLog("... but " + targetChar.name + " dodged!");
                    return false;
                }
        
                // Calculates the strength of the effect and applies it to the target
                var strength = effect.strength + this.randRange(effect.strengthVar); // Calculates the strength of the effect
                var strengthAbsorbed = targetStats[effect.type].absorb + this.randRange(targetStats[effect.type].absorbVar); // Calculates the amount of the effect that is absorbed by the target

                // If the effect is negative then add strengthAbsorbed to the strength of the effect
                // If the effect is positive then subtract strengthAbsorbed from the strength of the effect
                if (effect.strength < 0) {
                    strength += strengthAbsorbed;
                }
                else if (effect.strength > 0) {
                    strength -= strengthAbsorbed;
                }

                // Applies the effect to the target
                if (effect.stat == "health") { // If the effect is a health effect
                    if (strength > 0) { // Positive health effects
                        targetChar.health += strength
                        if (targetChar.health > targetChar.maxHealth) {
                            targetChar.health = targetChar.maxHealth;
                            this.addToLog("... and " + targetChar.name + " was fully healed!");
                        }
                        else {
                            this.addToLog("... and " + targetChar.name + " gained " + this.decToPer(Math.abs(strength)) + " health!");
                        }
                    }
                    else if (strength < 0) { // Negative health effects
                        targetChar.health += strength;
                        if (targetChar.health < 0) {
                            targetChar.health = 0;
                            this.addToLog("... and " + targetChar.name + " was killed!");
                        }
                        else {
                            this.addToLog("... and " + targetChar.name + " lost " + this.decToPer(Math.abs(strength)) + " health!");
                        }
                    }
                    else if (effect.target !== "user") { // Neutral health effects
                        this.addToLog("... but it had no effect!");
                    }
                }
                else { // If the effect changes the stats of the target (e.g. a potion of strength would increase the physical strength stat of the target)
                    var change = (strength > 0) ? "increased" : "decreased"; // Determines whether the stat is increased or decreased
                    if (strength !== 0) { // If the effect will actually change the stat
                        if (effect.duration > 0) { // Add the effect (stat, strength and charge) to the target's effects if duration > 0
                            targetChar.effects.push({
                                name: effect.name,
                                type: effect.type,
                                stat: effect.stat,
                                duration: effect.duration,
                                strength: effect.strength,
                                strengthVar: effect.strengthVar
                            });
                        }
                        // Second word of effect stat will come before the first
                        this.addToLog("... and " + targetChar.name + "'s ability to " + effect.stat.split(" ")[1] + " " + effect.stat.split(" ")[0] + " damage will be " + change + " by " + this.decToPer(Math.abs(strength)) + " for the next " + effect.duration + " turns!");
                    }
                    else { // If the effect will not change the stat
                        this.addToLog("... but it had no effect!");
                    }
                }
            }
        
            return true; // Returns true if the effect was successful (so any effects that rely on this effect succeeding can be applied)
        },
        preBattle: function(team) { // Apply active effects and health regen between turns
            team.forEach(member => { // Loop through all members of the team
                var stats = this.statChanges(member, "sum"); // The stats of the member

                // Calculate the regen factor for the character (using effects)
                var regenFactor = member.healthRegen + this.randRange(member.healthRegenVar) + member.effects.reduce((acc, cur) => {
                    if (cur.stat == ["health", "regen"]) {
                        return acc + cur.strength + this.randRange(cur.strengthVar);
                    }
                }, 0);
        
                // Apply the regen if positive
                if (regenFactor > 0) {
                    member.health += regenFactor;
                    if (member.health > member.maxHealth) {
                        member.health = member.maxHealth;
                        this.addToLog(member.name + " regained full health!");
                    }
                    else {
                        this.addToLog(member.name + " regenerated " + this.decToPer(regenFactor) + " health!");
                    }
                }
        
                // Loop through all the active effects on the character
                member.effects.forEach(effect => {
                    // Apply the effects that change health
                    if (effect.stat == "health") {
                        // Calculate the effectiveness
                        var effectiveness = effect.effectiveness + this.randRange(effect.effectivenessVar) - [effect.type].dodge - this.randRange([effect.type].dodgeVar);
        
                        if (!chance(effectiveness)) { // If the effect fails to apply then it will not be applied
                            this.addToLog(member.name + " resisted the " + effect.name + " effect!");
                            return
                        }

                        // Calculate the strength of the effect (how much to change the health by)
                        member.health += effect.strength + this.randRange(effect.strengthVar) - [effect.type].absorb - this.randRange([effect.type].absorbVar);
                        if (effect.strength > 0) { // If the effect is positive (healing)
                            if (member.health > member.maxHealth) { // Runs if they have been fully healed
                                member.health = member.maxHealth;
                                this.addToLog(member.name + " was fully healed!");
                            }
                            else { // Runs if they have been partially healed
                                this.addToLog(member.name + " gained " + this.decToPer(Math.abs(effect.strength)) + " health!");
                            }
                        }
                        else if (effect.strength < 0) { // If the effect is negative (take damage)
                            if (member.health < 0) { // Runs if they have been killed
                                member.health = 0;
                                this.addToLog(member.name + " was killed!");
                            }
                            else { // Runs if they have taken damage
                                this.addToLog(member.name + " lost " + this.decToPer(Math.abs(effect.strength)) + " health!");
                            }
                        }
                    }
        
                    // Change the charge of the effect, and remove the effect if it is finished
                    effect.charge--;
                    if (effect.charge <= 0) {
                        this.addToLog(member.name + "'s " + effect.name + " effect has finished!");
                        member.effects.splice(member.effects.indexOf(effect), 1);
                    }
                })
        
                // Loop through all the moves of the character (moves and the moves of their items)
                // This changes the charge/cooldown of any recharging moves
                var moves = member.moves.concat(member.items.map(item => item.moves));
                moves.forEach(move => {
                    // Change the charge of the move if it's not 0
                    move.charge -= (move.charge > 0) ? 1 : 0;
                })
            })
        },
        healthColor: function(decimal) { // Returns a color based on the decimal value of the health given
            // Colors will be mixed depending on the percent of health
            // 1 (100%) = green (#008A0E)
            // 0.8 (80%) = lime (#7EAC11)
            // 0.6 (60%) = yellow (#FCCE14)
            // 0.4 (40%) = orange (#CC4E00)
            // 0.2 (20%) = red (#E81313)
            // 0 (0%) = black (#000000)

            // E.G healthColor(1) = #008A0E (100% green)
            // E.G healthColor(0.9) =    #3f9b10 (50% green + 50% lime)
            // E.G healthColor(0.8) = #7EAC11 (100% lime)

            var ceilColor = "" // The first color to be mixed
            var ratio = 0 // How much of the first color to mix with the second color (Second will be 1 - ratio)
            var floorColor = "" // The second color to be mixed

            if (decimal == 1) { // If the health is 100% (full health)
                ceilColor = "#008A0E";
                floorColor = "#008A0E";
                ratio = 0.5; // Will mix black with itself, so it will just be black
            }
            else if (decimal >= 0.8) { // If the health is between 80% and 100%
                ceilColor = "#008A0E";
                floorColor = "#7EAC11";
                ratio = (decimal - 0.8) / 0.2; // Will mix so that the color transitions from green to lime as the health goes from 100% to 80%
            }
            else if (decimal >= 0.6) { // If the health is between 60% and 80%
                ceilColor = "#7EAC11";
                floorColor = "#FCCE14";
                ratio = (decimal - 0.6) / 0.2; // Will mix so that the color transitions from lime to yellow as the health goes from 80% to 60%
            }
            else if (decimal >= 0.4) {
                ceilColor = "#FCCE14";
                floorColor = "#CC4E00";
                ratio = (decimal - 0.4) / 0.2; // Will mix so that the color transitions from yellow to orange as the health goes from 60% to 40%
            }
            else if (decimal >= 0.2) { // If the health is between 20% and 40%
                ceilColor = "#CC4E00";
                floorColor = "#E81313";
                ratio = (decimal - 0.2) / 0.2; // Will mix so that the color transitions from orange to red as the health goes from 40% to 20%
            }
            else if (decimal >= 0) { // If the health is between 0% and 20%
                ceilColor = "#E81313";
                floorColor = "#000000";
                ratio = (decimal) / 0.2; // Will mix so that the color transitions from red to black as the health goes from 20% to 0%
            }
            else { // If the health is 0% (dead)
                ceilColor = "#000000";
                floorColor = "#000000";
                ratio = 0.5; // Will mix black with itself, so it will just be black
            }

            // Mix the colors using the ratio provided

            // Converts each hex value to an integer, adds them together using the ratio
            var red = parseInt(ceilColor.substring(1, 3), 16) * ratio + parseInt(floorColor.substring(1, 3), 16) * (1 - ratio);
            var green = parseInt(ceilColor.substring(3, 5), 16) * ratio + parseInt(floorColor.substring(3, 5), 16) * (1 - ratio);
            var blue = parseInt(ceilColor.substring(5, 7), 16) * ratio + parseInt(floorColor.substring(5, 7), 16) * (1 - ratio);

            // Converts the integers back to hex values (capatilized)
            red = Math.round(red).toString(16).toUpperCase();
            green = Math.round(green).toString(16).toUpperCase();
            blue = Math.round(blue).toString(16).toUpperCase();

            // Fixes the hex values that are only one character long (e.g. 0 instead of 00 or 9 instead of 09)
            // Adds the RGB values together with the # in front to make a hex color
            return "#" + (red.length == 1 ? "0" + red : red) + (green.length == 1 ? "0" + green : green) + (blue.length == 1 ? "0" + blue : blue);
        },   
        statChanges: function(char, type = "sum") { // Calculates changes to the character's stats based on the all active effects
            var changes = { // Will store the changes to the stats, starts with each stat at 0
                physical: {
                    dodge: 0,
                    dodgeVar: 0,
                    absorb: 0,
                    absorbVar: 0
                },
                electric: {
                    dodge: 0,
                    dodgeVar: 0,
                    absorb: 0,
                    absorbVar: 0
                },
                fire: {
                    dodge: 0,
                    dodgeVar: 0,
                    absorb: 0,
                    absorbVar: 0
                },
                mental: {
                    dodge: 0,
                    dodgeVar: 0,
                    absorb: 0,
                    absorbVar: 0
                },
                poison: {
                    dodge: 0,
                    dodgeVar: 0,
                    absorb: 0,
                    absorbVar: 0
                },
                projectile: {
                    dodge: 0,
                    dodgeVar: 0,
                    absorb: 0,
                    absorbVar: 0
                }
            };
            
            // Get all the effects that are active on the character (including the effects on them through items)
            var effects = char.effects
            char.items.filter(item => effects.concat(item.effects))

            // Loop through each effect
            effects.forEach(effect => {
                // If the effect changes their stats (contains the word "dodge", "dodgeVar", "absorb", or "absorbVar")
                if (effect.stat.includes("dodge") || effect.stat.includes("absorb")) {
                    // Calculate the change to the stat (strength)
                    var strength = effect.strength + this.randRange(effect.strengthVar);

                    // Get the type and stat to change
                    var type = effect.stat.split(" ")[0];
                    var stat = effect.stat.split(" ")[1];

                    // Apply the change to the stat
                    changes[type][stat] += strength;
                }
            });

            // Converts the data into the format chosen
            if (type == "sum") { // If the type is sum, return the stats + the changes
                // Creates an object with the values in char.stats + the values in changes
                return Object.assign({}, char.stats, changes);
            }
            else if (type == "changes") { // Returns the changes, not the stats + the changes
                return changes;
            }
            else if (type == "both") { // Returns both the sum of stats + changes and the changes alone
                return {
                    sum: Object.assign({}, char.stats, changes),
                    changes: changes
                };
            }
        },
        effectChanges: function(char, type = "sum") { // Calculates changes to the character's effects based on the all active effects
            var changes = { // Will store the changes to the effects, starts with each stat at 0
                physical: {
                    duration: 0,
                    strength: 0,
                    strengthVar: 0,
                    effectiveness: 0,
                    effectivenessVar: 0
                },
                electric: {
                    duration: 0,
                    strength: 0,
                    strengthVar: 0,
                    effectiveness: 0,
                    effectivenessVar: 0
                },
                fire: {
                    duration: 0,
                    strength: 0,
                    strengthVar: 0,
                    effectiveness: 0,
                    effectivenessVar: 0
                },
                mental: {
                    duration: 0,
                    strength: 0,
                    strengthVar: 0,
                    effectiveness: 0,
                    effectivenessVar: 0
                },
                poison: {
                    duration: 0,
                    strength: 0,
                    strengthVar: 0,
                    effectiveness: 0,
                    effectivenessVar: 0
                },
                projectile: {
                    duration: 0,
                    strength: 0,
                    strengthVar: 0,
                    effectiveness: 0,
                    effectivenessVar: 0
                }
            }
            
            // Get all the effects that are active on the character (including the effects on them through items)
            var effects = char.effects.concat(char.items.map(item => item.effects));

            // Loop through each effect
            effects.forEach(effect => {
                // If the effect changes their effects (contains the word "duration", "strength", "strengthVar", "effectiveness", or "effectivenessVar")
                if (effect.stat.includes("duration") || effect.stat.includes("strength") || effect.stat.includes("effectiveness")) {
                    // Calculate the change to the stat (strength)
                    var strength = effect.strength + this.randRange(effect.strengthVar);
                    
                    // Get the type and stat to change
                    var type = effect.stat.split(" ")[0];
                    var stat = effect.stat.split(" ")[1];

                    // Apply the change to the stat
                    changes[type][stat] += strength;
                }
            })

        }
    },
    created: function() { // Runs when the app is created
        // Updates the menu instantly
        this.updateButtons();
        window.addEventListener("resize", function() {
            // When the window is resized, update the menu
            this.updateButtons();
            this.page = 0;
        }.bind(this));
    }
}

window.onload = function() {
    // Tries to create the app
    try {
        new Vue(appdata)
        document.title = "Battle: " + settings.userName + " vs " + settings.oppoName + " (Supe Game)";
    }
    catch (err) {
        console.log(err);
    }
}

// Exports the appdata so it can be used in other files (for testing)
export var appdata;