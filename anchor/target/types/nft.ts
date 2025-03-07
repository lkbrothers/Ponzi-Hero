/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/nft.json`.
 */
export type Nft = {
  "address": "3BjKmutGGbVtnVeeJnNg9xKqkAticq7WYvBjuBr1dQab",
  "metadata": {
    "name": "nft",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createNftAccount",
      "discriminator": [
        95,
        2,
        43,
        195,
        207,
        216,
        87,
        30
      ],
      "accounts": [
        {
          "name": "nftAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "owner",
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
          "name": "name",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    },
    {
      "name": "deleteNftAccount",
      "discriminator": [
        94,
        82,
        208,
        43,
        32,
        81,
        67,
        211
      ],
      "accounts": [
        {
          "name": "nftAccount",
          "writable": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true,
          "relations": [
            "nftAccount"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "mintRandomNftAccount",
      "discriminator": [
        184,
        89,
        39,
        120,
        137,
        241,
        231,
        246
      ],
      "accounts": [
        {
          "name": "nftAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "readNftAccount",
      "discriminator": [
        118,
        214,
        168,
        66,
        43,
        230,
        96,
        59
      ],
      "accounts": [
        {
          "name": "nftAccount"
        }
      ],
      "args": []
    },
    {
      "name": "updateNftAccount",
      "discriminator": [
        155,
        107,
        143,
        199,
        214,
        243,
        224,
        104
      ],
      "accounts": [
        {
          "name": "nftAccount",
          "writable": true
        },
        {
          "name": "owner",
          "signer": true,
          "relations": [
            "nftAccount"
          ]
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "uri",
          "type": "string"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "nftAccount",
      "discriminator": [
        33,
        180,
        91,
        53,
        236,
        15,
        63,
        97
      ]
    }
  ],
  "types": [
    {
      "name": "nftAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "uri",
            "type": "string"
          }
        ]
      }
    }
  ]
};
