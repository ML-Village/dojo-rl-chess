import { BigNumberish } from 'starknet';
import { getEntityIdFromKeys } from '@dojoengine/utils';
import { Component, Entity, getComponentValue } from '@dojoengine/recs';
export * from './gameModelUtils';

export enum Direction {
    Left = 1,
    Right = 2,
    Up = 3,
    Down = 4,
}

export enum ProfilePicType {
    Undefined = 0,
    Native = 1,
    External = 2,
}

export function updatePositionWithDirection(
    direction: Direction,
    value: { vec: { x: number; y: number } }
) {
    switch (direction) {
        case Direction.Left:
            value.vec.x--;
            break;
        case Direction.Right:
            value.vec.x++;
            break;
        case Direction.Up:
            value.vec.y--;
            break;
        case Direction.Down:
            value.vec.y++;
            break;
        default:
            throw new Error("Invalid direction provided");
    }
    return value;
}


export const formatAddress = (address: string | undefined): string => {
    if (address && address.length >= 8) {
        return `${address.substring(0, 4)}...${address.substring(
            address.length - 4
        )}`;
    }
    return address || "";
};

export const bigintToHex = (v: BigNumberish): string => (!v ? '0x0' : `0x${BigInt(v).toString(16)}`)

export const formatTimestamp = (t: number): string => {
    const timeUTC = new Date(t * 1000).getTime()
    const tzoffset = (new Date(0)).getTimezoneOffset() * 60000 // local timezone offset in milliseconds
    const localDate = new Date(timeUTC - tzoffset)
    const iso = localDate.toISOString()
    const [date, iso2] = iso.split('T')
    const [time, iso3] = iso2.split('.')
    const [hour, minutes, seconds] = time.split(':')
    return `${date} ${hour}:${minutes}`
}

export const formatTimestampElapsed = (start: number): string => {
const now = Math.floor(new Date().getTime() / 1000)
return formatTimestampDelta(start, now)
}

export const formatTimestampCountdown = (end: number): string => {
const now = Math.floor(new Date().getTime() / 1000)
return formatTimestampDelta(now, end)
}

export const formatTimestampDelta = (start: number, end: number): string => {
    const t = Math.max(0, end - start)
    const iso = (new Date(t * 1000).toISOString())
    const [date, iso2] = iso.split('T')
    const [time, iso3] = iso2.split('.')
    const [hour, minutes, seconds] = time.split(':')
    const days = Math.floor(t / (24 * 60 * 60))
    let result = ''
    if (days > 0) result += `${days}d `
    if (days > 0 || parseInt(hour) > 0) result += `${hour == '00' ? '0' : hour}:`
    result += `${minutes}`
    if (days == 0) result += `:${seconds}`
    return result
}

export const bigintToEntity = (v: BigNumberish): Entity => (getEntityIdFromKeys([BigInt(v)]) as Entity)
export const keysToEntity = (keys: BigNumberish[]): Entity => (getEntityIdFromKeys(keys.map(v => BigInt(v ?? 0))) as Entity)
export const entityIdToKey = (component: Component, keyName: string, entityId: Entity) => (BigInt(getComponentValue(component, entityId)[keyName]))