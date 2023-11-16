const Constants = {
    COLLECTIONS: {
        USER: 'users',
        PG: 'pgs',
        PG_TYPES: 'pg.types',
        PG_ROOMS: 'pg.rooms',
        PG_ROOM_FACILITIES: 'pg.room.facilities',
        PG_ROOM_TYPES: 'pg.room.types',
        PG_ALLOCATION: 'pg.allocations',
        INVENTORY: 'inventory',
        FOOD: 'food',
        ATTENDANCE: 'attendance',
        PG_EXPENSES : 'pg.expenses',
        PAYMENTS: 'payments'
    },

    UPLOADS_DIR : "uploads/",
    COLLECTION_USER_ID_REQUIRED_MAPPING: {
        "tanent": ["payments", "orders"]
    },
    REDIS_SEPERATOR: ':',
    ACCESS_TOKEN_EXPIRE_IN_MS: 60 * 60 * 1000000,
    REFRESH_TOKEN_EXPIRE_IN_MS: 60 * 60 * 1000,

}

export default Constants;