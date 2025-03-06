/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/code_in.json`.
 */
export type CodeIn = {
  "address": "4Sz8xKjDR3tmb24HhMJjLYcLH2B6pmNPcbTUeYwYubUk",
  "metadata": {
    "name": "codeIn",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createCodeAccount",
      "discriminator": [
        255,
        87,
        132,
        46,
        195,
        66,
        147,
        170
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "codeAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
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
      "name": "createDbAccount",
      "discriminator": [
        123,
        206,
        170,
        23,
        96,
        135,
        187,
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "updateCodeAccount",
      "discriminator": [
        153,
        202,
        209,
        138,
        111,
        1,
        86,
        54
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "codeAccount"
          ]
        },
        {
          "name": "codeAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "randomNumber",
          "type": "u8"
        },
        {
          "name": "beforeTx",
          "type": "string"
        }
      ]
    },
    {
      "name": "updateDbAccount",
      "discriminator": [
        62,
        87,
        1,
        174,
        35,
        103,
        140,
        235
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true,
          "relations": [
            "dbAccount"
          ]
        },
        {
          "name": "dbAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "tailTx",
          "type": "string"
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
