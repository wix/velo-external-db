to start Azure provision script:
1. install azure cli
2. type 'az login' and log in your azure user.
3. get your user object id by the command ' az ad signed-in-user show | grep "objectId" ' and copy the value
4. get the subscription id by the command ' az account show | grep "id" ' and copy the value
