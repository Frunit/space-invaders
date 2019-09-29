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
        "resources": "readonly"
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
        ],
        "jsdoc/require-jsdoc": [
            "error", {
                "require":{
                    "ClassDeclaration": true,
                    "ClassExpression": true,
                    "FunctionDeclaration": true,
                    "FunctionExpression": true,
                    "MethodDefinition": true
                }
            }
        ],
        "semi": ["error", "always"],
        "eqeqeq": "error",
        "block-scoped-var": "error",
        "consistent-return": "error",
        "no-eq-null": "error",
        "no-implicit-globals": "error",
        "no-implied-eval": "error",
        "no-self-compare": "error",
        "no-unused-expressions": "error",
        "curly": "error",
        "max-len": ["error", {"code": 100, "ignoreComments": true}],
        "max-lines-per-function": ["error", {"max": 90}]
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
