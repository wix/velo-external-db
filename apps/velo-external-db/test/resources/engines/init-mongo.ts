/* eslint-disable no-undef */
//@ts-ignore
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
)