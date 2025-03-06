/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/transfer.json`.
 */
export type Transfer = {
  "address": "6LDk9tvtR5hoSp1QYZHsqdrVHv32tac6r8NYXjJam1M5",
  "metadata": {
    "name": "transfer",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "transferFromDbToUser",
      "discriminator": [
        72,
        212,
        104,
        32,
        221,
        86,
        36,
        42
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
        }
      ],
      "args": []
    },
    {
      "name": "transferFromUserToDb",
      "discriminator": [
        80,
        253,
        46,
        69,
        37,
        178,
        163,
        57
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
    }
  ],
  "accounts": [
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
  "errors": [
    {
      "code": 6000,
      "name": "insufficientFunds",
      "msg": "Insufficient funds to send code."
    },
    {
      "code": 6001,
      "name": "invalidTransfer",
      "msg": "invalidTransfer"
    }
  ],
  "types": [
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
