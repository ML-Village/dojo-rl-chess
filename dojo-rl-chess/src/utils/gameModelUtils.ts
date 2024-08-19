import { ContractComponents } from "@/dojo/generated/contractComponents";
import { feltToString } from "./starknet";

import { pfpCardImageUrl } from '@/constants/assetspath';

export const getPlayerName = (player: ContractComponents['Player']) => {
    return feltToString(String(player?.name ?? ""));
}

export const getPlayerPfPurl = (player: ContractComponents['Player']) => {
    let profilePicNum = player?.profile_pic_type == "Native" ? 
                        player?.profile_pic_uri.charCodeAt(0) :
                        JSON.stringify(player?.profile_pic_uri);
    profilePicNum = (typeof(profilePicNum) === "number") ? profilePicNum : 0;

    return pfpCardImageUrl[profilePicNum];
}