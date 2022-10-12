// CHARACTER, MOVE, ITEM AND EFFECT DATA USED FOR THE DEMO
// WILL BE REPLACED BY THE DATA FROM THE SERVER IN THE FUTURE

class Character {
    // name: the name of the character (string, required) e.g. "Data"
    constructor(
        name,
        desc,
        health = 1,
        maxHealth = 1,
        healthRegen = 0.01,
        healthRegenVar = 0.01,
        stats = {
            physical: { dodge: 0.1, dodgeVar: 0.1, absorb: 0.1, absorbVar: 0.1 },
            electric: { dodge: 0.1, dodgeVar: 0.1, absorb: 0.1, absorbVar: 0.1 },
            fire: { dodge: 0.1, dodgeVar: 0.1, absorb: 0.1, absorbVar: 0.1 },
            mental: { dodge: 0.1, dodgeVar: 0.1, absorb: 0.1, absorbVar: 0.1 },
            poison: { dodge: 0.1, dodgeVar: 0.1, absorb: 0.1, absorbVar: 0.1 },
            projectile: { dodge: 0.1, dodgeVar: 0.1, absorb: 0.1, absorbVar: 0.1 },
        },
        moves = [],
        items = [],
        effects = []
    ) {
        this.name = name; // The name of the character
        this.desc = desc; // The description of the character
        this.health = health; // The current health points of the character
        this.maxHealth = maxHealth; // The maximum health points the character can have
        this.healthRegen = healthRegen; // The amount of health points the character regenerates per turn
        this.healthRegenVar = healthRegenVar; // The variance in the amount of health points the character regenerates per turn
        this.stats = stats; // The stats of the character
        this.moves = moves; // The moves the character can use
        this.items = items; // The items the character has
        this.effects = effects; // The active effects on the character
    }

    allMoves() {
        let allMoves = this.moves;
        this.items
            .filter((item) => item.moves)
            .forEach((item) => (allMoves = allMoves.concat(item.moves)));
        return allMoves;
    }
}

class Move {
    constructor(
        name,
        desc,
        charge = 0,
        recharge = 0,
        target = ["enemy"],
        effects = []
    ) {
        this.name = name; // The name of the move
        this.desc = desc; // The description of the move
        this.charge = charge; // The current charge of the move
        this.recharge = recharge; // How many moves it takes to recharge the move
        this.target = target; // The target of the move
        this.effects = effects; // The effects of the move
    }
}

class Item {
    constructor(name, desc, health = null, moves = [], effects = []) {
        this.name = name; // The name of the item
        this.desc = desc; // The description of the item
        this.health = health; // How much impact this item can have before it is consumed/broken
        this.moves = moves; // The moves the item can use
        this.effects = effects; // The effects this item grants to the wearer/wielder
    }
}

class Effect {
    constructor(
        name,
        type,
        target = "target",
        required = false,
        stat = "health",
        duration = 0,
        strength,
        strengthVar,
        effectiveness,
        effectivenessVar
    ) {
        this.name = name; // The name of the effect
        this.type = type; // The type of the effect
        this.target = target; // Who the effect affects to (The target of the effect or the caster; for backfire effects)
        this.required = required; // Whether the effect must apply for the further effects to run
        this.stat = stat; // What the effect changes
        this.duration = duration; // How many turns the effect lasts (anything above 0 means the effect will be added to the effects array for the target)
        this.strength = strength; // How much the stat will be changed by (on average)
        this.strengthVar = strengthVar; // Variance in the strength of the effect
        this.effectiveness = effectiveness; // How likely it is that the effect will be applied
        this.effectivenessVar = effectivenessVar; // Variance in the effectiveness of the effect
    }
}

export var characters = [
    new Character(
        "Cerebrum",
        "A superhero with distinct mental abilities.",
        1,
        1,
        0.01,
        0.01,
        {
            physical: {
                dodge: 0.1,
                dodgeVar: 0.1,
                absorb: 0.1,
                absorbVar: 0.1,
            },
            electric: {
                dodge: 0.01,
                dodgeVar: 0,
                absorb: 0.01,
                absorbVar: 0.01,
            },
            fire: {
                dodge: 0.25,
                dodgeVar: 0.05,
                absorb: 0.1,
                absorbVar: 0.05,
            },
            mental: {
                dodge: 1,
                dodgeVar: 0,
                absorb: 0,
                absorbVar: 0,
            },
            poison: {
                dodge: 0.1,
                dodgeVar: 0.1,
                absorb: 0.1,
                absorbVar: 0.1,
            },
            projectile: {
                dodge: 0.1,
                dodgeVar: 0.1,
                absorb: 0.1,
                absorbVar: 0.1,
            },
        },
        [
            new Move(
                "Punch",
                "A basic punch.",
                0,
                0,
                ["enemy"],
                [
                    new Effect(
                        "Hit Target",
                        "physical",
                        "target",
                        true,
                        "health",
                        0,
                        -0.05,
                        0.01,
                        0.9,
                        0.1
                    ),
                    new Effect(
                        "Backfire",
                        "physical",
                        "user",
                        false,
                        "health",
                        0,
                        -0.001,
                        0.001,
                        1,
                        0
                    ),
                ]
            ),
            new Move(
                "Brain Freeze",
                "Slows down the neurons in the target's brain, thereby reducing their reaction speed.",
                0,
                10,
                ["enemy"],
                [
                    new Effect(
                        "Access Brain",
                        "mental",
                        "target",
                        true,
                        null,
                        0,
                        0,
                        0,
                        0.9,
                        0.1
                    ),
                    new Effect(
                        "Decreases dodging of physical effects",
                        "mental",
                        "target",
                        false,
                        "physical dodge",
                        5,
                        -0.25,
                        0,
                        1,
                        0
                    ),
                    new Effect(
                        "Decreases effectiveness of their physical effects",
                        "mental",
                        "target",
                        false,
                        "physical effectiveness",
                        5,
                        -0.25,
                        0,
                        1,
                        0
                    ),
                ]
            ),
        ],
        [
            new Item("Shield", "A reinforced, shield make of void-metal.", 100, [
                new Move(
                    "Block",
                    "Blocks physical and projectile attacks.",
                    0,
                    0,
                    ["user"],
                    [
                        new Effect(
                            "Increase Physical Dodge",
                            "physical",
                            "user",
                            false,
                            "physical dodge",
                            1,
                            0.3,
                            0,
                            1,
                            0
                        ),
                        new Effect(
                            "Increase Projectile Dodge",
                            "projectile",
                            "user",
                            false,
                            "projectile dodge",
                            1,
                            0.3,
                            0,
                            1,
                            0
                        ),
                        new Effect(
                            "Increase Projectile Absorb",
                            "projectile",
                            "user",
                            false,
                            "projectile absorb",
                            1,
                            0.3,
                            0,
                            1,
                            0
                        ),
                        new Effect(
                            "Increase Physical Absorb",
                            "physical",
                            "user",
                            false,
                            "physical absorb",
                            1,
                            0.3,
                            0,
                            1,
                            0
                        ),
                    ]
                ),
                new Move(
                    "Guaranteed Damage",
                    "Deals damage to the target.",
                    0,
                    0,
                    ["enemy"],
                    [
                        new Effect(
                            "Damage",
                            "stats",
                            "target",
                            false,
                            "health",
                            0,
                            -0.1,
                            0.05,
                            1,
                            0
                        ),
                    ]
                ),
            ]),
        ]
    ),
    new Character(
        "Volantis",
        "An insane supervillain with incredible physical powers.",
        2,
        2,
        0.05,
        0.05,
        {
            physical: {
                dodge: 0.75,
                dodgeVar: 0.25,
                absorb: 0.75,
                absorbVar: 0.25,
            },
            electric: {
                dodge: 0.1,
                dodgeVar: 0,
                absorb: 0.5,
                absorbVar: 0.1,
            },
            fire: {
                dodge: 0.1,
                dodgeVar: 0,
                absorb: 0.5,
                absorbVar: 0.1,
            },
            mental: {
                dodge: 0,
                dodgeVar: 0,
                absorb: 0,
                absorbVar: 0,
            },
            poison: {
                dodge: 0.1,
                dodgeVar: 0.1,
                absorb: 0.1,
                absorbVar: 0.1,
            },
            projectile: {
                dodge: 0.1,
                dodgeVar: 0.1,
                absorb: 0.33,
                absorbVar: 0.1,
            },
        },
        [
            new Move(
                "Phase Shift",
                "Becomes invisible and able to move through walls, mental attacks are all that can work against her while she's phased.",
                0,
                5,
                ["user"],
                [
                    new Effect(
                        "Physical Dodging",
                        "physical",
                        "target",
                        false,
                        "physical dodge",
                        1,
                        1,
                        0,
                        1,
                        0
                    ),
                    new Effect(
                        "Projectile Dodging",
                        "physical",
                        "target",
                        false,
                        "projectile dodge",
                        1,
                        1,
                        0,
                        1,
                        0
                    ),
                    new Effect(
                        "Electric Dodging",
                        "physical",
                        "target",
                        false,
                        "electric dodge",
                        1,
                        1,
                        0,
                        1,
                        0
                    ),
                    new Effect(
                        "Fire Dodging",
                        "physical",
                        "target",
                        false,
                        "fire dodge",
                        1,
                        1,
                        0,
                        1,
                        0
                    ),
                    new Effect(
                        "Poison Dodging",
                        "physical",
                        "target",
                        false,
                        "poison dodge",
                        1,
                        1,
                        0,
                        1,
                        0
                    ),
                ]
            ),
            new Move(
                "Super Punch",
                "A powerful punch that deals physical, electric, and fire damage.",
                0,
                2,
                ["enemy"],
                [
                    new Effect(
                        "Hit Target",
                        "physical",
                        "target",
                        true,
                        "health",
                        0,
                        -0.1,
                        0.05,
                        0.9,
                        0.1
                    ),
                    new Effect(
                        "Electric Damage",
                        "electric",
                        "target",
                        false,
                        "health",
                        0,
                        -0.05,
                        0.05,
                        1,
                        0
                    ),
                    new Effect(
                        "Fire Damage",
                        "fire",
                        "target",
                        false,
                        "health",
                        0,
                        -0.05,
                        0.05,
                        1,
                        0
                    ),
                ]
            ),
            new Move(
                "Energy Blast",
                "A powerful energy blast that deals physical, electric, and fire damage to all characters.",
                5,
                10,
                ["all but user"],
                [
                    new Effect(
                        "Shockwave",
                        "physical",
                        "target",
                        false,
                        "health",
                        0,
                        -0.2,
                        0.1,
                        1,
                        0
                    ),
                    new Effect(
                        "Shrapnel",
                        "projectile",
                        "target",
                        false,
                        "health",
                        0,
                        -0.1,
                        0.1,
                        0.5,
                        0
                    ),
                    new Effect(
                        "Fireball",
                        "fire",
                        "target",
                        false,
                        "health",
                        0,
                        -0.2,
                        0.1,
                        1,
                        0
                    ),
                    new Effect(
                        "Electricity",
                        "electric",
                        "target",
                        false,
                        "health",
                        0,
                        -0.1,
                        0.1,
                        1,
                        0
                    ),
                    new Effect(
                        "Move Toll",
                        "stats",
                        "user",
                        false,
                        "health",
                        0,
                        -0.25,
                        0.25,
                        2,
                        0
                    ),
                ]
            ),
            new Move(
                "Kick of Fire",
                "A powerful kick that deals physical, electric, and fire damage.",
                0,
                5,
                ["enemy"],
                [
                    new Effect(
                        "Hit Target",
                        "physical",
                        "target",
                        true,
                        "health",
                        0,
                        -0.05,
                        0.05,
                        0.9,
                        0.1
                    ),
                    new Effect(
                        "Electric Damage",
                        "electric",
                        "target",
                        false,
                        "health",
                        0,
                        -0.05,
                        0.05,
                        1,
                        0
                    ),
                    new Effect(
                        "Fire Damage",
                        "fire",
                        "target",
                        false,
                        "health",
                        0,
                        -0.05,
                        0.05,
                        1,
                        0
                    ),
                ]
            ),
            new Move(
                "Laser Glare",
                "A powerful beam of light that blinds and burns the target.",
                2,
                5,
                ["enemy"],
                [
                    new Effect(
                        "Burn target",
                        "fire",
                        "target",
                        true,
                        "health",
                        1,
                        -0.1,
                        0.1,
                        0.95,
                        0.05
                    ),
                    new Effect(
                        "Blind target (reduces physical dodge)",
                        "stats",
                        "target",
                        false,
                        "physical dodge",
                        1,
                        -0.5,
                        0.5,
                        0.5,
                        0.5
                    ),
                    new Effect(
                        "Blind target (reduces physical effectiveness)",
                        "stats",
                        "target",
                        false,
                        "physical effectiveness",
                        1,
                        -0.5,
                        0.5,
                        0.5,
                        0.5
                    ),
                    new Effect(
                        "Blind target (reduces projectile dodge)",
                        "stats",
                        "target",
                        false,
                        "projectile dodge",
                        1,
                        -0.5,
                        0.5,
                        0.5,
                        0.5
                    ),
                    new Effect(
                        "Blind target (reduces projectile effectiveness)",
                        "stats",
                        "target",
                        false,
                        "physical dodge",
                        1,
                        -0.5,
                        0.5,
                        0.5,
                        0.5
                    )
                ]
            ),
            new Move(
                "Energy Shield",
                "Creates a shield of energy that protects the user from physical, electric, and fire damage.",
                0,
                3,
                ["user"],
                [
                    new Effect(
                        "Physical Absorption",
                        "physical",
                        "user",
                        false,
                        "physical absorb",
                        1,
                        0.5,
                        0.5,
                        1,
                        0
                    ),
                    new Effect(
                        "Electric Absorption",
                        "electric",
                        "user",
                        false,
                        "electric absorb",
                        1,
                        0.5,
                        0.5,
                        1,
                        0
                    ),
                    new Effect(
                        "Fire Absorption",
                        "fire",
                        "user",
                        false,
                        "fire absorb",
                        1,
                        0.5,
                        0.5,
                        1,
                        0
                    ),
                    new Effect(
                        "Projectile Absorption",
                        "projectile",
                        "user",
                        false,
                        "projectile absorb",
                        1,
                        0.5,
                        0.5,
                        1,
                        0
                    )
                ]
            ),
            new Move(
                "Placeholder 1",
                "A placeholder move.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Placeholder 2",
                "Another placeholder move.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Placeholder 3",
                "Yet another placeholder move.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Placeholder 4",
                "A fourth placeholder move.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Placeholder 5",
                "The sequel to the fourth placeholder move.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Placeholder 6",
                "The end of the placeholder 4-5-6 trilogy.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Placeholder 7",
                "The third to last placeholder move.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Placeholder 8",
                "Almost the last placeholder move.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Placeholder 9",
                "The final placeholder move.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Placeholder 10",
                "Just kidding, this is REALLY the final placeholder move.",
                0,
                0,
                [],
                []
            ),
            new Move(
                "Missingno.",
                "This move is a glitch in the game. It is not supposed to be here.",
                0,
                0,
                ["enemy"],
                [
                    new Effect(
                        "Glitch",
                        "physical",
                        "target",
                        true,
                        "health",
                        0,
                        -0.005,
                        0,
                        1,
                        0
                    )
                ]
            ),
            new Move(
                "Error Loading Move",
                "The game was unable to load this move.",
                0,
                0,
                ["enemy"],
                []
            )
        ],
        []
    ),
];