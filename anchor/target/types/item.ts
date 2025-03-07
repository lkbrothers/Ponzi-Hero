/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/item.json`.
 */
export type Item = {
  "address": "4M2MAXqYYw9Qwek5WwzttegotU4sajWQrcmEfx8LZfga",
  "metadata": {
    "name": "item",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createItemAccount",
      "discriminator": [
        31,
        93,
        216,
        237,
        33,
        86,
        161,
        61
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "itemAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "grade",
          "type": "string"
        },
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        },
        {
          "name": "part",
          "type": "string"
        },
        {
          "name": "equipped",
          "type": "bool"
        }
      ]
    },
    {
      "name": "deleteItemAccount",
      "discriminator": [
        193,
        151,
        83,
        151,
        234,
        9,
        9,
        9
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "itemAccount"
          ]
        },
        {
          "name": "itemAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "randomMintItem",
      "discriminator": [
        130,
        208,
        110,
        79,
        102,
        133,
        121,
        128
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "itemAccount",
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
          "name": "gameProgram"
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
        },
        {
          "name": "dummyTxHash",
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
    },
    {
      "name": "updateItemAccount",
      "discriminator": [
        193,
        246,
        99,
        158,
        71,
        166,
        127,
        216
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "itemAccount"
          ]
        },
        {
          "name": "itemAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "grade",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "name",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "uri",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "part",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "equipped",
          "type": {
            "option": "bool"
          }
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
      "name": "dBaccount",
      "discriminator": [
        207,
        58,
        197,
        98,
        85,
        208,
        80,
        178
      ]
    },
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
      "name": "invalidGachaType",
      "msg": "Invalid Gacha Type Determined."
    },
    {
      "code": 6001,
      "name": "invalidItemGrade",
      "msg": "Invalid Item Grade Determined."
    }
  ],
  "types": [
    {
      "name": "codeAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "seed1",
            "type": "u64"
          },
          {
            "name": "seed2",
            "type": "u64"
          },
          {
            "name": "beforeTx",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "dBaccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "tailTx",
            "type": "string"
          },
          {
            "name": "counter",
            "type": "u64"
          }
        ]
      }
    },
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
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          },
          {
            "name": "part",
            "type": "string"
          },
          {
            "name": "equipped",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
