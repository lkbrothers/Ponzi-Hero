/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/credit.json`.
 */
export type Credit = {
  "address": "H1kXTuAJntnCELS2phbS7bMcD4VYy5CQK3wKFC9BMgfL",
  "metadata": {
    "name": "credit",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createCreditAccount",
      "discriminator": [
        254,
        166,
        237,
        170,
        145,
        60,
        170,
        95
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "creditAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  100,
                  105,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "owner"
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
          "name": "initialBalance",
          "type": "u64"
        }
      ]
    },
    {
      "name": "decreaseCreditAccount",
      "discriminator": [
        115,
        222,
        28,
        153,
        179,
        50,
        98,
        174
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "creditAccount"
          ]
        },
        {
          "name": "creditAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "deleteCreditAccount",
      "discriminator": [
        134,
        219,
        218,
        72,
        148,
        17,
        5,
        242
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "creditAccount"
          ]
        },
        {
          "name": "creditAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "increaseCreditAccount",
      "discriminator": [
        185,
        215,
        244,
        94,
        11,
        44,
        180,
        74
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "creditAccount"
          ]
        },
        {
          "name": "creditAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "updateCreditAccount",
      "discriminator": [
        21,
        66,
        166,
        247,
        121,
        222,
        121,
        183
      ],
      "accounts": [
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "creditAccount"
          ]
        },
        {
          "name": "creditAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "updateBalance",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "creditAccount",
      "discriminator": [
        196,
        171,
        234,
        132,
        239,
        255,
        21,
        96
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "overflow",
      "msg": "[ERROR] Overflow occurred: 잔액이 허용 범위를 초과합니다."
    },
    {
      "code": 6001,
      "name": "underflow",
      "msg": "[ERROR] Underflow occurred: 잔액은 0보다 작아질 수 없습니다."
    }
  ],
  "types": [
    {
      "name": "creditAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "balance",
            "type": "u64"
          }
        ]
      }
    }
  ]
};
