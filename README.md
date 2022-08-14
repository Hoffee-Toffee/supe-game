# supe-game

Turn based fighting game loosely inspired by Pokémon battles

## Design Goals

First Release Goals:

* Runs in the browser
* Simple and intuitive interface
* More intricate effect types
* Player can fight a computer opponent (randomized moves)
* Player can fight a local opponent (same device)
* Game mode where you play 'one move per turn'

Second Release Goals:

* Game mode where each team member plays one move per turn
* Game mode where each player controls one team member (instead of controlling the whole team)
* Online multiplayer
* Simple AI opponents
* Customizable characters, moves and items

Third Release Goals:

* Tournament mode
* More complex AI opponents
* Customizable effects

### Character Class

    - The character class is the base class for all characters.
    - It contains the following basic variables:
        - name: the name of the character (string, required) e.g. "Data"
        - desc: the description of the character (string, required) e.g. "An android created by Dr. Noonian Soong, crew member of the starship Enterprise"
        - health: the current health points of the character (float, required) e.g. 1
        - maxHealth: the maximum health points the character can have (float, required) e.g. 1
        - healthRegen: the amount of health points the character regenerates per turn (float, required) e.g. 0.01

    - The character class contains a stats object containing the dodge and absorb stats for each effect type.
        - stats: the dodging and absorbing stats of the character for each attack type (object, required)
            - physical: the dodging and absorbing stats for physical attacks (object, required)
                - dodge: chance to dodge an attack (float, required) e.g. 0.1
                - dodgeVar: variance in the chance to dodge an attack (float, required) e.g. 0.1
                - absorb: how much damage is absorbed by the character (float, required) e.g. 0.1
                - absorbVar: variance in the amount of damage absorbed by the character (float, required) e.g. 0.1
            - electric:
                - ...
            - fire:
                - ...
            - mental:
                - ...
            - poison:
                - ...
            - projectile:
                - ...

    - The character class contains a set of moves the character can inheritly use.
        - moves: the moves the character can use (array, required)
            - move: the move the character can use (object, required)
                - name: the name of the move (string, required) e.g. "Punch"
                - desc: the description of the move (string, required) e.g. "A basic punch attack"
                - recharge: how many turns before the move can be used again (int, required) e.g. 1
                - charge: used to show how far through the cooldown the move is (int, required) e.g. 0
                - target: the types of targets the move can be used on (array, required) e.g. ["enemy", "ally", "self", "enemy team", "ally team", "all"]

            - Each move contains a set of effects the move applies.
            - Moves are applied to the target and can be positive or negative.
                - effects: an array of effects the move applies (array, required)
                    - effect: the effect the move applies (object, required)
                        - name: the name of the effect (string, required) e.g. "Hit Damage"
                        - type: the type of effect (string, required) e.g. "physical"
                        - target: the target of the effect (string, required) e.g. "target" (Used if the effect can backfire)
                        - required: whether the move stops if the effect is not applied (boolean, required) e.g. true
                        - stat: the stat the effect affects (string) e.g. "health"
                        - duration: how many turns the effect lasts (int, required) e.g. 1
                        - strength: how much the effect will change the stat by on average (float, required) e.g. 0.1
                        - strengthVar: variance in the strength of the effect (float, required) e.g. 0.1
                        - effectiveness: the chance that the effect will be applied (float, required) e.g. 0.5
                        - effectivenessVar: variance in the effectiveness of the effect (float, required) e.g. 0.1

    - The character class contains a set of items the user has.
        - items: the items the character has (array, required)
            - item: the item the character has (object, required)
                - name: the name of the item (string, required) e.g. "Healing Potion"
                - desc: the description of the item (string, required) e.g. "A potion that gives the user an additional 10% health"
                - health: how much the item can impact before the item is used up or breaks (float, required) e.g. 0.1
                - moves: the moves that the item has (array, required)
                    - ...
                - effects: the effects the item has on the wielder (array, required)
                - e.g. armor will increase damage absorbtion, decrease dodge chance and decrease effect effectiveness
                    - ...


    - The character class contains a set of active effects on the user
        - effects: the active effects on the user (array, required)
            - effect: the effect the user has (object, required)
            - e.g. poison will reduce health points every turn until the effect is removed or the poison disipates
                - ...

    - The character class contains a set of methods
        - runEffects: applies all active effects to the character for this turn
        - e.g. character regenerates health
        - e.g. poison reduces health points every turn
        - effects under items are included

        - statChange: calculates changes to the character's stats based on the effects on the character
        - e.g. armor increases damage absorbtion, decrease dodge chance and decrease effect effectiveness
        - e.g. a strength potion increases the effectiveness of physical effects

        - allMoves: returns all moves the character can use
        - only moves with charge, moves under items are included

### Turn Logic

How a turn plays out:

    - Each team member's current effects are applied to them
    - The player selects a move and a target
    - The move's effects are looped through
        - Calculate if the effect misses
        - Calculate if the effect is dodged
        - Calculate the effect's strength
        - Apply the effect to the target
        - If the effect is unsuccessful and later effects rely on it being successful, then further effects are skipped 
    - If the move has a cooldown, the charge is set to the recharge value
    - The turn ends
    - Depending on the game mode, the next team member's turn begins or the enemy team's turn begins

### Game Modes

    - One Move Per Team (You can use one move per turn)
    - One Move Per Character (Each character uses one move per turn)
    - One Move Per Player (Each player controls one character and picks one move per turn)
    - Basic Tournament ('One Move Per Team' games are played in rounds)
    - Team Tournament ('One Move Per Character' games are played in rounds)
    - Solo Tournament ('One Move Per Player' games are played in rounds)
    - Ultimate Tournament (Teams and Individual players play against each other in rounds)
