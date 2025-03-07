/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/gacha.json`.
 */
export type Gacha = {
  "address": "B5jvU8fizMd4cPo8xBg3MMVLGKggB8Q5b5KjoUkDR3bJ",
  "metadata": {
    "name": "gacha",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "mintItem",
      "discriminator": [
        22,
        168,
        67,
        95,
        238,
        168,
        162,
        191
      ],
      "accounts": [
        {
          "name": "itemAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "recentBlockhashes",
          "address": "SysvarRecentB1ockHashes11111111111111111111"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "gachaType",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "itemAccount",
      "discriminator": [
        203,
        112,
        16,
        182,
        215,
        183,
        63,
        175
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidItemGrade",
      "msg": "Invalid Item Grade Determined."
    },
    {
      "code": 6001,
      "name": "invalidGachaType",
      "msg": "Invalid Gacha Type Determined."
    }
  ],
  "types": [
    {
      "name": "itemAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "grade",
            "type": "string"
          },
          {
            "name": "image",
            "type": "string"
          }
        ]
      }
    }
  ]
};
