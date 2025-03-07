/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/shop.json`.
 */
export type Shop = {
  "address": "2rwPP5Dev33CypTWEEDP1DSGpxYVi7xAcKwiTRYXWQNe",
  "metadata": {
    "name": "shop",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "exchangeCreditToItem",
      "discriminator": [
        219,
        72,
        66,
        156,
        193,
        41,
        177,
        203
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "itemAccount",
          "writable": true
        },
        {
          "name": "creditAccount",
          "writable": true
        },
        {
          "name": "itemProgram"
        },
        {
          "name": "creditProgram"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "itemKey",
          "type": "string"
        }
      ]
    },
    {
      "name": "exchangeItemToCredit",
      "discriminator": [
        92,
        140,
        254,
        72,
        81,
        249,
        54,
        89
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "itemAccount",
          "writable": true
        },
        {
          "name": "creditAccount",
          "writable": true
        },
        {
          "name": "itemProgram"
        },
        {
          "name": "creditProgram"
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
      "name": "invalidItem",
      "msg": "[ERROR] 제공된 Item이 유효하지 않습니다."
    },
    {
      "code": 6001,
      "name": "invalidItemGrade",
      "msg": "[ERROR] 아이템 등급이 유효하지 않습니다."
    },
    {
      "code": 6002,
      "name": "invalidItemType",
      "msg": "[ERROR] 아이템 타입이 유효하지 않습니다."
    },
    {
      "code": 6003,
      "name": "insufficientCredit",
      "msg": "[ERROR] 크레딧 잔액이 부족합니다."
    },
    {
      "code": 6004,
      "name": "overflow",
      "msg": "[ERROR] Overflow occurred: 잔액이 허용 범위를 초과합니다."
    },
    {
      "code": 6005,
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
