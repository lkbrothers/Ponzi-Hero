/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/game.json`.
 */
export type Game = {
  "address": "37Z9j1LjgPRHLnB3S3cTL7t4mCSsnWmrtUJj5u9eSBQi",
  "metadata": {
    "name": "game",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "dummyTx",
      "discriminator": [
        236,
        227,
        95,
        171,
        32,
        207,
        219,
        219
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "dbAccount",
          "writable": true
        },
        {
          "name": "codeAccount",
          "writable": true
        },
        {
          "name": "codeInProgram",
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "transferProgram",
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "timestamp",
          "type": "u64"
        }
      ]
    },
    {
      "name": "initializeGame",
      "discriminator": [
        44,
        62,
        102,
        247,
        126,
        208,
        130,
        215
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "dbAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              }
            ]
          }
        },
        {
          "name": "codeInProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "playGame",
      "discriminator": [
        37,
        88,
        207,
        85,
        42,
        144,
        122,
        197
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "dbAccount",
          "writable": true
        },
        {
          "name": "codeAccount",
          "writable": true
        },
        {
          "name": "codeInProgram",
          "docs": [
            "CHECK"
          ]
        },
        {
          "name": "transferProgram",
          "docs": [
            "CHECK"
          ]
        }
      ],
      "args": [
        {
          "name": "dummyTx",
          "type": "string"
        },
        {
          "name": "blockHash",
          "type": "string"
        },
        {
          "name": "slot",
          "type": "u64"
        },
        {
          "name": "blockTime",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "codeAccount",
      "discriminator": [
        65,
        67,
        94,
        253,
        193,
        120,
        172,
        223
      ]
    },
    {
      "name": "dbAccount",
      "discriminator": [
        91,
        119,
        194,
        92,
        234,
        59,
        240,
        195
      ]
    }
  ],
  "types": [
    {
      "name": "codeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "randomNumber",
            "type": "u8"
          },
          {
            "name": "beforeTx",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "dbAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "user",
            "type": "pubkey"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "tailTx",
            "type": "string"
          }
        ]
      }
    }
  ]
};
