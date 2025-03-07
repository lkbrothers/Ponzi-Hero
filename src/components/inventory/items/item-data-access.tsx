import { useAnchorProvider } from "@/components/solana/solana-provider";
import { useCluster } from "@/components/cluster/cluster-data-access";
import { getItemProgram, getItemProgramId } from "@project/anchor";
import { Cluster } from "@solana/web3.js";
export function useInventoryProgram() {
    const { cluster } = useCluster()
    const provider = useAnchorProvider()
    const programId = getItemProgramId(cluster.network as Cluster)
    const program = getItemProgram(provider, programId)
    return program
}