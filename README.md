# Setup and scripts

### npm install
Installs all necessary dependencies.

### npm start
Starts the server.

### npm run reset
Resets database with data from db/data.json file.

### npm run production
Starts the server in production mode.

---

# API Documentation

#### Document object scheme
```
{
    _id: "data",
    name: "data",
    content: "data"
}
```

## Routes 
#### GET "/docs"
    Returns all document objects in an array.
    

#### POST "/docs"
    Insert a new document in the database.
    
    Returns the new document object including the new _id value.
    name is required but content is optional.

        
#### PUT "/docs/:id"
    Route param: _id of target document.

    Updates the altered data of the properties in the object sent in the request body.
    _id cannot be altered, and is used in the route to specify target document.

    name or content or both can be included in the request body object, but atleast one is required. The value of the properties passed in the body of the request will be the new values of the document object. If one is excluded its value will remain unchanged.
    
    Returns no data. Logs success in console.

#### DELETE "/:id"
    Route param: _id of target document.
    
    Returns no data