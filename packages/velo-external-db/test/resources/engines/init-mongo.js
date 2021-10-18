db.createUser(
    {
        user: 'root',
        pwd: 'pass',
        roles: [
            {
                role: 'dbOwner',
                db: 'testdb'
            }
        ]
    }
);