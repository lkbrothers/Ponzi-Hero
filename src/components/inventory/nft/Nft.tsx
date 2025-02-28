'use client'

interface NftMetadata {
  name: string
  description: string
  image: string
  attributes: {
    trait_type: string
    value: string
  }[]
}

const dummyNftMetadata: NftMetadata[] = [
  {
    name: "용사의 검",
    description: "전설의 용사가 사용했던 검입니다.",
    image: "/images/sword.png",
    attributes: [
      {
        trait_type: "공격력",
        value: "100"
      },
      {
        trait_type: "내구도", 
        value: "80"
      }
    ]
  },
  {
    name: "마법사의 지팡이",
    description: "강력한 마법을 사용할 수 있는 지팡이입니다.",
    image: "/images/staff.png", 
    attributes: [
      {
        trait_type: "마력",
        value: "150"
      },
      {
        trait_type: "마나 회복",
        value: "10"
      }
    ]
  }
]

interface NftCardProps {
  metadata: NftMetadata
}

export function NftCard({ metadata }: NftCardProps) {
  return (
    <div className="card w-96 bg-base-100 shadow-xl">
      <figure>
        <img src={metadata.image} alt={metadata.name} />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{metadata.name}</h2>
        <p>{metadata.description}</p>
        <div className="flex flex-col gap-2">
          {metadata.attributes.map((attr, index) => (
            <div key={index} className="flex justify-between">
              <span className="font-bold">{attr.trait_type}</span>
              <span>{attr.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
