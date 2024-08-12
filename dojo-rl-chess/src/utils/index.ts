export enum Direction {
    Left = 1,
    Right = 2,
    Up = 3,
    Down = 4,
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