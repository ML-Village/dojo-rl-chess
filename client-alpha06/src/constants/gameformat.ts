import { FaRegSun } from "react-icons/fa";
import { TfiAlarmClock } from "react-icons/tfi";
import { FaBoltLightning } from "react-icons/fa6";
import { GiBulletBill } from "react-icons/gi";
import { IconType } from 'react-icons';

interface GameFormatConfig {
    [key: number]: {
        name: string;
        turn_expiry: number;
        total_time_per_side: number;
        total_time_string: string;
        increment: number;
        icon: IconType;
    };
}

export const gameFormatconfig: GameFormatConfig  = {
    // Daily-1
    1: {
            name: "Daily-1",
            turn_expiry: 0,
            total_time_per_side: 60*60*24, // 1 day
            total_time_string: "1 day",
            increment: 0,
            icon: FaRegSun,
        },
    // Daily-2
    2: {
            name: "Daily-2",
            turn_expiry: 0,
            total_time_per_side: 60*60*24*2, // 2 days
            total_time_string: "2 days",
            increment: 0,
            icon: FaRegSun,
        },
    // Daily-3
    3: {
        name: "Daily-3",
        turn_expiry: 0,
        total_time_per_side: 60*60*24*3, // 3 days
        total_time_string: "3 days",
        increment: 0,
        icon: FaRegSun,
    },
    // Daily-5
    4: {
        name: "Daily-5",
        turn_expiry: 0,
        total_time_per_side: 60*60*24*5, // 5 days
        total_time_string: "5 days",
        increment: 0,
        icon: FaRegSun,
    },
    // Daily-7
    5: {
        name: "Daily-7",
        turn_expiry: 0,
        total_time_per_side: 60*60*24*7, // 7 days
        total_time_string: "7 days",
        increment: 0,
        icon: FaRegSun,
    },
    // Daily-14
    6: {
        name: "Daily-14",
        turn_expiry: 0,
        total_time_per_side: 60*60*24*14, // 14 days
        total_time_string: "14 days",
        increment: 0,
        icon: FaRegSun,
    },
    

    // Rapid 10
    7: {
        name: "Rapid-10",
        turn_expiry: 0,
        total_time_per_side: 60*10, // 10 mins
        total_time_string: "10 mins",
        increment: 0,
        icon: TfiAlarmClock,
    },
    // Rapid 10-5
    8: {
        name: "Rapid-10-5",
        turn_expiry: 0,
        total_time_per_side: 60*10, // 10 mins
        total_time_string: "10mins | 5s",
        increment: 5,
        icon: TfiAlarmClock,
    },
    // Rapid 15
    9: {
        name: "Rapid-15",
        turn_expiry: 0,
        total_time_per_side: 60*15, // 15 mins
        total_time_string: "15 mins",
        increment: 0,
        icon: TfiAlarmClock,
    },
    // Rapid 20
    10: {
        name: "Rapid-20",
        turn_expiry: 0,
        total_time_per_side: 60*20, // 20 mins
        total_time_string: "20 mins",
        increment: 0,
        icon: TfiAlarmClock,
    },
    // Rapid 30
    11: {
        name: "Rapid-30",
        turn_expiry: 0,
        total_time_per_side: 60*30, // 30 mins
        total_time_string: "30 mins",
        increment: 0,
        icon: TfiAlarmClock,
    },
    // Rapid 60
    12: {
        name: "Rapid-60",
        turn_expiry: 0,
        total_time_per_side: 60*60, // 60 mins
        total_time_string: "60 mins",
        increment: 0,
        icon: TfiAlarmClock,
    },


    // Blitz 3
    13: {
            name: "Blitz-3",
            turn_expiry: 0,
            total_time_per_side: 60*3, // 3 min
            total_time_string: "3 mins",
            increment: 0,
            icon: FaBoltLightning,
        },
    
    // Blitz 3-2
    14: {
        name: "Blitz-3-2",
        turn_expiry: 0,
        total_time_per_side: 60*3, // 3 min
        total_time_string: "3 mins | 2s",
        increment: 2,
        icon: FaBoltLightning,
    },

    // Blitz 5
    15: {
        name: "Blitz-5",
        turn_expiry: 0,
        total_time_per_side: 60*5, // 5 min
        total_time_string: "5 mins",
        increment: 0,
        icon: FaBoltLightning,
    },

    // Blitz 5-2
    16: {
        name: "Blitz-5-2",
        turn_expiry: 0,
        total_time_per_side: 60*5, // 5 min
        total_time_string: "5 mins | 2s",
        increment: 2,
        icon: FaBoltLightning,
    },

    // Blitz 5-5
    17: {
        name: "Blitz-5-5",
        turn_expiry: 0,
        total_time_per_side: 60*5, // 5 min
        total_time_string: "5 mins | 5s",
        increment: 5,
        icon: FaBoltLightning,
    },

    // Bullet 1
    18: {
        name: "Bullet-1",
        turn_expiry: 0,
        total_time_per_side: 60*1, // 1 min
        total_time_string: "1 min",
        increment: 0,
        icon: GiBulletBill,
    },

    // Bullet 1-1
    19: {
        name: "Bullet-1-1",
        turn_expiry: 0,
        total_time_per_side: 60*1, // 1 min
        total_time_string: "1 min | 1s",
        increment: 1,
        icon: GiBulletBill,
    },

    // Bullet 2-1
    20: {
        name: "Bullet-2-1",
        turn_expiry: 0,
        total_time_per_side: 60*2, // 2 min
        total_time_string: "2 mins | 1s",
        increment: 1,
        icon: GiBulletBill,
    },

}
    