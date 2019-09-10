module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
    },
    "extends": [
        "eslint:recommended",
        "plugin:jsdoc/recommended",
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly",
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module",
    },
    "rules": {
        "jsdoc/no-undefined-types": [
            "warn",
            {
                "definedTypes": [
                    "Bullet",
                    "Entity",
                    "Goody",
                    "Bounds",
                    "Sprite"
                ]
            }
        ]
    },
    "plugins": [
        "jsdoc"
    ],
    "settings": {
        "jsdoc": {
            "tagNamePreference": {
                "class": "constructor",
                "augments": "extends"
            }
        }
    }
};
