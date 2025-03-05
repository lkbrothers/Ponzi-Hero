/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/game.json`.
 */
export type Game = {
  "address": "CoatTNmx2psjiC1yq34435qDtbHCLBLcdReJTLqAqrxL",
  "metadata": {
    "name": "game",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "dbCodeIn",
      "discriminator": [
        38,
        100,
        165,
        242,
        99,
        137,
        206,
        108
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "codeTxHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "finalizeGame",
      "discriminator": [
        203,
        227,
        3,
        167,
        186,
        102,
        76,
        10
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
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  115,
                  101,
                  101,
                  100,
                  104,
                  101,
                  114,
                  101
                ]
              },
              {
                "kind": "account",
                "path": "user"
              },
              {
                "kind": "account",
                "path": "db_account.counter",
                "account": "dBaccount"
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
          "name": "remitTxHash",
          "type": "string"
        },
        {
          "name": "blockHash",
          "type": "string"
        }
      ]
    },
    {
      "name": "remitForRandom",
      "discriminator": [
        238,
        111,
        87,
        135,
        161,
        97,
        51,
        115
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
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "userInitialize",
      "discriminator": [
        223,
        157,
        253,
        44,
        62,
        158,
        83,
        137
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
                "kind": "const",
                "value": [
                  100,
                  98,
                  115,
                  101,
                  101,
                  100,
                  104,
                  101,
                  114,
                  101
                ]
              },
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
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to send code."
    },
    {
      "code": 6001,
      "name": "invalidWallet",
      "msg": "Invalid wallet address."
    },
    {
      "code": 6002,
      "name": "invalidReceiver",
      "msg": "Invalid receiver address."
    },
    {
      "code": 6003,
      "name": "fundsNotReceived",
      "msg": "Funds were not received by the expected wallet."
    },
    {
      "code": 6004,
      "name": "invalidAccount",
      "msg": "Provided code account is invalid."
    },
    {
      "code": 6005,
      "name": "invalidCodeFormat",
      "msg": "invalidCodeFormat"
    },
    {
      "code": 6006,
      "name": "invalidInstructionData",
      "msg": "invalidInstructionData"
    },
    {
      "code": 6007,
      "name": "invalidTransfer",
      "msg": "invalidTransfer"
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
            "name": "code",
            "type": "string"
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
            "name": "handle",
            "type": "string"
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
    }
  ]
};
